"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationSocketService = exports.Rooms = exports.NotificationType = exports.NotificationFor = void 0;
const auth_schema_1 = require("../lib/schema/auth.schema");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const AuthSession_1 = __importDefault(require("../models/AuthSession"));
const user_1 = require("../models/user");
var NotificationFor;
(function (NotificationFor) {
    NotificationFor["ALL"] = "all_users";
    NotificationFor["MATRIMONY_USERS"] = "matrimony_users";
    NotificationFor["VIDEO_USERS"] = "video_users";
})(NotificationFor || (exports.NotificationFor = NotificationFor = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["ADMIN"] = "admin_notification";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
var Rooms;
(function (Rooms) {
    Rooms["MATRIMONY_ROOMS"] = "matrimonyProfileRoom";
    Rooms["VIDEO_ROOMS"] = "videoProfileRoom";
    Rooms["ALL_USERS_ROOMS"] = "allProfileRoom";
})(Rooms || (exports.Rooms = Rooms = {}));
class NotificationSocketService {
    io;
    constructor(io) {
        this.io = io;
        io.use(async function (socket, next) {
            try {
                let { token, profileType } = await socket.handshake.auth;
                token = auth_schema_1.authSessionValidation.parse(token);
                if (profileType === 'video_users') {
                    let videoCallingMember = await VideoProfile_1.default.findOne({ 'auth.authSession': token });
                    if (videoCallingMember) {
                        socket.user_id = videoCallingMember._id.toString();
                        socket.userProfileType = 'videoProfile';
                        videoCallingMember.socket_ids.notification_socket = socket.id;
                        videoCallingMember.status = 'online';
                        videoCallingMember.lastActive = new Date();
                        await videoCallingMember.save();
                        return next();
                    }
                    else
                        return next(new Error('Failed To Authenticate the User'));
                }
                else {
                    let matrimonyProfile = await AuthSession_1.default.findOne({ key: token }, 'value.userId');
                    if (matrimonyProfile) {
                        socket.user_id = matrimonyProfile.value.userId.toString();
                        socket.userProfileType = 'matrimonyProfile';
                        await user_1.User.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.notification_socket': socket.id,
                            "onlineStatus.isOnline": true,
                            "onlineStatus.lastSeen": Date.now(),
                            "onlineStatus.lastActive": Date.now(),
                        });
                        return next();
                    }
                    else
                        return next(new Error('Failed To Authenticate the User'));
                }
            }
            catch (error) {
                next(new Error('Failed to Authenticate User'));
            }
        });
        this.initializeListeners();
    }
    async initializeListeners() {
        this.io.on('connection', async (socket) => {
            socket.emit('connection-success', null);
            if (socket.userProfileType === 'matrimonyProfile')
                socket.join('matrimonyProfileRoom');
            else if (socket.userProfileType === 'videoProfile')
                socket.join('videoProfileRoom');
            socket.on('disconnect', async () => {
                try {
                    if (socket.userProfileType === 'matrimonyProfile') {
                        socket.leave('matrimonyProfileRoom');
                        await user_1.User.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.notification_socket': null,
                            "onlineStatus.isOnline": false,
                            "onlineStatus.lastSeen": Date.now(),
                            "onlineStatus.lastActive": Date.now(),
                        });
                    }
                    else if (socket.userProfileType === 'videoProfile') {
                        socket.leave('videoProfileRoom');
                        await VideoProfile_1.default.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.notification_socket': null,
                            status: 'offline',
                            lastActive: new Date()
                        });
                    }
                }
                catch (error) {
                    console.error(error);
                }
            });
        });
    }
    static getInstance(io) {
        return new NotificationSocketService(io);
    }
}
exports.NotificationSocketService = NotificationSocketService;
