"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const CoinExpense_1 = require("../models/CoinExpense");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/create-expenses', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let { expense_type, coins } = (zod_1.z.object({
            expense_type: zod_1.z.enum(['video_call', 'gift']),
            coins: zod_1.z.number().min(0).max(100000)
        })).parse(req.body);
        let user = await VideoProfile_1.default.findById(req.videoProfile._id);
        if (!user)
            return res.sendStatus(401);
        if (user.video_calling_coins < coins)
            return res.sendStatus(403);
        user.video_calling_coins = user.video_calling_coins - coins;
        await user.save();
        await CoinExpense_1.CoinExpense.create({
            coins,
            expense_type,
            expending_date: new Date(),
            userId: req.videoProfile._id
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
router.get('/history/:type', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let { type: expense_type } = (zod_1.z.object({ type: zod_1.z.enum(['video_call', 'gift', 'all']) })).parse(req.params);
        let base_query = { userId: req.videoProfile._id };
        switch (expense_type) {
            case 'gift':
                base_query['expense_type'] = expense_type;
                break;
            case 'video_call':
                base_query['expense_type'] = expense_type;
                break;
        }
        let expenses = await CoinExpense_1.CoinExpense.find(base_query).sort({ expending_date: -1 });
        return res.status(200).json({
            success: true,
            data: { expenses }
        });
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
exports.default = router;
