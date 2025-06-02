"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifyForgotPasswordOtpSchema = exports.ResetPasswordSchema = exports.VerifyOtpSchema = exports.authSessionValidation = exports.tempSessionValidation = exports.zodOTPValidation = exports.LoginSchema = exports.LoginEnum = exports.registrationUserSchema = exports.educationSchema = void 0;
const zod_1 = require("zod");
const user_types_1 = require("../types/user.types");
const countryCodes_1 = require("../data/countryCodes");
const schemaComponents_1 = require("./schemaComponents");
const country_names_enum_1 = require("../types/country_names.enum");
const divisions_1 = require("../data/divisions");
const districts_1 = require("../data/districts");
const upazilas_1 = require("../data/upazilas");
const unions_1 = require("../data/unions");
const userEducation_types_1 = require("../types/userEducation.types");
const getEducationCertificates_1 = __importDefault(require("../core/getEducationCertificates"));
const calculateAge = (dateOfBirth) => {
    const diff = new Date().getTime() - dateOfBirth.getTime();
    return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)); // Convert milliseconds to years
};
const countryNames = countryCodes_1.countryCodes.map(c => c.country);
const phoneCountryCodes = countryCodes_1.countryCodes.map(c => c.code);
const CountryNameEnum = zod_1.z.enum([countryNames[0], ...countryNames]);
const CountryPhoneCodeEnum = zod_1.z.enum([phoneCountryCodes[0], ...phoneCountryCodes]);
exports.educationSchema = zod_1.z.object({
    level: zod_1.z.nativeEnum(user_types_1.EducationLevel),
    certificate: zod_1.z.nativeEnum(userEducation_types_1.CertificateType),
    institution: zod_1.z.string().min(2, "Institution name is too short").max(100),
    yearOfCompletion: zod_1.z.number()
        .min(1950, "Year must be after 1950")
        .max(new Date().getFullYear(), "Year cannot be in the future"),
    grade: zod_1.z.string().max(25).optional(),
    additionalInfo: zod_1.z.string().max(100).optional()
})
    .refine((data) => (0, getEducationCertificates_1.default)(data.level).includes(data.certificate), {
    message: `The certificate does not belong to the education level`,
    path: ['education.certificate', 'education.level'],
});
const AddressSchema = zod_1.z.object({
    division: zod_1.z.optional(zod_1.z.object({
        id: zod_1.z.number({
            required_error: "Division ID is required",
            invalid_type_error: "Division ID must be a number"
        })
            .gte(1, "Division ID must be between 1 and 8")
            .lte(8, "Division ID must be between 1 and 8")
            .transform(data => data.toString()),
        name: zod_1.z.string().optional(),
        bd_name: zod_1.z.string().optional(),
    })),
    district: zod_1.z.optional(zod_1.z.object({
        id: zod_1.z.number({
            required_error: "District ID is required",
            invalid_type_error: "District ID must be a number"
        })
            .gte(1, "District ID must be between 1 and 64")
            .lte(64, "District ID must be between 1 and 64")
            .transform(data => data.toString()),
        division_id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        bn_name: zod_1.z.string().optional(),
    })),
    upazila: zod_1.z.optional(zod_1.z.object({
        id: zod_1.z.number({
            required_error: "Upazila ID is required",
            invalid_type_error: "Upazila ID must be a number"
        })
            .gte(1, "Upazila ID must be between 1 and 494")
            .lte(494, "Upazila ID must be between 1 and 494")
            .transform(data => data.toString()),
        district_id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        bn_name: zod_1.z.string().optional(),
    })),
    union: zod_1.z.optional(zod_1.z.object({
        id: zod_1.z.number({
            required_error: "Union ID is required",
            invalid_type_error: "Union ID must be a number"
        })
            .gte(1, "Union ID must be between 1 and 4540")
            .lte(4540, "Union ID must be between 1 and 4540")
            .transform(data => data.toString()),
        upazilla_id: zod_1.z.string().optional(),
        name: zod_1.z.string().optional(),
        bn_name: zod_1.z.string().optional(),
    }))
})
    .refine((data) => !!data.division?.id && !!data.district?.id && !!data.upazila?.id && !!data.union?.id, {
    message: "address.division.id, address.district.id, address.upazila.id, address.union.id are required for Bangladesh addresses"
})
    .transform(function (data) {
    data.division = divisions_1.Divisions.find(element => element.id == data.division?.id);
    data.district = districts_1.Districts.find(element => element.id == data.district?.id);
    data.upazila = upazilas_1.Upazilas.find(element => element.id == data.upazila?.id);
    data.union = unions_1.Unions.find(element => element.id == data.union?.id);
    return data;
});
exports.registrationUserSchema = zod_1.z.object({
    profileCreatedBy: zod_1.z.nativeEnum(user_types_1.ProfileCreatedBy, {
        required_error: "Profile creator type is required",
        invalid_type_error: "Invalid profile creator type"
    }),
    gender: zod_1.z.nativeEnum(user_types_1.Gender, {
        required_error: "Gender is required",
        invalid_type_error: "Invalid gender type"
    }),
    name: zod_1.z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters')
        .trim(),
    dateOfBirth: zod_1.z.string()
        .transform((str) => new Date(str))
        .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
        message: "Invalid date format"
    })
        .refine((date) => date < new Date(), {
        message: "Date of birth cannot be in the future"
    })
        .refine((date) => {
        const age = Math.floor((new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return age >= 18;
    }, {
        message: "You must be at least 18 years old"
    }),
    email: schemaComponents_1.emailValidatior,
    height: zod_1.z.nativeEnum(user_types_1.Height, {
        required_error: "Height is required",
        invalid_type_error: "Invalid height value"
    }),
    weight: zod_1.z.number()
        .min(30, 'Weight must be at least 30 kg')
        .max(200, 'Weight must not exceed 200 kg'),
    isEducated: zod_1.z.boolean(),
    education: zod_1.z.array(exports.educationSchema)
        .optional()
        .default([]),
    address: AddressSchema,
    phoneInfo: zod_1.z.object({
        number: zod_1.z.string()
            .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
        country: zod_1.z.object({
            name: CountryNameEnum
                .default(country_names_enum_1.CountryNamesEnum.BANGLADESH)
                .describe("Country name must be from the provided list"),
            phone_code: CountryPhoneCodeEnum
                .default(countryCodes_1.countryCodes.find(c => c.country === country_names_enum_1.CountryNamesEnum.BANGLADESH)?.code || '+88')
                .describe("Phone code must be from the provided list")
        })
            .default({
            name: country_names_enum_1.CountryNamesEnum.BANGLADESH,
            phone_code: "+88"
        })
            .refine((data) => {
            const countryCode = countryCodes_1.countryCodes.find(c => c.country === data.name);
            return countryCode?.code === data.phone_code;
        }, {
            message: "Country name and phone code do not match"
        })
    }),
    languages: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Language, {
        invalid_type_error: "Invalid language selection"
    })).min(1, "At least one language is required"),
    religion: zod_1.z.nativeEnum(user_types_1.Religion, {
        required_error: "Religion is required",
        invalid_type_error: "Invalid religion selection"
    }),
    password: schemaComponents_1.passwordValidator,
    confirmPassword: zod_1.z.string().trim(),
})
    .refine(function (data) {
    const age = Math.floor((new Date().getTime() - data.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (data.gender === user_types_1.Gender.MALE) {
        return age >= 21 && age <= 70;
    }
    else if (data.gender === user_types_1.Gender.FEMALE) {
        return age >= 18 && age <= 70;
    }
}, {
    message: "Invalid age for the selected gender. Male must be 21-70 years old, and female must be 18-70 years old.",
    path: ["age"],
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})
    .refine(function (data) {
    return data.address.district?.division_id === data.address.division?.id;
}, {
    message: "Selected district does not belong to the selected division",
    path: ["address.district.division_id"]
})
    .refine(function (data) {
    return data.address.upazila?.district_id === data.address.district?.id;
}, {
    message: "Selected upazila does not belong to the selected district",
    path: ["address.upazila.district_id"]
})
    .refine(function (data) {
    return data.address.union?.upazilla_id === data.address.upazila?.id;
}, {
    message: "Selected union does not belong to the selected upazila",
    path: ["address.union.upazilla_id"]
})
    .refine((data) => {
    if (data.isEducated && data.education.length === 0)
        return false;
    return true;
}, {
    message: "If User Is educated than the education details is required",
    path: ["isEducated", 'education']
})
    .refine(function ({ isEducated, education }) {
    if (!isEducated && education.length !== 0) {
        return false;
    }
    return true;
}, {
    message: 'If User is not educated Than education details is not required',
    path: ['isEducated', 'education[0].level', 'education[0].certificate', 'education[0].yearOfCompletion']
})
    .transform(function (data) {
    return {
        ...data,
        age: Math.floor((new Date().getTime() - data.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    };
});
var LoginEnum;
(function (LoginEnum) {
    LoginEnum["withPhone"] = "with_phone";
    LoginEnum["withEmail"] = "with_email";
})(LoginEnum || (exports.LoginEnum = LoginEnum = {}));
// Base schema for common fields
exports.LoginSchema = zod_1.z.object({
    password: schemaComponents_1.passwordValidator,
    email: zod_1.z.optional(schemaComponents_1.emailValidatior),
    phoneInfo: zod_1.z.object({
        number: zod_1.z.string({
            required_error: "Phone number is required",
            invalid_type_error: "Phone number must be a string"
        })
            .regex(/^\d{10,15}$/, "Phone number must be between 10 and 15 digits"),
        phone_code: CountryPhoneCodeEnum.describe("Phone code must be from the provided list")
    }).optional(),
    loginType: zod_1.z.nativeEnum(LoginEnum)
})
    .refine((data) => !!data.email || (!!data.phoneInfo?.number || !!data?.phoneInfo?.phone_code), {
    message: 'Either email or phone information (number and phone code) must be provided.',
    path: ['phoneInfo', 'email']
})
    .refine((data) => {
    if (data.loginType === LoginEnum.withEmail) {
        return !!data.email;
    }
    return true;
}, {
    message: 'Email must be provided when login type is "with_email".',
    path: ['loginType', 'email']
})
    .refine((data) => {
    if (data.loginType === LoginEnum.withPhone) {
        return !!data.phoneInfo?.number || !!data?.phoneInfo?.phone_code;
    }
    return true;
}, {
    message: 'Phone number and phone code must be provided when login type is "with_phone".',
    path: ['loginType', 'phoneInfo']
});
exports.zodOTPValidation = zod_1.z.string({
    required_error: "OTP is required",
    invalid_type_error: "OTP must be a string"
})
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^[0-9]{6}$/, "OTP must contain only numbers")
    .transform((val) => parseInt(val, 10));
// Session key validation
exports.tempSessionValidation = zod_1.z.string({
    required_error: "Session key is required",
    invalid_type_error: "Session key must be a string"
})
    .trim()
    .min(64, "Invalid session key length")
    .max(64, "Invalid session key length")
    .regex(/^[0-9a-fA-F]{64}$/, "Session key must be a valid hex string");
// Session key validation
exports.authSessionValidation = zod_1.z.string({
    required_error: "Auth Token is required",
    invalid_type_error: "Auth Token must be a string"
})
    .trim()
    .min(64, "Invalid session key length")
    .max(64, "Invalid session key length")
    .regex(/^[0-9a-fA-F]{64}$/, "Session key must be a valid hex string");
exports.VerifyOtpSchema = zod_1.z.object({
    sessionKey: exports.tempSessionValidation,
    otp: exports.zodOTPValidation
});
exports.ResetPasswordSchema = zod_1.z.object({
    // User ID validation using MongoDB ObjectId
    userId: zod_1.z.optional(schemaComponents_1._idValidator),
    // New password validation with strong password requirements
    password: schemaComponents_1.passwordValidator,
    // Confirm password validation
    confirmPassword: schemaComponents_1.passwordValidator,
    // new Password
    newPassword: schemaComponents_1.passwordValidator,
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"] // Path helps client identify which field caused the error
});
exports.VerifyForgotPasswordOtpSchema = zod_1.z.object({
    sessionKey: exports.tempSessionValidation,
    otp: exports.zodOTPValidation,
    newPassword: schemaComponents_1.passwordValidator,
    confirmPassword: schemaComponents_1.passwordValidator
})
    .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});
