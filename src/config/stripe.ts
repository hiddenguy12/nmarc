/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ  
InshaAllah, By his marcy I will Gain Success 
*/

import Stripe from 'stripe';


// Define interfaces for better type checking
interface StripeOptions {
  success_url: string;
  cancel_url: string;
  key :string;
}

interface ProductData {
  name: string;
  description?: string;
  images?: string[];
  metadata?: Record<string, string>;
}

interface PriceData {
  currency: string;
  product_data: ProductData;
  unit_amount: number;
  tax_behavior?: 'inclusive' | 'exclusive' | 'unspecified';
}

interface LineItem {
  price_data: PriceData;
  quantity: number;
  adjustable_quantity?: {
    enabled: boolean;
    minimum?: number;
    maximum?: number;
  };
}

interface CheckoutOptions {
  shipping_amount: number;
  line_items: LineItem[];
  customer_email?: string;
  metadata?: Record<string, string>;
  payment_method_types?: string[];
}

interface CheckoutResult {
  url: string;
  id: string;
}

/**
 * StripePay - Handles Stripe payment processing
 */
export default class StripePay {
  private stripe: Stripe;
  private success_url: string;
  private cancel_url: string;

  constructor(options: StripeOptions) {
    this.stripe = new Stripe(options.key);
    this.success_url = options.success_url;
    this.cancel_url = options.cancel_url;
  }

  async checkOut(options: CheckoutOptions): Promise<CheckoutResult> {
    try {
      const { line_items } = options;
      
      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: this.success_url,
        cancel_url: this.cancel_url,
        line_items: line_items
      };
      
      // Create checkout session
      const session :any= await this.stripe.checkout.sessions.create(sessionParams);

      if (!session.url || !session.id) {
        throw new Error('Failed to create a valid checkout session');
      }

      return {
        url: session.url,
        id: session.id
      };
    } catch (error) {
      console.error(error)
      if (error instanceof Error) {
        throw new Error(`Stripe checkout failed: ${error.message}`);
      } else {
        throw new Error('Sorry, failed to create stripe payment');
      }
    }
  }


  async retrieveSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return await this.stripe.checkout.sessions.retrieve(sessionId);
  }
}