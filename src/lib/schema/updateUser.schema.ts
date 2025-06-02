/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import { 
    ProfileCreatedBy, 
    Gender, 
    Height, 
    Religion, 
    Language,
    MaritalStatus,
    Occupation 
} from '../types/user.types';
import { 
    PhysicalStatus, 
    ReligiousBranch, 
    BadHabits, 
    Sports, 
    Hobbies, 
    MusicTypes, 
    FoodTypes,
    SettingsPermissionType 
} from '../types/userProfile.types';
import { EducationLevel } from '../types/userEducation.types';
import { countryCodes } from '../data/countryCodes';
import countryNames from '../data/countryNames';
import { educationSchema } from './auth.schema';
import { Divisions } from '../data/divisions';
import { Districts } from '../data/districts';
import { Upazilas } from '../data/upazilas';
import { Unions } from '../data/unions';
import { CountryNamesEnum as CountryNamesEnumForAdressField} from "../types/country_names.enum";

import { countryNames as CountryNamesForCountryField} from '../data/countryNames'




const weightPreferenceSchema = z.object({
    minWeight: z.number().min(30).max(200).optional(),
    maxWeight: z.number().min(30).max(200).optional()
})
    .optional()
    .refine(
        (data) => {
        if (data?.minWeight && data?.maxWeight) {
            return data.minWeight <= data.maxWeight;
        }
        return true;
    }, 
    {
        message: "Minimum weight must be less than or equal to maximum weight"
    }
);

const heightPreferenceSchema = z.object({
    minHeight: z.number().min(3).max(9).optional(),
    maxHeight: z.number().min(3).max(9).optional()
})
    .optional()
    .refine(
        (data) => {
            if (data?.minHeight && data?.maxHeight) {
                return data.minHeight <= data.maxHeight;
            }
            return true;
        },
        {
            message: "Minimum height must be less than or equal to maximum height"
        }
    );

const agePreferenceSchema = z.object({
    minAge: z.number().min(18).max(70).optional(),
    maxAge: z.number().min(18).max(70).optional()
})
.optional()
    .refine(data => {
        if (data?.minAge && data?.maxAge) {
            return data.minAge <= data.maxAge;
        }
        return true;
    },
        {
            message: "Minimum age must be less than or equal to maximum age"
        }
    );

const educationPreferenceSchema = z.object({
    level: z.nativeEnum(EducationLevel)
});


        

const AddressSchema = z.object({
    division: z.optional(
        z.object({
            id: z.number({
                required_error: "Division ID is required",
                invalid_type_error: "Division ID must be a number"
            })
            .gte(1, "Division ID must be between 1 and 8")
            .lte(8, "Division ID must be between 1 and 8")
            .transform(data => data.toString()),
            name: z.string().optional(),
            bd_name: z.string().optional(),
        })
    ),

    district: z.optional(
        z.object({
            id: z.number({
                required_error: "District ID is required",
                invalid_type_error: "District ID must be a number"
            })
            .gte(1, "District ID must be between 1 and 64")
            .lte(64, "District ID must be between 1 and 64")
            .transform(data => data.toString()),
            division_id: z.string().optional(),
            name: z.string().optional(),
            bn_name: z.string().optional(),
        })),

    upazila: z.optional(
        z.object({
            id: z.number({
                required_error: "Upazila ID is required",
                invalid_type_error: "Upazila ID must be a number"
            })
            .gte(1, "Upazila ID must be between 1 and 494")
            .lte(494, "Upazila ID must be between 1 and 494")
            .transform(data => data.toString()),
            district_id: z.string().optional(),
            name: z.string().optional(),
            bn_name: z.string().optional(),
        })
    ),

    union: z.optional(
        z.object({
            id: z.number({
                required_error: "Union ID is required",
                invalid_type_error: "Union ID must be a number"
            })
            .gte(1, "Union ID must be between 1 and 4540")
            .lte(4540, "Union ID must be between 1 and 4540")
            .transform((data) => data.toString()),
            upazilla_id: z.string().optional(),
            name: z.string().optional(),
            bn_name: z.string().optional(),
        })
    )
})
    .refine(
        (data) => !!data.division?.id && !!data.district?.id && !!data.upazila?.id && !!data.union?.id,
        {
            message: "address.division.id, address.district.id, address.upazila.id, address.union.id are required "
        }
    )

    .transform(
        function (data) {
            data.division = Divisions.find(element => element.id == data.division?.id);
            data.district = Districts.find(element => element.id == data.district?.id);
            data.upazila = Upazilas.find(element => element.id == data.upazila?.id);
            data.union = Unions.find(element => element.id == data.union?.id);
            return data;
        },
       
    );


