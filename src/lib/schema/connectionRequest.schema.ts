/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */



import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { _idValidator } from './schemaComponents';

export const createInitialMessageSchema = z.object({
    recipientId: _idValidator,
    initialMessage: z.optional(z
        .string({
            required_error: "Message content is required",
            invalid_type_error: "Message content must be a string"
        })
        .min(1, "Message cannot be empty")
        .max(1000, "Message cannot exceed 1000 characters")
        .trim()
        .refine(
            (message) => {
                // Basic content moderation - prevent just whitespace or special characters
                return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
            },
            "Message must contain valid content"
        )
    )
});

// Type inference from the schema
export type CreateInitialMessageInput = z.infer<typeof createInitialMessageSchema>;