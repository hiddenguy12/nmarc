"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const zod_1 = require("zod");
const coins_controller_1 = __importDefault(require("../controllers/coins.controller"));
const paypal_1 = __importDefault(require("../config/paypal"));
const env_1 = require("../config/env");
const CoinsTransection_1 = __importDefault(require("../models/CoinsTransection"));
const stripe_1 = __importDefault(require("../config/stripe"));
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const router = (0, express_1.Router)();
let transectionIdValidation = zod_1.z.string().min(1).max(512).refine(str => !/<script.*?>.*?<\/script>/gi.test(str), { message: "Scripts not allowed" })
    .refine(str => !/\$|\{|\}|\b(?:\$ne|\$gt|\$lt|\$or|\$where)\b/gi.test(str), { message: "Possible injection detected" })
    .refine(str => /^[\x00-\x7F]*$/.test(str), // ASCII filter (optional)
{ message: "Unsupported characters" });
router.post('/buy-coins/paypal', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let packageIdValidation = zod_1.z.enum(['package_1', 'package_2', 'package_3', 'package_4']);
        let package_id = packageIdValidation.parse(req.body.package_id);
        let { name, price } = (0, coins_controller_1.default)(package_id);
        let paypal = new paypal_1.default({
            client_id: env_1.PAYPAL_CLIENT_ID,
            client_secret: env_1.PAYPAL_CLIENT_SECRET,
            success_url: env_1.BASE_URL + '/api/coins/payment-success/paypal',
            cancel_url: env_1.BASE_URL + '/api/coins/payment-cancel/paypal',
            brand_name: 'FriendsBook'
        });
        let pAccessToken = await paypal.getAccessToken();
        let paymentInfo = await paypal.createPayment({
            accessToken: pAccessToken,
            items: [
                {
                    name: `FriendBook Coins ${name} Package`,
                    unit_amount: {
                        currency_code: env_1.PAYPAP_CURRENCY,
                        value: Number(price).toFixed()
                    },
                    quantity: 1
                }
            ],
            total: Number(price).toFixed(),
            productToatal: Number(price).toFixed(),
            shipping: '0.00',
            success_url: env_1.BASE_URL + '/api/coins/payment-success/paypal',
            cancel_url: env_1.BASE_URL + '/api/coins/payment-cancel/paypal'
        });
        if (!paymentInfo.link || !paymentInfo.token) {
            throw new Error('Failed to make Paypal Payment');
        }
        let transection = new CoinsTransection_1.default({
            userId: req.videoProfile._id,
            amount: price,
            paymentMethod: 'paypal',
            transactionId: paymentInfo.token,
            package: package_id,
            status: "pending"
        });
        await transection.save();
        res.status(200).json({
            success: true,
            data: {
                link: paymentInfo.link
            },
            message: 'Paypal Coin Purchase Link created '
        });
        return;
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
        console.error('[Buy Coins Paypal Api Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/buy-coins/stripe', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let packageIdValidation = zod_1.z.enum(['package_1', 'package_2', 'package_3', 'package_4']);
        let package_id = packageIdValidation.parse(req.body.package_id);
        let { name, price } = (0, coins_controller_1.default)(package_id);
        let stripe = new stripe_1.default({
            key: env_1.STRIPE_SECRET_KEY,
            success_url: env_1.BASE_URL + '/api/coins/payment-success/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: env_1.BASE_URL + '/api/coins/payment-cancel/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
        });
        let paymentInfo = await stripe.checkOut({
            shipping_amount: 0,
            line_items: [
                {
                    price_data: {
                        currency: env_1.STRIPE_CURRENCY,
                        product_data: {
                            name: `FriendBook Coins ${name} Package`,
                        },
                        unit_amount: Number(price) * 100,
                    },
                    quantity: 1
                }
            ]
        });
        let transection = new CoinsTransection_1.default({
            userId: req.videoProfile._id,
            amount: price,
            paymentMethod: 'stripe',
            transactionId: paymentInfo.id,
            package: package_id,
            status: "pending"
        });
        await transection.save();
        res.status(200).json({
            success: true,
            data: {
                link: paymentInfo.url
            },
            message: 'Paypal Coin Purchase Link created '
        });
        return;
    }
    catch (error) {
        console.error('[Buy Coins Paypal Api Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/payment-success/paypal', async function (req, res) {
    try {
        // Extract the PayPal transaction token from the query parameters
        const token = transectionIdValidation.parse(req.query.token);
        // Find the transaction in our database
        const transaction = await CoinsTransection_1.default.findOne({
            transactionId: token,
            paymentMethod: 'paypal',
            status: 'pending'
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
                data: null
            });
        }
        // Create PayPal instance for verification
        const paypal = new paypal_1.default({
            client_id: env_1.PAYPAL_CLIENT_ID,
            client_secret: env_1.PAYPAL_CLIENT_SECRET,
            success_url: env_1.BASE_URL + '/api/coins/payment-success/paypal',
            cancel_url: env_1.BASE_URL + '/api/coins/payment-cancel/paypal',
            brand_name: 'FriendsBook'
        });
        // Verify the payment with PayPal
        const accessToken = await paypal.getAccessToken();
        const paymentDetails = await paypal.captureDetails(token);
        if (paymentDetails.status !== 'COMPLETED') {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: null
            });
        }
        // Update user's coin balance based on the package
        const { coins } = (0, coins_controller_1.default)(transaction.package);
        // Update transaction status
        transaction.status = 'success';
        transaction.updatedAt = new Date();
        transaction.coins = Number(coins);
        await transaction.save();
        let vUser = await VideoProfile_1.default.findByIdAndUpdate(transaction.userId, { $inc: { video_calling_coins: Number(coins) } });
        if (vUser?.socket_ids.notification_socket)
            req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'success' });
        // Redirect to success page or return success response
        return res.redirect(`${env_1.BASE_URL}/purchase_status?type=paypal&id=${transaction._id}&status=success`);
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
        console.error('[Payment Success Paypal Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/payment-success/stripe', async function (req, res) {
    try {
        const sessionId = transectionIdValidation.parse(req.query.session_id);
        const stripe = new stripe_1.default({
            key: env_1.STRIPE_SECRET_KEY,
            success_url: env_1.BASE_URL + '/api/coins/payment-success/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
            cancel_url: env_1.BASE_URL + '/api/coins/payment-cancel/stripe' + '?session_id={CHECKOUT_SESSION_ID}',
        });
        const session = await stripe.retrieveSession(sessionId);
        if (session.payment_status !== 'paid') {
            return res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                data: null
            });
        }
        const transaction = await CoinsTransection_1.default.findOne({
            transactionId: sessionId,
            paymentMethod: 'stripe',
            status: 'pending'
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
                data: null
            });
        }
        const { coins } = (0, coins_controller_1.default)(transaction.package);
        transaction.status = 'success';
        transaction.updatedAt = new Date();
        transaction.coins = Number(coins);
        await transaction.save();
        let vUser = await VideoProfile_1.default.findByIdAndUpdate(transaction.userId, { $inc: { video_calling_coins: Number(coins) } });
        if (vUser?.socket_ids.notification_socket)
            req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'success' });
        // Redirect to success page or return success response
        return res.redirect(`${env_1.BASE_URL}/purchase_status?type=stripe&id=${transaction._id}&status=success`);
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
        console.error('[Payment Success Stripe Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/payment-cancel/paypal', async function (req, res) {
    try {
        const token = transectionIdValidation.parse(req.query.token);
        // Find the transaction in our database
        const transaction = await CoinsTransection_1.default.findOne({
            transactionId: token,
            paymentMethod: 'paypal',
            status: 'pending',
        }).populate('userId');
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
                data: null
            });
        }
        // Update transaction status
        transaction.status = 'failed';
        transaction.updatedAt = new Date();
        await transaction.save();
        const { coins } = (0, coins_controller_1.default)(transaction.package);
        let vUser = await transaction.userId;
        if (vUser?.socket_ids.notification_socket)
            req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'failed' });
        // Redirect to cancel page or return cancel response
        return res.redirect(`${env_1.BASE_URL}/purchase_status?type=paypal&id=${transaction._id}&status=failed`);
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
        console.error('[Payment Cancel Paypal Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/payment-cancel/stripe', async function (req, res) {
    try {
        // Extract the Stripe session ID from the query parameters
        const sessionId = transectionIdValidation.parse(req.query.session_id);
        // Find the transaction in our database
        const transaction = await CoinsTransection_1.default.findOne({
            transactionId: sessionId,
            paymentMethod: 'stripe',
            status: 'pending'
        }).populate('userId');
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found',
                data: null
            });
        }
        // Update transaction status
        transaction.status = 'failed';
        transaction.updatedAt = new Date();
        await transaction.save();
        const { coins } = (0, coins_controller_1.default)(transaction.package);
        let vUser = await transaction.userId;
        if (vUser?.socket_ids.notification_socket)
            req.notifications?.io.to(vUser?.socket_ids.notification_socket).emit('coin-purchase-notification', { coins, status: 'failed' });
        // Redirect to cancel page or return cancel response
        return res.redirect(`${env_1.BASE_URL}/purchase_status?type=stripe&id=${transaction._id}&status=failed`);
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
        console.error('[Payment Cancel Stripe Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/coin-purchase-history', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let transactions = await CoinsTransection_1.default.aggregate([
            {
                $match: { userId: req.videoProfile._id, }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $project: {
                    amount: 1,
                    package: 1,
                    paymentMethod: 1,
                    coins: 1,
                    transactionDate: '$createdAt',
                    status: 1,
                    admin_note: 1
                }
            }
        ]);
        res.status(200).json({
            success: true,
            data: { transactions },
            error: null,
            message: 'OK'
        });
        return;
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/coin-purchase-request', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        let { package_id, paymentMethod, transactionId, amount, paying_phone_number } = (zod_1.z.object({
            paymentMethod: zod_1.z.enum(['bkash', 'nagad', 'rocket']),
            transactionId: zod_1.z.string().trim().min(1).max(120),
            amount: zod_1.z.number().max(100000),
            package_id: zod_1.z.enum(['package_1', 'package_2', 'package_3', 'package_4']),
            paying_phone_number: zod_1.z.string()
        })).parse(req.body);
        await CoinsTransection_1.default.create({
            paymentMethod: paymentMethod,
            transactionId: transactionId,
            amount,
            currency: 'BDT',
            package: package_id,
            userId: req.videoProfile?._id,
            paying_phone_number
        });
        return res.sendStatus(200);
    }
    catch (error) {
        console.error('[Coin Purchase Request Api]', error);
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
