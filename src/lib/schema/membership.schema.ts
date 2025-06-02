/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import { MembershipTier, MembershipDuration, PaymentMethod } from '../types/memberdship.types';
import { paginationSchema } from './search.schema';

const imageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    id: z.string()
});

export const membershipRequestSchema = z.object({
    paymentInfo: z.object({
        transactionId: z.string()
            .min(1, 'Transaction ID is required')
            .max(100, 'Transaction ID is too long'),
        amount: z.number()
            .positive('Amount must be positive'),
        paymentMethod: z.nativeEnum(PaymentMethod),
        verificationImage: imageSchema
    }),
    tier: z.nativeEnum(MembershipTier),
    duration: z.nativeEnum(MembershipDuration),
    startDate: z.date()
});

export const membershipRequestQuerySchema = paginationSchema.extend({
    status: z.enum(['all', 'pending', 'approved', 'rejected', 'cancelled']).optional()
});

export type MembershipRequestInput = z.infer<typeof membershipRequestSchema>;