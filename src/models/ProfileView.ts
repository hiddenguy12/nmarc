/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';

export interface IProfileView extends Document {
    viewerId: mongoose.Types.ObjectId;
    viewedId: mongoose.Types.ObjectId;
    viewedAt: Date;
}

const profileViewSchema = new Schema<IProfileView>({
    viewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    viewedAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}, {
    timestamps: false // We only need viewedAt
});


profileViewSchema.index({ viewedAt: -1 });

export const ProfileView = mongoose.model<IProfileView>('ProfileView', profileViewSchema);