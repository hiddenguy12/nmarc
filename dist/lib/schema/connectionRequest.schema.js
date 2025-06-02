"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInitialMessageSchema = void 0;
const zod_1 = require("zod");
const schemaComponents_1 = require("./schemaComponents");
exports.createInitialMessageSchema = zod_1.z.object({
    recipientId: schemaComponents_1._idValidator,
    initialMessage: zod_1.z.optional(zod_1.z
        .string({
        required_error: "Message content is required",
        invalid_type_error: "Message content must be a string"
    })
        .min(1, "Message cannot be empty")
        .max(1000, "Message cannot exceed 1000 characters")
        .trim()
        .refine((message) => {
        // Basic content moderation - prevent just whitespace or special characters
        return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
    }, "Message must contain valid content"))
});
