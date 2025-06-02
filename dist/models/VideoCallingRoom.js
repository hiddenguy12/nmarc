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
exports.VideoRoom = exports.VideoCallStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var VideoCallStatus;
(function (VideoCallStatus) {
    VideoCallStatus["PENDING"] = "pending";
    VideoCallStatus["ACCAPTED"] = "accapted";
    VideoCallStatus["REJECTED"] = "rejected";
    VideoCallStatus["ENDED"] = "ended";
})(VideoCallStatus || (exports.VideoCallStatus = VideoCallStatus = {}));
/**
 * VideoRoom schema definition
 */
const VideoRoomSchema = new mongoose_1.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    status: {
        type: String,
        enum: Object.values(VideoCallStatus),
        required: true,
        default: VideoCallStatus.PENDING
    },
    caller: {
        peer_id: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: 'VideoProfile',
            required: true
        },
        called_at: Date,
        socket_id: {
            type: String,
        }
    },
    reciever: {
        peer_id: {
            type: String,
            required: true
        },
        user_id: {
            type: mongoose_1.default.SchemaTypes.ObjectId,
            ref: 'VideoProfile',
            required: true
        },
        revieved_at: Date,
        socket_id: {
            type: String,
        }
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    endedAt: {
        type: Date,
    },
    max_call_duration: Number,
    used_call_duration: Number,
    used_coins: Number
}, {
    timestamps: true,
});
VideoRoomSchema.index({ isActive: 1, createdAt: -1 });
VideoRoomSchema.index({ "caller.user_id": 1 });
VideoRoomSchema.index({ "reciever.user_id": 1 });
VideoRoomSchema.index({ "caller.peer_id": 1 });
VideoRoomSchema.index({ "reciever.peer_id": 1 });
VideoRoomSchema.index({ createdAt: -1 });
VideoRoomSchema.index({ "caller.socket_id": 1, "reciever.socket_id": 1 });
exports.VideoRoom = mongoose_1.default.model('VideoRoom', VideoRoomSchema);
