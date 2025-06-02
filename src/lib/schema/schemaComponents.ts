/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import { Types } from 'mongoose';
import { CountryNamesEnum } from '../types/country_names.enum';
import { EducationLevel, Language, MaritalStatus, Occupation, Religion } from '../types/user.types';
import { CurrencyCode } from '../types/currencyCodes.enum';

// Define Zod schema for query parameters
export const limitValidation = z.optional(z.enum(['10', '25', '50', '100']))
    .default('25')
    .transform(str => parseInt(str));
    
export const pageValidation = z.optional(
    z.string()
        .regex(/^\d+$/, {
            message: "Page must be a positive integer"
        })
        .max(4)
).default('1').transform(val => val ? parseInt(val, 10) : 1)

export const countValidation = z.enum(['yes', 'no'])
    .optional()
    .default('no');

export const _idValidator = z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string"
})
    .trim()
    .refine((val) => Types.ObjectId.isValid(val), {
        message: "Invalid user ID format"
    });


export const passwordValidator = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character like @,$,!,%,*,?,&")
    .transform((val) => val.trim());


export const emailValidatior = z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
})
    .email("Invalid email format")
    .trim()
    .max(100, "Email  must not exceed 100 characters")
    .toLowerCase();



export const countriesValidator = z
    .array(
        z.nativeEnum(CountryNamesEnum, {
            errorMap: (issue, ctx) => {
                switch (issue.code) {
                    case 'invalid_enum_value':
                        return {
                            message: `Invalid country name. Expected one of: ${Object.values(CountryNamesEnum).join(', ')}`
                        };
                    default:
                        return {
                            message: `Invalid country format. Please provide a valid country name`
                        };
                }
            }
        })
    )
    .min(1, { message: "At least one country must be selected" })
    .optional()
    .default([CountryNamesEnum.BANGLADESH])
    .describe("List of preferred countries");

    


export const educationLevelsValidator = z
    .array(
        z.nativeEnum(EducationLevel, {
            errorMap: (issue, ctx) => {
                switch (issue.code) {
                    case 'invalid_enum_value':
                        return {
                            message: `Invalid education level. Expected one of: ${Object.values(EducationLevel).join(', ')}`
                        };
                    default:
                        return {
                            message: "Invalid education level format"
                        };
                }
            }
        })
    )
    .min(1, { message: "At least one education level must be selected" })
    .max(10, { message: "Cannot select more than 10 education levels" })
    .optional()
    .default([])
    .describe("List of acceptable education levels");


export const occupationsValidator = z.array(
    z.nativeEnum(Occupation)
)
    .max(10, "Maximum 10 occupations can be searched at once")
    .optional()
    .default([]);


export const division_ids_valdator = z.array(
    z.string()
        .regex(/^\d+$/, "Division ID must be a number")
        .transform(Number)
        .pipe(
            z.number()
                .int("Division ID must be an integer")
                .min(1, "Division ID must be at least 1")
                .max(8, "Division ID cannot exceed 8")
        )
)
    .max(8, 'You can not add more than 10 division ids')
    .optional()
    .default([]);


export const maritalStatusesValdator = z
    .array(
        z.nativeEnum(MaritalStatus, {
            errorMap: (issue, ctx) => {
                switch (issue.code) {
                    case 'invalid_enum_value':
                        return {
                            message: `Invalid marital status. Must be one of: ${Object.values(MaritalStatus).join(', ')}`
                        };
                    case 'invalid_type':
                        return {
                            message: 'Marital status must be a valid string value'
                        };
                    default:
                        return {
                            message: 'Invalid marital status format'
                        };
                }
            }
        })
    )
    .max(5, {
        message: 'You cannot select more than 5 marital status preferences'
    })

    .optional()
    .default([])
    .describe('Array of preferred marital statuses for partner matching');


export const languagesValdator = z
    .array(
        z.nativeEnum(Language, {
            errorMap: (issue, ctx) => {
                switch (issue.code) {
                    case 'invalid_enum_value':
                        return {
                            message: `Invalid language. Allowed languages are: ${Object.values(Language).join(', ')}`
                        };
                    default:
                        return {
                            message: 'Invalid language format'
                        };
                }
            }
        })
    )
    .min(1, { message: 'Please select at least one language' })
    .max(10, { message: 'Cannot select more than 10 languages' })
    .optional()
    .default([Language.BENGALI])
    .describe('Languages known by the user');

export const incomeCurrencyValidator = z
    .nativeEnum(CurrencyCode, {
        errorMap: (issue, ctx) => {
            switch (issue.code) {
                case 'invalid_enum_value':
                    return {
                        message: `Invalid currency code. Supported currencies are: ${Object.values(CurrencyCode).join(', ')}`
                    };
                case 'invalid_type':
                    return {
                        message: 'Currency code must be a valid string value'
                    };
                default:
                    return {
                        message: 'Invalid currency format'
                    };
            }
        },
    })
    .optional()
    .default(CurrencyCode.BDT)
    .describe('Currency code for income representation, defaults to BDT (Bangladeshi Taka)');


export const religionValidator = z
    .nativeEnum(Religion, {
        errorMap: (issue, ctx) => {
            switch (issue.code) {
                case 'invalid_enum_value':
                    return {
                        message: `Invalid religion. Must be one of: ${Object.values(Religion).join(', ')}`
                    };
                case 'invalid_type':
                    return {
                        message: 'Religion must be a valid string value'
                    };
                default:
                    return {
                        message: 'Invalid religion format'
                    };
            }
        }
    })
    .optional()
    .describe('User\'s religious affiliation for matrimony matching');

export const text100Validation = z.string().min(1).max(100).trim().refine(
            (message) => {
                // Basic content moderation - prevent just whitespace or special characters
                return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
            },
            "Message must contain valid content"
        );

export const text1000Validation = z.string().min(1).max(1000).trim().refine(
            (message) => {
                // Basic content moderation - prevent just whitespace or special characters
                return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
            },
            "Message must contain valid content"
        );


export const text500Validation = z.string().min(1).max(500).trim().refine(
            (message) => {
                // Basic content moderation - prevent just whitespace or special characters
                return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
            },
            "Message must contain valid content"
        );

export const uuidValidator = z.string().uuid().trim();
export const urlValidator = z.string().uuid().trim();
