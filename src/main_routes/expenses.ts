/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */


import { Router, Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import VideoProfile from "../models/VideoProfile";
import { resolveSoa } from "dns";
import { CoinExpense } from "../models/CoinExpense";
import { findNearestDistricts } from "../controllers/search.controller";
import { validateVideoProfile } from "../lib/middlewares/auth.middleware";


const router = Router();

router.post('/create-expenses', validateVideoProfile, async function (req: Request, res: Response): Promise<any> {
    try {
        let { expense_type, coins } = (z.object({
            expense_type: z.enum(['video_call', 'gift']),
            coins: z.number().min(0).max(100000)
        })).parse(req.body);

        let user = await VideoProfile.findById(req.videoProfile._id);

        if (!user) return res.sendStatus(401);

        if (user.video_calling_coins < coins) return res.sendStatus(403);

        user.video_calling_coins = user.video_calling_coins - coins;
        await user.save();

        await CoinExpense.create({
            coins,
            expense_type,
            expending_date: new Date(),
            userId: req.videoProfile._id
        });

        return res.sendStatus(200)

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

router.get('/history/:type', validateVideoProfile, async function (req: Request, res: Response): Promise<any> {
    try {
        let { type: expense_type } = (z.object({ type: z.enum(['video_call', 'gift', 'all']) })).parse(req.params);
        let base_query: any = { userId: req.videoProfile._id };
        switch (expense_type) {
            case 'gift':
                base_query['expense_type'] = expense_type;
                break;
            case 'video_call':
                base_query['expense_type'] = expense_type;
                break;
        }

        let expenses = await CoinExpense.find(base_query , ).sort({ expending_date: -1 });

        return res.status(200).json({
            success: true,
            data: { expenses }
        });

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


export default router;