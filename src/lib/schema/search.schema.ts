/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import { EducationLevel, Height, Language, MaritalStatus, Occupation, Religion } from '../types/user.types';
import { CountryNamesEnum } from '../types/country_names.enum';
import countryNames from '../data/countryNames';
import { CurrencyCode } from '../types/currencyCodes.enum';
import { countriesValidator, countValidation, division_ids_valdator, educationLevelsValidator, incomeCurrencyValidator, languagesValdator, limitValidation, maritalStatusesValdator, occupationsValidator, pageValidation, religionValidator } from './schemaComponents';
import { Districts } from '../data/districts';
import { DistrictName } from '../types/district.types';


export const paginationSchema = z.object({
    page: pageValidation,
    limit: limitValidation,
    count: countValidation
});





export const todaysMatchSchema = z.object({ limit: limitValidation })


// Add this new schema for just-joined endpoint
export const justJoinedSchema = paginationSchema.extend({
    timeRange: z.optional(z.enum(['7', '15', '30'])).default('7'),
})





/* Add these new schemas to your existing search.schema.ts */
export const getUserByMIDSchema = z.object({
    mid: z.string()
        .min(1, "MID is required")
        .max(50, "MID is too long")
});





// Type for TypeScript type checking
export type FilterUsersQueryParams = z.infer<typeof filterUsersSchema>;


// Add these new schemas for preferred searches

export const preferredEducationSearchSchema =  paginationSchema.extend({
    educationLevels: z.optional(educationLevelsValidator)
});


export const preferredLocationSearchSchema = paginationSchema.extend({
    district_names: z.array(z.nativeEnum(DistrictName)).optional(),
    latitude:z.optional( z.string()
        .transform(Number)
        .refine((val) => !isNaN(val), { // Add validation after transform
            message: "Latitude must be a valid number",
        })
        .refine((val) => val >= -90 && val <= 90, {
            message: "Latitude must be between -90 and 90",
        })),
    longitude:z.optional( z.string()
        .transform(Number)
        .refine((val) => !isNaN(val), { // Add validation after transform
            message: "Longitude must be a valid number",
        })
        .refine((val) => val >= -180 && val <= 180, {
            message: "Longitude must be between -180 and 180",
        })),
})
.refine(({ district_names , latitude ,  longitude}) => {
    if (district_names === undefined) {
        if (latitude === undefined || longitude ===undefined  ) return false ;
        else return true;
    }
    else return true
},
{ 
    path :[ 'latitude' , 'longitude'],
    message  : " latitude and longitude is required when district_names is undefined "
}
);




// Add this new schema for preferred occupation search

export const preferredOccupationSearchSchema =  paginationSchema.extend({
    occupations: occupationsValidator
});

export const filterUsersSchema =  paginationSchema.extend({
    languages: languagesValdator,
    division_ids: division_ids_valdator,
    isEducated: z.enum(['yes', 'no']).optional().default('yes').transform(val => val === 'yes'),
    maritalStatuses: maritalStatusesValdator,
    occupations: occupationsValidator,

    minWeight: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(30, "Minimum weight must be at least 30")
                .max(200, "Maximum weight cannot exceed 200")
        )
        .optional(),
    maxWeight: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(30, "Minimum weight must be at least 30")
                .max(200, "Maximum weight cannot exceed 200")
        )
        .optional(),
    minHeight: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(4, "Minimum Height must be at least 4")
                .max(8, "Maximum Height cannot exceed 8")
        )
        .optional(),
    maxHeight: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(5, "Minimum Height must be at least 5 foots")
                .max(9, "Maximum Height cannot exceed 9 foots")
        )
        .optional(),

    minAge: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(18, "Minimum age must be at least 18")
                .max(70, "Maximum age cannot exceed 70")
        )
        .optional(),
    maxAge: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(18, "Minimum age must be at least 18")
                .max(70, "Maximum age cannot exceed 70")
        )
        .optional(),


    minAnnualIncome: z.string()
        .regex(/^\d+$/, "Must be a positive number")
        .transform(Number)
        .pipe(
            z.number()
                .min(0, "Minimum annual income cannot be negative")
                .max(1000000000, "Maximum annual income cannot exceed 1 billion")
        )
        .optional(),

    maxAnnualIncome: z.string().regex(/^\d+$/, "Must be a positive number").transform(Number)
        .pipe(
            z.number()
                .min(0, "Minimum annual income cannot be negative")
                .max(1000000000, "Maximum annual income cannot exceed 1 billion")
        )
        .optional(),
  
})
    .refine(
        (data) => {
            if (data.minWeight && data.maxWeight) {
                return data.minWeight <= data.maxWeight;
            }
            return true;
        },
        {
            message: "Minimum weight must be less than or equal to maximum weight",
            path: ["minWeight", "maxWeight"]
        }
    )
    .refine(
        (data) => {
            if (data.minAge && data.maxAge) {
                return data.minAge <= data.maxAge;
            }
            return true;
        },
        {
            message: "Minimum age must be less than or equal to maximum age",
            path: ["minAge", "maxAge"]
        }
    )
    .refine(
        (data) => {
            if (data.minHeight && data.maxHeight) {
                return data.minHeight < data.maxHeight;
            }
            return true;
        },
        {
            message: "Minimum Height must be less than maxHeight",
            path: ["maxHeight", "minHeight"]
        }
    )
    .refine(
        (data) => {
            if (data.minAnnualIncome && data.maxAnnualIncome) {
                return data.minAnnualIncome <= data.maxAnnualIncome;
            }
            return true;
        },
        {
            message: "Minimum annual income must be less than or equal to maximum annual income",
            path: ["minAnnualIncome", "maxAnnualIncome"]
        }
    );
   
    




export const searchHistorySchema = z.object({
    title: z.string().max(80).min(3).trim().transform(el => el.replace('  ', ' ')),
    searchQuery : filterUsersSchema
})


export const exploreByCountrySchema = paginationSchema.extend({
    countries: z.array(z.nativeEnum(CountryNamesEnum))
        .min(1, "At least one country must be selected")
        .max(5, "Maximum 5 countries can be selected at once"),
});

export const exploreByDivisionSchema = paginationSchema.extend({
    division_ids: z.array(z.string())
        .min(1, "At least one division must be selected")
        .max(8, "Maximum 8 divisions can be selected at once")
});