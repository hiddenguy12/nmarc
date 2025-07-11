/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, NextFunction, } from 'express';
import { authSessionValidation } from '../schema/auth.schema';
import AuthSession, { IAuthSession } from '../../models/AuthSession';
import VideoProfile, { IVideoProfile } from '../../models/VideoProfile';




// Utility function to extract token
export const extractBearerToken = (header: string | undefined): string | null => {
  if (!header || !header.startsWith('Bearer ')) {
    return null;
  }
  // Remove 'Bearer ' from the header
  return header.slice(7);
};

// Middleware to extract and validate bearer token
export async function validateUser(req: Request | any, res: Response, next: NextFunction) :Promise<void | any> {
  try {
    const authHeader = req.headers.authorization;
   
    const token = extractBearerToken(authHeader);

    

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    let validationResult = await authSessionValidation.safeParseAsync(token);

    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Bearer access token is failed to validate',
        error: validationResult.error
      });
    }

    let session = await AuthSession.findOne({ key: validationResult.data , expiration_date : { $gt :new Date()}  });

    if (!session) {
      return res.status(401).json({
        success: false,
        message: 'Bearer access token is failed to validate',
        error: validationResult.error
      });
    }

    req.authSession = session;
    req.bearerAccessToken = token;
  

    next();
    return;
  } catch (error) {
    console.error('Bearer access Token Validation error' , error);

    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });

  }
};

export async function validateVideoProfile(req: Request | any , res: Response, next: NextFunction) :Promise<void | any> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required'
      });
    }

    let validationResult = await authSessionValidation.safeParseAsync(token);

    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Bearer access token is failed to validate',
        error: validationResult.error
      });
    }

    let user :any= await VideoProfile.findOne({ 'auth.authSession' : token , "auth.session_exp_date" : { $gt : new Date()} }).select('-passwordDetails');
    if (user) {
      req.videoProfile =user;
      next();
    } else {
      res.status(401).json({
          success: false,
          message:  'Invalid authorization token',
          data: null
      });
      return;
    }
    
  } catch (error) {
    console.error('Bearer access Token Validation error' , error);
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token'
    });

  }
};


export async function validateBothProfiledUser(req: Request | any,res: Response,next: NextFunction) :Promise<void | any> {
  try {
    const authHeader = req.headers.authorization;
    const token = extractBearerToken(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    const validationResult = await authSessionValidation.safeParseAsync(token);

    if (!validationResult.success) {
      return res.status(401).json({
        success: false,
        message: 'Bearer access token failed to validate',
        error: validationResult.error,
      });
    }

    const matrimonyUserAuthSession = await AuthSession.findOne({
      key: token,
      expiration_date: { $gt: new Date() },
    });

    if (matrimonyUserAuthSession) {
      req.authSession = matrimonyUserAuthSession;
      req.bearerAccessToken = token;
      req.profileType = 'matrimony_profile';
      return next();
    }

    let user: any = await VideoProfile.findOne({
      'auth.authSession': token,
      'auth.session_exp_date': { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Failed to find User Account',
        data: null,
      });
    }

    user = user?.toObject();
    delete user.passwordDetails;
    req.videoProfile = user;
    req.bearerAccessToken = token;
    req.profileType = 'videoProfile';
    return next();
  } catch (error) {
    console.error('[Bearer access Token Validation error]', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token',
    });
  }
}
