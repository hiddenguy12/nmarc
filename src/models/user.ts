/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema } from 'mongoose';
import { IUser, ProfileCreatedBy, Gender, Height, Religion, Language, EducationLevel, SettingsType, MaritalStatus, Occupation, IUserMembership, Education } from '../lib/types/user.types';
import { countryCodes } from '../lib/data/countryCodes';
import countryNames from '../lib/data/countryNames';
import generateMatrimonyId from '../lib/core/mid-geneator';
import { CurrencyCode } from '../lib/types/currencyCodes.enum';
import {
    PhysicalStatus,
    ReligiousBranch,
    BadHabits,
    Sports,
    Hobbies,
    MusicTypes,
    FoodTypes,
    SettingsPermissionType
} from '../lib/types/userProfile.types';
import {

    EmploymentSector,
    PreferredLocation,
    FamilyValues,
    ComplexionPreference
} from '../lib/types/partnerPreference';
import { partnerPreferenceSchema } from '../lib/db_schema/partnerPreference.schema';
import { CountryNamesEnum } from '../lib/types/country_names.enum';
import { findNearestDistricts } from '../controllers/search.controller';
import { isBefore } from 'date-fns';
import { randomIntFromArray } from '../lib/core/randomInt';




const aboutMeSchema = new Schema({
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    physicalStatus: {
        type: String,
        enum: Object.values(PhysicalStatus),
        default: PhysicalStatus.NORMAL
    },
    religiousBranch: {
        type: String,
        enum: Object.values(ReligiousBranch)
    },
    badHabits: [{
        type: String,
        enum: Object.values(BadHabits),
        default: [BadHabits.NONE]
    }],
    interestedSports: [{
        type: String,
        enum: Object.values(Sports)
    }],
    interestedHobbies: [{
        type: String,
        enum: Object.values(Hobbies)
    }],
    interestedFoodTypes: [{
        type: String,
        enum: Object.values(FoodTypes)
    }],
    interestedMusicTypes: [{
        type: String,
        enum: Object.values(MusicTypes)
    }]
});

const familyInfoSchema = new Schema({
    aboutFamily: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    familyOrigin: {
        type: String,
        trim: true
    },
    numberOfBrothers: {
        type: Number,
        min: 0,
        default: 0
    },
    numberOfSisters: {
        type: Number,
        min: 0,
        default: 0
    },
    numberOfMarriedBrothers: {
        type: Number,
        min: 0,
        default: 0,
       
    },
    numberOfMarriedSisters: {
        type: Number,
        min: 0,
        default: 0,
       
    }
});

const blockedProfileSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    blockedAt: Date,

    reason: String
});

const enhancedSettingsSchema = {
    blocked: [blockedProfileSchema],
    privacy: {
        whoCanViewProfile: {
            type: String,
            enum: Object.values(SettingsPermissionType),
            default: SettingsPermissionType.EVERYONE
        },
        whoCanContactMe: {
            type: String,
            enum: Object.values(SettingsPermissionType),
            default: SettingsPermissionType.EVERYONE
        },
        showShortlistedNotification: {
            type: Boolean,
            default: true
        },
        showProfileViewNotification: {
            type: Boolean,
            default: true
        }
    },
    notifications: {
        dailyRecommendations: {
            type: Boolean,
            default: true
        },
        todaysMatch: {
            type: Boolean,
            default: true
        },
        profileViews: {
            type: Boolean,
            default: true
        },
        shortlists: {
            type: Boolean,
            default: true
        },
        messages: {
            type: Boolean,
            default: true
        },
        connectionRequests: {
            type: Boolean,
            default: true
        }
    }
};


const userMembershipSchema = new Schema<IUserMembership>({
    currentMembership: {
        requestId: {
            type: Schema.Types.ObjectId,
            ref: 'MembershipRequest',
            required: false
        },
        membership_exipation_date: Date
    }
});

const suspensionEntrySchema = new Schema({
    reason: {
        type: String,
        required: false,
        trim: true
    },
    date: {
        type: Date,
        required: false,
    }
});

const settingsSchema = new Schema({
    notifications: {
        dailyRecommendations: {
            type: String,
            required: true,
            enum: Object.values(SettingsType),
            default: Object.values(SettingsType)[0]
        },
        todaysMatch: {
            type: String,
            required: true,
            enum: Object.values(SettingsType),
            default: Object.values(SettingsType)[0]
        },
        viewedMyProfile: {
            type: String,
            required: true,
            enum: Object.values(SettingsType),
            default: Object.values(SettingsType)[0]
        },
    },
    privacy: {
        sendNotificationOnProfileView: {
            type: String,
            required: true,
            enum: Object.values(SettingsType),
            default: Object.values(SettingsType)[0]
        }
    }
})

