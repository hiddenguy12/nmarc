"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
const mongoose_1 = require("mongoose");
const MessageSchema = new mongoose_1.Schema({
    id: String,
    room: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'MessagingRoom',
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    type: {
        type: String,
        enum: ['text', 'image', 'gift', 'coin', 'pdf'],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {},
    },
}, { timestamps: true });
exports.Message = (0, mongoose_1.model)('Message', MessageSchema);
