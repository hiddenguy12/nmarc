/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, Router } from "express";
import { readFileSync } from "fs";
import path from "path";
import { MembershipRequest } from "../models/membershipRequest";
import { membershipRequestQuerySchema, membershipRequestSchema } from "../lib/schema/membership.schema";
import getBearerTokenAndAuthSession from "../lib/core/giveBearerTokenAndSession";
import { MembershipDuration, MembershipRequestStatus, MembershipTier, PaymentMethod } from "../lib/types/memberdship.types";
import { z } from "zod";
import { log } from "console";

const router =Router();

router.get('/dynamic-details',  async function (req: Request, res: Response): Promise<Response | any> {
    try {

        let data: any = JSON.parse(readFileSync(path.join(__dirname , '../../data/membership.config.json') , 'utf-8' ));
        return res.status(200).json({
            success : true ,
            data : {
                membership_data : data
            }
        })
    } catch (error) {
        console.error('[Dinamic Membership Details Api error ]', error);
        return res.status(500).json({
           success: false,
           message: 'Internal server error',
           data: null
        });
    }
});

router.get('/membership-history', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        
        let {token ,session } = await getBearerTokenAndAuthSession(req);
        if (!session) {
            res.sendStatus(401)
            return;
        }
        let userId = session.value.userId;
        // Validate query parameters
        const validationResult = membershipRequestQuerySchema.safeParse(req.query);
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
        const query: any = { requesterID: userId };
        if (status && status !== 'all') {
            query.requestStatus = status;
        }

        // Execute query with pagination
        const requests = await MembershipRequest.find(query)
            .sort({ requestDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .maxTimeMS(10000); // Set maximum execution time

        // Get total count if requested
        let totalCount: number | undefined;

        if (shouldCount === 'yes') {
            totalCount = await MembershipRequest.countDocuments(query)
                .maxTimeMS(5000);
        }

        // Prepare pagination info
        let pagination: object = {
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

    } catch (error) {
        console.error('[Get Membership History API Error]', {
            error: error instanceof Error ? error.message : 'Unknown error',
            
            timestamp: new Date().toISOString(),
            userId: req.authSession?.value?.userId
        });

        if (error instanceof z.ZodError) {
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

router.post('/membership-request', async function (req: Request, res: Response): Promise<any> {
    try {

         // Define schema for request validation
        let { 
            tier, 
            duration, 
            paymentMethod, 
            transactionId, 
            amount, 
            paid_from 
        } = (z.object({
            tier: z.nativeEnum(MembershipTier),
            duration: z.nativeEnum(MembershipDuration),
            paymentMethod: z.nativeEnum(PaymentMethod),
            transactionId: z.string().min(1).trim(),
            amount: z.number().int().positive(),
            paid_from: z.string().regex(/^\d{10,15}$/),
        }))
        .parse(req.body);


        let { session } = await getBearerTokenAndAuthSession(req);

        if (!session) {
            res.sendStatus(401);
            return;
        }
        let userId = session.value.userId;


        let validMemberships :any =  JSON.parse(readFileSync(path.join(__dirname , '../../data/membership.config.json') , 'utf-8'));
     
        if (validMemberships[tier.toLowerCase()].prices[duration].price !== amount) {
            res.status(403).json({
                success: false,
                message: 'Invalid request parameters',
                data: {}
            });
            return;
        }

        // Check if there's already a pending request for this user
        const existingPendingRequest = await MembershipRequest.findOne({
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

        if ((
            await MembershipRequest.findOne({ 
                'paymentInfo.transactionId' : transactionId , 
                requestStatus : { $in : [MembershipRequestStatus.PENDING , MembershipRequestStatus.APPROVED ]} 
            }))
        ) {
            return res.sendStatus(403)
        }

        // Calculate start and end dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + Number(duration));

        // Create new membership request
        const membershipRequest = new MembershipRequest({
            tier,
            duration,
            requesterID: userId,
            startDate,
            endDate,
            paymentInfo: {
                transactionId,
                amount,
                paymentMethod,
                paidFrom : paid_from,
            },
            verifiedPhoneLimit : validMemberships[tier.toLowerCase()].prices[duration].sms
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
    } catch (error) {
        console.error('[membership-request]', error);
        
        // Handle validation errors specifically
        if (error instanceof z.ZodError) {
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

router.put('/membership-request/cancel', async function (req: Request, res: Response): Promise<any> {
    try {
        let {token ,session } = await getBearerTokenAndAuthSession(req)
        if (!session) {
            res.sendStatus(401)
            return;
        }
        let userId = session.value.userId;

        const membershipRequest = await MembershipRequest.findOne({
            requesterID: userId,
            requestStatus: MembershipRequestStatus.PENDING
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

    } catch (error) {
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


export default router;