"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENT_MODE = exports.STRIPE_SECRET_KEY = exports.PAYPAL_CLIENT_SECRET = exports.PAYPAL_CLIENT_ID = exports.STRIPE_CURRENCY = exports.PAYPAP_CURRENCY = exports.JOB_SECRET = exports.EMAIL_BACKGROUND_COLOR = exports.EMAIL_PRIMARY_COLOR = exports.SMTP_SECURE = exports.SMTP_PASS = exports.SMTP_USER = exports.SMTP_PORT = exports.SMTP_HOST = exports.COMPANY_CONTACT_PHONE = exports.COMPANY_CONTACT_ADDRESS = exports.COMPANY_CONTACT_EMAIL = exports.COMPANY_LOGO = exports.COMPANY_MAIL = exports.COMPANY_NAME = exports.ClOUDINARY_API_SECRET = exports.ClOUDINARY_API_KEY = exports.ClOUDINARY_CLOUD_NAME = exports.MONGO_DB_URL2 = exports.MONGO_DB_URL = exports.ALLOWED_ORIGIN = exports.BASE_URL = exports.NODE_ENV = exports.PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// SERVER
exports.PORT = process.env.PORT;
exports.NODE_ENV = process.env.NODE_ENV;
exports.BASE_URL = process.env.BASE_URL;
exports.ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN;
// Database
exports.MONGO_DB_URL = process.env.MONGO_DB_URL;
exports.MONGO_DB_URL2 = process.env.MONGO_DB_URL2;
// FILE STORAGE
exports.ClOUDINARY_CLOUD_NAME = process.env.ClOUDINARY_CLOUD_NAME;
exports.ClOUDINARY_API_KEY = process.env.ClOUDINARY_API_KEY;
exports.ClOUDINARY_API_SECRET = process.env.ClOUDINARY_API_SECRET;
// COMPANY DETAILS
exports.COMPANY_NAME = process.env.COMPANY_NAME;
exports.COMPANY_MAIL = process.env.COMPANY_MAIL;
exports.COMPANY_LOGO = process.env.COMPANY_LOGO;
exports.COMPANY_CONTACT_EMAIL = process.env.COMPANY_CONTACT_EMAIL;
exports.COMPANY_CONTACT_ADDRESS = process.env.COMPANY_CONTACT_ADDRESS;
exports.COMPANY_CONTACT_PHONE = process.env.COMPANY_CONTACT_PHONE;
// SMTP Configuration
exports.SMTP_HOST = process.env.SMTP_HOST;
exports.SMTP_PORT = process.env.SMTP_PORT;
exports.SMTP_USER = process.env.SMTP_USER;
exports.SMTP_PASS = process.env.SMTP_PASS;
exports.SMTP_SECURE = process.env.SMTP_SECURE;
// Email Accent Colors
exports.EMAIL_PRIMARY_COLOR = '#025EB1';
exports.EMAIL_BACKGROUND_COLOR = '#FFFFFF';
// Cron-Jobs 
exports.JOB_SECRET = process.env.JOB_SECRET;
// currency
exports.PAYPAP_CURRENCY = process.env.PAYPAP_CURRENCY;
exports.STRIPE_CURRENCY = process.env.STRIPE_CURRENCY;
// Paypal Payment Info
exports.PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
exports.PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
// Stripe Keys
exports.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// Payment Mode
exports.PAYMENT_MODE = process.env.PAYMENT_MODE;
