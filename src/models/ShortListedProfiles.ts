/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';

export interface IShortList extends Document {
    shortListerId: mongoose.Types.ObjectId;
    shortListedId: mongoose.Types.ObjectId;
    shortListedAt: Date;
}

const shortListSchema = new Schema<IShortList>({
    shortListerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shortListedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    shortListedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can't shortlist the same profile multiple times
shortListSchema.index({ userId: 1, shortListedId: 1 }, { unique: true });
// Index for quick retrieval of shortlists by userId
shortListSchema.index({ userId: 1, shortListedAt: -1 });

export const ShortList = mongoose.model<IShortList>('ShortList', shortListSchema);