const phoneCountryNames =countryCodes.map(c => c.country) ;
const phoneCountryPhoneCode =countryCodes.map(c => c.code);
const phoneInfoSchema = z.object({
    number: z.string(),
   
}).optional();

const annualIncomeSchema = z.object({
    amount: z.number().min(0).max(1000000000).int(),
    currency: z.enum(['BDT']).default('BDT')
}).optional();

const aboutMeSchema = z.object({
    description: z.string().max(1000).optional(),
    physicalStatus: z.nativeEnum(PhysicalStatus).optional(),
    religiousBranch: z.nativeEnum(ReligiousBranch).optional(),
    badHabits: z.array(z.nativeEnum(BadHabits)).optional(),
    interestedSports: z.array(z.nativeEnum(Sports)).optional(),
    interestedHobbies: z.array(z.nativeEnum(Hobbies)).optional(),
    interestedFoodTypes: z.array(z.nativeEnum(FoodTypes)).optional(),
    interestedMusicTypes: z.array(z.nativeEnum(MusicTypes)).optional()
}).optional();

const familyInfoSchema = z.object({
    aboutFamily: z.string().max(1000).optional(),
    familyOrigin: z.string().optional(),
    numberOfBrothers: z.number().min(0).max(5).optional(),
    numberOfSisters: z.number().min(0).optional(),
    numberOfMarriedBrothers: z.number().min(0).optional(),
    numberOfMarriedSisters: z.number().min(0).optional()
}).optional();

const enhancedSettingsSchema = z.object({
    privacy: z.object({
        whoCanViewProfile: z.nativeEnum(SettingsPermissionType).optional(),
        whoCanContactMe: z.nativeEnum(SettingsPermissionType).optional(),
        showShortlistedNotification: z.boolean().optional(),
        showProfileViewNotification: z.boolean().optional()
    }).optional(),
    notifications: z.object({
        dailyRecommendations: z.boolean().optional(),
        todaysMatch: z.boolean().optional(),
        profileViews: z.boolean().optional(),
        shortlists: z.boolean().optional(),
        messages: z.boolean().optional(),
        connectionRequests: z.boolean().optional()
    }).optional()
}).optional();

export const updateUserSchema = z.object({
    // Basic Information
    name: z.string().min(1).optional(),
    gender: z.nativeEnum(Gender).optional(),
    dateOfBirth: z.string().datetime().optional(),
    profileCreatedBy: z.nativeEnum(ProfileCreatedBy).optional(),

    // Physical Attributes
    height: z.nativeEnum(Height).optional(),
    weight: z.number().min(30).max(200).optional(),

    // Education & Career

    occupation: z.nativeEnum(Occupation).optional(),
    annualIncome: annualIncomeSchema,


    isEducated: z.boolean().optional(),
    education: z.array(educationSchema).optional(),
    // Location & Contact
    address: z.optional(AddressSchema),
    phoneInfo: phoneInfoSchema,

    // Personal Background
    languages: z.array(z.nativeEnum(Language)).optional(),
    religion: z.nativeEnum(Religion).optional(),
    maritalStatus: z.nativeEnum(MaritalStatus).optional(),

    coverImage: z.object({ url: z.string().url(), id: z.string().uuid() }).optional(),
    profileImage: z.object({ url: z.string().url(), id: z.string().uuid() }).optional(),
})
    .refine(
        function ({ isEducated, education }) {

            if (isEducated && education) {
                if (education.length === 0) {
                    return false;
                }
            }
            return true;
        },
        {
            message: 'If User is educated Than education details is required',
            path: ['isEducated', 'education[0].level', 'education[0].certificate', 'education[0].yearOfCompletion']
        }
    )
    .transform(
        function (data) {
            if (data.isEducated === false) data.education = [];
            
            return data;
        }
        
    );




export type UpdateUserInput = z.infer<typeof updateUserSchema>;