"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
function rateLimiter(time = 600 * 1000, request = 200) {
    return (0, express_rate_limit_1.default)({
        windowMs: time,
        limit: request,
        standardHeaders: 'draft-8',
        legacyHeaders: false,
        message: JSON.stringify({
            success: false,
            error: {
                message: 'You have reached the maximum number of requests allowed in a short period of time. Your access has been temporarily restricted for 10 minutes to ensure system stability. Please wait until this brief cooling period ends, after which your normal access will be automatically restored. Thank you for your understanding. '
            },
            data: null,
        })
    });
}
