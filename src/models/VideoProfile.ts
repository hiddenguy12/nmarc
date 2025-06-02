/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Mongoose, Schema, model } from 'mongoose';
import { IPassword, IUserImage, Language } from '../lib/types/user.types';


export interface IVideoProfile extends Document {
    _id : mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone : string ;
    profileImage?: IUserImage;
    coverImage?: IUserImage;
    gender: 'male' | 'female' | 'other';
    status: 'online' | 'offline' | 'busy';
    dateOfBirth : Date ,
    age : number ;
    lastActive: Date;
    createdAt?: Date;
    updatedAt?: Date;
    passwordDetails: IPassword,
    languages : Language[],
    
    video_calling_coins : number;
    auth : {
        authSession? : String;
        session_exp_date: Date,
        lastLoggedIn : Date[];
    };
    location :{
        country : string ;
        lat : number ;
        long : number ;
    };
     // Messaging rooms
    messagingRooms : {
        connectedRooms : mongoose.Types.ObjectId[],
        blockedRooms : mongoose.Types.ObjectId[]
    },
    socket_ids : {
        notification_socket :string ;
        messaging_socket : string ;
        video_calling_socket : string;
        random_video_calling_socket : string ;
    }
}


const videoProfileSchema = new Schema<IVideoProfile>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true
        },
        profileImage: {
            url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
            id: { type: String }
        },
        coverImage: {
            url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
            id: { type: String }
        },
        gender: {
            type: String,
            enum: ['male', 'female', 'other'],
            default: 'other'
        },
        dateOfBirth : {
            type : Date ,
            required : true ,
        },
        age : {type : Number , required : true },
        status: {
            type: String,
            enum: ['online', 'offline', 'busy'],
            default: 'online'
        },
        lastActive: {
            type: Date,
            default: Date.now
        },
      
        passwordDetails: {
            type: {
                hashed: String,
                salt: String
            },
            required: true
        },
        languages : {
            type : [{
                type : String ,
                required : true 
            }],  
        },
        video_calling_coins : {
            type : Number ,
            required : true,
            default : 0,
        },
        auth : {
            authSession : {
                type : String , 
                
            },        
            session_exp_date : {
                type : Date ,
                default :() => Date.now() + 30 * 24 * 3600 * 1000 
            },
            lastLoggedIn : [{
                type : Date,
                default : Date.now 
            }]
        },
        location :{
            country : {
                type : String,
            },
            lat : Number ,
            long : Number 
        },
        phone : {
            type : String ,
            required : true ,
            maxlength : 20,
            minlength : 8
        },
        // Messaging Rooms 
        messagingRooms : {
            connectedRooms : [{
                type : mongoose.SchemaTypes.ObjectId ,
                ref : 'MessagingRoom'
            }],
            blockedRooms : [{
                type : mongoose.SchemaTypes.ObjectId ,
                ref : 'MessagingRoom'
            }]
        },

        // Socket Id
        socket_ids : {
            notification_socket : String, 
            messaging_socket: String ,
            video_calling_socket : String,
            random_video_calling_socket : String 
        } 

    },
    { timestamps: true }
);

videoProfileSchema.index({ "auth.isLoggedIn" : 1} , {unique : true });
videoProfileSchema.index({ "auth.authSession" : 1});
videoProfileSchema.index({ "location.country" : 1});
videoProfileSchema.index({ "location.lat" : 1});
videoProfileSchema.index({ "location.long" : 1});
videoProfileSchema.index({ "status" : 1});
videoProfileSchema.index({ "lastActive" : 1});
videoProfileSchema.index({ "email" : 1} , { unique : true });
videoProfileSchema.index({ "phone" : 1} , { unique : true });



const VideoProfile = model<IVideoProfile>('VideoProfile', videoProfileSchema);
export default VideoProfile;