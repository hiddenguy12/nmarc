"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.membershipRequestQuerySchema = exports.membershipRequestSchema = void 0;
const zod_1 = require("zod");
const memberdship_types_1 = require("../types/memberdship.types");
const search_schema_1 = require("./search.schema");
const imageSchema = zod_1.z.object({
    url: zod_1.z.string().url('Invalid image URL'),
    id: zod_1.z.string()
});
exports.membershipRequestSchema = zod_1.z.object({
    paymentInfo: zod_1.z.object({
        transactionId: zod_1.z.string()
            .min(1, 'Transaction ID is required')
            .max(100, 'Transaction ID is too long'),
        amount: zod_1.z.number()
            .positive('Amount must be positive'),
        paymentMethod: zod_1.z.nativeEnum(memberdship_types_1.PaymentMethod),
        verificationImage: imageSchema
    }),
    tier: zod_1.z.nativeEnum(memberdship_types_1.MembershipTier),
    duration: zod_1.z.nativeEnum(memberdship_types_1.MembershipDuration),
    startDate: zod_1.z.date()
});
exports.membershipRequestQuerySchema = search_schema_1.paginationSchema.extend({
    status: zod_1.z.enum(['all', 'pending', 'approved', 'rejected', 'cancelled']).optional()
});
