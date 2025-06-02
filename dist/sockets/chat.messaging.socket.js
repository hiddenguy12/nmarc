"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = configureChatMessagingSocket;
const MessagingRooms_1 = require("../models/MessagingRooms");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const user_1 = require("../models/user");
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const zod_1 = require("zod");
const Message_1 = require("../models/Message");
const date_fns_1 = require("date-fns");
const Gifts_1 = __importDefault(require("../models/Gifts"));
const socket_middleware_1 = require("../lib/middlewares/socket.middleware");
const socket_types_1 = require("../lib/types/socket.types");
const mongoose_1 = __importStar(require("mongoose"));
const roomIdSchema = zod_1.z.string().refine(data => (0, mongoose_1.isValidObjectId)(data), { message: "Room is not valid mongoose object id" });
async function configureChatMessagingSocket(io) {
    io.use((0, socket_middleware_1.newSocketMiddleware)(socket_types_1.SOCKET_USER_TYPE.ALL));
    io.use(async (socket, next) => {
        try {
            switch (socket.userProfileType) {
                case 'videoProfile':
                    await user_1.User.findByIdAndUpdate(socket.user_id, {
                        'socket_ids.messaging_socket': socket.id
                    });
                    break;
                case 'matrimonyProfile':
                    await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, {
                        'socket_ids.messaging_socket': socket.id
                    });
                    break;
            }
            next();
        }
        catch (error) {
            console.error(`[chat message socket id adding error]`);
            next(new Error('Unknown Error'));
        }
    });
    io.on('connection', async (socket) => {
        socket.emit('client:connected', { message: 'connection SuccessFull' });
        socket.on('server:initialize-message', async () => {
            try {
                switch (socket.userProfileType) {
                    case 'matrimonyProfile':
                        let user = await user_1.User.findById(socket.user_id);
                        if (user) {
                            // if (
                            //     !user.membership?.currentMembership ||
                            //     user.membership?.currentMembership?.membership_exipation_date.getTime() < Date.now()
                            // ) {
                            //     return socket.emit('client:initialize-message-error' , { message : "You do not have active membership" });
                            // }
                            let rooms = await user.messagingRooms.connectedRooms;
                            for (let i = 0; i < rooms.length; i++) {
                                const element = rooms[i];
                                socket.join(element.toString());
                            }
                            let db_rooms = (await MessagingRooms_1.MessagingRoom.find({
                                memberType: "matrimony_member",
                                _id: {
                                    $in: [rooms]
                                }
                            }))
                                .map((element) => {
                                return ({
                                    room_id: element._id,
                                    user2_id: element.members.filter(el => el.toString() != user?._id?.toString()).join(''),
                                });
                            });
                            let user2_details = await user_1.User.find({
                                _id: { $in: db_rooms.map(el => el.user2_id) }
                            }, "name profileImage _id");
                            let activeRooms = [];
                            for (let i = 0; i < user2_details.length; i++) {
                                const element = user2_details[i];
                                let db_room = db_rooms.find((room) => {
                                    if (room.user2_id == element._id?.toString())
                                        return room;
                                });
                                if (db_room) {
                                    activeRooms.push({
                                        userName: element.name,
                                        userId: element._id,
                                        room: db_room.room_id
                                    });
                                }
                            }
                            socket.emit('client:message-initialization-completed', activeRooms);
                        }
                        break;
                    case 'videoProfile':
                        let videoUser = await VideoProfile_1.default.findById(socket.user_id);
                        if (videoUser) {
                            let rooms = await videoUser.messagingRooms.connectedRooms;
                            for (let i = 0; i < rooms.length; i++)
                                socket.join(rooms[i].toString());
                            let db_rooms = (await MessagingRooms_1.MessagingRoom.find({
                                memberType: 'video_calling_member',
                                _id: {
                                    $in: [rooms]
                                }
                            }))
                                .map((element) => {
                                return ({
                                    room_id: element._id,
                                    user2_id: element.members.filter(el => el.toString() != videoUser._id.toString()).join(''),
                                });
                            });
                            let user2_details = await VideoProfile_1.default.find({
                                _id: { $in: db_rooms.map(el => el.user2_id) },
                            }, "name profileImage _id");
                            let activeRooms = [];
                            for (let i = 0; i < user2_details.length; i++) {
                                const element = user2_details[i];
                                let db_room = db_rooms.find((room) => {
                                    if (room.user2_id == element._id?.toString())
                                        return room;
                                });
                                if (db_room) {
                                    activeRooms.push({
                                        userName: element.name,
                                        userId: element._id,
                                        room: db_room.room_id
                                    });
                                }
                            }
                            socket.emit('client:message-initialization-completed', activeRooms);
                        }
                        break;
                }
            }
            catch (error) {
                console.error(error);
                socket.emit('client:initialize-message-error', { message: error instanceof Error ? error.message : "Failed to initialize message" });
            }
        });
        socket.on('server:open-message-room', async (messengerId) => {
            try {
                messengerId = schemaComponents_1._idValidator.parse(messengerId);
                let room_id;
                if (messengerId.toString() === socket.user_id.toString()) {
                    return socket.emit('client:message-room-opening-error', { messengerId, message: "You can not message Your self" });
                }
                switch (socket.userProfileType) {
                    case 'matrimonyProfile':
                        {
                            let existingRoom = await MessagingRooms_1.MessagingRoom.findOne({
                                $or: [
                                    {
                                        memberType: 'matrimony_member',
                                        members: { $all: [messengerId, socket.user_id] }
                                    },
                                    {
                                        memberType: 'matrimony_member',
                                        members: { $all: [socket.user_id, messengerId] }
                                    }
                                ],
                            });
                            if (existingRoom) {
                                room_id = existingRoom._id;
                            }
                            let otherUser = await user_1.User.findById(messengerId, 'name profileImage _id socket_ids.messaging_socket');
                            if (!otherUser)
                                return socket.emit('client:message-room-opening-error', { message: "Another User Does Not Exist", messengerId });
                            if (otherUser && room_id) {
                                socket.emit('client:messaging-room-opened', { roomId: room_id, otherUser, messengerId });
                                return;
                            }
                            let room = await MessagingRooms_1.MessagingRoom.create({
                                members: [socket.user_id, otherUser._id],
                                memberType: 'matrimony_member'
                            });
                            await user_1.User.findByIdAndUpdate(socket.user_id, { $addToSet: { 'messagingRooms.connectedRooms': room._id } });
                            await user_1.User.findByIdAndUpdate(otherUser._id, { $addToSet: { 'messagingRooms.connectedRooms': room._id } });
                            let userA = await user_1.User.findById(socket.user_id, 'name profileImage _id').lean();
                            if (otherUser.socket_ids?.messaging_socket)
                                io.to(otherUser.socket_ids.messaging_socket).emit('client:messaging-room-opened', { roomId: room._id, otherUser: userA });
                            socket.emit('client:messaging-room-opened', { roomId: room._id, otherUser, messengerId });
                            return;
                        }
                        ;
                    case 'videoProfile':
                        {
                            let existingRoom = await MessagingRooms_1.MessagingRoom.findOne({
                                memberType: 'video_calling_member',
                                $or: [
                                    {
                                        members: { $all: [messengerId, socket.user_id] }
                                    },
                                    {
                                        members: { $all: [socket.user_id, messengerId] }
                                    }
                                ],
                            });
                            if (existingRoom)
                                room_id = existingRoom._id;
                            let otherUser = await VideoProfile_1.default.findById(messengerId, 'name profileImage _id socket_ids.messaging_socket');
                            if (!otherUser)
                                return socket.emit('client:message-room-opening-error', { messengerId, message: "Another User Does Not Exist" });
                            if (otherUser && room_id) {
                                return socket.emit('client:messaging-room-opened', { roomId: room_id, otherUser, messengerId });
                            }
                            let room = await MessagingRooms_1.MessagingRoom.create({
                                members: [socket.user_id, otherUser._id],
                                memberType: 'video_calling_member'
                            });
                            await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, { $addToSet: { 'messagingRooms.connectedRooms': room._id } });
                            await VideoProfile_1.default.findByIdAndUpdate(otherUser._id, { $addToSet: { 'messagingRooms.connectedRooms': room._id } });
                            let userA = await user_1.User.findById(socket.user_id);
                            if (otherUser.socket_ids?.messaging_socket)
                                io.to(otherUser.socket_ids.messaging_socket).emit('client:messaging-room-opened', { roomId: room._id, otherUser: userA, messengerId });
                            socket.emit('client:messaging-room-opened', { roomId: room._id, otherUser, messengerId });
                            return;
                        }
                        ;
                }
            }
            catch (error) {
                console.error(error);
                socket.emit('client:message-room-opening-error', { message: "Failed Open The message room" });
            }
        });
        socket.on('server:join-room', async (uuid) => {
            try {
                const validatedRoomId = roomIdSchema.parse(uuid);
                const room = await MessagingRooms_1.MessagingRoom.findById(validatedRoomId);
                if (!room) {
                    throw new Error('Room not found');
                }
                if (!room.members.includes(new mongoose_1.default.Types.ObjectId(socket.user_id))) {
                    throw new Error('Not authorized to join this room');
                }
                await socket.join(validatedRoomId);
                socket.emit('client:joined-room', { roomId: validatedRoomId });
            }
            catch (error) {
                console.error(error);
                socket.emit('client:join-room-error', { message: error instanceof Error ? error.message : "Unknown Error" });
            }
        });
        socket.on('server:typing-start', (roomId) => {
            if ((roomIdSchema.safeParse(roomId)).success) {
                socket.broadcast.to(roomId).emit('client:user-typing', {
                    userId: socket.user_id,
                    roomId
                });
            }
        });
        socket.on('server:typing-end', (roomId) => {
            if ((roomIdSchema.safeParse(roomId)).success) {
                socket.broadcast.to(roomId).emit('client:user-stopped-typing', {
                    userId: socket.user_id,
                    roomId
                });
            }
        });
        socket.on('server:send-message-event', async function (msg, msg_id, roomId) {
            try {
                msg = (zod_1.z.string().trim()
                    .min(1)
                    .max(1000)
                    .refine(val => !/(.)\1{6,}/g.test(val))
                    .refine(str => !/<script.*?>.*?<\/script>/gi.test(str), { message: "Scripts not allowed" })
                    .refine(str => !/\$|\{|\}|\b(?:\$ne|\$gt|\$lt|\$or|\$where)\b/gi.test(str), { message: "Possible injection detected" })
                    .refine(str => /^[\x00-\x7F]*$/.test(str), // ASCII filter (optional)
                { message: "Unsupported characters" })).parse(msg);
                msg_id = schemaComponents_1.uuidValidator.parse(msg_id);
                roomId = roomIdSchema.parse(roomId);
                let room = await MessagingRooms_1.MessagingRoom.findOne({ _id: roomId });
                if (!room)
                    throw new Error("Message Room Is not valid");
                if (!room.members.includes(new mongoose_1.default.Types.ObjectId(socket.user_id))) {
                    throw new Error('Not authorized to message in this room');
                }
                let message = await Message_1.Message.create({
                    room: room._id,
                    sender: socket.user_id,
                    type: 'text',
                    content: msg,
                    id: msg_id
                });
                socket.broadcast.to(roomId).emit('client:unseen-message', {
                    message: msg,
                    msg_id,
                    message_id: message._id,
                    sender: socket.user_id,
                    roomId,
                });
                socket.emit('client:message-send-successful', { msg_id, message_id: message._id, roomId });
                return;
            }
            catch (error) {
                error instanceof Error ? console.log(error.message) : console.error(error);
                socket.emit('client:sent-message-failed', { msg_id });
            }
        });
        socket.on('server:send-image-event', async function (url, msg_id, roomId) {
            try {
                (zod_1.z.object({ url: zod_1.z.string().url().trim(), roomId: zod_1.z.string().uuid().trim() })).parse({ url, roomId });
                roomId = schemaComponents_1._idValidator.parse(roomId);
                msg_id = schemaComponents_1.uuidValidator.parse(msg_id);
                let room = await MessagingRooms_1.MessagingRoom.findOne({ _id: roomId });
                if (!room)
                    throw new Error("Message Room Is not valid");
                if (!room.members.includes(new mongoose_1.default.Types.ObjectId(socket.user_id))) {
                    throw new Error('Not authorized to message in this room');
                }
                let message = await Message_1.Message.create({
                    room: room._id,
                    sender: socket.user_id,
                    type: 'image',
                    content: url,
                    id: msg_id
                });
                socket.broadcast.to(roomId).emit('client:unseen-image', {
                    image: url,
                    msg_id,
                    message_id: message._id,
                    sender: socket.user_id,
                    roomId
                });
                socket.emit('client:image-send-successful', { message_id: message._id, msg_id, roomId });
                return;
            }
            catch (error) {
                error instanceof Error ? console.log(error.message) : console.error(error);
                ;
                socket.emit('client:sent-image-failed', { msg_id });
            }
        });
        socket.on('server:send-pdf-event', async function (pdf_id, pdfName, msg_id, roomId) {
            try {
                [pdf_id, pdfName, roomId, msg_id] = [
                    schemaComponents_1.uuidValidator.parse(pdf_id),
                    zod_1.z.string().trim().min(1).max(120).parse(pdfName),
                    schemaComponents_1._idValidator.parse(roomId),
                    schemaComponents_1._idValidator.parse(msg_id)
                ];
                let room = await MessagingRooms_1.MessagingRoom.findOne({ _id: roomId });
                if (!room)
                    throw new Error("Message Room Is not valid");
                if (!room.members.includes(new mongoose_1.default.Types.ObjectId(socket.user_id))) {
                    throw new Error('Not authorized to message in this room');
                }
                let message = await Message_1.Message.create({
                    room: room._id,
                    sender: socket.user_id,
                    type: 'pdf',
                    content: pdf_id,
                    id: msg_id
                });
                socket.broadcast.to(roomId).emit('client:unseen-pdf', {
                    pdf_id,
                    pdfName,
                    message_id: message._id,
                    msg_id,
                    sender: socket.user_id,
                    roomId
                });
                socket.emit('client:pdf-send-successful', { message_id: message._id, msg_id, roomId });
            }
            catch (error) {
                error instanceof Error ? console.log(error.message) : console.error(error);
                ;
                socket.emit('client:sent-pdf-failed', { msg_id });
            }
        });
        socket.on('server:send-gift-event', async (gift_id, msg_id, roomId) => {
            try {
                if (socket.userProfileType !== 'videoProfile') {
                    socket.emit('client:sent-gift-failed', { message: "Sending Gifts is for Video calling User" });
                    return;
                }
                roomId = roomIdSchema.parse(roomId);
                gift_id = schemaComponents_1._idValidator.parse(gift_id);
                msg_id = schemaComponents_1.uuidValidator.parse(msg_id);
                let room = await MessagingRooms_1.MessagingRoom.findOne({
                    _id: roomId,
                    memberType: "video_calling_member"
                });
                if (!room)
                    throw new Error("Message Room Is not valid");
                if (!room.members.includes(new mongoose_1.default.Types.ObjectId(socket.user_id)))
                    throw new Error('Not authorized to message in this room');
                // 4. Get sender's profile and gift details
                let sender = await VideoProfile_1.default.findById(socket.user_id);
                let gift = await Gifts_1.default.findById(gift_id);
                if (!sender || !gift)
                    throw new Error("Failed to load sender or gift details");
                // 5. Check if sender has enough coins
                if (sender.video_calling_coins < gift.coins) {
                    socket.emit('client:sent-gift-failed', {
                        message: "Insufficient coins to send this gift"
                    });
                    return;
                }
                let receiver = room.members.find(member => member.toString() !== socket.user_id);
                if (!receiver) {
                    throw new Error("Failed to find gift receiver");
                }
                // await VideoProfile.findByIdAndUpdate(sender._id, {
                //     $inc: { video_calling_coins: -gift.coins }
                // });
                // await VideoProfile.findByIdAndUpdate(receiver._id, {
                //     $inc: { video_calling_coins: gift.coins }
                // });
                let message = await Message_1.Message.create({
                    room: room._id,
                    sender: socket.user_id,
                    type: 'gift',
                    content: gift._id.toString(),
                    id: msg_id
                });
                socket.broadcast.to(roomId).emit('client:received-gift', {
                    gift_id: gift._id,
                    gift_name: gift.name,
                    gift_image: gift.image,
                    msg_id,
                    // coins: gift.coins,
                    message_id: message._id,
                    sender: socket.user_id,
                    senderName: sender.name,
                    roomId
                });
                socket.emit('client:gift-send-successful', {
                    msg_id,
                    message_id: message._id,
                    roomId,
                    remaining_coins: sender.video_calling_coins - gift.coins
                });
            }
            catch (error) {
                error instanceof Error ? console.log(error.message) : console.error(error);
                ;
                socket.emit('client:sent-gift-failed', { gift_id });
            }
        });
        socket.on('server:check-msg', async (fromDate, roomId) => {
            try {
                roomId = roomIdSchema.parse(roomId);
                fromDate = zod_1.z.string().transform(str => new Date(str)).pipe(zod_1.z.date());
                if (!(0, date_fns_1.isBefore)(fromDate, new Date())) {
                    throw new Error("Invalid Message Date");
                }
                let room = await MessagingRooms_1.MessagingRoom.findOne({ _id: roomId, memberType: "video_calling_member" }).populate('members');
                if (!room)
                    throw new Error("Message Room Is not valid");
                let messages = await Message_1.Message.find({
                    createdAt: { $gte: fromDate },
                    room: room._id,
                    sender: { $ne: socket.user_id }
                }, "type content id").lean();
                messages = messages.map(function (message) {
                    message.msg_id = message.id;
                    delete message.id;
                    return message;
                });
                socket.emit('client:found-prev-message', { roomId, messages, fromDate });
                return;
            }
            catch (error) {
                error instanceof Error ? console.log(error.message) : console.error(error);
                ;
                socket.emit('client:check-msg-error', { message: null });
            }
        });
        socket.on('disconnect', async () => {
            try {
                switch (socket.userProfileType) {
                    case 'matrimonyProfile':
                        await user_1.User.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.messaging_socket': null
                        });
                        break;
                    case 'videoProfile':
                        await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.messaging_socket': null
                        });
                        break;
                }
            }
            catch (error) {
                console.error('[Error handling disconnect in chat messaging socket]', error);
            }
        });
    });
    return io;
}
