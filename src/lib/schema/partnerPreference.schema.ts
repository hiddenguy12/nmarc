/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import {
    ComplexionPreference,
    EmploymentSector,
    FamilyValues,
    PreferredLocation
} from '../types/partnerPreference';
import { Height, MaritalStatus, Occupation, Religion, Language } from '../types/user.types';
import { EducationLevel } from '../types/userEducation.types';
import { PhysicalStatus, ReligiousBranch, BadHabits } from '../types/userProfile.types';
import { CurrencyCode } from '../types/currencyCodes.enum';
import { CountryNamesEnum } from '../types/country_names.enum';
import { districtNames } from '../data/districts';


export const partnerPreferenceSchema = z.object({
    ageRange: z.object({
        min: z.number().min(18).max(70).optional(),
        max: z.number().min(18).max(70).optional()
    })
    .refine(
        (data) => {
            if (data?.min !== undefined && data?.max !== undefined) {
                return data.min <= data.max;
            }
            return true; // If either min or max is undefined, the refine doesn't apply
        },
        {
            message: "Minimum age must be less than or equal to maximum age"
        }
    ).optional(),

    heightRange: z.object({
        min: z.number().min(4).max(8).optional(),
        max: z.number().min(5).max(9).optional()
    })
    .refine(
        ({ min, max }) => {
            if ((!min && max) || (!max && min)) {
                return false;
            }
            if (min && max ) return min < max; 
        },
        {
            message: "Minimum height must be less than to maximum height"
        }
    )
    .optional(),

    weightRange: z.object({
        min: z.number().min(30).max(200).optional(),
        max: z.number().min(30).max(200).optional()
    })
    .refine(
        (data) => {
            if (data?.min !== undefined && data?.max !== undefined) {
                return data.min <= data.max;
            }
            return true; // If either min or max is undefined, the refine doesn't apply
        },
        {
            message: "Minimum weight must be less than or equal to maximum weight"
        }
    )
    .optional(),
    district: z.string().optional(),
    maritalStatus: z.array(z.nativeEnum(MaritalStatus)).min(1).optional(),
    complexion: z.array(z.nativeEnum(ComplexionPreference)).optional(),
    physicalStatus: z.array(z.nativeEnum(PhysicalStatus)).min(1).optional(),
    religiousBranch: z.array(z.nativeEnum(ReligiousBranch)).optional(),
    dealBreakers: z.array(z.nativeEnum(BadHabits)).optional(),

    locationPreference: z.object({
        preferredDistrictIds:z.array( z.number().min(1).max(64)).default([]).optional()
    })
    .optional(),

    education: z.object({
        minimumLevel: z.nativeEnum(EducationLevel).optional(),
        preferredLevels: z.array(z.nativeEnum(EducationLevel)).optional(),
        mustBeEducated: z.boolean().optional(),
        preferredInstitutions: z.array(z.string()).optional()
    })
    .optional(),

    profession: z.object({
        acceptedOccupations: z.array(z.nativeEnum(Occupation)).optional(),
        preferredSectors: z.array(z.nativeEnum(EmploymentSector)).optional(),
        minimumAnnualIncome: z.object({
            min: z.number().optional(),
            max: z.number().optional(),
            currency: z.optional(z.enum(['BDT']).default('BDT'))
        }).optional()
    }).optional(),

    religion: z.array(z.nativeEnum(Religion)).min(1).optional(),
    motherTongue: z.array(z.nativeEnum(Language)).optional(),
    familyValues: z.array(z.nativeEnum(FamilyValues)).optional(),

    familyBackground: z.object({
        maxSiblings: z.number().optional(),
        preferredFamilyType: z.array(z.string()).optional(),
        preferredFamilyStatus: z.array(z.string()).optional()
    }).optional(),
})
    .refine(
        (data) => {
            if (data.district ) return !!districtNames.includes(data.district);
            return true;
        },
        {
            message : '',
            path :[ 'district']
        }
    );


export type PartnerPreferenceInput = z.infer<typeof partnerPreferenceSchema>;