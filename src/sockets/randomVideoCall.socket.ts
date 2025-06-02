/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Namespace } from 'socket.io';
import '../lib/types/socket.decralation';
import { newSocketMiddleware, socketMiddlewaresVideoProfile } from '../lib/middlewares/socket.middleware';
import { Socket } from 'socket.io';
import { RandomVideoCall, IRandomVideoCall } from '../models/RandomVideoCall';
import { z, ZodError } from 'zod';
import mongoose from 'mongoose';
import { randomUUID, sign } from 'crypto';
import VideoProfile from '../models/VideoProfile';
import { ExtendedError } from 'socket.io';
import { authSessionValidation } from '../lib/schema/auth.schema';
import { SOCKET_USER_TYPE } from '../lib/types/socket.types';



const VIDEO_CALL_DURATION = 20 * 1000; // 20 seconds in milliseconds
export let roomIdSchema = z.string().uuid();



export class randomVideoCallSocketService {
    private io: Namespace;
    private activeCallTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor(io: Namespace) {
        this.io = io;
        this.io.use(newSocketMiddleware(SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER));
        this.io.use(async function (socket, next) {
            try {
                await VideoProfile.findByIdAndUpdate(socket.user_id, {
                    'socket_ids.random_video_calling_socket': socket.id
                });
            } catch (error) {
                error instanceof Error ? console.error(`[random video call socket setup error]`, error.message) : console.error(`[random video call socket setup error]`, error);
                next(new Error('Video Calling Socket Setup error'))
            }
        })
        this.initializeListeners();
    }

