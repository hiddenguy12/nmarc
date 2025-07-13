"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const user_1 = require("../models/user");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const zod_1 = require("zod");
const membershipRequest_1 = require("../models/membershipRequest");
const memberdship_types_1 = require("../lib/types/memberdship.types");
const Gifts_1 = __importDefault(require("../models/Gifts"));
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const notification_socket_1 = require("../sockets/notification.socket");
const CoinsTransection_1 = __importDefault(require("../models/CoinsTransection"));
const post_1 = require("../models/post");
const multer_1 = require("../config/multer");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const mongoose_1 = __importDefault(require("mongoose"));
// Utility: Populate user info for posts/comments
const populateUserFields = [
    { path: 'userId', select: 'name profileImage.url' },
    { path: 'comments.userId', select: 'name profileImage.url' },
    { path: 'comments.replies.userId', select: 'name profileImage.url' },
];
const router = (0, express_1.Router)();
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        let adminSettings = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/admin.panal.settings.json'), 'utf-8'));
        let { email: validEmail, password: validPassword } = adminSettings;
        if (email === validEmail && password === validPassword) {
            let authToken = (0, auth_controller_1.giveAuthSessionId)();
            (0, fs_1.writeFileSync)(path_1.default.join(__dirname, '../../data/admin.panal.settings.json'), JSON.stringify({
                email: validEmail,
                password: validPassword,
                auth_session: authToken
            }));
            // Set auth token as cookie
            res.cookie('admin_auth_token', authToken, {
                httpOnly: true,
                sameSite: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            return res.status(200).json({
                success: true,
                message: 'Admin login successful',
                data: { email: email, authToken }
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/is-loggedin', async function (req, res) {
    try {
        const authToken = req.cookies?.admin_auth_token;
        let adminSettings = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/admin.panal.settings.json'), 'utf-8'));
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Admin is not logged in'
            });
        }
        if (adminSettings.auth_session === authToken) {
            return res.status(200).json({
                success: true,
                message: 'Admin is logged in',
                data: {
                    email: adminSettings.email,
                    token: authToken
                }
            });
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Admin is not logged in'
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.use(async (req, res, next) => {
    try {
        const authToken = req.cookies?.admin_auth_token;
        if (!authToken) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Admin authentication required'
            });
        }
        let adminSettings = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/admin.panal.settings.json'), 'utf-8'));
        if (adminSettings.auth_session === authToken) {
            // Admin is authenticated, proceed to the next middleware or route handler
            next();
        }
        else {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Invalid admin authentication token'
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/overview-statistics', async function (req, res, next) {
    try {
        // Get counts from database
        const totalUsers = await user_1.User.countDocuments();
        const onlineActiveUsers = await user_1.User.countDocuments({ status: 'online' });
        const usersJoinedThisMonth = await user_1.User.countDocuments({
            createdAt: { $gte: new Date(new Date().setDate(1)) } // First day of current month
        });
        const premiumUsers = await user_1.User.countDocuments({ membershipType: 'premium' });
        const suspendedUsers = await user_1.User.countDocuments({ status: 'suspended' });
        const videoProfileUsers = await user_1.User.countDocuments({ hasVideoProfile: true });
        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                onlineActiveUsers,
                usersJoinedThisMonth,
                premiumUsers,
                suspendedUsers,
                videoProfileUsers
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/users', async function (req, res, next) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const userType = req.query.usertype || 'matrimony';
        const skip = (page - 1) * limit;
        let users = [];
        let totalUsers = 0;
        switch (userType) {
            case 'matrimony':
                totalUsers = await user_1.User.countDocuments({});
                users = await user_1.User.find({})
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('_id name email profileImage.url suspension onlineStatus membership address phoneInfo');
                break;
            case 'video-calling':
                totalUsers = await VideoProfile_1.default.countDocuments({});
                users = await VideoProfile_1.default.find({})
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .select('location.country profileImage.url name email status phone gender');
                break;
        }
        let totalPages = Math.ceil(totalUsers / limit);
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    hasNextPage: page < totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/users/search', async function (req, res, next) {
    try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,15}$/;
        const { searchTerm, userType } = req.query;
        if (typeof searchTerm !== 'string' || !(userType === 'video' || userType == 'matrimony')) {
            return res.sendStatus(400);
        }
        let filterbyEmail = true;
        if (emailRegex.test(searchTerm)) {
            filterbyEmail = true;
        }
        if (phoneRegex.test(searchTerm)) {
            filterbyEmail = false;
        }
        if (userType === 'matrimony') {
            let query = {};
            if (filterbyEmail)
                query = { email: searchTerm.trim() };
            if (!filterbyEmail)
                query = { "phoneInfo.number": searchTerm.trim() };
            const user = await user_1.User.findOne(query)
                .select('-password')
                .limit(20);
            if (!user)
                return res.sendStatus(204);
            return res.status(200).json({
                success: true,
                data: {
                    user
                }
            });
        }
        if (userType === 'video') {
            let query = {};
            if (filterbyEmail)
                query = { email: searchTerm.trim() };
            if (!filterbyEmail)
                query = { "phone": searchTerm.trim() };
            const user = await VideoProfile_1.default.findOne(query)
                .select('-passwordDetails')
                .limit(20);
            if (!user)
                return res.sendStatus(204);
            return res.status(200).json({
                success: true,
                data: {
                    user
                }
            });
        }
        return res.sendStatus(400);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/users/:id', async function (req, res, next) {
    try {
        let schema = zod_1.z.object({
            name: zod_1.z.string().min(6).max(30).optional(),
            email: zod_1.z.string().email().optional(),
            phoneInfo: zod_1.z.object({ number: zod_1.z.string().min(8).max(16).regex(/^\d{10,15}$/).optional() }).optional()
        });
        let data = schema.parse(req.body);
        await user_1.User.findByIdAndUpdate(req.params.id, data);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/video-user/:id', async function (req, res, next) {
    try {
        let { name, email, phone } = (zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(120).trim(),
            email: schemaComponents_1.emailValidatior,
            phone: zod_1.z.string().regex(/^\d{10,15}$/).trim(),
        })).parse(req.body);
        await VideoProfile_1.default.findByIdAndUpdate(schemaComponents_1._idValidator.parse(req.params.id), { name, email, phone });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('[Uodate Video User From Admin Panal Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/users/:id/suspend', async function (req, res, next) {
    try {
        await user_1.User.findByIdAndUpdate(req.params.id || '', { 'suspension.isSuspended': true });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.put('/users/:id/unsuspend', async function (req, res, next) {
    try {
        await user_1.User.findByIdAndUpdate(req.params.id || '', { 'suspension.isSuspended': false });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.delete('/users/:id', async function (req, res, next) {
    try {
        await user_1.User.findByIdAndDelete(req.params.id);
        return res.sendStatus(200);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.get('/membership/pricing', async function (req, res) {
    try {
        let data = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/membership.config.json'), 'utf-8'));
        return res.status(200).json({
            success: true,
            data: {
                membership_data: data
            }
        });
    }
    catch (error) {
        console.error('[/membership/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/membership/pricing', async function (req, res) {
    try {
        let memberships = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/membership.config.json'), 'utf-8'));
        let schema = zod_1.z.object({
            plan: zod_1.z.enum(['gold', 'diamond', 'platinum']),
            duration: zod_1.z.enum(['3', '6', '12']),
            field: zod_1.z.enum(['sms', 'price']),
            value: zod_1.z.number().min(1).max(10000)
        });
        let { plan, duration, field, value } = schema.parse(req.body);
        memberships[plan].prices[duration][field] = value;
        (0, fs_1.writeFileSync)(path_1.default.join(__dirname, '../../data/membership.config.json'), JSON.stringify(memberships));
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('[/membership/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/membership/request', async function (req, res) {
    try {
        // Parse pagination params, default to page 1, limit 10
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 10;
        const skip = (page - 1) * limit;
        const total = await membershipRequest_1.MembershipRequest.countDocuments({ requestStatus: memberdship_types_1.MembershipRequestStatus.PENDING });
        const membershipRequests = await membershipRequest_1.MembershipRequest.find({ requestStatus: memberdship_types_1.MembershipRequestStatus.PENDING })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .select('_id requesterID requestDate paymentInfo tier duration')
            .populate('requesterID', "name phoneInfo.number profileImage email")
            .lean();
        return res.status(200).json({
            success: true,
            message: 'Membership requests fetched successfully',
            data: {
                requests: membershipRequests,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('[/membership/request api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/membership/request/:id/accept', async function (req, res) {
    try {
        let membership = await membershipRequest_1.MembershipRequest.findOne({ _id: schemaComponents_1._idValidator.parse(req.params.id), requestStatus: memberdship_types_1.MembershipRequestStatus.PENDING });
        if (!membership) {
            res.status(400).json({
                success: false,
                message: 'Request Not Found',
                data: null
            });
            return;
        }
        let endDate = new Date(Date.now() + (membership.duration * 30 * 24 * 3600 * 1000));
        await membershipRequest_1.MembershipRequest.findByIdAndUpdate(schemaComponents_1._idValidator.parse(req.params.id), {
            requestStatus: memberdship_types_1.MembershipRequestStatus.APPROVED,
            startDate: new Date(),
            endDate: endDate
        }, { runValidators: true });
        let user = await user_1.User.findByIdAndUpdate(membership.requesterID, {
            "membership.currentMembership.requestId": membership._id,
            "membership.currentMembership.membership_exipation_date": endDate
        });
        let socket = user?.socket_ids?.notification_socket;
        if (socket) {
            req.notifications?.io.to(socket).emit('membership-notification', {
                status: memberdship_types_1.MembershipRequestStatus.APPROVED,
                tier: membership.tier,
                duration: membership.duration,
                phone_view_limit: membership.verifiedPhoneLimit,
                membership_id: membership._id
            });
        }
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('[/membership/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/membership/request/:id/reject', async function (req, res) {
    try {
        let { reason } = (zod_1.z.object({
            reason: zod_1.z.string().min(1).max(120)
        })).parse(req.query);
        let m = await membershipRequest_1.MembershipRequest.findByIdAndUpdate(req.params.id, {
            requestStatus: memberdship_types_1.MembershipRequestStatus.REJECTED,
            adminNote: reason
        });
        if (!m)
            return res.sendStatus(204);
        let user = await user_1.User.findById(m?.requesterID, 'socket_ids');
        let socket = user?.socket_ids?.notification_socket;
        if (socket) {
            req.notifications?.io.to(socket).emit('membership-notification', {
                status: memberdship_types_1.MembershipRequestStatus.APPROVED,
                tier: m.tier,
                duration: m.duration,
                membership_id: m._id,
                adminNote: reason
            });
        }
        res.status(200).json({
            success: true,
            data: {},
            error: null,
            message: 'OK'
        });
        return;
    }
    catch (error) {
        console.error('[/membership/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/coins/request', async function (req, res) {
    try {
        let page = parseInt(req.query.page) || 1;
        let limit = parseInt(req.query.limit) || 10;
        if (page < 1)
            page = 1;
        if (limit < 1)
            limit = 10;
        const skip = (page - 1) * limit;
        let query = {
            status: "pending",
        };
        const total = await CoinsTransection_1.default.countDocuments(query);
        let request = await CoinsTransection_1.default.find(query).skip(skip).limit(limit).populate('userId', 'name email phone profileImage').lean();
        let data = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
        for (let i = 0; i < request.length; i++)
            request[i]['package'] = data[request[i]['package']];
        return res.status(200).json({
            data: {
                request,
                pagination: {
                    page,
                    total,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('[Coin Purchase Request Get Api (Admin ) Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/coins/request/:id/reject', async function (req, res) {
    try {
        let t = await CoinsTransection_1.default.findOneAndUpdate({
            _id: schemaComponents_1._idValidator.parse(req.params.id),
            status: "pending",
        }, {
            status: 'failed',
            admin_note: (zod_1.z.string().min(1).max(120)).parse(req.body.admin_note)
        });
        return res.sendStatus(200);
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
router.put('/coins/request/:id/accept', async function (req, res) {
    try {
        let t = await CoinsTransection_1.default.findOne({
            _id: schemaComponents_1._idValidator.parse(req.params.id),
            status: "pending",
        });
        if (!t)
            return res.sendStatus(403);
        let data = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
        let coins = data[t.package].coins;
        t.status = 'success';
        t.coins = coins;
        await t.save();
        await VideoProfile_1.default.findByIdAndUpdate(t.userId, { $inc: { video_calling_coins: t.coins } });
        return res.sendStatus(200);
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
router.put('/coins-data', async function (req, res) {
    try {
        let coinPackages = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
        // Validate input data
        const schema = zod_1.z.object({
            packageId: zod_1.z.enum(['package_1', 'package_2', 'package_3', 'package_4']),
            field: zod_1.z.enum(['name', 'price', 'coins']),
            value: zod_1.z.union([zod_1.z.string(), zod_1.z.number()])
        });
        let { packageId, field, value } = schema.parse(req.body);
        // Convert number to string for storage
        if (typeof value === 'number') {
            value = value.toString();
        }
        // Update the package data
        coinPackages[packageId][field] = value;
        // Save the updated data
        (0, fs_1.writeFileSync)(path_1.default.join(__dirname, '../../data/coin.packages.json'), JSON.stringify(coinPackages, null, 2));
        return res.status(200).json({
            success: true,
            message: 'Coin package updated successfully'
        });
    }
    catch (error) {
        console.error('[/coins/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/gifts', async function (req, res) {
    try {
        const giftSchema = zod_1.z.object({
            name: zod_1.z.string().min(1, "Gift name is required").max(50, "Gift name is too long"),
            coins: zod_1.z.number().int().positive("Coins must be a positive number"),
            image: zod_1.z.object({
                id: zod_1.z.string().uuid(),
                url: zod_1.z.string().url("Invalid image URL")
            })
        });
        const validationResult = giftSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: validationResult.error.errors.map(err => err.message).join(', ')
            });
        }
        const { name, coins, image } = validationResult.data;
        const newGift = await Gifts_1.default.create({ name, coins, image });
        return res.status(201).json({
            success: true,
            message: "Gift created successfully",
            data: {
                gift: newGift
            }
        });
    }
    catch (error) {
        console.error('[Gifts Posting Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/gifts/:id', async function (req, res) {
    try {
        const giftSchema = zod_1.z.object({
            name: zod_1.z.string().min(1, "Gift name is required").max(50, "Gift name is too long"),
            coins: zod_1.z.number().int().positive("Coins must be a positive number"),
        });
        const validationResult = giftSchema.safeParse(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                error: validationResult.error.errors.map(err => err.message).join(', ')
            });
        }
        const { name, coins } = validationResult.data;
        const updatedGift = await Gifts_1.default.findByIdAndUpdate(req.params.id, { name, coins });
        return res.status(200).json({
            success: true,
            message: "Gift updated SuccessFully successfully",
            data: {
                gift: updatedGift
            }
        });
    }
    catch (error) {
        console.error('[Gifts Posting Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.delete('/gifts/:id', async function (req, res) {
    try {
        let deletedGift = await Gifts_1.default.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            data: { deletedGift },
            error: null,
            message: 'Gift Deleted Success Fully'
        });
        return;
    }
    catch (error) {
        console.error('[delete api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/log-out', async function (req, res) {
    try {
        res.clearCookie('admin_auth_token', {
            httpOnly: true,
            sameSite: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        })
            .status(200)
            .json({});
        return;
    }
    catch (error) {
        console.error('[Admin Log out error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/notification', async function (req, res) {
    try {
        let { title, body, room } = (zod_1.z.object({
            title: zod_1.z.string().max(80).min(1),
            body: zod_1.z.string().min(1).max(120),
            room: zod_1.z.nativeEnum(notification_socket_1.Rooms)
        })).parse(req.body);
        if (room === notification_socket_1.Rooms.ALL_USERS_ROOMS) {
            req.notifications?.io.emit('admin-notification', { title, body });
        }
        if (room === notification_socket_1.Rooms.MATRIMONY_ROOMS) {
            req.notifications?.io.to(room).emit('admin-notification', { title, body });
        }
        else {
            req.notifications?.io.to(room).emit('admin-notification', { title, body });
        }
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('[Create Notification Api Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
// Admin: Create post (with optional image upload)
router.post('/posts', multer_1.upload.single('image'), async (req, res) => {
    try {
        const { userId, content, category } = req.body;
        let image = undefined;
        if (req.file) {
            const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                unique_filename: true,
                resource_type: 'image',
                transformation: ['media_lib_thumb'],
            });
            image = {
                url: result.url,
                public_id: result.public_id,
            };
        }
        const post = await post_1.Post.create({
            userId,
            content,
            category,
            image,
        });
        await post.populate(populateUserFields);
        return res.status(201).json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to create post', error });
    }
});
// Admin: List posts (paginated)
router.get('/posts', async (req, res) => {
    try {
        let { offset = 0, limit = 10 } = req.query;
        offset = parseInt(offset, 10);
        limit = parseInt(limit, 10);
        const filter = { isDeleted: false };
        const total = await post_1.Post.countDocuments(filter);
        const posts = await post_1.Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate(populateUserFields);
        return res.json({
            success: true,
            total,
            offset,
            limit,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
            data: posts,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get posts', error });
    }
});
// Admin: Search posts by content or category (paginated)
router.get('/posts/search', async (req, res) => {
    try {
        let { q, category, offset = 0, limit = 10 } = req.query;
        offset = parseInt(offset, 10);
        limit = parseInt(limit, 10);
        const filter = { isDeleted: false };
        if (q)
            filter.content = { $regex: q, $options: 'i' };
        if (category)
            filter.category = category;
        const total = await post_1.Post.countDocuments(filter);
        const posts = await post_1.Post.find(filter)
            .sort({ createdAt: -1 })
            .skip(offset)
            .limit(limit)
            .populate(populateUserFields);
        return res.json({
            success: true,
            total,
            offset,
            limit,
            currentPage: Math.floor(offset / limit) + 1,
            totalPages: Math.ceil(total / limit),
            data: posts,
        });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to search posts', error });
    }
});
// Admin: Get single post by ID
router.get('/posts/:id', async (req, res) => {
    try {
        if (!mongoose_1.default.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ success: false, message: 'Invalid post ID' });
        }
        const post = await post_1.Post.findById(req.params.id).populate(populateUserFields);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to get post', error });
    }
});
// Admin: Update post (all fields, including likes, comments, shares)
router.put('/posts/:id', multer_1.upload.single('image'), async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        const { userId, content, category, likesIDs, likesCount, comments, commentsCount, shareCounts, isDeleted } = req.body;
        if (userId)
            post.userId = userId;
        if (content)
            post.content = content;
        if (category)
            post.category = category;
        if (typeof likesIDs !== 'undefined')
            post.likesIDs = likesIDs;
        if (typeof likesCount !== 'undefined')
            post.likesCount = likesCount;
        if (typeof comments !== 'undefined')
            post.comments = comments;
        if (typeof commentsCount !== 'undefined')
            post.commentsCount = commentsCount;
        if (typeof shareCounts !== 'undefined')
            post.shareCounts = shareCounts;
        if (typeof isDeleted !== 'undefined')
            post.isDeleted = isDeleted;
        if (req.file) {
            const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                unique_filename: true,
                resource_type: 'image',
                transformation: ['media_lib_thumb'],
            });
            post.image = {
                url: result.url,
                public_id: result.public_id,
            };
        }
        post.updatedAt = new Date();
        await post.save();
        await post.populate(populateUserFields);
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update post', error });
    }
});
// Admin: Delete post (soft delete)
router.delete('/posts/:id', async (req, res) => {
    try {
        const post = await post_1.Post.findById(req.params.id);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        post.isDeleted = true;
        await post.save();
        return res.json({ success: true, message: 'Post deleted' });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to delete post', error });
    }
});
// Admin: Edit a comment on a post
router.patch('/posts/:postId/comments/:commentId', async (req, res) => {
    try {
        const { postId, commentId } = req.params;
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, message: 'Content is required' });
        const post = await post_1.Post.findById(postId);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        let comment = null;
        if (post.comments && typeof post.comments.id === 'function' && !Array.isArray(post.comments)) {
            comment = post.comments.id(commentId);
        }
        else if (Array.isArray(post.comments)) {
            comment = post.comments.find((c) => c._id?.toString() === commentId);
        }
        if (!comment)
            return res.status(404).json({ success: false, message: 'Comment not found' });
        comment.content = content;
        comment.updatedAt = new Date();
        await post.save();
        await post.populate(populateUserFields);
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update comment', error });
    }
});
// Admin: Edit a reply on a comment
router.patch('/posts/:postId/comments/:commentId/replies/:replyId', async (req, res) => {
    try {
        const { postId, commentId, replyId } = req.params;
        const { content } = req.body;
        if (!content)
            return res.status(400).json({ success: false, message: 'Content is required' });
        const post = await post_1.Post.findById(postId);
        if (!post)
            return res.status(404).json({ success: false, message: 'Post not found' });
        let comment = null;
        if (post.comments && typeof post.comments.id === 'function' && !Array.isArray(post.comments)) {
            comment = post.comments.id(commentId);
        }
        else if (Array.isArray(post.comments)) {
            comment = post.comments.find((c) => c._id?.toString() === commentId);
        }
        if (!comment)
            return res.status(404).json({ success: false, message: 'Comment not found' });
        let reply = null;
        if (comment.replies && typeof comment.replies.id === 'function' && !Array.isArray(comment.replies)) {
            reply = comment.replies.id(replyId);
        }
        else if (Array.isArray(comment.replies)) {
            reply = comment.replies.find((r) => r._id?.toString() === replyId);
        }
        if (!reply)
            return res.status(404).json({ success: false, message: 'Reply not found' });
        reply.content = content;
        reply.updatedAt = new Date();
        await post.save();
        await post.populate(populateUserFields);
        return res.json({ success: true, data: post });
    }
    catch (error) {
        return res.status(500).json({ success: false, message: 'Failed to update reply', error });
    }
});
exports.default = router;
