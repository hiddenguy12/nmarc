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
    // service: SMTP_HOST,
    secure: false,
    auth: {
        user: env_1.SMTP_USERNAME,
        pass: env_1.SMTP_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
        ciphers: 'SSLv3'
    },
    connectionTimeout: 10000,
    dnsTimeout: 3000,
    socketTimeout: 3000,
    greetingTimeout: 3000
});
exports.default = transporter;
