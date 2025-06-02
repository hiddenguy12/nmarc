/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import dotenv from 'dotenv';

dotenv.config();

type ENV_VALUE=string | undefined

// SERVER
export const PORT : ENV_VALUE =process.env.PORT ;
export const NODE_ENV : ENV_VALUE =process.env.NODE_ENV ;
export const BASE_URL : ENV_VALUE =process.env.BASE_URL ;
export const ALLOWED_ORIGIN : ENV_VALUE =process.env.ALLOWED_ORIGIN ;

// Database
export const MONGO_DB_URL:ENV_VALUE=process.env.MONGO_DB_URL ;
export const MONGO_DB_URL2:ENV_VALUE=process.env.MONGO_DB_URL2 ;

// FILE STORAGE
export const ClOUDINARY_CLOUD_NAME:ENV_VALUE=process.env.ClOUDINARY_CLOUD_NAME ;
export const ClOUDINARY_API_KEY:ENV_VALUE=process.env.ClOUDINARY_API_KEY ;
export const ClOUDINARY_API_SECRET:ENV_VALUE=process.env.ClOUDINARY_API_SECRET ;

// COMPANY DETAILS
export const COMPANY_NAME: ENV_VALUE = process.env.COMPANY_NAME;
export const COMPANY_MAIL: ENV_VALUE = process.env.COMPANY_MAIL;
export const COMPANY_LOGO: ENV_VALUE = process.env.COMPANY_LOGO;
export const COMPANY_CONTACT_EMAIL: ENV_VALUE = process.env.COMPANY_CONTACT_EMAIL;
export const COMPANY_CONTACT_ADDRESS: ENV_VALUE = process.env.COMPANY_CONTACT_ADDRESS;
export const COMPANY_CONTACT_PHONE: ENV_VALUE = process.env.COMPANY_CONTACT_PHONE;



// SMTP Configuration
export const SMTP_HOST: ENV_VALUE = process.env.SMTP_HOST;
export const SMTP_PORT: ENV_VALUE = process.env.SMTP_PORT;
export const SMTP_USERNAME: ENV_VALUE = process.env.SMTP_USERNAME;
export const SMTP_PASSWORD: ENV_VALUE = process.env.SMTP_PASSWORD;
export const SMTP_API_KEY: ENV_VALUE = process.env.SMTP_API_KEY;

// Email Accent Colors
export const EMAIL_PRIMARY_COLOR = '#025EB1';
export const EMAIL_BACKGROUND_COLOR = '#FFFFFF';


// Cron-Jobs 
export const JOB_SECRET: ENV_VALUE = process.env.JOB_SECRET;

// currency
export const PAYPAP_CURRENCY: ENV_VALUE = process.env.PAYPAP_CURRENCY;
export const STRIPE_CURRENCY: ENV_VALUE = process.env.STRIPE_CURRENCY;

// Paypal Payment Info
export const PAYPAL_CLIENT_ID: ENV_VALUE = process.env.PAYPAL_CLIENT_ID;
export const PAYPAL_CLIENT_SECRET: ENV_VALUE = process.env.PAYPAL_CLIENT_SECRET;

// Stripe Keys
export const STRIPE_SECRET_KEY: ENV_VALUE = process.env.STRIPE_SECRET_KEY;

// Payment Mode
export const PAYMENT_MODE: ENV_VALUE = process.env.PAYMENT_MODE;
