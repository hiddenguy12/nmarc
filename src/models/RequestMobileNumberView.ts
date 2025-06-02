/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';

export interface IRequestMobileNumberView extends Document {
    requesterId: mongoose.Types.ObjectId;
    requestedId: mongoose.Types.ObjectId;
    requestedAt: Date[];
     
}

const requestMobileNumberViewSchema = new Schema<IRequestMobileNumberView>({
    requesterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedAt: [{
        type: Date,
        required: true,
        default: Date.now
    }],
   
}, {
    timestamps: false // We'll use requestedAt array
});

// Indexes for efficient querying
requestMobileNumberViewSchema.index({ requesterId: 1, requestedId: 1 });
requestMobileNumberViewSchema.index({ requestedAt: -1 });
requestMobileNumberViewSchema.index({ status: 1 });
requestMobileNumberViewSchema.index({ expiresAt: 1 });

export const RequestMobileNumberView = mongoose.model<IRequestMobileNumberView>('RequestMobileNumberView', requestMobileNumberViewSchema);