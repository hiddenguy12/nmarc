/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ InshaAllah
*/

import crypto from "crypto"
import { EducationLevel, Gender, Height, IUser, MaritalStatus } from "../lib/types/user.types"
import { CountryNamesEnum } from "../lib/types/country_names.enum"
import { IAuthSessionValue } from "../models/AuthSession"
import mongoose from "mongoose"
import { countryCodes, CountryCode } from '../lib/data/countryCodes';

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password.normalize(), salt, 64, (error, hash) => {
      if (error) reject('Error in hassing the password')

      resolve(hash.toString("hex").normalize())
    })
  })
}

export async function comparePasswords({
  password,
  salt,
  hashedPassword,
}: {
  password: string
  salt: string
  hashedPassword: string
}) {
  const inputHashedPassword = await hashPassword(password, salt)

  return crypto.timingSafeEqual(
    Buffer.from(inputHashedPassword, "hex"),
    Buffer.from(hashedPassword, "hex")
  )
}

export function generateSalt() {
  return crypto.randomBytes(16).toString("hex").normalize()
}

export function GenerateOtp() {
  function giveOtp() {
    return Math.floor(Math.random() * 999999)
  }
  let otp = giveOtp()
  for (let i = 0; true; i++) {
    if (otp > 99999 && otp < 1000000) {
      return otp;
    }
    else otp = giveOtp();
  }
}

export function giveAuthSessionId() {
  let token: string = crypto.randomBytes(512).toString("hex").normalize();
  return token;
}

export function giveAuthSession(): string {
  return crypto.randomBytes(32).toString("hex").normalize();
}

export async function sendRegistrationOTP(email: string, otp: number): Promise<boolean> {
  try {
    // TODO: Implement email sending logic here
    // This should use your email service to send the OTP
    // Return true if email sent successfully, false otherwise
    return true;
  } catch (error) {
    console.error("Send registration OTP error:", error);
    return false;
  }
}

export function generateAuthToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function giveAuthSessionValue(user: IUser): IAuthSessionValue {
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
                    (user.gender === Gender.MALE ? 18 : 21),
                max: user.partnerPreference?.ageRange?.max || 
                    (user.gender === Gender.MALE ? 35 : 45)
            },
            heightRange: {
                min: user.partnerPreference?.heightRange?.min || 4,
                max: user.partnerPreference?.heightRange?.max || 7
            },
            weightRange: {
                min: user.partnerPreference?.weightRange?.min || 
                    (user.gender === Gender.MALE ? 45 : 50),
                max: user.partnerPreference?.weightRange?.max || 
                    (user.gender === Gender.MALE ? 75 : 85)
            },
            maritalStatus: user.partnerPreference?.maritalStatus || [MaritalStatus.NEVER_MARRIED],
            education: user.isEducated ? {
                minimumLevel: user.partnerPreference?.education?.minimumLevel || 
                    (user.education?.[0]?.level || EducationLevel.HSC),
                mustBeEducated: user.partnerPreference?.education?.mustBeEducated ?? true,
                preferredLevels: user.partnerPreference?.education?.preferredLevels || 
                    [EducationLevel.HSC, EducationLevel.BACHELORS_DEGREE]
            } : undefined,
            religion: user.partnerPreference?.religion || [user.religion],
            occupation: user.partnerPreference?.profession?.acceptedOccupations,
            location: {
              prefferedDistrictIds: user.partnerPreference.locationPreference.preferredDistrictIds
            }
        },

        // Security & Privacy
        blockedProfiles: user.enhancedSettings.blocked.map(
            ({ userId }) => new mongoose.Types.ObjectId(userId)
        )
    };
};




interface PhoneValidationResult {
  isValid: boolean;
  countryCode?: string;
  nationalNumber?: string;
  country?: CountryCode;
}

export function validatePhoneNumber(phoneNumber: string): PhoneValidationResult {
  // Remove all spaces and special characters except + and digits
  const cleanedNumber = phoneNumber.replace(/[^\d+]/g, '');
  
  // Check if number starts with +
  if (!cleanedNumber.startsWith('+')) {
    return { isValid: false };
  }

  // Find matching country code
  const matchingCountry = countryCodes.find(country => {
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

function validateNumberLength(number: string, country: string): boolean {
  // Define country-specific validation rules
  const countryRules: { [key: string]: { min: number; max: number } } = {
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