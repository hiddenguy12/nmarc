"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractBearerToken = void 0;
exports.validateUser = validateUser;
exports.validateVideoProfile = validateVideoProfile;
exports.validateBothProfiledUser = validateBothProfiledUser;
const auth_schema_1 = require("../schema/auth.schema");
const AuthSession_1 = __importDefault(require("../../models/AuthSession"));
const VideoProfile_1 = __importDefault(require("../../models/VideoProfile"));
// Utility function to extract token
const extractBearerToken = (header) => {
    if (!header || !header.startsWith('Bearer ')) {
        return null;
    }
    // Remove 'Bearer ' from the header
    return header.slice(7);
};
exports.extractBearerToken = extractBearerToken;
// Middleware to extract and validate bearer token
async function validateUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, exports.extractBearerToken)(authHeader);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is required'
            });
        }
        let validationResult = await auth_schema_1.authSessionValidation.safeParseAsync(token);
        if (!validationResult.success) {
            return res.status(401).json({
                success: false,
                message: 'Bearer access token is failed to validate',
                error: validationResult.error
            });
        }
        let session = await AuthSession_1.default.findOne({ key: validationResult.data, expiration_date: { $gt: new Date() } });
        if (!session) {
            return res.status(401).json({
                success: false,
                message: 'Bearer access token is failed to validate',
                error: validationResult.error
            });
        }
        req.authSession = session;
        req.bearerAccessToken = token;
        // Attach user info for downstream use
        req.user = { _id: session.value.userId };
        next();
        return;
    }
    catch (error) {
        console.error('Bearer access Token Validation error', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization token'
        });
    }
}
;
async function validateVideoProfile(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, exports.extractBearerToken)(authHeader);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is required'
            });
        }
        let validationResult = await auth_schema_1.authSessionValidation.safeParseAsync(token);
        if (!validationResult.success) {
            return res.status(401).json({
                success: false,
                message: 'Bearer access token is failed to validate',
                error: validationResult.error
            });
        }
        let user = await VideoProfile_1.default.findOne({ 'auth.authSession': token, "auth.session_exp_date": { $gt: new Date() } }).select('-passwordDetails');
        if (user) {
            req.videoProfile = user;
            next();
        }
        else {
            res.status(401).json({
                success: false,
                message: 'Invalid authorization token',
                data: null
            });
            return;
        }
    }
    catch (error) {
        console.error('Bearer access Token Validation error', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization token'
        });
    }
}
;
async function validateBothProfiledUser(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        const token = (0, exports.extractBearerToken)(authHeader);
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Authorization token is required',
            });
        }
        const validationResult = await auth_schema_1.authSessionValidation.safeParseAsync(token);
        if (!validationResult.success) {
            return res.status(401).json({
                success: false,
                message: 'Bearer access token failed to validate',
                error: validationResult.error,
            });
        }
        const matrimonyUserAuthSession = await AuthSession_1.default.findOne({
            key: token,
            expiration_date: { $gt: new Date() },
        });
        if (matrimonyUserAuthSession) {
            req.authSession = matrimonyUserAuthSession;
            req.bearerAccessToken = token;
            req.profileType = 'matrimony_profile';
            return next();
        }
        let user = await VideoProfile_1.default.findOne({
            'auth.authSession': token,
            'auth.session_exp_date': { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Failed to find User Account',
                data: null,
            });
        }
        user = user?.toObject();
        delete user.passwordDetails;
        req.videoProfile = user;
        req.bearerAccessToken = token;
        req.profileType = 'videoProfile';
        return next();
    }
    catch (error) {
        console.error('[Bearer access Token Validation error]', error);
        return res.status(401).json({
            success: false,
            message: 'Invalid authorization token',
        });
    }
}
