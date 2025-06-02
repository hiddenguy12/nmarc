import { Request } from "express";
import { IAuthSessionValue } from "../models/AuthSession";
import { IVideoProfile } from "../models/VideoProfile";

export interface CustomRequest extends Request {
  profileType?: "videoProfile" | "matrimony_profile";
  videoProfile?: IVideoProfile;
  authSession?: {
    value: IAuthSessionValue;
  };
}
