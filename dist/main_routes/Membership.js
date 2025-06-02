"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const membershipRequest_1 = require("../models/membershipRequest");
const membership_schema_1 = require("../lib/schema/membership.schema");
const giveBearerTokenAndSession_1 = __importDefault(require("../lib/core/giveBearerTokenAndSession"));
const memberdship_types_1 = require("../lib/types/memberdship.types");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
router.get('/dynamic-details', async function (req, res) {
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
        console.error('[Dinamic Membership Details Api error ]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/membership-history', async function (req, res) {
    try {
        let { token, session } = await (0, giveBearerTokenAndSession_1.default)(req);
        if (!session) {
            res.sendStatus(401);
            return;
        }
        let userId = session.value.userId;
        // Validate query parameters
        const validationResult = membership_schema_1.membershipRequestQuerySchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, status, count: shouldCount } = validationResult.data;
        // Build query
        const query = { requesterID: userId };
        if (status && status !== 'all') {
            query.requestStatus = status;
        }
        // Execute query with pagination
        const requests = await membershipRequest_1.MembershipRequest.find(query)
            .sort({ requestDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .maxTimeMS(10000); // Set maximum execution time
        // Get total count if requested
        let totalCount;
        if (shouldCount === 'yes') {
            totalCount = await membershipRequest_1.MembershipRequest.countDocuments(query)
                .maxTimeMS(5000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalRequests: totalCount
            };
        }
        // Set cache headers
        res.set('Cache-Control', 'private, max-age=30'); // Cache for 30 seconds, private because it's user-specific
        return res.status(200).json({
            success: true,
            data: {
                requests,
                pagination,
                filterCriteria: {
                    status
                }
            }
        });
    }
    catch (error) {
        console.error('[Get Membership History API Error]', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString(),
            userId: req.authSession?.value?.userId
        });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                error: error.errors,
                data: null
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/membership-request', async function (req, res) {
    try {
        // Define schema for request validation
        let { tier, duration, paymentMethod, transactionId, amount, paid_from } = (zod_1.z.object({
            tier: zod_1.z.nativeEnum(memberdship_types_1.MembershipTier),
            duration: zod_1.z.nativeEnum(memberdship_types_1.MembershipDuration),
            paymentMethod: zod_1.z.nativeEnum(memberdship_types_1.PaymentMethod),
            transactionId: zod_1.z.string().min(1).trim(),
            amount: zod_1.z.number().int().positive(),
            paid_from: zod_1.z.string().regex(/^\d{10,15}$/),
        }))
            .parse(req.body);
        let { session } = await (0, giveBearerTokenAndSession_1.default)(req);
        if (!session) {
            res.sendStatus(401);
            return;
        }
        let userId = session.value.userId;
        let validMemberships = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/membership.config.json'), 'utf-8'));
        if (validMemberships[tier.toLowerCase()].prices[duration].price !== amount) {
            res.status(403).json({
                success: false,
                message: 'Invalid request parameters',
                data: {}
            });
            return;
        }
        // Check if there's already a pending request for this user
        const existingPendingRequest = await membershipRequest_1.MembershipRequest.findOne({
            requesterID: userId,
            requestStatus: 'PENDING'
        });
        if (existingPendingRequest) {
            return res.status(400).json({
                success: false,
                message: 'You already have a pending membership request',
                data: { requestId: existingPendingRequest._id }
            });
        }
        if ((await membershipRequest_1.MembershipRequest.findOne({
            'paymentInfo.transactionId': transactionId,
            requestStatus: { $in: [memberdship_types_1.MembershipRequestStatus.PENDING, memberdship_types_1.MembershipRequestStatus.APPROVED] }
        }))) {
            return res.sendStatus(403);
        }
        // Calculate start and end dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + Number(duration));
        // Create new membership request
        const membershipRequest = new membershipRequest_1.MembershipRequest({
            tier,
            duration,
            requesterID: userId,
            startDate,
            endDate,
            paymentInfo: {
                transactionId,
                amount,
                paymentMethod,
                paidFrom: paid_from,
            },
            verifiedPhoneLimit: validMemberships[tier.toLowerCase()].prices[duration].sms
        });
        // Save the membership request
        await membershipRequest.save();
        return res.status(200).json({
            success: true,
            message: 'Membership request submitted successfully',
            data: {
                requestId: membershipRequest._id,
                status: membershipRequest.requestStatus,
                tier: membershipRequest.tier,
                duration: membershipRequest.duration,
                verifiedPhoneLimit: membershipRequest.verifiedPhoneLimit,
                hasProfileHighlighter: membershipRequest.hasProfileHighlighter
            }
        });
    }
    catch (error) {
        console.error('[membership-request]', error);
        // Handle validation errors specifically
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                errors: error.errors
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/membership-request/cancel', async function (req, res) {
    try {
        let { token, session } = await (0, giveBearerTokenAndSession_1.default)(req);
        if (!session) {
            res.sendStatus(401);
            return;
        }
        let userId = session.value.userId;
        const membershipRequest = await membershipRequest_1.MembershipRequest.findOne({
            requesterID: userId,
            requestStatus: memberdship_types_1.MembershipRequestStatus.PENDING
        });
        if (!membershipRequest) {
            return res.status(404).json({
                success: false,
                message: 'No pending membership request found',
                data: null
            });
        }
        membershipRequest.cancel();
        await membershipRequest.save();
        return res.status(200).json({
            success: true,
            message: 'Membership request cancelled successfully',
            data: membershipRequest
        });
    }
    catch (error) {
        console.error('[Cancel Membership Request API Error]', {
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.default = router;
