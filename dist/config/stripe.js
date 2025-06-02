"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ
InshaAllah, By his marcy I will Gain Success
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const stripe_1 = __importDefault(require("stripe"));
/**
 * StripePay - Handles Stripe payment processing
 */
class StripePay {
    stripe;
    success_url;
    cancel_url;
    constructor(options) {
        this.stripe = new stripe_1.default(options.key);
        this.success_url = options.success_url;
        this.cancel_url = options.cancel_url;
    }
    async checkOut(options) {
        try {
            const { line_items } = options;
            const sessionParams = {
                payment_method_types: ['card'],
                mode: 'payment',
                success_url: this.success_url,
                cancel_url: this.cancel_url,
                line_items: line_items
            };
            // Create checkout session
            const session = await this.stripe.checkout.sessions.create(sessionParams);
            if (!session.url || !session.id) {
                throw new Error('Failed to create a valid checkout session');
            }
            return {
                url: session.url,
                id: session.id
            };
        }
        catch (error) {
            console.error(error);
            if (error instanceof Error) {
                throw new Error(`Stripe checkout failed: ${error.message}`);
            }
            else {
                throw new Error('Sorry, failed to create stripe payment');
            }
        }
    }
    async retrieveSession(sessionId) {
        return await this.stripe.checkout.sessions.retrieve(sessionId);
    }
}
exports.default = StripePay;
