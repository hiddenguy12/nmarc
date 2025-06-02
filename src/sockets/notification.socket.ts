/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { ExtendedError, Socket } from "socket.io";
import { Namespace } from "socket.io";
import { verifiyToken } from "../lib/middlewares/socket.middleware";
import { NextFunction } from "express";
import { z } from "zod";
import { authSessionValidation } from "../lib/schema/auth.schema";
import VideoProfile from "../models/VideoProfile";
import AuthSession from "../models/AuthSession";
import { User } from "../models/user";

export enum NotificationFor {
    ALL= 'all_users',
    MATRIMONY_USERS= 'matrimony_users',
    VIDEO_USERS= 'video_users',
}
export enum NotificationType {
    ADMIN = "admin_notification"
}
export enum Rooms {
    MATRIMONY_ROOMS = 'matrimonyProfileRoom',
    VIDEO_ROOMS = 'videoProfileRoom',
    ALL_USERS_ROOMS = 'allProfileRoom',
}


export interface INotificationSocketService {
    io : Namespace ;
}

export class NotificationSocketService {
    public io: Namespace;
   
    constructor(io: Namespace) {
        this.io = io;
        io.use(async function (socket, next: (error?: ExtendedError | undefined) => void): Promise<any> {
            try {
                let { token, profileType } = await socket.handshake.auth;
                token = authSessionValidation.parse(token);
                if (profileType === 'video_users') {
                    let videoCallingMember = await VideoProfile.findOne({ 'auth.authSession': token });
                    if (videoCallingMember) {
                        socket.user_id = videoCallingMember._id.toString();
                        socket.userProfileType = 'videoProfile';
                        videoCallingMember.socket_ids.notification_socket = socket.id ;
                        videoCallingMember.status = 'online';
                        videoCallingMember.lastActive = new Date();
                        await videoCallingMember.save();
                        return next();
                    } else return next(new Error('Failed To Authenticate the User'));
                } else {
                    let matrimonyProfile = await AuthSession.findOne({ key: token }, 'value.userId');
                    if (matrimonyProfile) {
                        socket.user_id = matrimonyProfile.value.userId.toString();
                        socket.userProfileType = 'matrimonyProfile';
                        await User.findByIdAndUpdate(socket.user_id, {
                            'socket_ids.notification_socket': socket.id,
                            "onlineStatus.isOnline": true,
                            "onlineStatus.lastSeen": Date.now(),
                            "onlineStatus.lastActive": Date.now(),
                        });
                        return next();
                    } else return next(new Error('Failed To Authenticate the User'));
                }
            } catch (error) {
                next(new Error('Failed to Authenticate User'));
            }
        });
        this.initializeListeners();
    }

    private async initializeListeners() {
        this.io.on('connection', async (socket: Socket) => {
        
            
            socket.emit('connection-success' , null) ;

            if (socket.userProfileType === 'matrimonyProfile') socket.join('matrimonyProfileRoom');
            else if (socket.userProfileType === 'videoProfile') socket.join('videoProfileRoom');


            socket.on('disconnect',async () => {
                try {
                    if (socket.userProfileType === 'matrimonyProfile') {
                        socket.leave('matrimonyProfileRoom');
                        await User.findByIdAndUpdate(socket.user_id , {
                            'socket_ids.notification_socket' : null,
                            "onlineStatus.isOnline": false,
                            "onlineStatus.lastSeen": Date.now(),
                            "onlineStatus.lastActive": Date.now(),
                        });
                    }
                    else if (socket.userProfileType === 'videoProfile') {
                        socket.leave('videoProfileRoom');
                         await VideoProfile.findByIdAndUpdate(socket.user_id , {
                            'socket_ids.notification_socket' : null,
                            status : 'offline',
                            lastActive : new Date()
                        });
                    }
                } catch (error) {
                    console.error(error);
                }
            });

        });
    }

    


    static getInstance(io: Namespace) { 
        return new NotificationSocketService(io);
    }
}