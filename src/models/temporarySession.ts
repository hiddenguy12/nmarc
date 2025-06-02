/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Schema } from 'mongoose';

export enum TemporarySessionNames {
    FORGET_PASSWORD_SESSION = "forget_password_session",
    REGISTRATION_SESSION = 'registration_session',
    VIDEO_PROFILE_REGISTATION = "video_profile_regirstation_session",
    VIDEO_PROFILE_FORGET_PASSWORD = "video_profile_forget_password"
}

interface ITemporarySession extends Document {
    name: TemporarySessionNames;
    value: string;
    key?: string;
    created_at: Date;
    updated_at?: Date;
}

let temporarySessionSchema = new Schema<ITemporarySession>(
    {
        name: {
            type: String,
            required: true,
            enum: Object.values(TemporarySessionNames)
        },
        key: {
            type: String,
            required: false,
        },
        value: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    }
);

temporarySessionSchema.index({ created_at: 1 }, { expireAfterSeconds: 600 });
// The temporary session will automatically be deleted after 600 seconds of creation

const TemporarySession = mongoose.model<ITemporarySession>('TemporarySession', temporarySessionSchema);
export default TemporarySession;