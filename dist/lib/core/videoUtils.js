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
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRoomToken = generateRoomToken;
exports.getTurnCredentials = getTurnCredentials;
exports.generateSecurityToken = generateSecurityToken;
exports.verifySecurityToken = verifySecurityToken;
const crypto_1 = __importStar(require("crypto"));
/**
 * Generate a unique room token for the video call
 * This is a simplified version. In production, you might want to:
 * 1. Use a third-party video service (Twilio, Agora, etc.)
 * 2. Create more secure tokens with appropriate TTL
 */
async function generateRoomToken() {
    return `room_${(0, crypto_1.randomUUID)()}`;
}
/**
 * Get TURN server credentials
 * In a real application, you would integrate with actual TURN servers
 */
function getTurnCredentials() {
    // In production, use a real TURN server service
    return {
        iceServers: [
            {
                urls: [
                    'stun:stun.l.google.com:19302',
                    'stun:stun1.l.google.com:19302',
                ],
            },
            // Example TURN server config (replace with actual credentials)
            // {
            //   urls: ['turn:your-turn-server.com:3478'],
            //   username: 'username',
            //   credential: 'password'
            // }
        ],
    };
}
/**
 * Generate a time-limited token for security
 * (Example implementation - would need to be expanded in production)
 */
function generateSecurityToken(userId, roomId) {
    const hmac = crypto_1.default.createHmac('sha256', process.env.VIDEO_SECRET || 'video-secret');
    const expiry = Date.now() + 3600 * 1000; // 1 hour from now
    const data = `${userId}:${roomId}:${expiry}`;
    const signature = hmac.update(data).digest('hex');
    return `${data}:${signature}`;
}
/**
 * Verify a security token
 */
function verifySecurityToken(token) {
    try {
        const [userId, roomId, expiry, signature] = token.split(':');
        // Check if token has expired
        if (parseInt(expiry) < Date.now()) {
            return { valid: false };
        }
        // Verify signature
        const hmac = crypto_1.default.createHmac('sha256', process.env.VIDEO_SECRET || 'video-secret');
        const data = `${userId}:${roomId}:${expiry}`;
        const expectedSignature = hmac.update(data).digest('hex');
        if (signature !== expectedSignature) {
            return { valid: false };
        }
        return { valid: true, userId, roomId };
    }
    catch (error) {
        return { valid: false };
    }
}
