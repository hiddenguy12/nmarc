"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagingRoom = void 0;
const mongoose_1 = require("mongoose");
const MessagingRoomSchema = new mongoose_1.Schema({
    memberType: {
        type: String,
        enum: ['video_calling_member', 'matrimony_member'],
        required: true,
    },
    members: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    ],
}, { timestamps: true });
exports.MessagingRoom = (0, mongoose_1.model)('MessagingRoom', MessagingRoomSchema);
