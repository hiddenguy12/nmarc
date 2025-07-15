"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ InshaAllah
*/
const nodemailer_1 = __importDefault(require("nodemailer"));
const env_1 = require("./env");
const transporter = nodemailer_1.default.createTransport({
    host: env_1.SMTP_HOST,
    port: Number(env_1.SMTP_PORT),
    secure: env_1.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
        user: env_1.SMTP_USER,
        pass: env_1.SMTP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 5000,
});
exports.default = transporter;