const onlineStatusSchema = new Schema({
    isOnline: {
        type: Boolean,
        default: false,
        required: true
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    lastActive: {
        type: Date,
        default: Date.now,
    }
});


const addressSchema = new Schema({
    division: {
        id: {
            type: String,
            required: true           
        },
        name: {
            type: String,
            required: true  
        },
        bd_name: {
            type: String,
            required: true
        }
    },
    district: {
        id: {
            type: String,
            required: true
        },
        division_id: {
            type: String,
            required: true,

        },
        name: {
            type: String,
            required: true
        },
        bn_name: {
            type: String,
            required: true
        },
        lat: Number,
        long: Number
    },
    upazila: {
        id: {
            type: String,
            required:true
        },
        district_id: {
            type: String,
            required: true

        },
        name: {
            type: String,
            required: true
        },
        bn_name: {
            type: String,

        }
    },
    union: {
        id: {
            type: String,
            required: true
        },
        upazilla_id: {
            type: String,
            required: true

        },
        name: {
            type: String,
            required: true
        },
        bn_name: {
            type: String,
            required: true
        }
    }


 } , { _id : false}) ;

const phoneInfoSchema = new Schema({
    number: {
        type: String,
        required: true
    },
    country: {
        name: {
            type: String,
            enum: countryCodes.map(element => element.country),
            required: true
        },
        phone_code: {
            type: String,
            required: true,
            enum: countryCodes.map(element => element.code),
            maxlength: 5
        }
    }
});

const userSchema = new Schema<IUser>({
    /**
     * Core User Identification
     * ----------------------
     * Essential fields that uniquely identify and authenticate a user
     */
    mid: {
        type: String,
        required: true,
        unique: true,
        immutable: true, // Matrimony ID - Cannot be changed once set
        index: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        hashed: { type: String, required: true },
        salt: { type: String, required: true },
    },

    /**
     * Profile Creation & Management
     * ---------------------------
     * Information about how and when the profile was created
     */
    profileCreatedBy: {
        type: String,
        enum: Object.values(ProfileCreatedBy),
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },

    /**
     * Basic Personal Information
     * ------------------------
     * Fundamental details about the user
     */
    name: {
        type: String,
        required: true,
        trim: true,
    },
    gender: {
        type: String,
        enum: Object.values(Gender),
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 18,
        max: 70
    },

    /**
     * Physical Attributes
     * -----------------
     * Physical characteristics of the user
     */
    height: {
        type: String,
        enum: Object.values(Height),
        required: true,
    },
    weight: {
        type: Number,
        required: true,
        min: 30,
        max: 200 // in kilograms
    },

    /**
     * Media & Images
     * -------------
     * User's profile pictures and other images
     */
    profileImage: {
        url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
        id: { type: String ,  }
    },
    coverImage: {
        url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
        id: String
    },
    userImages: [{
        url: { type: String, default: 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png', required: true },
        id: { type: String, required: false }
    }],

    /**
     * Educational Background
     * --------------------
     * User's educational qualifications and preferences
     */
    isEducated: {
        type: Boolean,
        default: true,
        required: true
    },
    education: [{
        level: {
            type: String,
            required: function () { return this.isEducated; },
            enum: Object.values(EducationLevel)
        },
        certificate: {
            type: String,
            required: function () { return this.isEducated; }
        },
        institution: {
            type: String,
            required: function () { return this.isEducated; }
        },
        yearOfCompletion: {
            type: Number,
            required: function () { return this.isEducated; }
        },
        grade: {
            type: String,
            required: false
        },
        additionalInfo: {
            type: String,
            required: false
        }
    }],

    /**
     * Contact & Location Information
     * ----------------------------
     * User's contact details and address
     */
    address: {
        type: addressSchema,
        required: true
    },
    phoneInfo: phoneInfoSchema,

    /**
     * Cultural & Personal Attributes
     * ---------------------------
     * Cultural and personal characteristics
     */
    languages: [{
        type: String,
        enum: Object.values(Language),
        required: true
    }],
    religion: {
        type: String,
        enum: Object.values(Religion),
        required: true
    },
    maritalStatus: {
        type: String,
        enum: Object.values(MaritalStatus),
        required: false
    },

    /**
     * Professional Information
     * ----------------------
     * Career and financial details
     */
    occupation: {
        type: String,
        enum: Object.values(Occupation),
        required: false
    },
    annualIncome: {
        amount: {
            type: Number,
            required: false,
            default : 150000 ,
            min: 0,
            max: 1000000000, // 1 billion BDT
            validate: {
                validator: Number.isInteger,
                message: 'Annual income must be a whole number'
            }
        },
        currency: {
            type: String,
            required(this: any) { return !!this.annualIncome?.currency },
            uppercase: true,
            enum: Object.values(CurrencyCode),
            minlength: 3,
            maxlength: 3,
            default: 'BDT'
        }
    },

    // Messaging Rooms 
    messagingRooms : {
        connectedRooms : [{
            type : mongoose.SchemaTypes.ObjectId ,
            ref : 'MessagingRoom'
        }],
        blockedRooms : [{
            type : mongoose.SchemaTypes.ObjectId ,
            ref : 'MessagingRoom'
        }]
    },
    
    socket_ids : {
        notification_socket : String, 
        messaging_socket: String ,
        video_calling_socket : String,
    } ,
    /**
     * Partner Preferences
     * -----------------
     * User's preferences for potential matches
     */
    partnerPreference: {
        type: partnerPreferenceSchema,
        required: true,
        default: function () {
            return ({});
        }
    },

    /**
     * Platform Features & Settings
     * -------------------------
     * User's platform-specific settings and statuses
     */
    onlineStatus: onlineStatusSchema,
    aboutMe: aboutMeSchema,
    familyInfo: familyInfoSchema,
    enhancedSettings: {
        type : enhancedSettingsSchema,
        required : true ,
    },
    membership: userMembershipSchema,
   

    /**
     * Connections & Network
     * -------------------
     * User's connections and relationship with other users
     */
    connections: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingIncomingRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'ConnectionRequest'
    }],
    pendingOutgoingRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'ConnectionRequest'
    }],


    suspension: {
        isSuspended: {
            type: Boolean,
            default: false,
        },
        suspensions: [suspensionEntrySchema]
    }
});



