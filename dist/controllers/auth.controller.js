"use strict";
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ InshaAllah
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.comparePasswords = comparePasswords;
exports.generateSalt = generateSalt;
exports.GenerateOtp = GenerateOtp;
exports.giveAuthSessionId = giveAuthSessionId;
exports.giveAuthSession = giveAuthSession;
exports.sendRegistrationOTP = sendRegistrationOTP;
exports.generateAuthToken = generateAuthToken;
exports.giveAuthSessionValue = giveAuthSessionValue;
exports.validatePhoneNumber = validatePhoneNumber;
const crypto_1 = __importDefault(require("crypto"));
const user_types_1 = require("../lib/types/user.types");
const mongoose_1 = __importDefault(require("mongoose"));
const countryCodes_1 = require("../lib/data/countryCodes");
function hashPassword(password, salt) {
    return new Promise((resolve, reject) => {
        crypto_1.default.scrypt(password.normalize(), salt, 64, (error, hash) => {
            if (error)
                reject('Error in hassing the password');
            resolve(hash.toString("hex").normalize());
        });
    });
}
async function comparePasswords({ password, salt, hashedPassword, }) {
    const inputHashedPassword = await hashPassword(password, salt);
    return crypto_1.default.timingSafeEqual(Buffer.from(inputHashedPassword, "hex"), Buffer.from(hashedPassword, "hex"));
}
function generateSalt() {
    return crypto_1.default.randomBytes(16).toString("hex").normalize();
}
function GenerateOtp() {
    function giveOtp() {
        return Math.floor(Math.random() * 999999);
    }
    let otp = giveOtp();
    for (let i = 0; true; i++) {
        if (otp > 99999 && otp < 1000000) {
            return otp;
        }
        else
            otp = giveOtp();
    }
}
function giveAuthSessionId() {
    let token = crypto_1.default.randomBytes(512).toString("hex").normalize();
    return token;
}
function giveAuthSession() {
    return crypto_1.default.randomBytes(32).toString("hex").normalize();
}
async function sendRegistrationOTP(email, otp) {
    try {
        // TODO: Implement email sending logic here
        // This should use your email service to send the OTP
        // Return true if email sent successfully, false otherwise
        return true;
    }
    catch (error) {
        console.error("Send registration OTP error:", error);
        return false;
    }
}
function generateAuthToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
function giveAuthSessionValue(user) {
    return {
        // Basic Info
        email: user.email,
        userId: user._id,
        // Location Info
        address: {
            country: user.address.country,
            lat: user.address.district?.lat,
            long: user.address.district?.long,
            division: user.address.division?.name,
            district: user.address.district?.name,
            upazila: user.address.upazila?.name,
            union: user.address.union?.name
        },
        // Contact Info
        phone: {
            number: user.phoneInfo.number,
            code: user.phoneInfo.country.phone_code,
        },
        // Personal Attributes
        gender: user.gender,
        height: user.height,
        weight: user.weight,
        religion: user.religion,
        languages: user.languages,
        maritalStatus: user.maritalStatus,
        // Education & Professional Info
        isEducated: user.isEducated,
        education: user.education?.map(edu => ({
            level: edu.level
        })),
        occupation: user.occupation,
        // Partner Preferences (Optimized for Search)
        partnerPreferences: {
            ageRange: {
                min: user.partnerPreference?.ageRange?.min ||
                    (user.gender === user_types_1.Gender.MALE ? 18 : 21),
                max: user.partnerPreference?.ageRange?.max ||
                    (user.gender === user_types_1.Gender.MALE ? 35 : 45)
            },
            heightRange: {
                min: user.partnerPreference?.heightRange?.min || 4,
                max: user.partnerPreference?.heightRange?.max || 7
            },
            weightRange: {
                min: user.partnerPreference?.weightRange?.min ||
                    (user.gender === user_types_1.Gender.MALE ? 45 : 50),
                max: user.partnerPreference?.weightRange?.max ||
                    (user.gender === user_types_1.Gender.MALE ? 75 : 85)
            },
            maritalStatus: user.partnerPreference?.maritalStatus || [user_types_1.MaritalStatus.NEVER_MARRIED],
            education: user.isEducated ? {
                minimumLevel: user.partnerPreference?.education?.minimumLevel ||
                    (user.education?.[0]?.level || user_types_1.EducationLevel.HSC),
                mustBeEducated: user.partnerPreference?.education?.mustBeEducated ?? true,
                preferredLevels: user.partnerPreference?.education?.preferredLevels ||
                    [user_types_1.EducationLevel.HSC, user_types_1.EducationLevel.BACHELORS_DEGREE]
            } : undefined,
            religion: user.partnerPreference?.religion || [user.religion],
            occupation: user.partnerPreference?.profession?.acceptedOccupations,
            location: {
                prefferedDistrictIds: user.partnerPreference.locationPreference.preferredDistrictIds
            }
        },
        // Security & Privacy
        blockedProfiles: user.enhancedSettings.blocked.map(({ userId }) => new mongoose_1.default.Types.ObjectId(userId))
    };
}
;
function validatePhoneNumber(phoneNumber) {
    // Remove all spaces and special characters except + and digits
    const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
    // Check if number starts with +
    if (!cleanedNumber.startsWith('+')) {
        return { isValid: false };
    }
    // Find matching country code
    const matchingCountry = countryCodes_1.countryCodes.find(country => {
        const code = country.code.replace(/\s/g, ''); // Remove any spaces in country code
        return cleanedNumber.startsWith(code);
    });
    if (!matchingCountry) {
        return { isValid: false };
    }
    const nationalNumber = cleanedNumber.slice(matchingCountry.code.length);
    // Validate number length based on country
    const isValidLength = validateNumberLength(nationalNumber, matchingCountry.country);
    if (!isValidLength) {
        return { isValid: false };
    }
    return {
        isValid: true,
        countryCode: matchingCountry.code,
        nationalNumber,
        country: matchingCountry
    };
}
function validateNumberLength(number, country) {
    // Define country-specific validation rules
    const countryRules = {
        'Bangladesh': { min: 10, max: 10 },
        'India': { min: 10, max: 10 },
        'United States': { min: 10, max: 10 },
        'United Kingdom': { min: 9, max: 10 },
    };
    // Default rule if country specific rule not found
    const defaultRule = { min: 6, max: 15 };
    const rule = countryRules[country] || defaultRule;
    return number.length >= rule.min && number.length <= rule.max;
}
