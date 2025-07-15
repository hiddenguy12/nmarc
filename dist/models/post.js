"use strict";
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
exports.Post = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Comment Reply Schema
const replySchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { _id: true });
// Comment Schema
const commentSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    replies: [replySchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { _id: true });
// Post Schema
const postSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, trim: true, default: 'general' },
    image: {
        url: { type: String },
        public_id: { type: String },
        assetId: { type: mongoose_1.Types.ObjectId, ref: 'Asset' },
    },
    // Add YouTube metadata field
    youtubeMeta: {
        videoId: { type: String },
        url: { type: String },
        title: { type: String },
        description: { type: String },
        thumbnail: { type: String },
        channelTitle: { type: String },
        publishedAt: { type: Date },
    },
    likesIDs: [{ type: mongoose_1.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },
    comments: [commentSchema],
    commentsCount: { type: Number, default: 0 },
    shareCounts: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    // Additional fields for extensibility
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
exports.Post = mongoose_1.default.model('Post', postSchema);