userSchema.methods.hasActiveMembership = function () {
    if (!this.currentMembership.requestId || !this.currentMembership.membership_exipation_date) return false;
    else if (Date.now() > this.currentMembership.membership_exipation_date.getTime()) return true;
    else return false;
};

userSchema.methods.getActiveMembershipID = function () {
    if (!this.hasActiveMembership()) throw new Error("This member does not have a any active membership");
    return this.currentMembership.requestId;
}

userSchema.methods.addFCMToken = async function (token: string) {
    if (this.fcmToken === token) return;
    this.fcmToken = token;
    await this.save()
}


userSchema.methods.removeFCMToken = async function () {
    this.fcmToken = undefined;
    await this.save()
};


userSchema.methods.hasProfileHighlighter = function () {
    return this.hasActiveMembership() && this.membership.hasProfileHighlighter;
};

userSchema.methods.createPreference = function () {
    // IIFE for generating height range using existing utility
    const heightPreferences = (() => {
        const userHeightInFeet = parseInt(this.height.split(' ')[0]);
      

        // Cultural considerations for Bengali marriages
        if (this.gender === Gender.MALE) {
            // Men typically prefer women slightly shorter
            
            return {
                min :randomIntFromArray([4, 5]),
                max :randomIntFromArray([6, 7])
            }
    
        } else {
            // Women typically prefer men slightly taller
            return {
                min :randomIntFromArray([4, 5, 6]),
                max :randomIntFromArray([ 7,8])
            }
        }
    })();

    // IIFE for age preferences with Bengali cultural norms
    const agePreferences = (() => {
        // Constants based on Bengali marriage customs and legal requirements
        const LEGAL_MIN_AGE_WOMEN = 18;
        const LEGAL_MIN_AGE_MEN = 21;
        const CULTURAL_MAX_AGE_MEN = 45;
        const CULTURAL_MAX_AGE_WOMEN = 35;
        const MAX_AGE_DIFFERENCE = 12;

        if (this.gender === Gender.MALE) {
            // For male users
            const minAge = 18;
            const maxAge =this.age < 40 ? this.age : 40;
            return { min: minAge, max: maxAge };
        } else {
            // For female users
            const minAge = this.age ;
            const maxAge = this.age < 40 ? this.age * 1.5 : this.age;
            return { min: minAge, max: maxAge };
        }
    })();

    // IIFE for location preferences with district-based matching
    const locationPreferences = (() => {
        const isBangladeshi = this.address.country === CountryNamesEnum.BANGLADESH;

        if (isBangladeshi && this.address.district?.lat && this.address.district?.long) {
            const nearestDistricts = findNearestDistricts(
                this.address.district.lat,
                this.address.district.long,
                7
            );

            return {
                preferredCountries: [CountryNamesEnum.BANGLADESH],
                preferredRegions: [this.address.division?.id],
                preferredCities: nearestDistricts.map(d => d.id),
                locationType: PreferredLocation.SAME_STATE,
                willingToRelocate: this.gender === Gender.FEMALE
            };
        }

        return {
            preferredCountries: [this.address.country as CountryNamesEnum],
            locationType: PreferredLocation.SAME_COUNTRY,
            willingToRelocate: this.gender === Gender.FEMALE
        };
    })();

    // IIFE for education and profession preferences with proper typing and cultural norms
    const educationAndProfessionPreferences = (() => {
        // Get user's highest education level with proper type checking
        const getUserHighestEducation = (): Education | null => {
            if (!this.isEducated || !this.education.length) return null;

            return this.education.reduce((highest: Education, current: Education) => {
                const educationLevels = Object.values(EducationLevel);
                const currentIndex = educationLevels.indexOf(current.level);
                const highestIndex = educationLevels.indexOf(highest.level);
                return currentIndex > highestIndex ? current : highest;
            });
        };

        // Get culturally appropriate occupations based on gender and education
        const getCulturallyAppropriateOccupations = (): Occupation[] => {
            const allOccupations = Object.values(Occupation);
            const userHighestEdu = getUserHighestEducation();

            // Base occupations that are always acceptable
            const baseAcceptableOccupations = [
                Occupation.GOVERNMENT_EMPLOYEE,
                Occupation.TEACHER,
                Occupation.DOCTOR,
                Occupation.ENGINEER,
                Occupation.BUSINESS_OWNER,
                Occupation.BANKER
            ];

            // Occupations to exclude based on cultural norms
            const culturallyExcludedOccupations = [
                Occupation.UNEMPLOYED,
                Occupation.DAILY_LABORER,
                ...(this.gender === Gender.FEMALE ? [
                    Occupation.CONSTRUCTION_WORKER,
                    Occupation.SECURITY_GUARD
                ] : [])
            ];

            if (this.gender === Gender.FEMALE) {
                // For female users seeking male partners
                return allOccupations.filter(occ =>
                    !culturallyExcludedOccupations.includes(occ) &&
                    (baseAcceptableOccupations.includes(occ) ||
                        occ.includes('MANAGER') ||
                        occ.includes('OFFICER') ||
                        occ.includes('PROFESSIONAL'))
                );
            } else {
                // For male users seeking female partners
                // More flexible with occupations but prioritize certain professions
                return allOccupations.filter(occ =>
                    !culturallyExcludedOccupations.includes(occ)
                );
            }
        };

        // Get education preferences based on cultural norms
        const getEducationPreferences = () => {
            const userHighestEdu = getUserHighestEducation();
            const educationLevels = Object.values(EducationLevel);
            const userLevelIndex = userHighestEdu
                ? educationLevels.indexOf(userHighestEdu.level)
                : educationLevels.indexOf(EducationLevel.HSC);

            if (this.gender === Gender.FEMALE) {
                // For female users: prefer equal or higher education
                return {
                    minimumLevel: userHighestEdu?.level || EducationLevel.BACHELORS_DEGREE,
                    mustBeEducated: true,
                    preferredLevels: educationLevels.slice(userLevelIndex)
                };
            } else {
                // For male users: prefer equal or lower education with some flexibility
                return {
                    minimumLevel: EducationLevel.HSC,
                    mustBeEducated: this.isEducated,
                    preferredLevels: educationLevels.slice(
                        0,
                        Math.min(userLevelIndex + 2, educationLevels.length)
                    )
                };
            }
        };

        // Calculate minimum annual income based on user's income
        const getMinimumIncomePreference = () => {
            if (!this.annualIncome?.amount) return undefined;

            return {
                min: 100000,
                max:
                    this.annualIncome.amount ?
                        (this.gender === Gender.MALE ? this.annualIncome.amount : this.annualIncome.amount * 1.5)
                        : 300000,
                currency: this.annualIncome.currency
            };
        };

        return {
            education: getEducationPreferences(),
            profession: {
                acceptedOccupations: getCulturallyAppropriateOccupations(),
                preferredSectors: [
                    EmploymentSector.GOVERNMENT,
                    EmploymentSector.PRIVATE,
                    EmploymentSector.BUSINESS,
                    ...(this.gender === Gender.FEMALE ? [EmploymentSector.DEFENSE] : [])
                ],
                minimumAnnualIncome: getMinimumIncomePreference()
            }
        };
    })();

    // Calculate BMI-based weight preferences
    const weightPreferences = (() => {
        return {
            min: this.gender === Gender.MALE ? 45 : 55,
            max: this.gender === Gender.MALE ?90 :110
        };
    })();

    this.partnerPreference= {
        ageRange: agePreferences,
        heightRange: heightPreferences,
        weightRange: weightPreferences,
        maritalStatus: [
            MaritalStatus.NEVER_MARRIED,
            ...(this.maritalStatus !== MaritalStatus.NEVER_MARRIED ?
                [this.maritalStatus] : [])
        ],
        complexion: Object.values(ComplexionPreference).filter(c => c !== ComplexionPreference.ANY),
        physicalStatus: [PhysicalStatus.NORMAL],
        religiousBranch: this.aboutMe?.religiousBranch ? [this.aboutMe.religiousBranch] : undefined,
        dealBreakers: [BadHabits.SMOKING, BadHabits.DRINKING],
        locationPreference: locationPreferences,
        ...educationAndProfessionPreferences,
        religion: [this.religion],
        motherTongue: this.languages.slice(0, 1),
        familyValues: [FamilyValues.TRADITIONAL, FamilyValues.MODERATE],
        familyBackground: this.familyInfo ? {
            maxSiblings: Math.max(
                (this.familyInfo.numberOfBrothers || 0) + 2,
                (this.familyInfo.numberOfSisters || 0) + 2
            ),
            preferredFamilyType: ['joint', 'nuclear'],
            preferredFamilyStatus: ['middle_class', 'upper_middle_class']
        } : undefined,
        strictPreferences: this.gender === Gender.FEMALE,
        priority: {
            education: this.isEducated ? 5 : 3,
            profession: this.occupation ? 4 : 3,
            location: 3,
            religion: 5,
            age: 4
        },
        lastUpdated: new Date(),
        district : this.address.district.name    
    };
    return this;
};


