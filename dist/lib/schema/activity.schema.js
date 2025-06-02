"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondToPhoneRequestSchema = exports.requestPhoneViewSchema = exports.activityHistorySchema = exports.requestMobileNumberSchema = exports.sendSmsSchema = exports.sendMailSchema = exports.likeProfileSchema = exports.shortListSchema = void 0;
const zod_1 = require("zod");
const schemaComponents_1 = require("./schemaComponents");
const search_schema_1 = require("./search.schema");
exports.shortListSchema = zod_1.z.object({
    shortListedId: schemaComponents_1._idValidator
});
exports.likeProfileSchema = zod_1.z.object({
    likedId: schemaComponents_1._idValidator
});
exports.sendMailSchema = zod_1.z.object({
    receiverId: schemaComponents_1._idValidator,
    message: zod_1.z.string().optional()
});
exports.sendSmsSchema = zod_1.z.object({
    receiverId: schemaComponents_1._idValidator,
    message: zod_1.z.string().optional()
});
exports.requestMobileNumberSchema = zod_1.z.object({
    requestedId: schemaComponents_1._idValidator
});
// Add this to your existing search.schema.ts
exports.activityHistorySchema = search_schema_1.paginationSchema.extend({
    type: zod_1.z.enum(['likes', 'emails', 'sms'], {
        required_error: "Activity type is required",
        invalid_type_error: "Activity type must be one of: likes, emails, sms"
    })
});
exports.requestPhoneViewSchema = zod_1.z.object({
    requestedUserId: schemaComponents_1._idValidator,
});
exports.respondToPhoneRequestSchema = zod_1.z.object({
    requestId: schemaComponents_1._idValidator,
    action: zod_1.z.enum(['APPROVED', 'REJECTED']),
    expirationDays: zod_1.z.number().min(1).max(30).optional().default(7)
});
