/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema, Document } from 'mongoose';
import { Language } from '../lib/types/user.types';
import { randomUUID } from 'crypto';

export interface IRandomVideoCall extends Document {
  userId: mongoose.Types.ObjectId;
  id : string ;
  status: 'searching' | 'connected' | 'ended';
  connectedWith?: mongoose.Types.ObjectId;

  createdAt: Date;
  updatedAt: Date;
  socketId: string;
  roomId: string;
  gender : string ;
}

const RandomVideoCallSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'VideoProfile',
      required: true,
    },
    id : {
      type : String ,
      required : true , 
      default :() =>  randomUUID()
    },
    status: {
      type: String,
      enum: ['searching', 'connected', 'ended'],
      default: 'searching',
    },
    connectedWith: {
      type: Schema.Types.ObjectId,
      ref: 'VideoProfile',
    },
    roomId : {
      type : String
    },
    gender : String 

  },
  { timestamps: true }
);


export const RandomVideoCall = mongoose.model<IRandomVideoCall>('RandomVideoCall', RandomVideoCallSchema);