    private async initializeListeners() {
        this.io.on('connection', (socket: Socket) => {
            this.cleanupUserSessions(socket.user?._id);

            socket.on('init-video-call', async () => {
                try {
                    let roomId = randomUUID();

                    const randomVideoCall = new RandomVideoCall({
                        userId: socket.user._id,
                        status: 'searching',
                        roomId: roomId,
                        gender: socket.user.gender
                    });

                    socket.join(roomId);

                    await randomVideoCall.save();

                    socket.emit('video-call-initialized', { data: { roomId } });
                } catch (error) {
                    console.error('Error creating video request:', error);
                    socket.emit('call-initialization-error', { message: 'Failed to create video call request' });
                }
            });



            socket.on('connect-video-call', async (roomId) => {
                try {
                    let randomVideoCall = await RandomVideoCall.findOne({ roomId: roomIdSchema.parse(roomId) });

                    if (!randomVideoCall) throw new Error("Cannot find Random video call created in the database");

                    let arr: number[] = [1, 2, 1, 2, 1, 2];

                    let startSearchNow: boolean = ((arr: number[]) => {
                        let randomNum = Math.floor(arr.length * Math.random());
                        return arr[randomNum] === 1;
                    })(arr);

                    if (startSearchNow) {
                        let request2 = await this.searchUser(socket.user._id, socket.user.gender);
                        if (request2) this.connectUser(randomVideoCall, request2, socket);
                        else socket.emit('not-connected', { data: null });
                    } else {
                        let timeOut = setTimeout(async () => {
                            let isConnected = await RandomVideoCall.exists({
                                roomId: randomVideoCall.roomId,
                                status: 'connected'
                            });
                            if (!isConnected) {
                                let request2 = await this.searchUser(socket.user._id, socket.user.gender);
                                if (request2) this.connectUser(randomVideoCall, request2, socket);
                                else socket.emit('not-connected', { data: null });
                            }
                            clearTimeout(timeOut);
                        }, 5000);
                    }
                } catch (error) {
                    error instanceof Error ? console.error(error.message) : console.error(error);
                    socket.emit('connection-creation-failed', { message: 'Failed to connect User in 20s video call' });
                }
            });

            socket.on('peer-details', (signal, userBRoomId) => {
                try {

                    this.io.to(roomIdSchema.parse(userBRoomId)).emit('call-user', signal);
                    let timeOut: any;
                    const endCall = async (room1: IRandomVideoCall, room2: IRandomVideoCall) => {
                        try {
                            this.io.to(room1.roomId).emit('end-call', room1.roomId);
                            this.io.to(room2.roomId).emit('end-call', room2.roomId);

                            await RandomVideoCall.updateMany(
                                {
                                    status: 'connected',
                                    roomId: {
                                        $in: [room1.roomId, room2.roomId]
                                    },
                                    connectedWith: {
                                        $in: [room1.userId, room2.userId]
                                    }
                                },
                                {
                                    status: 'ended'
                                }
                            );

                            clearTimeout(timeOut)
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    timeOut = setTimeout(async function () {
                        let request1 = await RandomVideoCall.findOne({ roomId: userBRoomId });
                        let request2 = await RandomVideoCall.findOne({ userId: socket.user_id });
                        if (request1 && request2) endCall(request1, request2);
                    }, VIDEO_CALL_DURATION + 2500);

                } catch (error) {
                    console.error(error);
                    socket.emit('invalid-peer-details', { data: null })
                }
            });

            socket.on('caller-details-request', async () => {
                try {
                    let call2 = await RandomVideoCall.findOne({ connectedWith: socket.user._id, status: 'connected' });
                    if (!call2) {
                        return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                    }
                    let caller = await VideoProfile.findById(call2.connectedWith);
                    if (!caller) {
                        return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                    }
                    socket.emit('caller-details', {
                        name: caller.name,
                        photo: caller.profileImage?.url,
                        email: caller.email
                    });

                } catch (error) {
                    console.error(error);
                    return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                }
            });


            socket.on('leave-call-room', async (roomId) => {
                try {
                    roomId = roomIdSchema.parse(roomId);
                    socket.leave(roomId);
                } catch (error) {
                    console.error('[Leave calling Room Error]', error);
                    socket.emit('leave-calling-room-error', { data: null })
                }
            });


            socket.on('stop-video-call', async (roomId) => {
                try {
                    let call2 = await RandomVideoCall.findOne({ connectedWith: socket.user._id, status: 'connected' });
                    if (call2) {
                        this.io.to(call2.roomId).emit('end-call', call2.roomId);
                        socket.leave(roomId);
                    }
                } catch (error) {
                    console.error(error);

                }
            });

            socket.on('disconnect', async () => {
                try {
                    await VideoProfile.findByIdAndUpdate(socket.user_id, { 'socket_ids.random_video_calling_socket': null });
                } catch (error) {
                    error instanceof Error ? console.error(`[random video call socket removing error]`, error.message) : console.error(`[random video call socket removing error]`, error);
                }
            });
        });
    }

    private async searchUser(id: mongoose.Types.ObjectId, gender: string) {
        // Fixed query to properly search for users of opposite gender
        const matchingUser = await RandomVideoCall.findOne({
            userId: { $ne: id },
            status: 'searching',
            gender: { $ne: gender }
        })
            .populate({
                path: 'userId',
            });

        if (!matchingUser || !matchingUser.userId) {
            return null;
        }

        return matchingUser;
    }

    private async connectUser(request1: IRandomVideoCall, request2: IRandomVideoCall, socket: Socket) {
        try {

            request1.status = 'connected';
            request1.connectedWith = request2.userId;
            await request1.save();

            request2.status = 'connected';
            request2.connectedWith = request1.userId;
            await request2.save();

            // Notify both users about the connection
            this.io.to(request2.roomId).emit('give-peer-details', request1.roomId); // User B Room Id
            socket.emit('connection-created', { data: null });


        } catch (error) {
            console.error('Error connecting users:', error);
            socket.emit('connection-creation-failed', { message: 'Failed to establish connection' });
        }
    }


    // Helper method to clean up existing sessions for a user
    private async cleanupUserSessions(userId: mongoose.Types.ObjectId) {
        try {
            if (!userId) return;
            await RandomVideoCall.deleteMany(
                {
                    userId: userId,
                    status: { $in: ['connected', "searching"] }
                }
            );
        } catch (error) {
            console.error('Error cleaning up user sessions:', error);
        }
    }

    // Static method to get instance
    static getInstance(io: Namespace) { // Fixed typo in method name
        return new randomVideoCallSocketService(io);
    }
}