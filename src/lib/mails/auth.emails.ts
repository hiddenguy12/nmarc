/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import {
    COMPANY_MAIL,
    COMPANY_CONTACT_ADDRESS,
    COMPANY_CONTACT_EMAIL,
    COMPANY_CONTACT_PHONE,
    COMPANY_LOGO,
    COMPANY_NAME,
    EMAIL_PRIMARY_COLOR,
    EMAIL_BACKGROUND_COLOR,
} from '../../config/env';
import transporter from '../../config/transporter';

// // Email templates
export default function generateEmailTemplate(content: string): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: ${EMAIL_BACKGROUND_COLOR}; border: 1px solid #ddd; padding: 20px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
              <img src="${COMPANY_LOGO}" alt="${COMPANY_NAME} Logo" style="max-width: 180px;">
          </div>
          <div style="background-color: ${EMAIL_PRIMARY_COLOR}; color: #ffffff; padding: 18px; text-align: center; border-radius: 8px;">
              <h1 style="margin: 0;">${COMPANY_NAME}</h1>
          </div>
          <div style="padding: 25px 20px; color: #333;">
              ${content}
          </div>
          <hr style="border: none; border-top: 1px solid ${EMAIL_PRIMARY_COLOR}; margin: 30px 0;">
          <div style="font-size: 12px; color: #666; text-align: center;">
              <p><strong>${COMPANY_NAME}</strong></p>
              <p>${COMPANY_CONTACT_ADDRESS}</p>
              <p>Email: <a href="mailto:${COMPANY_CONTACT_EMAIL}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: none;">${COMPANY_CONTACT_EMAIL}</a></p>
              <p>Phone: <a href="tel:${COMPANY_CONTACT_PHONE}" style="color: ${EMAIL_PRIMARY_COLOR}; text-decoration: none;">${COMPANY_CONTACT_PHONE}</a></p>
          </div>
      </div>
    `;
}

// Registration OTP Email
async function registrationOtpEmail(otp: number, email: string): Promise<boolean> {
    try {
        const content = `
        <div style="background-color: ${EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${EMAIL_PRIMARY_COLOR};">Email Verification</h2>
            <p>This is your registration OTP from <strong>NMRCA</strong> app. Please use the following code to verify your email and complete your registration:</p>
            <div style="background-color: ${EMAIL_PRIMARY_COLOR}; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. If you didn't initiate this request, please ignore this email.</p>
        </div>
        `;
        const info = await transporter.sendMail({
            from: COMPANY_MAIL,
            to: email,
            subject: `Registration OTP - NMRCA`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Registration OTP sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send Registration OTP to: ${email} | Subject: Registration OTP - NMRCA | Error:`, error);
        return false;
    }
}


// Registration Successful Email
async function registrationSuccessEmail(email: string): Promise<boolean> {
    try {
        const content = `
        <div style="background-color: ${EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${EMAIL_PRIMARY_COLOR};">Welcome to NMRCA!</h2>
            <p>Your registration was successful. We're excited to have you on board.</p>
            <p>You can now log in to the <strong>NMRCA</strong> app and start exploring!</p>
            <p>If you have any questions or need help, feel free to contact our support team.</p>
        </div>
        `;
        const info = await transporter.sendMail({
            from: COMPANY_MAIL,
            to: email,
            subject: `Registration Successful - NMRCA`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Registration Success sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send Registration Success to: ${email} | Subject: Registration Successful - NMRCA | Error:`, error);
        return false;
    }
}


// Forgot Password OTP Email
async function forgotPasswordOtpEmail(otp: number, email: string): Promise<boolean> {
    try {
        const content = `
        <div style="background-color: ${EMAIL_BACKGROUND_COLOR}; padding: 20px;">
            <h2 style="color: ${EMAIL_PRIMARY_COLOR};">Password Reset</h2>
            <p>You requested to reset your password for <strong>NMRCA</strong> app. Use the following OTP to proceed:</p>
            <div style="background-color: ${EMAIL_PRIMARY_COLOR}; color: white; padding: 15px; text-align: center; margin: 20px 0; border-radius: 8px;">
                <h1 style="margin: 0;">${otp}</h1>
            </div>
            <p>This code will expire in 10 minutes. If you didn't request this, please contact our support team immediately.</p>
        </div>
        `;
        const info = await transporter.sendMail({
            from: COMPANY_MAIL,
            to: email,
            subject: `Password Reset - NMRCA`,
            html: generateEmailTemplate(content),
        });
        console.log(`[Email Success] Forgot Password OTP sent to: ${email} | Message ID: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error(`[Email Error] Failed to send Forgot Password OTP to: ${email} | Subject: Password Reset - NMRCA | Error:`, error);
        return false;
    }
}




// Export emails
export const authEmails = {
    registrationOtpEmail ,
    registrationSuccessEmail ,
    forgotPasswordOtpEmail
};