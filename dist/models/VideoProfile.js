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
const mongoose_1 = __importStar(require("mongoose"));
const videoProfileSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    profileImage: {
        url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
        id: { type: String }
    },
    coverImage: {
        url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
        id: { type: String }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other'
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    age: { type: Number, required: true },
    status: {
        type: String,
        enum: ['online', 'offline', 'busy'],
        default: 'online'
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    passwordDetails: {
        type: {
            hashed: String,
            salt: String
        },
        required: true
    },
    languages: {
        type: [{
                type: String,
                required: true
            }],
    },
    video_calling_coins: {
        type: Number,
        required: true,
        default: 0,
    },
    auth: {
        authSession: {
            type: String,
        },
        session_exp_date: {
            type: Date,
            default: () => Date.now() + 30 * 24 * 3600 * 1000
        },
        lastLoggedIn: [{
                type: Date,
                default: Date.now
            }]
    },
    location: {
        country: {
            type: String,
        },
        lat: Number,
        long: Number
    },
    phone: {
        type: String,
        required: true,
        maxlength: 20,
        minlength: 8
    },
    // Messaging Rooms 
    messagingRooms: {
        connectedRooms: [{
                type: mongoose_1.default.SchemaTypes.ObjectId,
                ref: 'MessagingRoom'
            }],
        blockedRooms: [{
                type: mongoose_1.default.SchemaTypes.ObjectId,
                ref: 'MessagingRoom'
            }]
    },
    // Socket Id
    socket_ids: {
        notification_socket: String,
        messaging_socket: String,
        video_calling_socket: String,
        random_video_calling_socket: String
    },
    // User's posts
    posts: [{
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: 'Post',
        }],
    // Coin system
    totalCoin: {
        type: Number,
        default: 0,
        required: true,
    },
    coinHistory: [
        {
            userId: { type: mongoose_1.default.SchemaTypes.ObjectId, ref: 'VideoProfile', required: true },
            status: { type: String, enum: ['sent', 'received'], required: true },
            giftId: { type: mongoose_1.default.SchemaTypes.ObjectId, ref: 'Gift', required: true },
            coinAmount: { type: Number, required: true },
            coinName: { type: String, required: true },
            date: { type: Date, default: Date.now, required: true },
        }
    ],
}, { timestamps: true });
// videoProfileSchema.index({ "auth.isLoggedIn" : 1} , {unique : true });
videoProfileSchema.index({ "auth.authSession": 1 });
videoProfileSchema.index({ "location.country": 1 });
videoProfileSchema.index({ "location.lat": 1 });
videoProfileSchema.index({ "location.long": 1 });
videoProfileSchema.index({ "status": 1 });
videoProfileSchema.index({ "lastActive": 1 });
videoProfileSchema.index({ "email": 1 }, { unique: true });
videoProfileSchema.index({ "phone": 1 }, { unique: true });
const VideoProfile = (0, mongoose_1.model)('VideoProfile', videoProfileSchema);
exports.default = VideoProfile;
