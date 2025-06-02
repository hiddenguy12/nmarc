/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from "zod";
import { _idValidator } from "./schemaComponents";
import { paginationSchema } from "./search.schema";

export const shortListSchema = z.object({
    shortListedId: _idValidator
});   


export const likeProfileSchema = z.object({
    likedId: _idValidator
});

export const sendMailSchema = z.object({
    receiverId: _idValidator,
    message: z.string().optional()
});

export const sendSmsSchema = z.object({
    receiverId: _idValidator,
    message: z.string().optional()
});

export const requestMobileNumberSchema = z.object({
    requestedId: _idValidator
});

// Add this to your existing search.schema.ts

export const activityHistorySchema = paginationSchema.extend({
    type: z.enum(['likes', 'emails', 'sms'], {
        required_error: "Activity type is required",
        invalid_type_error: "Activity type must be one of: likes, emails, sms"
    })
});



export const requestPhoneViewSchema = z.object({
    requestedUserId: _idValidator,
});

export const respondToPhoneRequestSchema = z.object({
    requestId: _idValidator,
    action: z.enum(['APPROVED', 'REJECTED']),
    expirationDays: z.number().min(1).max(30).optional().default(7)
});