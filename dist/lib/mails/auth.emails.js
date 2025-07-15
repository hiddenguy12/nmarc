"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authEmails = void 0;
exports.default = generateEmailTemplate;
const env_1 = require("../../config/env");
const transporter_1 = __importDefault(require("../../config/transporter"));
// // Email templates
function generateEmailTemplate(content) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${env_1.EMAIL_BACKGROUND_COLOR}; border: 1px solid #ddd; padding: 20px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="${env_1.COMPANY_LOGO}" alt="${env_1.COMPANY_NAME} Logo" style="max-width: 180px;">
          </div>
          <div style="background-color: ${env_1.EMAIL_PRIMARY_COLOR}; color: #ffffff; padding: 18px; text-align: center; border-radius: 8px;">
              <h1 style="margin: 0;">${env_1.COMPANY_NAME}</h1>
          </div>
          <div style="padding: 25px 20px; color: #333;">
              ${content}
          </div>
          <hr style="border: none; border-top: 1px solid ${env_1.EMAIL_PRIMARY_COLOR}; margin: 30px 0;">
          <div style="font-size: 12px; color: #666; text-align: center;">
              <p><strong>${env_1.COMPANY_NAME}</strong></p>
              <p>${env_1.COMPANY_CONTACT_ADDRESS}</p>
              <p>Email: <a href="mailto:${env_1.COMPANY_CONTACT_EMAIL}" style="color: ${env_1.EMAIL_PRIMARY_COLOR}; text-decoration: none;">${env_1.COMPANY_CONTACT_EMAIL}</a></p>
              <p>Phone: <a href="tel:${env_1.COMPANY_CONTACT_PHONE}" style="color: ${env_1.EMAIL_PRIMARY_COLOR}; text-decoration: none;">${env_1.COMPANY_CONTACT_PHONE}</a></p>
          </div>
      </div>
    `;
}
// Registration OTP Email
async function registrationOtpEmail(otp, email) {
    try {
        const content = `
        <div style="background-color: ${env_1.EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${env_1.EMAIL_PRIMARY_COLOR};">Email Verification</h2>
            <p>This is your registration OTP from <strong>FriendsBook</strong> app. Please use the following code to verify your email and complete your registration:</p>
            <div style="background-color: ${env_1.EMAIL_PRIMARY_COLOR}; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. If you didn't initiate this request, please ignore this email.</p>
        </div>
        `;
        const info = await transporter_1.default.sendMail({
            from: env_1.COMPANY_MAIL,
            to: email,
            subject: `Registration OTP - FriendsBook`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Registration OTP sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error(`[Email Error] Failed to send Registration OTP to: ${email} | Subject: Registration OTP - FriendsBook | Error:`, error);
        return false;
    }
}
// Registration Successful Email
async function registrationSuccessEmail(email) {
    try {
        const content = `
        <div style="background-color: ${env_1.EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${env_1.EMAIL_PRIMARY_COLOR};">Welcome to FriendsBook!</h2>
            <p>Your registration was successful. We're excited to have you on board.</p>
            <p>You can now log in to the <strong>FriendsBook</strong> app and start exploring!</p>
            <p>If you have any questions or need help, feel free to contact our support team.</p>
        </div>
        `;
        const info = await transporter_1.default.sendMail({
            from: env_1.COMPANY_MAIL,
            to: email,
            subject: `Registration Successful - FriendsBook`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Registration Success sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error(`[Email Error] Failed to send Registration Success to: ${email} | Subject: Registration Successful - FriendsBook | Error:`, error);
        return false;
    }
}
// Forgot Password OTP Email
async function forgotPasswordOtpEmail(otp, email) {
    try {
        const content = `
        <div style="background-color: ${env_1.EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${env_1.EMAIL_PRIMARY_COLOR};">Password Reset</h2>
            <p>You requested to reset your password for <strong>FriendsBook</strong> app. Use the following OTP to proceed:</p>
            <div style="background-color: ${env_1.EMAIL_PRIMARY_COLOR}; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. If you didn't request this, please contact our support team immediately.</p>
        </div>
        `;
        const info = await transporter_1.default.sendMail({
            from: env_1.COMPANY_MAIL,
            to: email,
            subject: `Password Reset - FriendsBook`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Forgot Password OTP sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    }
    catch (error) {
        console.error(`[Email Error] Failed to send Forgot Password OTP to: ${email} | Subject: Password Reset - FriendsBook | Error:`, error);
        return false;
    }
}
// Export emails
exports.authEmails = {
    registrationOtpEmail,
    registrationSuccessEmail,
    forgotPasswordOtpEmail
};
