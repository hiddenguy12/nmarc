"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketMiddlewares = socketMiddlewares;
exports.socketMiddlewaresVideoProfile = socketMiddlewaresVideoProfile;
exports.verifiyToken = verifiyToken;
exports.newSocketMiddleware = newSocketMiddleware;
const VideoProfile_1 = __importDefault(require("../../models/VideoProfile"));
const AuthSession_1 = __importDefault(require("../../models/AuthSession"));
const zod_1 = require("zod");
const auth_schema_1 = require("../schema/auth.schema");
const socket_types_1 = require("../types/socket.types");
async function socketMiddlewares(socket, next) {
    try {
        let profileType = socket.handshake.auth.profileType;
        const token = socket.handshake.auth.token;
        let verificationRasult = await verifiyToken({ profileType, token });
        if (verificationRasult === false) {
            next(new Error('Verification Error'));
            return;
        }
        socket.user = verificationRasult.user;
        socket.userProfileType = verificationRasult.profileType;
        next();
    }
    catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Socket Io validation error'));
    }
}
async function socketMiddlewaresVideoProfile(socket, next) {
    try {
        const token = socket.handshake.auth.token;
        let user = await VideoProfile_1.default.findOne({
            'auth.authSession': token,
            'auth.session_exp_date': { $gt: new Date() }
        }, 'name email gender languages status languages lastActive profileImage coverImage')
            .lean();
        if (!user) {
            return next(new Error("Socket authentication Failed"));
        }
        socket.user = user;
        next();
    }
    catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Socket Io validation error'));
    }
}
async function verifiyToken(auth) {
    try {
        let Schema = zod_1.z.object({
            profileType: zod_1.z.enum(['videoProfile', 'matrimonyProfile']),
            token: auth_schema_1.authSessionValidation
        });
        let { profileType, token } = Schema.parse({ profileType: auth.profileType, token: auth.token });
        if (profileType === 'matrimonyProfile') {
            let user = await AuthSession_1.default.findOne({ key: token, expiration_date: { $gt: new Date() } }, 'value').lean();
            if (!user) {
                throw new Error("User is completed successfully");
            }
            return { profileType, user };
        }
        let user = await VideoProfile_1.default.findOne({
            'auth.authSession': token,
            'auth.session_exp_date': { $gt: new Date() }
        }, 'name email gender languages status languages lastActive profileImage coverImage').lean();
        if (!user) {
            throw new Error("User is completed successfully");
        }
        return { profileType, user };
    }
    catch (error) {
        console.error('[Verfify Socket Token error]) ', error);
        return false;
    }
}
;
function newSocketMiddleware(forUser) {
    return async function (socket, next) {
        try {
            let authHeader = socket.handshake.headers['authorization'];
            // log(authHeader)
            if (!authHeader) {
                throw new Error('Socket Authentication Error: Auth header is missing');
            }
            if (!authHeader.includes(':')) {
                throw new Error('Socket Authentication Error: Invalid auth header format - missing separator');
            }
            const isValidUserType = (authHeader.startsWith(socket_types_1.SOCKET_USER_TYPE.MATRIMONY_MEMBERS) ||
                authHeader.startsWith(socket_types_1.SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER));
            if (!isValidUserType) {
                throw new Error('Socket Authentication Error: Invalid user type');
            }
            const authParts = authHeader.split(':');
            if (authParts.length !== 2) {
                throw new Error('Socket Authentication Error: Invalid auth header format - wrong number of parts');
            }
            let profileType = authHeader.split(':')[0];
            let token = (zod_1.z.string().regex(/^[0-9A-Fa-f]{64}$/)).parse(authHeader.split(':')[1]);
            // log([profileType , token])
            if (profileType === socket_types_1.SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER && forUser === socket_types_1.SOCKET_USER_TYPE.MATRIMONY_MEMBERS) {
                throw new Error('User Is not allowed in this socket');
            }
            if (profileType === socket_types_1.SOCKET_USER_TYPE.MATRIMONY_MEMBERS && forUser === socket_types_1.SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER) {
                throw new Error('User Is not allowed in this socket');
            }
            if (profileType === socket_types_1.SOCKET_USER_TYPE.MATRIMONY_MEMBERS) {
                let session = await AuthSession_1.default.findOne({ key: token, expiration_date: { $gt: new Date() } });
                if (!session)
                    throw new Error('User is logged Out');
                socket.userProfileType = 'matrimonyProfile';
                socket.user_id = session?.value.userId;
                return next();
            }
            if (profileType === socket_types_1.SOCKET_USER_TYPE.VIDEO_CALLING_MEMBER) {
                let user = await VideoProfile_1.default.findOne({
                    'auth.authSession': token,
                    'auth.session_exp_date': { $gt: new Date() }
                });
                if (!user)
                    throw new Error('User is logged Out');
                socket.user_id = user._id.toString();
                socket.userProfileType = 'videoProfile';
                // log(user._id)
                return next();
            }
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Socket authentication error:', error.message);
                next(new Error(error.message));
                return;
            }
            console.error('Socket authentication error:', error);
            next(new Error('Socket Io authentication error'));
        }
    };
}