userSchema.methods.createMID = function () {
    return generateMatrimonyId();
};

userSchema.methods.suspend = function (reason: string) {
    this.suspension.isSuspended = true;
    this.suspension.suspensions.push({
        reason,
        date: new Date()
    });
    return this;
};

userSchema.methods.unsuspend = function () {
    this.suspension.isSuspended = false;
    return this;
};

userSchema.methods.getSuspensionHistory = function () {
    return this.suspension.suspensions;
};

userSchema.methods.hasActiveMembership = function() {
    return !!this.membership?.currentMembership?.requestId && !!this.membership?.currentMembership?.membership_exipation_date && isBefore(new Date() , this.membership.currentMembership.membership_exipation_date);
}

userSchema.index({ gender: 1 });
userSchema.index({ age: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'education.level': 1 });
userSchema.index({ dateOfBirth: 1 });
userSchema.index({  'address.district.id': 1 });
userSchema.index({"suspension.isSuspended": 1 });
userSchema.index({ 'onlineStatus.lastActive': -1 });
userSchema.index({ maritalStatus: 1 });
userSchema.index({ occupation: 1 });
userSchema.index({ 'annualIncome.amount': 1, 'annualIncome.currency': 1 });
userSchema.index({ 'membership.currentMembership.isActive': 1 });
userSchema.index({ 'membership.currentMembership.endDate': 1 });
userSchema.index({ 'membership.currentMembership.tier': 1 });
userSchema.index({ 'partnerPreference.ageRange': 1 });
userSchema.index({ 'partnerPreference.heightRange': 1 });
userSchema.index({ 'partnerPreference.religion': 1 });
userSchema.index({ 'partnerPreference.locationPreference.preferredCountries': 1 });
userSchema.index({ 'partnerPreference.education.minimumLevel': 1 });
userSchema.index({ 'partnerPreference.profession.acceptedOccupations': 1 });


export const User = mongoose.model<IUser>('User', userSchema);

