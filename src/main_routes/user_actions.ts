/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, Router } from "express";
import { z, ZodError } from "zod";
import { validateUser, validateVideoProfile } from "../lib/middlewares/auth.middleware";
import { _idValidator } from "../lib/schema/schemaComponents";
import { SendMailedProfile } from "../models/SendMailedProfile";
import { ProfileView } from "../models/ProfileView";
import { User } from "../models/user";
import { MembershipRequest } from "../models/membershipRequest";
import { ShortList } from "../models/ShortListedProfiles";
import Gifts from "../models/Gifts";
import VideoProfile from "../models/VideoProfile";

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

/**
 * User Search & Filter API
 * GET /search-users?name=...&gender=...&religion=...&age=...&page=...&limit=...
 * - 'name' is a case-insensitive partial match (search)
 * - 'gender', 'religion', 'age' are filters (exact match)
 * - All can be used together or separately
 */
router.get('/search-users', async function (req, res) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        // Build query
        const filter: any = {};
        // Name search (case-insensitive, partial)
        if (req.query.name && typeof req.query.name === 'string') {
            filter.name = { $regex: req.query.name, $options: 'i' };
        }
        // Gender filter
        if (req.query.gender && typeof req.query.gender === 'string') {
            filter.gender = req.query.gender;
        }
        // Religion filter
        if (req.query.religion && typeof req.query.religion === 'string') {
            filter.religion = req.query.religion;
        }
        // Age filter
        if (req.query.age && !isNaN(Number(req.query.age))) {
            filter.age = Number(req.query.age);
        }

        // Find users
        const users = await User.find(filter)
            .select('name _id email profileImage gender age religion onlineStatus')
            .skip(skip)
            .limit(limit)
            .lean();

        const totalUsers = await User.countDocuments(filter);
        const totalPages = Math.ceil(totalUsers / limit);

        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                },
                filter: {
                    name: req.query.name,
                    gender: req.query.gender,
                    religion: req.query.religion,
                    age: req.query.age ? Number(req.query.age) : undefined
                }
            }
        });
    } catch (error) {
        console.error('[User Search API error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

/**
 * Send Gift API
 * POST /send-gift
 * Body: { receiverId: string, giftId: string }
 * - Decreases sender's totalCoin, increases receiver's totalCoin
 * - Adds coinHistory entry for both users
 */
router.post('/send-gift', validateVideoProfile, async function (req, res) {
    try {
        const senderId = req.videoProfile?._id;
        const { receiverId, giftId } = req.body;
        if (!senderId || !receiverId || !giftId) {
            // Error: Missing required fields
            return res.status(400).json({ success: false, message: 'Missing required fields.' });
        }
        if (senderId.toString() === receiverId.toString()) {
            // Error: Cannot send gift to yourself
            return res.status(400).json({ success: false, message: 'Cannot send gift to yourself.' });
        }
        // Fetch sender, receiver, and gift from VideoProfile and Gifts
        const [sender, receiver, gift] = await Promise.all([
            VideoProfile.findById(senderId),
            VideoProfile.findById(receiverId),
            Gifts.findById(giftId)
        ]);
        if (!sender || !receiver || !gift) {
            // Error: Sender, receiver, or gift not found
            return res.status(404).json({ success: false, message: 'Sender, receiver, or gift not found.' });
        }
        if (sender.totalCoin < gift.coins) {
            // Error: Insufficient coins
            return res.status(400).json({ success: false, message: 'Insufficient coins.' });
        }
        // Prepare coin history entries
        const now = new Date();
        const senderHistory = {
            userId: receiver._id,
            status: 'sent',
            giftId: gift._id,
            coinAmount: gift.coins,
            coinName: gift.name,
            date: now
        };
        const receiverHistory = {
            userId: sender._id,
            status: 'received',
            giftId: gift._id,
            coinAmount: gift.coins,
            coinName: gift.name,
            date: now
        };
        // Update both VideoProfiles atomically
        await Promise.all([
            VideoProfile.findByIdAndUpdate(sender._id, {
                $inc: { totalCoin: -gift.coins },
                $push: { coinHistory: senderHistory }
            }),
            VideoProfile.findByIdAndUpdate(receiver._id, {
                $inc: { totalCoin: gift.coins },
                $push: { coinHistory: receiverHistory }
            })
        ]);
        return res.status(200).json({ success: true, message: 'Gift sent successfully.' });
    } catch (error) {
        // Error: Failed to send gift
        console.error('[Send Gift API error]', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});

/**
 * Gift History API
 * GET /gift-history
 * - Returns the user's coinHistory (sent and received gifts)
 */
router.get('/gift-history', validateVideoProfile, async function (req, res) {
    try {
        const userId = req.videoProfile?._id;
        if (!userId) {
            // Error: Unauthorized (no video profile)
            return res.status(401).json({ success: false, message: 'Unauthorized.' });
        }
        const videoProfile = await VideoProfile.findById(userId).select('coinHistory').lean();
        if (!videoProfile) {
            // Error: VideoProfile not found
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const history = (videoProfile.coinHistory || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json({ success: true, data: history });
    } catch (error) {
        // Error: Failed to fetch gift history
        console.error('[Gift History API error]', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});


export default router;