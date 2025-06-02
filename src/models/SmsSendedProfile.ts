/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';

export interface ISmsSendedProfile extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    smsType: string;
    smsStatus: string;
    sentAt: Date[];
}

const smsSendedProfileSchema = new Schema<ISmsSendedProfile>({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    smsType: {
        type: String,
        required: true,
        enum: ['INTEREST', 'INTRODUCTION', 'CUSTOM'],
        default: 'INTEREST'
    },
    smsStatus: {
        type: String,
        required: true,
        enum: ['SENT', 'FAILED', 'PENDING'],
        default: 'PENDING'
    },
    sentAt: [{
        type: Date,
        required: true,
        default: Date.now
    }]
}, {
    timestamps: false // We'll use sentAt array
});

// Indexes for efficient querying
smsSendedProfileSchema.index({ senderId: 1, receiverId: 1 });
smsSendedProfileSchema.index({ sentAt: -1 });
smsSendedProfileSchema.index({ smsStatus: 1 });

export const SmsSendedProfile = mongoose.model<ISmsSendedProfile>('SmsSendedProfile', smsSendedProfileSchema);