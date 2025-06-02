"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerPreferenceSchema = void 0;
const mongoose_1 = require("mongoose");
const user_types_1 = require("../types/user.types");
const userEducation_types_1 = require("../types/userEducation.types");
const userProfile_types_1 = require("../types/userProfile.types");
const currencyCodes_enum_1 = require("../types/currencyCodes.enum");
const partnerPreference_1 = require("../types/partnerPreference");
const districts_1 = require("../data/districts");
exports.partnerPreferenceSchema = new mongoose_1.Schema({
    ageRange: {
        min: { type: Number, required: false, min: 18, max: 70 },
        max: { type: Number, required: false, min: 18, max: 70 }
    },
    heightRange: {
        min: { type: Number, required: false, min: 4, max: 8 },
        max: { type: Number, required: false, min: 5, max: 9 }
    },
    weightRange: {
        min: { type: Number, required: false, min: 30, max: 199 },
        max: { type: Number, required: false, min: 31, max: 200 }
    },
    maritalStatus: [{
            type: String,
            enum: Object.values(user_types_1.MaritalStatus),
            required: false
        }],
    district: {
        type: String,
        enum: districts_1.districtNames,
    },
    complexion: [{
            type: String,
            enum: Object.values(partnerPreference_1.ComplexionPreference)
        }],
    physicalStatus: [{
            type: String,
            enum: Object.values(userProfile_types_1.PhysicalStatus),
            required: false
        }],
    religiousBranch: [{
            type: String,
            enum: Object.values(userProfile_types_1.ReligiousBranch)
        }],
    dealBreakers: [{
            type: String,
            enum: Object.values(userProfile_types_1.BadHabits)
        }],
    locationPreference: {
        preferredDistrict: {
            type: [{
                    type: Number
                }]
        }
    },
    education: {
        minimumLevel: {
            type: String,
            enum: Object.values(userEducation_types_1.EducationLevel),
            required: false
        },
        preferredLevels: [{
                type: String,
                enum: Object.values(userEducation_types_1.EducationLevel)
            }],
        mustBeEducated: {
            type: Boolean,
            required: false,
            default: true
        },
        preferredInstitutions: [String]
    },
    profession: {
        acceptedOccupations: [{
                type: String,
                enum: Object.values(user_types_1.Occupation)
            }],
        preferredSectors: [{
                type: String,
                enum: Object.values(partnerPreference_1.EmploymentSector)
            }],
        minimumAnnualIncome: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                enum: Object.values(currencyCodes_enum_1.CurrencyCode)
            }
        }
    },
    religion: [{
            type: String,
            enum: Object.values(user_types_1.Religion),
            required: false
        }],
    motherTongue: [{
            type: String,
            enum: Object.values(user_types_1.Language)
        }],
    familyValues: [{
            type: String,
            enum: Object.values(partnerPreference_1.FamilyValues)
        }],
    familyBackground: {
        maxSiblings: Number,
        preferredFamilyType: [String],
        preferredFamilyStatus: [String]
    },
    lastUpdated: {
        type: Date,
        required: false,
        default: Date.now
    },
});
// Add validation for age range
exports.partnerPreferenceSchema.pre('save', function (next) {
    if (this.ageRange.min > this.ageRange.max) {
        next(new Error('Minimum age cannot be greater than maximum age'));
    }
    if (this.heightRange.min > this.heightRange.max) {
        next(new Error('Minimum height cannot be greater than maximum height'));
    }
    next();
});
