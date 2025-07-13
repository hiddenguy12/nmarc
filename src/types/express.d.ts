// src/types/express.declaration.d.ts
import { IAuthSession } from "@/models/AuthSession";
import { IUser } from "../lib/types/user.types";
import { IVideoProfile } from "@/models/VideoProfile";
import { INotificationSocketService } from "@/sockets/notification.socket";
import { File as MulterFile } from 'multer';

declare global {
  namespace Express {
    interface Request {
      authSession?: IAuthSession;
      bearerAccessToken?: string;
      profileType?: "videoProfile" | "matrimony_profile";
      videoProfile?: IVideoProfile | any;
      notifications?: INotificationSocketService;
      user?: IUser; 
      file?: MulterFile;
      files?: MulterFile[];
    }
  }
}


export {}