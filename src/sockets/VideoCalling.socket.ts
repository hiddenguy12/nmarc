import { Namespace, Socket } from "socket.io";
import { User } from "../models/user";
import AuthSession from "../models/AuthSession";
import VideoProfile from "../models/VideoProfile";
import { authSessionValidation } from "../lib/schema/auth.schema";
import { ExtendedError } from "socket.io";
import { VideoCallStatus, VideoRoom } from "../models/VideoCallingRoom";
import { _idValidator } from "../lib/schema/schemaComponents";
import { randomUUID } from "crypto";

export default async function configureVideoCallingSocket(io: Namespace) {
    try {
        io.use(async function (socket, next: (error?: ExtendedError | undefined) => void): Promise<any> {
            try {
                let { token, profileType } = await socket.handshake.auth;
                token = authSessionValidation.parse(token);
                
                if (profileType === 'video_calling_member') {
                    let videoCallingMember = await VideoProfile.findOne({ 'auth.authSession': token });
                    if (videoCallingMember) {
                        socket.user_id = videoCallingMember._id.toString();
                        socket.userProfileType = 'videoProfile';
                        videoCallingMember.socket_ids.video_calling_socket = socket.id;
                        await videoCallingMember.save(); 
                        return next();
                    } else return next(new Error('Failed To Authenticate the User'));
                } else return next(new Error('Failed To Authenticate the User'));
            } catch (error) {
                next(new Error('Failed to Authenticate User'));
            }
        });

        io.on('connection', async (socket: Socket) => {
            socket.emit('connected', { message: 'connection SuccessFull' });

            socket.on('init-call', async (recieverId, peerId) => {
                try {
                    recieverId = _idValidator.parse(recieverId);
                    const min_calling_coin = 1200;
                    
                    const sender = await VideoProfile.findById(socket.user_id);
                    if (!sender) return socket.emit('init-calling-error', { message: "Sender account does not exist in Database" });
                    
                    if (sender.video_calling_coins < min_calling_coin)
                        return socket.emit('unsufficient-video-calling-coins', { 
                            message: `Minimum video calling coins must be ${min_calling_coin}`,
                            current_coins: sender.video_calling_coins
                        });
                    
                    const reciever = await VideoProfile.findById(recieverId);
                    if (!reciever) return socket.emit('invalid-reciever-id', { recieverId });
                    
                    if (reciever.status !== 'online') return socket.emit('reciever-offline', { message: 'Receiver is currently offline', recieverId });
                    
                    const existingCall = await VideoRoom.findOne({
                        $or: [
                            { 'caller.user_id': socket.user_id, 'reciever.user_id': recieverId, isActive: true },
                            { 'caller.user_id': recieverId, 'reciever.user_id': socket.user_id, isActive: true }
                        ]
                    });
                    
                    if (existingCall) return socket.emit('already-in-call', { 
                        message: 'There is already an active call between these users',
                        roomId: existingCall.roomId
                    });
                    
                    const maxDuration = Math.floor((sender.video_calling_coins / 400) * 60);
                    const room = await VideoRoom.create({
                        roomId: randomUUID(),
                        caller: {
                            socket_id: socket.id,
                            called_at: new Date(),
                            user_id: socket.user_id,
                            peer_id: peerId
                        },
                        reciever: {
                            user_id: reciever._id,
                            socket_id: reciever.socket_ids.video_calling_socket,
                            peer_id: '',
                            revieved_at: null
                        },
                        status: VideoCallStatus.PENDING,
                        max_call_duration: maxDuration,
                        used_call_duration: 0,
                        used_coins: 0
                    });

                    socket.join(room.roomId);

                    if (reciever.socket_ids.video_calling_socket) {
                        io.to(reciever.socket_ids.video_calling_socket).emit('video-call-request', { 
                            roomId: room.roomId,
                            callerName: sender.name,
                            callerId: sender._id,
                            callerProfileImage: sender.profileImage
                        });
                        
                        socket.emit('video-call-initialize', { 
                            roomId: room.roomId,
                            maxDuration: maxDuration,
                            message: 'Call request sent successfully'
                        });
                        
                        setTimeout(async () => {
                            const pendingRoom = await VideoRoom.findOne({ 
                                roomId: room.roomId, 
                                status: VideoCallStatus.PENDING 
                            });
                            
                            if (pendingRoom) {
                                pendingRoom.status = VideoCallStatus.REJECTED;
                                pendingRoom.isActive = false;
                                await pendingRoom.save();
                                
                                io.to(pendingRoom.roomId).emit('video-call-timeout', { 
                                    message: 'Call request timed out',
                                    roomId: pendingRoom.roomId
                                });
                            }
                        }, 30000);
                    } else {
                        await VideoRoom.findByIdAndUpdate(room._id, { 
                            status: VideoCallStatus.REJECTED,
                            isActive: false
                        });
                        
                        socket.emit('reciever-offline', { 
                            message: 'Receiver is not available for video calls',
                            recieverId
                        });
                    }
                } catch (error) {
                    console.error('Error in init-call:', error);
                    socket.emit('init-calling-error', { message: "Failed to initialize call" });
                }
            });

            socket.on('accapt-video-call-request', async ({ roomId, peerId }) => {
                try {
                    if (!roomId || !peerId) return socket.emit('call-error', { message: 'Invalid request parameters' });
                    
                    const room = await VideoRoom.findOne({ 
                        roomId, 
                        'reciever.user_id': socket.user_id,
                        status: VideoCallStatus.PENDING,
                        isActive: true
                    });
                    
                    if (!room) return socket.emit('call-error', { message: 'Call not found or already handled' });
                    
                    room.status = VideoCallStatus.ACCAPTED;
                    room.reciever.peer_id = peerId;
                    room.reciever.revieved_at = new Date();
                    room.reciever.socket_id = socket.id;
                    await room.save();
                    
                    socket.join(room.roomId);
                    
                    io.to(room.caller.socket_id).emit('video-call-accapted-by-reciever', {
                        roomId: room.roomId,
                        recieverPeerId: peerId,
                        maxDuration: room.max_call_duration
                    });
                    
                    await VideoProfile.updateMany(
                        { _id: { $in: [room.caller.user_id, room.reciever.user_id] } },
                        { status: 'busy' }
                    );
                    
                    socket.emit('call-accepted-confirmation', {
                        roomId: room.roomId,
                        callerPeerId: room.caller.peer_id,
                        maxDuration: room.max_call_duration
                    });
                } catch (error) {
                    console.error('Error in accept-video-call:', error);
                    socket.emit('call-error', { message: 'Failed to accept call' });
                }
            });

            socket.on('reject-video-call-request', async ({ roomId }) => {
                try {
                    if (!roomId) return socket.emit('call-error', { message: 'Invalid request parameters' });
                    
                    const room = await VideoRoom.findOne({ 
                        roomId, 
                        'reciever.user_id': socket.user_id,
                        status: VideoCallStatus.PENDING,
                        isActive: true
                    });
                    
                    if (!room) return socket.emit('call-error', { message: 'Call not found or already handled' });
                    
                    room.status = VideoCallStatus.REJECTED;
                    room.isActive = false;
                    room.endedAt = new Date();
                    await room.save();
                    
                    io.to(room.caller.socket_id).emit('video-call-rejected', {
                        roomId: room.roomId,
                        message: 'Call was rejected by receiver'
                    });
                    
                    socket.emit('rejection-confirmation', {
                        roomId: room.roomId,
                        message: 'Call rejected successfully'
                    });
                } catch (error) {
                    console.error('Error in reject-video-call:', error);
                    socket.emit('call-error', { message: 'Failed to reject call' });
                }
            });

            socket.on('calling-started', async ({ roomId }) => {
                try {
                    if (!roomId) return socket.emit('call-error', { message: 'Invalid request parameters' });
                    
                    const room = await VideoRoom.findOne({ 
                        roomId, 
                        status: VideoCallStatus.ACCAPTED,
                        isActive: true
                    });
                    
                    if (!room) return socket.emit('call-error', { message: 'Active call not found' });
                    
                    io.to(roomId).emit('call-connected', { 
                        roomId, 
                        timestamp: new Date(),
                        maxDuration: room.max_call_duration
                    });
                } catch (error) {
                    console.error('Error in calling-started:', error);
                    socket.emit('call-error', { message: 'Failed to start call' });
                }
            });

            socket.on('add-calling-duration', async ({ roomId, duration }) => {
                try {
                    if (!roomId || typeof duration !== 'number') return socket.emit('call-error', { message: 'Invalid request parameters' });
                    
                    const room = await VideoRoom.findOne({ 
                        roomId, 
                        'caller.user_id': socket.user_id,
                        status: VideoCallStatus.ACCAPTED,
                        isActive: true
                    });
                    
                    if (!room) return socket.emit('call-error', { message: 'Active call not found' });
                    
                    const newDuration = room.used_call_duration + duration;
                    
                    const timeBlocks = Math.floor(duration / 30);
                    const coinsToDeduct = timeBlocks * 200;
                    const newCoinsUsed = room.used_coins + coinsToDeduct;
                    
                    room.used_call_duration = newDuration;
                    room.used_coins = newCoinsUsed;
                    await room.save();
                    
                    const caller = await VideoProfile.findById(room.caller.user_id);
                    if (caller) {
                        caller.video_calling_coins -= coinsToDeduct;
                        
                        if (caller.video_calling_coins <= 0) {
                            caller.video_calling_coins = 0;
                            await caller.save();
                            
                            room.status = VideoCallStatus.ENDED;
                            room.isActive = false;
                            room.endedAt = new Date();
                            await room.save();
                            
                            io.to(roomId).emit('video-call-stoped', {
                                roomId: room.roomId,
                                reason: 'Insufficient coins',
                                usedDuration: room.used_call_duration,
                                usedCoins: room.used_coins
                            });
                            
                            await VideoProfile.updateMany(
                                { _id: { $in: [room.caller.user_id, room.reciever.user_id] } },
                                { status: 'online' }
                            );
                            
                            return;
                        }
                        
                        await caller.save();
                    }
                    
                    if (newDuration >= room.max_call_duration) {
                        room.status = VideoCallStatus.ENDED;
                        room.isActive = false;
                        room.endedAt = new Date();
                        await room.save();
                        
                        io.to(roomId).emit('video-call-stoped', {
                            roomId: room.roomId,
                            reason: 'Maximum duration reached',
                            usedDuration: room.used_call_duration,
                            usedCoins: room.used_coins
                        });
                        
                        await VideoProfile.updateMany(
                            { _id: { $in: [room.caller.user_id, room.reciever.user_id] } },
                            { status: 'online' }
                        );
                        
                        return;
                    }
                    
                    io.to(roomId).emit('call-stats-update', {
                        roomId: room.roomId,
                        currentDuration: newDuration,
                        remainingDuration: room.max_call_duration - newDuration,
                        usedCoins: newCoinsUsed,
                        remainingCoins: caller ? caller.video_calling_coins : 0
                    });
                } catch (error) {
                    console.error('Error in add-calling-duration:', error);
                    socket.emit('call-error', { message: 'Failed to update call duration' });
                }
            });

            socket.on('call-ended', async ({ roomId }) => {
                try {
                    if (!roomId) return socket.emit('call-error', { message: 'Invalid request parameters' });
                    
                    const room = await VideoRoom.findOne({ 
                        roomId, 
                        status: VideoCallStatus.ACCAPTED,
                        isActive: true,
                        $or: [
                            { 'caller.user_id': socket.user_id },
                            { 'reciever.user_id': socket.user_id }
                        ]
                    });
                    
                    if (!room) return socket.emit('call-error', { message: 'Active call not found' });
                    
                    room.status = VideoCallStatus.ENDED;
                    room.isActive = false;
                    room.endedAt = new Date();
                    await room.save();
                    
                    io.to(roomId).emit('video-call-ended', {
                        roomId: room.roomId,
                        endedBy: socket.user_id,
                        usedDuration: room.used_call_duration,
                        usedCoins: room.used_coins,
                        timestamp: room.endedAt
                    });
                    
                    await VideoProfile.updateMany(
                        { _id: { $in: [room.caller.user_id, room.reciever.user_id] } },
                        { status: 'online' }
                    );
                } catch (error) {
                    console.error('Error in call-ended:', error);
                    socket.emit('call-error', { message: 'Failed to end call' });
                }
            });
        });
    } catch (error) {
        console.error('Error configuring video calling socket:', error);
    }
}