"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomVideoCallSocketService = exports.roomIdSchema = void 0;
require("../lib/types/socket.decralation");
const socket_middleware_1 = require("../lib/middlewares/socket.middleware");
const RandomVideoCall_1 = require("../models/RandomVideoCall");
const zod_1 = require("zod");
const crypto_1 = require("crypto");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const socket_types_1 = require("../lib/types/socket.types");
const VIDEO_CALL_DURATION = 20 * 1000; // 20 seconds in milliseconds
exports.roomIdSchema = zod_1.z.string().uuid();
class randomVideoCallSocketService {
    io;
    activeCallTimers = new Map();
    constructor(io) {
        this.io = io;
        this.io.use((0, socket_middleware_1.newSocketMiddleware)(socket_types_1.SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER));
        this.io.use(async function (socket, next) {
            try {
                await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, {
                    'socket_ids.random_video_calling_socket': socket.id
                });
            }
            catch (error) {
                error instanceof Error ? console.error(`[random video call socket setup error]`, error.message) : console.error(`[random video call socket setup error]`, error);
                next(new Error('Video Calling Socket Setup error'));
            }
        });
        this.initializeListeners();
    }
    async initializeListeners() {
        this.io.on('connection', (socket) => {
            this.cleanupUserSessions(socket.user?._id);
            socket.on('init-video-call', async () => {
                try {
                    let roomId = (0, crypto_1.randomUUID)();
                    const randomVideoCall = new RandomVideoCall_1.RandomVideoCall({
                        userId: socket.user._id,
                        status: 'searching',
                        roomId: roomId,
                        gender: socket.user.gender
                    });
                    socket.join(roomId);
                    await randomVideoCall.save();
                    socket.emit('video-call-initialized', { data: { roomId } });
                }
                catch (error) {
                    console.error('Error creating video request:', error);
                    socket.emit('call-initialization-error', { message: 'Failed to create video call request' });
                }
            });
            socket.on('connect-video-call', async (roomId) => {
                try {
                    let randomVideoCall = await RandomVideoCall_1.RandomVideoCall.findOne({ roomId: exports.roomIdSchema.parse(roomId) });
                    if (!randomVideoCall)
                        throw new Error("Cannot find Random video call created in the database");
                    let arr = [1, 2, 1, 2, 1, 2];
                    let startSearchNow = ((arr) => {
                        let randomNum = Math.floor(arr.length * Math.random());
                        return arr[randomNum] === 1;
                    })(arr);
                    if (startSearchNow) {
                        let request2 = await this.searchUser(socket.user._id, socket.user.gender);
                        if (request2)
                            this.connectUser(randomVideoCall, request2, socket);
                        else
                            socket.emit('not-connected', { data: null });
                    }
                    else {
                        let timeOut = setTimeout(async () => {
                            let isConnected = await RandomVideoCall_1.RandomVideoCall.exists({
                                roomId: randomVideoCall.roomId,
                                status: 'connected'
                            });
                            if (!isConnected) {
                                let request2 = await this.searchUser(socket.user._id, socket.user.gender);
                                if (request2)
                                    this.connectUser(randomVideoCall, request2, socket);
                                else
                                    socket.emit('not-connected', { data: null });
                            }
                            clearTimeout(timeOut);
                        }, 5000);
                    }
                }
                catch (error) {
                    error instanceof Error ? console.error(error.message) : console.error(error);
                    socket.emit('connection-creation-failed', { message: 'Failed to connect User in 20s video call' });
                }
            });
            socket.on('peer-details', (signal, userBRoomId) => {
                try {
                    this.io.to(exports.roomIdSchema.parse(userBRoomId)).emit('call-user', signal);
                    let timeOut;
                    const endCall = async (room1, room2) => {
                        try {
                            this.io.to(room1.roomId).emit('end-call', room1.roomId);
                            this.io.to(room2.roomId).emit('end-call', room2.roomId);
                            await RandomVideoCall_1.RandomVideoCall.updateMany({
                                status: 'connected',
                                roomId: {
                                    $in: [room1.roomId, room2.roomId]
                                },
                                connectedWith: {
                                    $in: [room1.userId, room2.userId]
                                }
                            }, {
                                status: 'ended'
                            });
                            clearTimeout(timeOut);
                        }
                        catch (error) {
                            console.error(error);
                        }
                    };
                    timeOut = setTimeout(async function () {
                        let request1 = await RandomVideoCall_1.RandomVideoCall.findOne({ roomId: userBRoomId });
                        let request2 = await RandomVideoCall_1.RandomVideoCall.findOne({ userId: socket.user_id });
                        if (request1 && request2)
                            endCall(request1, request2);
                    }, VIDEO_CALL_DURATION + 2500);
                }
                catch (error) {
                    console.error(error);
                    socket.emit('invalid-peer-details', { data: null });
                }
            });
            socket.on('caller-details-request', async () => {
                try {
                    let call2 = await RandomVideoCall_1.RandomVideoCall.findOne({ connectedWith: socket.user._id, status: 'connected' });
                    if (!call2) {
                        return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                    }
                    let caller = await VideoProfile_1.default.findById(call2.connectedWith);
                    if (!caller) {
                        return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                    }
                    socket.emit('caller-details', {
                        name: caller.name,
                        photo: caller.profileImage?.url,
                        email: caller.email
                    });
                }
                catch (error) {
                    console.error(error);
                    return socket.emit('caller-details-error', { message: 'can not find Caller Details' });
                }
            });
            socket.on('leave-call-room', async (roomId) => {
                try {
                    roomId = exports.roomIdSchema.parse(roomId);
                    socket.leave(roomId);
                }
                catch (error) {
                    console.error('[Leave calling Room Error]', error);
                    socket.emit('leave-calling-room-error', { data: null });
                }
            });
            socket.on('stop-video-call', async (roomId) => {
                try {
                    let call2 = await RandomVideoCall_1.RandomVideoCall.findOne({ connectedWith: socket.user._id, status: 'connected' });
                    if (call2) {
                        this.io.to(call2.roomId).emit('end-call', call2.roomId);
                        socket.leave(roomId);
                    }
                }
                catch (error) {
                    console.error(error);
                }
            });
            socket.on('disconnect', async () => {
                try {
                    await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, { 'socket_ids.random_video_calling_socket': null });
                }
                catch (error) {
                    error instanceof Error ? console.error(`[random video call socket removing error]`, error.message) : console.error(`[random video call socket removing error]`, error);
                }
            });
        });
    }
    async searchUser(id, gender) {
        // Fixed query to properly search for users of opposite gender
        const matchingUser = await RandomVideoCall_1.RandomVideoCall.findOne({
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
    async connectUser(request1, request2, socket) {
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
        }
        catch (error) {
            console.error('Error connecting users:', error);
            socket.emit('connection-creation-failed', { message: 'Failed to establish connection' });
        }
    }
    // Helper method to clean up existing sessions for a user
    async cleanupUserSessions(userId) {
        try {
            if (!userId)
                return;
            await RandomVideoCall_1.RandomVideoCall.deleteMany({
                userId: userId,
                status: { $in: ['connected', "searching"] }
            });
        }
        catch (error) {
            console.error('Error cleaning up user sessions:', error);
        }
    }
    // Static method to get instance
    static getInstance(io) {
        return new randomVideoCallSocketService(io);
    }
}
exports.randomVideoCallSocketService = randomVideoCallSocketService;
