"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.userDetailsQuerySchema = void 0;
const zod_1 = require("zod");
// Constants for error messages
const ERROR_MESSAGES = {
    FIELDS: {
        INVALID_TYPE: "Fields must be an array of valid profile field names",
        TOO_MANY: (max) => `Too many fields requested. Maximum ${max} fields allowed per request`,
        INVALID_FIELD: (field) => `Invalid field requested: '${field}'. Please refer to the API documentation for valid fields`,
        RESTRICTED: (field) => `Access to field '${field}' is restricted. Please check your permissions`,
        DEPRECATED: (field) => `Field '${field}' is deprecated. Please use the recommended alternative`,
    },
    PRIVACY: {
        ACCESS_DENIED: "Access to requested fields is restricted by privacy settings",
        PREMIUM_REQUIRED: "This field requires a premium subscription",
    }
};
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
];
const MAX_FIELDS = Fields.length;
// Default fields with proper typing
const defaultFields = [
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
exports.userDetailsQuerySchema = zod_1.z.object({
    fields: zod_1.z.array(zod_1.z.enum(Fields, {
        errorMap: (issue, ctx) => ({
            message: issue.code === 'invalid_enum_value'
                ? ERROR_MESSAGES.FIELDS.INVALID_FIELD(ctx.data)
                : ERROR_MESSAGES.FIELDS.INVALID_TYPE
        })
    }))
        .max(MAX_FIELDS, {
        message: ERROR_MESSAGES.FIELDS.TOO_MANY(MAX_FIELDS)
    })
        .optional()
        .default(defaultFields)
        .transform(arr => arr.join(' '))
});
