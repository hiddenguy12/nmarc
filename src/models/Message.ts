/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
import { Types, Schema, model } from "mongoose";


type MessageType = 'text' | 'image' | 'gift' | 'coin' | 'system';

interface IMessage extends Document {
  id: string;
  _id: Types.ObjectId;
  room: Types.ObjectId;
  sender: Types.ObjectId;
  type: MessageType;
  content: string; // Text or URL
  metadata?: any; // Extra info for gifts/coins etc.
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    id: String,
    room: {
      type: Schema.Types.ObjectId,
      ref: 'MessagingRoom',
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
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
      type: Schema.Types.Mixed,
      default: {},
    },

  },
  { timestamps: true }
);

export const Message = model<IMessage>('Message', MessageSchema);
