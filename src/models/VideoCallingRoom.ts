/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Model, Schema ,} from 'mongoose';

type ObjectId = mongoose.Types.ObjectId;



export enum VideoCallStatus {
  PENDING = 'pending',
  ACCAPTED = 'accapted',
  REJECTED='rejected',
  ENDED= 'ended'
}

interface ICaller {
    peer_id : string ;
    user_id :mongoose.Types.ObjectId;
    called_at : Date ;
    socket_id : string;
}

interface IReciever {
    peer_id : string ;
    user_id :mongoose.Types.ObjectId,
    revieved_at : Date ;
    socket_id : string;
}



export interface VideoRoomDocument extends Document {
  roomId: string;
  caller :ICaller , 
  reciever : IReciever ,
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  endedAt?: Date;
  status : VideoCallStatus ,
  max_call_duration : number;  // seconds for calculating 
  used_call_duration :number;
  used_coins : number;
}

/**
 * VideoRoom schema definition
 */
const VideoRoomSchema: Schema<VideoRoomDocument> = new Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status : {
      type : String ,
      enum : Object.values(VideoCallStatus),
      required : true ,
      default : VideoCallStatus.PENDING
    },
    caller : {
        peer_id : {
          type : String ,
          required : true 
        },
        user_id : {
          type : mongoose.SchemaTypes.ObjectId,
          ref :'VideoProfile',
          required : true 
        },
        called_at : Date ,
        socket_id : {
          type : String ,
        }
    },
    reciever : {
        peer_id : {
          type : String ,
          required : true 
        },
        user_id : {
          type : mongoose.SchemaTypes.ObjectId,
          ref :'VideoProfile',
          required : true 
        },
        revieved_at : Date ,
        socket_id : {
          type : String ,
        
        }
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    endedAt: {
      type: Date,
    },
    max_call_duration : Number ,
    used_call_duration : Number,
    used_coins : Number 
  },
  {
    timestamps: true,
  }
);

export interface VideoRoomModel extends Model<VideoRoomDocument> {}



VideoRoomSchema.index({ isActive: 1, createdAt: -1 });
VideoRoomSchema.index({ "caller.user_id": 1 });
VideoRoomSchema.index({ "reciever.user_id": 1 });
VideoRoomSchema.index({ "caller.peer_id": 1 });
VideoRoomSchema.index({ "reciever.peer_id": 1 });
VideoRoomSchema.index({ createdAt: -1 });
VideoRoomSchema.index({ "caller.socket_id": 1, "reciever.socket_id": 1 });

export const VideoRoom: VideoRoomModel = mongoose.model<VideoRoomDocument, VideoRoomModel>('VideoRoom',VideoRoomSchema);