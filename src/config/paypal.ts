/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */


import fetch from 'node-fetch';
import { NODE_ENV, PAYMENT_MODE, PAYPAP_CURRENCY } from './env';

// Define interfaces for better type checking
interface PaypalOptions {
    client_id: string;
    client_secret: string;
  
    success_url?: string;
    cancel_url?: string;
    currency_code?: string;
    brand_name?: string;
}

interface UnitAmount {
    currency_code: string;
    value: string;
}

interface Item {
    name: string;
    unit_amount: UnitAmount;
    quantity: number;
}

interface CreatePaymentOptions {
    accessToken: string;
    items: Item[];
    total: string;
    productToatal: string;
    shipping: string;
    success_url?: string;
    cancel_url?: string;
    currency_code?: string;
}

interface CheckoutOptions {
    currency_code?: string;
    shipping: string | number;
    items: Item[];
}

interface PaymentLink {
    link: string;
    token: string;
}

interface PaypalError {
    paypalError: {
        type: string;
        description?: string;
        [key: string]: any;
    };
}

export default class PaypalPayment {
    private client_id: string;
    private client_secret: string;
    private api_link: string;
    private success_url?: string;
    private cancel_url?: string;
    private currency_code: string;
    private brand_name?: string;

    constructor(options: PaypalOptions = { client_id: "", client_secret: "", currency_code: 'USD' }) {
        this.client_id = options.client_id;
        this.client_secret = options.client_secret;
        
        this.api_link = (PAYMENT_MODE === 'test' ? 'https://api-m.sandbox.paypal.com' : "https://api-m.paypal.com");
        if (options.success_url) this.success_url = options.success_url;
        if (options.cancel_url) this.cancel_url = options.cancel_url;
        this.currency_code = options.currency_code || 'USD';
        if (options.brand_name) this.brand_name = options.brand_name;
    }

    async getAccessToken(): Promise<string> {
        const response = await fetch(this.api_link + '/v1/oauth2/token', {
            headers: {
                "Cache-Control": "no-cache",
                'Authorization': 'Basic ' + Buffer.from(this.client_id + ':' + this.client_secret).toString('base64')
            },
            body: 'grant_type=client_credentials',
            method: 'POST'
        });

        const data: any = await response.json();

        if (data.error) {
            console.error(data);

            throw new Error("Paypal Access Token Error")
        }

        return data.access_token;
    }

    async createPayment(options: CreatePaymentOptions): Promise<PaymentLink> {
      
        let items = [...options.items];
       
        const response = await fetch(this.api_link + '/v2/checkout/orders', {
            method: 'POST',
            headers: {
                "Cache-Control": "no-cache",
                'Content-Type': 'application/json',
                Authorization: `Bearer ${options.accessToken}`
            },
            body: JSON.stringify({
                intent: 'CAPTURE',
                purchase_units: [{
                    items: items,
                    amount: {
                        currency_code: PAYPAP_CURRENCY,
                        value: options.total,
                        breakdown: {
                            item_total: {
                                currency_code: PAYPAP_CURRENCY,
                                value: options.productToatal, // Cost of items
                            },
                            shipping: {
                                currency_code: PAYPAP_CURRENCY,
                                value: options.shipping, // Shipping cost
                            }
                        }
                    }
                }],
                application_context: {
                    return_url: options.success_url || this.success_url,
                    cancel_url: options.cancel_url || this.cancel_url,
                    user_action: 'PAY_NOW',
                    brand_name: this.brand_name ? this.brand_name : undefined,
                }
            })
        });

        const data :any= await response.json();


        const link = data.links.find((link: { rel: string, href?: string }) => link.rel === 'approve');


        return ({ link: link.href, token: data.id });
    }


    async captureDetails(orderID : string) {
        let accessToken = await this.getAccessToken();
        
        const response = await fetch(`${this.api_link}/v2/checkout/orders/${orderID}/capture`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
                'PayPal-Request-Id': `capture-${orderID}-${Date.now()}` 
            },
            body: JSON.stringify({}), 
        });

         if (!response.ok) {
            let paymentDetails :any=await response.json()
            throw new Error(`Failed to capture order: ${paymentDetails.message || JSON.stringify(paymentDetails)}`);
        }

        let paymentDetails = await response.json()

        return paymentDetails;
    }
    paypalError(type: any, description?: string): never {
        if (description === undefined) throw ({ paypalError: { ...type } });
        else throw ({ paypalError: { type, description } });
    }
}