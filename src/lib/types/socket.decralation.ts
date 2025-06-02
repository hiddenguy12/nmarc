/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Mongoose } from "mongoose";
import { IVideoProfile } from "../../models/VideoProfile";
import { IUser } from "./user.types";


declare module 'socket.io' {
    interface Socket {
      user?: IUser | IVideoProfile |any;
      user_id : string ;
      userProfileType?: "videoProfile" | "matrimonyProfile";
    }
  }
  