/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, Router } from "express";
import { z, ZodError } from "zod";
import { validateUser } from "../lib/middlewares/auth.middleware";
import { _idValidator } from "../lib/schema/schemaComponents";
import { SendMailedProfile } from "../models/SendMailedProfile";
import { ProfileView } from "../models/ProfileView";
import { User } from "../models/user";
import { MembershipRequest } from "../models/membershipRequest";
import { ShortList } from "../models/ShortListedProfiles";

const router = Router();


router.post('/mail-history/:mailed_user_id', validateUser, async function (req: Request, res: Response): Promise<any> {
    try {
        let mailed_user_id = _idValidator.parse(req.params.mailed_user_id);
        let user_id = req.authSession?.value.userId;

        await SendMailedProfile.create({
            receiverId : mailed_user_id ,
            senderId : user_id ,
        });

        return res.sendStatus(201);
    } catch (error) {
        console.error(error);
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/mail-history', validateUser, async function (req: Request, res: Response): Promise<any> {
    try {
        let mailes :any[]=await SendMailedProfile.find({ senderId : req.authSession?.value.userId}).sort({ emailedAt : -1 }).populate('receiverId', 'name _id profileImage').lean();
        
        for (let i = 0; i < mailes.length; i++) {
           let receiver= mailes[i].receiverId;
           delete mailes[i].receiverId;
           mailes[i]['receiver']= receiver;
        }
        mailes.length === 0 ? res.sendStatus(204) : res.status(200).json(mailes);
        return;
    } catch (error) {
        console.error(error);
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.all('/short-list',validateUser, async function (req: Request, res: Response): Promise<any> {
    try {
        let users: any[] = [];
        console.log(req.method);
        switch (req.method) {
            case 'POST':
                await ShortList.create({ shortListerId: req.authSession?.value.userId, shortListedId: _idValidator.parse(req.body.shortlisted_profile_id), shortListedAt : Date.now() });
                return res.sendStatus(200);
           
            case 'GET':
                let shortlist = await ShortList.find({ shortListerId: req.authSession?.value.userId })
                    .sort({ viewedAt: -1 })
                    .select('shortListedId')
                    .populate('shortListedId', 'name email profileImage _id')
                    .lean();

                return res.status(200).json({ success: true, data: { shortlist } });
        }
    } catch (error) {
        console.error('[Profile View Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.post('/phone-view/:requested_profile_id', validateUser, async function (req: Request, res: Response): Promise<any> {
    try {
        let user = await User.findById(req.authSession?.value.userId );
        let requested_profile_id = _idValidator.parse(req.params.requested_profile_id);

        if (!user?.hasActiveMembership()) return res.sendStatus(403);

        let membership = await MembershipRequest.findOne({ _id :user?.membership?.currentMembership?.requestId }) ;

        if (!membership) throw new Error("Membership Not Found");
        

        if (membership.verifiedPhoneLimit > membership.verifiedPhoneViewed) {
            let requested_profile = await User.findById(requested_profile_id, 'phoneInfo.number');
            if (!requested_profile) throw new Error("Phone Not Found");
            membership.verifiedPhoneViewed++ ;
            await membership.save();
            return res.status(200).send(requested_profile.phoneInfo.number);
        } else return res.sendStatus(403);
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        console.error('[Profile View Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});




export default router;