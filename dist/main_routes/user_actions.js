"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const SendMailedProfile_1 = require("../models/SendMailedProfile");
const user_1 = require("../models/user");
const membershipRequest_1 = require("../models/membershipRequest");
const ShortListedProfiles_1 = require("../models/ShortListedProfiles");
const Gifts_1 = __importDefault(require("../models/Gifts"));
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const router = (0, express_1.Router)();
router.post('/mail-history/:mailed_user_id', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let mailed_user_id = schemaComponents_1._idValidator.parse(req.params.mailed_user_id);
        let user_id = req.authSession?.value.userId;
        await SendMailedProfile_1.SendMailedProfile.create({
            receiverId: mailed_user_id,
            senderId: user_id,
        });
        return res.sendStatus(201);
    }
    catch (error) {
        console.error(error);
        if (error instanceof zod_1.ZodError) {
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
router.get('/mail-history', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let mailes = await SendMailedProfile_1.SendMailedProfile.find({ senderId: req.authSession?.value.userId }).sort({ emailedAt: -1 }).populate('receiverId', 'name _id profileImage').lean();
        for (let i = 0; i < mailes.length; i++) {
            let receiver = mailes[i].receiverId;
            delete mailes[i].receiverId;
            mailes[i]['receiver'] = receiver;
        }
        mailes.length === 0 ? res.sendStatus(204) : res.status(200).json(mailes);
        return;
    }
    catch (error) {
        console.error(error);
        if (error instanceof zod_1.ZodError) {
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
router.all('/short-list', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let users = [];
        console.log(req.method);
        switch (req.method) {
            case 'POST':
                await ShortListedProfiles_1.ShortList.create({ shortListerId: req.authSession?.value.userId, shortListedId: schemaComponents_1._idValidator.parse(req.body.shortlisted_profile_id), shortListedAt: Date.now() });
                return res.sendStatus(200);
            case 'GET':
                let shortlist = await ShortListedProfiles_1.ShortList.find({ shortListerId: req.authSession?.value.userId })
                    .sort({ viewedAt: -1 })
                    .select('shortListedId')
                    .populate('shortListedId', 'name email profileImage _id')
                    .lean();
                return res.status(200).json({ success: true, data: { shortlist } });
        }
    }
    catch (error) {
        console.error('[Profile View Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/phone-view/:requested_profile_id', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let user = await user_1.User.findById(req.authSession?.value.userId);
        let requested_profile_id = schemaComponents_1._idValidator.parse(req.params.requested_profile_id);
        if (!user?.hasActiveMembership())
            return res.sendStatus(403);
        let membership = await membershipRequest_1.MembershipRequest.findOne({ _id: user?.membership?.currentMembership?.requestId });
        if (!membership)
            throw new Error("Membership Not Found");
        if (membership.verifiedPhoneLimit > membership.verifiedPhoneViewed) {
            let requested_profile = await user_1.User.findById(requested_profile_id, 'phoneInfo.number');
            if (!requested_profile)
                throw new Error("Phone Not Found");
            membership.verifiedPhoneViewed++;
            await membership.save();
            return res.status(200).send(requested_profile.phoneInfo.number);
        }
        else
            return res.sendStatus(403);
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        // Build query
        const filter = {};
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
        const users = await user_1.User.find(filter)
            .select('name _id email profileImage gender age religion onlineStatus')
            .skip(skip)
            .limit(limit)
            .lean();
        const totalUsers = await user_1.User.countDocuments(filter);
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
    }
    catch (error) {
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
router.post('/send-gift', auth_middleware_1.validateVideoProfile, async function (req, res) {
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
            VideoProfile_1.default.findById(senderId),
            VideoProfile_1.default.findById(receiverId),
            Gifts_1.default.findById(giftId)
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
            VideoProfile_1.default.findByIdAndUpdate(sender._id, {
                $inc: { totalCoin: -gift.coins },
                $push: { coinHistory: senderHistory }
            }),
            VideoProfile_1.default.findByIdAndUpdate(receiver._id, {
                $inc: { totalCoin: gift.coins },
                $push: { coinHistory: receiverHistory }
            })
        ]);
        return res.status(200).json({ success: true, message: 'Gift sent successfully.' });
    }
    catch (error) {
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
router.get('/gift-history', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        const userId = req.videoProfile?._id;
        if (!userId) {
            // Error: Unauthorized (no video profile)
            return res.status(401).json({ success: false, message: 'Unauthorized.' });
        }
        const videoProfile = await VideoProfile_1.default.findById(userId).select('coinHistory').lean();
        if (!videoProfile) {
            // Error: VideoProfile not found
            return res.status(404).json({ success: false, message: 'User not found.' });
        }
        const history = (videoProfile.coinHistory || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return res.status(200).json({ success: true, data: history });
    }
    catch (error) {
        // Error: Failed to fetch gift history
        console.error('[Gift History API error]', error);
        return res.status(500).json({ success: false, message: 'Internal server error.' });
    }
});
exports.default = router;
