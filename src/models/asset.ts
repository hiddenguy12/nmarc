/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { randomUUID } from 'crypto';
import mongoose, { Document, Schema } from 'mongoose';


export enum AssetType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
  AUDIO = 'audio'
}

export interface IUploadInfo {
  host: string;      
  host_id: string;   
  path?: string;    
}

export interface IAsset extends Document {
  name?: string;
  url: string;
  asset_type: AssetType;
  size?: number;
  created_at: Date;
  updated_at?: Date;
  uploadInfo: IUploadInfo;
  id : string;
}

const UploadInfoSchema = new Schema<IUploadInfo>({
  host: {
    type: String,
    required: [true, 'Host service name is required'],
    trim: true
  },
  host_id: {
    type: String,
    required: [true, 'Host ID is required'],
    trim: true
  },
  path: {
    type: String,
    required: false,
    trim: true
  }
}, { _id: false }); // Disable _id for subdocument

const AssetSchema = new Schema<IAsset>(
  {
    id : {
      type :String,
      required : true,
      index : true ,
      unique : true , 
      immutable : true ,
      default : randomUUID
    },
    name: {
      type: String,
      required: false,
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Asset URL is required'],
      unique: true,
      trim: true
    },
    asset_type: {
      type: String,
      enum: Object.values(AssetType),
      required: [true, 'Asset type is required'],
    },
    size: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Size must be an integer'
      }
    },
    uploadInfo: {
      type: UploadInfoSchema,
      required: [true, 'Upload information is required']
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  }
);


export const Asset = mongoose.model<IAsset>('Asset', AssetSchema);