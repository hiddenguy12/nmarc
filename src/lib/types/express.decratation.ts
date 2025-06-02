/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { IAuthSession } from "../../models/AuthSession";
import { IVideoProfile } from "../../models/VideoProfile";
import { INotificationSocketService } from "../../sockets/notification.socket";


declare global {
    namespace Express {
        interface Request {
            authSession?: IAuthSession;
            bearerAccessToken?: string;
            profileType ?: "videoProfile" | "matrimony_profile";
            videoProfile? : IVideoProfile |any;
            notifications ? : INotificationSocketService
        }
    }
  }
