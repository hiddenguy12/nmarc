"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.urlValidator = exports.uuidValidator = exports.text500Validation = exports.text1000Validation = exports.text100Validation = exports.religionValidator = exports.incomeCurrencyValidator = exports.languagesValdator = exports.maritalStatusesValdator = exports.division_ids_valdator = exports.occupationsValidator = exports.educationLevelsValidator = exports.countriesValidator = exports.emailValidatior = exports.passwordValidator = exports._idValidator = exports.countValidation = exports.pageValidation = exports.limitValidation = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const country_names_enum_1 = require("../types/country_names.enum");
const user_types_1 = require("../types/user.types");
const currencyCodes_enum_1 = require("../types/currencyCodes.enum");
// Define Zod schema for query parameters
exports.limitValidation = zod_1.z.optional(zod_1.z.enum(['10', '25', '50', '100']))
    .default('25')
    .transform(str => parseInt(str));
exports.pageValidation = zod_1.z.optional(zod_1.z.string()
    .regex(/^\d+$/, {
    message: "Page must be a positive integer"
})
    .max(4)).default('1').transform(val => val ? parseInt(val, 10) : 1);
exports.countValidation = zod_1.z.enum(['yes', 'no'])
    .optional()
    .default('no');
exports._idValidator = zod_1.z.string({
    required_error: "User ID is required",
    invalid_type_error: "User ID must be a string"
})
    .trim()
    .refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid user ID format"
});
exports.passwordValidator = zod_1.z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must not exceed 100 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character like @,$,!,%,*,?,&")
    .transform((val) => val.trim());
exports.emailValidatior = zod_1.z.string({
    required_error: "Email is required",
    invalid_type_error: "Email must be a string"
})
    .email("Invalid email format")
    .trim()
    .max(100, "Email  must not exceed 100 characters")
    .toLowerCase();
exports.countriesValidator = zod_1.z
    .array(zod_1.z.nativeEnum(country_names_enum_1.CountryNamesEnum, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid country name. Expected one of: ${Object.values(country_names_enum_1.CountryNamesEnum).join(', ')}`
                };
            default:
                return {
                    message: `Invalid country format. Please provide a valid country name`
                };
        }
    }
}))
    .min(1, { message: "At least one country must be selected" })
    .optional()
    .default([country_names_enum_1.CountryNamesEnum.BANGLADESH])
    .describe("List of preferred countries");
exports.educationLevelsValidator = zod_1.z
    .array(zod_1.z.nativeEnum(user_types_1.EducationLevel, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid education level. Expected one of: ${Object.values(user_types_1.EducationLevel).join(', ')}`
                };
            default:
                return {
                    message: "Invalid education level format"
                };
        }
    }
}))
    .min(1, { message: "At least one education level must be selected" })
    .max(10, { message: "Cannot select more than 10 education levels" })
    .optional()
    .default([])
    .describe("List of acceptable education levels");
exports.occupationsValidator = zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Occupation))
    .max(10, "Maximum 10 occupations can be searched at once")
    .optional()
    .default([]);
exports.division_ids_valdator = zod_1.z.array(zod_1.z.string()
    .regex(/^\d+$/, "Division ID must be a number")
    .transform(Number)
    .pipe(zod_1.z.number()
    .int("Division ID must be an integer")
    .min(1, "Division ID must be at least 1")
    .max(8, "Division ID cannot exceed 8")))
    .max(8, 'You can not add more than 10 division ids')
    .optional()
    .default([]);
exports.maritalStatusesValdator = zod_1.z
    .array(zod_1.z.nativeEnum(user_types_1.MaritalStatus, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid marital status. Must be one of: ${Object.values(user_types_1.MaritalStatus).join(', ')}`
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
}))
    .max(5, {
    message: 'You cannot select more than 5 marital status preferences'
})
    .optional()
    .default([])
    .describe('Array of preferred marital statuses for partner matching');
exports.languagesValdator = zod_1.z
    .array(zod_1.z.nativeEnum(user_types_1.Language, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid language. Allowed languages are: ${Object.values(user_types_1.Language).join(', ')}`
                };
            default:
                return {
                    message: 'Invalid language format'
                };
        }
    }
}))
    .min(1, { message: 'Please select at least one language' })
    .max(10, { message: 'Cannot select more than 10 languages' })
    .optional()
    .default([user_types_1.Language.BENGALI])
    .describe('Languages known by the user');
exports.incomeCurrencyValidator = zod_1.z
    .nativeEnum(currencyCodes_enum_1.CurrencyCode, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid currency code. Supported currencies are: ${Object.values(currencyCodes_enum_1.CurrencyCode).join(', ')}`
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
    .default(currencyCodes_enum_1.CurrencyCode.BDT)
    .describe('Currency code for income representation, defaults to BDT (Bangladeshi Taka)');
exports.religionValidator = zod_1.z
    .nativeEnum(user_types_1.Religion, {
    errorMap: (issue, ctx) => {
        switch (issue.code) {
            case 'invalid_enum_value':
                return {
                    message: `Invalid religion. Must be one of: ${Object.values(user_types_1.Religion).join(', ')}`
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
exports.text100Validation = zod_1.z.string().min(1).max(100).trim().refine((message) => {
    // Basic content moderation - prevent just whitespace or special characters
    return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
}, "Message must contain valid content");
exports.text1000Validation = zod_1.z.string().min(1).max(1000).trim().refine((message) => {
    // Basic content moderation - prevent just whitespace or special characters
    return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
}, "Message must contain valid content");
exports.text500Validation = zod_1.z.string().min(1).max(500).trim().refine((message) => {
    // Basic content moderation - prevent just whitespace or special characters
    return /^(?=.*[a-zA-Z0-9]).+$/.test(message);
}, "Message must contain valid content");
exports.uuidValidator = zod_1.z.string().uuid().trim();
exports.urlValidator = zod_1.z.string().uuid().trim();
