/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';

export interface ILikedProfile extends Document {
    likerId: mongoose.Types.ObjectId;
    likedId: mongoose.Types.ObjectId;
    likedAt: Date[];
}

const likedProfileSchema = new Schema<ILikedProfile>({
    likerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likedAt: [{
        type: Date,
        required: true,
        default: Date.now
    }]
}, {
    timestamps: false // We'll use likedAt array
});

// Index for querying likes efficiently
likedProfileSchema.index({ likerId: 1, likedId: 1 });
likedProfileSchema.index({ likedAt: -1 });

export const LikedProfile = mongoose.model<ILikedProfile>('LikedProfile', likedProfileSchema);