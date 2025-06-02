/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, model, Document, Types } from "mongoose";

export type MessagingMemberType = 'video_calling_member' | 'matrimony_member';

interface IMessagingRoom extends Document {
  memberType: MessagingMemberType;
  members: Types.ObjectId[]; // Array of 2 user IDs
  createdAt: Date;
  updatedAt: Date;
  _id : mongoose.Types.ObjectId
}

const MessagingRoomSchema = new Schema<IMessagingRoom>(
  {
    memberType: {
      type: String,
      enum: ['video_calling_member', 'matrimony_member'],
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const MessagingRoom = model<IMessagingRoom>('MessagingRoom', MessagingRoomSchema);
