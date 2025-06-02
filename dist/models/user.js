"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const user_types_1 = require("../lib/types/user.types");
const countryCodes_1 = require("../lib/data/countryCodes");
const mid_geneator_1 = __importDefault(require("../lib/core/mid-geneator"));
const currencyCodes_enum_1 = require("../lib/types/currencyCodes.enum");
const userProfile_types_1 = require("../lib/types/userProfile.types");
const partnerPreference_1 = require("../lib/types/partnerPreference");
const partnerPreference_schema_1 = require("../lib/db_schema/partnerPreference.schema");
const country_names_enum_1 = require("../lib/types/country_names.enum");
const search_controller_1 = require("../controllers/search.controller");
const date_fns_1 = require("date-fns");
const randomInt_1 = require("../lib/core/randomInt");
const aboutMeSchema = new mongoose_1.Schema({
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    physicalStatus: {
        type: String,
        enum: Object.values(userProfile_types_1.PhysicalStatus),
        default: userProfile_types_1.PhysicalStatus.NORMAL
    },
    religiousBranch: {
        type: String,
        enum: Object.values(userProfile_types_1.ReligiousBranch)
    },
    badHabits: [{
            type: String,
            enum: Object.values(userProfile_types_1.BadHabits),
            default: [userProfile_types_1.BadHabits.NONE]
        }],
    interestedSports: [{
            type: String,
            enum: Object.values(userProfile_types_1.Sports)
        }],
    interestedHobbies: [{
            type: String,
            enum: Object.values(userProfile_types_1.Hobbies)
        }],
    interestedFoodTypes: [{
            type: String,
            enum: Object.values(userProfile_types_1.FoodTypes)
        }],
    interestedMusicTypes: [{
            type: String,
            enum: Object.values(userProfile_types_1.MusicTypes)
        }]
});
const familyInfoSchema = new mongoose_1.Schema({
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
const blockedProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
            enum: Object.values(userProfile_types_1.SettingsPermissionType),
            default: userProfile_types_1.SettingsPermissionType.EVERYONE
        },
        whoCanContactMe: {
            type: String,
            enum: Object.values(userProfile_types_1.SettingsPermissionType),
            default: userProfile_types_1.SettingsPermissionType.EVERYONE
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
const userMembershipSchema = new mongoose_1.Schema({
    currentMembership: {
        requestId: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'MembershipRequest',
            required: false
        },
        membership_exipation_date: Date
    }
});
const suspensionEntrySchema = new mongoose_1.Schema({
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
const settingsSchema = new mongoose_1.Schema({
    notifications: {
        dailyRecommendations: {
            type: String,
            required: true,
            enum: Object.values(user_types_1.SettingsType),
            default: Object.values(user_types_1.SettingsType)[0]
        },
        todaysMatch: {
            type: String,
            required: true,
            enum: Object.values(user_types_1.SettingsType),
            default: Object.values(user_types_1.SettingsType)[0]
        },
        viewedMyProfile: {
            type: String,
            required: true,
            enum: Object.values(user_types_1.SettingsType),
            default: Object.values(user_types_1.SettingsType)[0]
        },
    },
    privacy: {
        sendNotificationOnProfileView: {
            type: String,
            required: true,
            enum: Object.values(user_types_1.SettingsType),
            default: Object.values(user_types_1.SettingsType)[0]
        }
    }
});
const onlineStatusSchema = new mongoose_1.Schema({
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
const addressSchema = new mongoose_1.Schema({
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
            required: true
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
}, { _id: false });
const phoneInfoSchema = new mongoose_1.Schema({
    number: {
        type: String,
        required: true
    },
    country: {
        name: {
            type: String,
            enum: countryCodes_1.countryCodes.map(element => element.country),
            required: true
        },
        phone_code: {
            type: String,
            required: true,
            enum: countryCodes_1.countryCodes.map(element => element.code),
            maxlength: 5
        }
    }
});
const userSchema = new mongoose_1.Schema({
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
        enum: Object.values(user_types_1.ProfileCreatedBy),
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
        enum: Object.values(user_types_1.Gender),
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
        enum: Object.values(user_types_1.Height),
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
        id: { type: String, }
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
                enum: Object.values(user_types_1.EducationLevel)
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
            enum: Object.values(user_types_1.Language),
            required: true
        }],
    religion: {
        type: String,
        enum: Object.values(user_types_1.Religion),
        required: true
    },
    maritalStatus: {
        type: String,
        enum: Object.values(user_types_1.MaritalStatus),
        required: false
    },
    /**
     * Professional Information
     * ----------------------
     * Career and financial details
     */
    occupation: {
        type: String,
        enum: Object.values(user_types_1.Occupation),
        required: false
    },
    annualIncome: {
        amount: {
            type: Number,
            required: false,
            default: 150000,
            min: 0,
            max: 1000000000, // 1 billion BDT
            validate: {
                validator: Number.isInteger,
                message: 'Annual income must be a whole number'
            }
        },
        currency: {
            type: String,
            required() { return !!this.annualIncome?.currency; },
            uppercase: true,
            enum: Object.values(currencyCodes_enum_1.CurrencyCode),
            minlength: 3,
            maxlength: 3,
            default: 'BDT'
        }
    },
    // Messaging Rooms 
    messagingRooms: {
        connectedRooms: [{
                type: mongoose_1.default.SchemaTypes.ObjectId,
                ref: 'MessagingRoom'
            }],
        blockedRooms: [{
                type: mongoose_1.default.SchemaTypes.ObjectId,
                ref: 'MessagingRoom'
            }]
    },
    socket_ids: {
        notification_socket: String,
        messaging_socket: String,
        video_calling_socket: String,
    },
    /**
     * Partner Preferences
     * -----------------
     * User's preferences for potential matches
     */
    partnerPreference: {
        type: partnerPreference_schema_1.partnerPreferenceSchema,
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
        type: enhancedSettingsSchema,
        required: true,
    },
    membership: userMembershipSchema,
    /**
     * Connections & Network
     * -------------------
     * User's connections and relationship with other users
     */
    connections: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    pendingIncomingRequests: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'ConnectionRequest'
        }],
    pendingOutgoingRequests: [{
            type: mongoose_1.Schema.Types.ObjectId,
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
    if (!this.currentMembership.requestId || !this.currentMembership.membership_exipation_date)
        return false;
    else if (Date.now() > this.currentMembership.membership_exipation_date.getTime())
        return true;
    else
        return false;
};
userSchema.methods.getActiveMembershipID = function () {
    if (!this.hasActiveMembership())
        throw new Error("This member does not have a any active membership");
    return this.currentMembership.requestId;
};
userSchema.methods.addFCMToken = async function (token) {
    if (this.fcmToken === token)
        return;
    this.fcmToken = token;
    await this.save();
};
userSchema.methods.removeFCMToken = async function () {
    this.fcmToken = undefined;
    await this.save();
};
userSchema.methods.hasProfileHighlighter = function () {
    return this.hasActiveMembership() && this.membership.hasProfileHighlighter;
};
userSchema.methods.createPreference = function () {
    // IIFE for generating height range using existing utility
    const heightPreferences = (() => {
        const userHeightInFeet = parseInt(this.height.split(' ')[0]);
        // Cultural considerations for Bengali marriages
        if (this.gender === user_types_1.Gender.MALE) {
            // Men typically prefer women slightly shorter
            return {
                min: (0, randomInt_1.randomIntFromArray)([4, 5]),
                max: (0, randomInt_1.randomIntFromArray)([6, 7])
            };
        }
        else {
            // Women typically prefer men slightly taller
            return {
                min: (0, randomInt_1.randomIntFromArray)([4, 5, 6]),
                max: (0, randomInt_1.randomIntFromArray)([7, 8])
            };
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
        if (this.gender === user_types_1.Gender.MALE) {
            // For male users
            const minAge = 18;
            const maxAge = this.age < 40 ? this.age : 40;
            return { min: minAge, max: maxAge };
        }
        else {
            // For female users
            const minAge = this.age;
            const maxAge = this.age < 40 ? this.age * 1.5 : this.age;
            return { min: minAge, max: maxAge };
        }
    })();
    // IIFE for location preferences with district-based matching
    const locationPreferences = (() => {
        const isBangladeshi = this.address.country === country_names_enum_1.CountryNamesEnum.BANGLADESH;
        if (isBangladeshi && this.address.district?.lat && this.address.district?.long) {
            const nearestDistricts = (0, search_controller_1.findNearestDistricts)(this.address.district.lat, this.address.district.long, 7);
            return {
                preferredCountries: [country_names_enum_1.CountryNamesEnum.BANGLADESH],
                preferredRegions: [this.address.division?.id],
                preferredCities: nearestDistricts.map(d => d.id),
                locationType: partnerPreference_1.PreferredLocation.SAME_STATE,
                willingToRelocate: this.gender === user_types_1.Gender.FEMALE
            };
        }
        return {
            preferredCountries: [this.address.country],
            locationType: partnerPreference_1.PreferredLocation.SAME_COUNTRY,
            willingToRelocate: this.gender === user_types_1.Gender.FEMALE
        };
    })();
    // IIFE for education and profession preferences with proper typing and cultural norms
    const educationAndProfessionPreferences = (() => {
        // Get user's highest education level with proper type checking
        const getUserHighestEducation = () => {
            if (!this.isEducated || !this.education.length)
                return null;
            return this.education.reduce((highest, current) => {
                const educationLevels = Object.values(user_types_1.EducationLevel);
                const currentIndex = educationLevels.indexOf(current.level);
                const highestIndex = educationLevels.indexOf(highest.level);
                return currentIndex > highestIndex ? current : highest;
            });
        };
        // Get culturally appropriate occupations based on gender and education
        const getCulturallyAppropriateOccupations = () => {
            const allOccupations = Object.values(user_types_1.Occupation);
            const userHighestEdu = getUserHighestEducation();
            // Base occupations that are always acceptable
            const baseAcceptableOccupations = [
                user_types_1.Occupation.GOVERNMENT_EMPLOYEE,
                user_types_1.Occupation.TEACHER,
                user_types_1.Occupation.DOCTOR,
                user_types_1.Occupation.ENGINEER,
                user_types_1.Occupation.BUSINESS_OWNER,
                user_types_1.Occupation.BANKER
            ];
            // Occupations to exclude based on cultural norms
            const culturallyExcludedOccupations = [
                user_types_1.Occupation.UNEMPLOYED,
                user_types_1.Occupation.DAILY_LABORER,
                ...(this.gender === user_types_1.Gender.FEMALE ? [
                    user_types_1.Occupation.CONSTRUCTION_WORKER,
                    user_types_1.Occupation.SECURITY_GUARD
                ] : [])
            ];
            if (this.gender === user_types_1.Gender.FEMALE) {
                // For female users seeking male partners
                return allOccupations.filter(occ => !culturallyExcludedOccupations.includes(occ) &&
                    (baseAcceptableOccupations.includes(occ) ||
                        occ.includes('MANAGER') ||
                        occ.includes('OFFICER') ||
                        occ.includes('PROFESSIONAL')));
            }
            else {
                // For male users seeking female partners
                // More flexible with occupations but prioritize certain professions
                return allOccupations.filter(occ => !culturallyExcludedOccupations.includes(occ));
            }
        };
        // Get education preferences based on cultural norms
        const getEducationPreferences = () => {
            const userHighestEdu = getUserHighestEducation();
            const educationLevels = Object.values(user_types_1.EducationLevel);
            const userLevelIndex = userHighestEdu
                ? educationLevels.indexOf(userHighestEdu.level)
                : educationLevels.indexOf(user_types_1.EducationLevel.HSC);
            if (this.gender === user_types_1.Gender.FEMALE) {
                // For female users: prefer equal or higher education
                return {
                    minimumLevel: userHighestEdu?.level || user_types_1.EducationLevel.BACHELORS_DEGREE,
                    mustBeEducated: true,
                    preferredLevels: educationLevels.slice(userLevelIndex)
                };
            }
            else {
                // For male users: prefer equal or lower education with some flexibility
                return {
                    minimumLevel: user_types_1.EducationLevel.HSC,
                    mustBeEducated: this.isEducated,
                    preferredLevels: educationLevels.slice(0, Math.min(userLevelIndex + 2, educationLevels.length))
                };
            }
        };
        // Calculate minimum annual income based on user's income
        const getMinimumIncomePreference = () => {
            if (!this.annualIncome?.amount)
                return undefined;
            return {
                min: 100000,
                max: this.annualIncome.amount ?
                    (this.gender === user_types_1.Gender.MALE ? this.annualIncome.amount : this.annualIncome.amount * 1.5)
                    : 300000,
                currency: this.annualIncome.currency
            };
        };
        return {
            education: getEducationPreferences(),
            profession: {
                acceptedOccupations: getCulturallyAppropriateOccupations(),
                preferredSectors: [
                    partnerPreference_1.EmploymentSector.GOVERNMENT,
                    partnerPreference_1.EmploymentSector.PRIVATE,
                    partnerPreference_1.EmploymentSector.BUSINESS,
                    ...(this.gender === user_types_1.Gender.FEMALE ? [partnerPreference_1.EmploymentSector.DEFENSE] : [])
                ],
                minimumAnnualIncome: getMinimumIncomePreference()
            }
        };
    })();
    // Calculate BMI-based weight preferences
    const weightPreferences = (() => {
        return {
            min: this.gender === user_types_1.Gender.MALE ? 45 : 55,
            max: this.gender === user_types_1.Gender.MALE ? 90 : 110
        };
    })();
    this.partnerPreference = {
        ageRange: agePreferences,
        heightRange: heightPreferences,
        weightRange: weightPreferences,
        maritalStatus: [
            user_types_1.MaritalStatus.NEVER_MARRIED,
            ...(this.maritalStatus !== user_types_1.MaritalStatus.NEVER_MARRIED ?
                [this.maritalStatus] : [])
        ],
        complexion: Object.values(partnerPreference_1.ComplexionPreference).filter(c => c !== partnerPreference_1.ComplexionPreference.ANY),
        physicalStatus: [userProfile_types_1.PhysicalStatus.NORMAL],
        religiousBranch: this.aboutMe?.religiousBranch ? [this.aboutMe.religiousBranch] : undefined,
        dealBreakers: [userProfile_types_1.BadHabits.SMOKING, userProfile_types_1.BadHabits.DRINKING],
        locationPreference: locationPreferences,
        ...educationAndProfessionPreferences,
        religion: [this.religion],
        motherTongue: this.languages.slice(0, 1),
        familyValues: [partnerPreference_1.FamilyValues.TRADITIONAL, partnerPreference_1.FamilyValues.MODERATE],
        familyBackground: this.familyInfo ? {
            maxSiblings: Math.max((this.familyInfo.numberOfBrothers || 0) + 2, (this.familyInfo.numberOfSisters || 0) + 2),
            preferredFamilyType: ['joint', 'nuclear'],
            preferredFamilyStatus: ['middle_class', 'upper_middle_class']
        } : undefined,
        strictPreferences: this.gender === user_types_1.Gender.FEMALE,
        priority: {
            education: this.isEducated ? 5 : 3,
            profession: this.occupation ? 4 : 3,
            location: 3,
            religion: 5,
            age: 4
        },
        lastUpdated: new Date(),
        district: this.address.district.name
    };
    return this;
};
userSchema.methods.createMID = function () {
    return (0, mid_geneator_1.default)();
};
userSchema.methods.suspend = function (reason) {
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
userSchema.methods.hasActiveMembership = function () {
    return !!this.membership?.currentMembership?.requestId && !!this.membership?.currentMembership?.membership_exipation_date && (0, date_fns_1.isBefore)(new Date(), this.membership.currentMembership.membership_exipation_date);
};
userSchema.index({ gender: 1 });
userSchema.index({ age: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ 'education.level': 1 });
userSchema.index({ dateOfBirth: 1 });
userSchema.index({ 'address.district.id': 1 });
userSchema.index({ "suspension.isSuspended": 1 });
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
exports.User = mongoose_1.default.model('User', userSchema);
