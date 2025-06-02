/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from "zod";
import { EducationLevel } from "../types/userEducation.types";

// Constants for error messages
const ERROR_MESSAGES = {
    FIELDS: {
        INVALID_TYPE: "Fields must be an array of valid profile field names",
        TOO_MANY: (max: number) =>
            `Too many fields requested. Maximum ${max} fields allowed per request`,
        INVALID_FIELD: (field: string) =>
            `Invalid field requested: '${field}'. Please refer to the API documentation for valid fields`,
        RESTRICTED: (field: string) =>
            `Access to field '${field}' is restricted. Please check your permissions`,
        DEPRECATED: (field: string) =>
            `Field '${field}' is deprecated. Please use the recommended alternative`,
    },
    PRIVACY: {
        ACCESS_DENIED: "Access to requested fields is restricted by privacy settings",
        PREMIUM_REQUIRED: "This field requires a premium subscription",
    }
} as const;

// Field groups for better organization and validation
const Fields = [
    'name',
    'mid',
    'email',
    'phoneInfo',
    'gender',
    'age',
    'dateOfBirth',
    'height',
    'weight',
    'maritalStatus',
    'profileCreatedBy',
    'profileImage',
    'coverImage',
    'userImages',
    'address',
    'religion',
    'languages',
    'isEducated',
    'education',
    'occupation',
    'annualIncome',
    'aboutMe',
    'familyInfo',
    'createdAt',
    'onlineStatus',
    'partnerPreference',
    'enhancedSettings',
] as const;

// Type for valid fields
type ValidField = typeof Fields[number];

const MAX_FIELDS = Fields.length;

// Default fields with proper typing
const defaultFields: ValidField[] = [
    'name',
    'mid',
    'email',
    'phoneInfo',
    'gender',
    'age',
    'dateOfBirth',
    'height',
    'weight',
    'maritalStatus',
    'profileCreatedBy',
    'profileImage',
    'coverImage',
    'userImages',
    'religion',
    'languages',
    'isEducated',
    'education',
    'occupation',
    'annualIncome',
];

// Schema with enhanced validation and error messages
export const userDetailsQuerySchema = z.object({
    fields: z.array(
        z.enum(Fields, {
            errorMap: (issue, ctx) => ({
                message: issue.code === 'invalid_enum_value'
                    ? ERROR_MESSAGES.FIELDS.INVALID_FIELD(ctx.data)
                    : ERROR_MESSAGES.FIELDS.INVALID_TYPE
            })
        })
    )
        .max(MAX_FIELDS, {
            message: ERROR_MESSAGES.FIELDS.TOO_MANY(MAX_FIELDS)
        })
        .optional()
        .default(defaultFields)
        .transform(arr => arr.join(' '))
});