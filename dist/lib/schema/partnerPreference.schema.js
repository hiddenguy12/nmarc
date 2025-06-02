"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerPreferenceSchema = void 0;
const zod_1 = require("zod");
const partnerPreference_1 = require("../types/partnerPreference");
const user_types_1 = require("../types/user.types");
const userEducation_types_1 = require("../types/userEducation.types");
const userProfile_types_1 = require("../types/userProfile.types");
const districts_1 = require("../data/districts");
exports.partnerPreferenceSchema = zod_1.z.object({
    ageRange: zod_1.z.object({
        min: zod_1.z.number().min(18).max(70).optional(),
        max: zod_1.z.number().min(18).max(70).optional()
    })
        .refine((data) => {
        if (data?.min !== undefined && data?.max !== undefined) {
            return data.min <= data.max;
        }
        return true; // If either min or max is undefined, the refine doesn't apply
    }, {
        message: "Minimum age must be less than or equal to maximum age"
    }).optional(),
    heightRange: zod_1.z.object({
        min: zod_1.z.number().min(4).max(8).optional(),
        max: zod_1.z.number().min(5).max(9).optional()
    })
        .refine(({ min, max }) => {
        if ((!min && max) || (!max && min)) {
            return false;
        }
        if (min && max)
            return min < max;
    }, {
        message: "Minimum height must be less than to maximum height"
    })
        .optional(),
    weightRange: zod_1.z.object({
        min: zod_1.z.number().min(30).max(200).optional(),
        max: zod_1.z.number().min(30).max(200).optional()
    })
        .refine((data) => {
        if (data?.min !== undefined && data?.max !== undefined) {
            return data.min <= data.max;
        }
        return true; // If either min or max is undefined, the refine doesn't apply
    }, {
        message: "Minimum weight must be less than or equal to maximum weight"
    })
        .optional(),
    district: zod_1.z.string().optional(),
    maritalStatus: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.MaritalStatus)).min(1).optional(),
    complexion: zod_1.z.array(zod_1.z.nativeEnum(partnerPreference_1.ComplexionPreference)).optional(),
    physicalStatus: zod_1.z.array(zod_1.z.nativeEnum(userProfile_types_1.PhysicalStatus)).min(1).optional(),
    religiousBranch: zod_1.z.array(zod_1.z.nativeEnum(userProfile_types_1.ReligiousBranch)).optional(),
    dealBreakers: zod_1.z.array(zod_1.z.nativeEnum(userProfile_types_1.BadHabits)).optional(),
    locationPreference: zod_1.z.object({
        preferredDistrictIds: zod_1.z.array(zod_1.z.number().min(1).max(64)).default([]).optional()
    })
        .optional(),
    education: zod_1.z.object({
        minimumLevel: zod_1.z.nativeEnum(userEducation_types_1.EducationLevel).optional(),
        preferredLevels: zod_1.z.array(zod_1.z.nativeEnum(userEducation_types_1.EducationLevel)).optional(),
        mustBeEducated: zod_1.z.boolean().optional(),
        preferredInstitutions: zod_1.z.array(zod_1.z.string()).optional()
    })
        .optional(),
    profession: zod_1.z.object({
        acceptedOccupations: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Occupation)).optional(),
        preferredSectors: zod_1.z.array(zod_1.z.nativeEnum(partnerPreference_1.EmploymentSector)).optional(),
        minimumAnnualIncome: zod_1.z.object({
            min: zod_1.z.number().optional(),
            max: zod_1.z.number().optional(),
            currency: zod_1.z.optional(zod_1.z.enum(['BDT']).default('BDT'))
        }).optional()
    }).optional(),
    religion: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Religion)).min(1).optional(),
    motherTongue: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Language)).optional(),
    familyValues: zod_1.z.array(zod_1.z.nativeEnum(partnerPreference_1.FamilyValues)).optional(),
    familyBackground: zod_1.z.object({
        maxSiblings: zod_1.z.number().optional(),
        preferredFamilyType: zod_1.z.array(zod_1.z.string()).optional(),
        preferredFamilyStatus: zod_1.z.array(zod_1.z.string()).optional()
    }).optional(),
})
    .refine((data) => {
    if (data.district)
        return !!districts_1.districtNames.includes(data.district);
    return true;
}, {
    message: '',
    path: ['district']
});
