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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const user_types_1 = require("../lib/types/user.types");
const AuthSessionValue = {
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.default.SchemaTypes.ObjectId,
        required: true,
        ref: "User"
    },
    address: {
        type: {
            lat: {
                type: Number,
                required: false
            },
            long: {
                type: Number,
                required: false
            },
            division: {
                type: String,
                required: false
            },
            district: {
                type: String,
                required: false
            },
            upazilla: {
                type: String,
                required: false
            },
            union: {
                type: String,
                required: false
            },
        },
        _id: false // Prevents MongoDB from creating an _id for this subdocument
    },
    phone: {
        type: {
            number: {
                type: String,
                required: false
            },
            code: {
                type: String,
                required: false
            }
        },
        _id: false // Prevents MongoDB from creating an _id for this subdocument
    },
    gender: {
        type: String,
        enum: Object.values(user_types_1.Gender),
        required: true
    },
    partnerPreferences: {
        type: {
            ageRange: {
                min: { type: Number, },
                max: { type: Number, }
            },
            heightRange: {
                min: { type: Number, },
                max: { type: Number, }
            },
            weightRange: {
                min: { type: Number, },
                max: { type: Number, }
            },
            maritalStatus: [{
                    type: String,
                    enum: Object.values(user_types_1.MaritalStatus),
                }],
            education: {
                minimumLevel: {
                    type: String,
                    enum: Object.values(user_types_1.EducationLevel)
                },
                mustBeEducated: Boolean,
                preferredLevels: [{
                        type: String,
                        enum: Object.values(user_types_1.EducationLevel)
                    }]
            },
            religion: [{
                    type: String,
                    enum: Object.values(user_types_1.Religion),
                }],
            occupation: [{
                    type: String,
                    enum: Object.values(user_types_1.Occupation)
                }],
            location: {
                preferredCountries: [String],
                preferredRegions: [String],
                preferredCities: [String]
            }
        },
        required: true
    },
    // New fields added
    languages: [{
            type: String,
            required: true
        }],
    religion: {
        type: String,
        required: true
    },
    isEducated: {
        type: Boolean,
        required: true
    },
    education: [{
            level: {
                type: String,
                required: true,
                enum: Object.values(user_types_1.EducationLevel)
            },
        }],
    height: {
        type: String,
        required: true,
        enum: Object.values(user_types_1.Height)
    },
    weight: {
        type: Number,
        required: true,
        min: 30,
        max: 200
    },
    blockedProfiles: {
        type: [
            {
                type: mongoose_1.default.SchemaTypes.ObjectId
            }
        ],
        default: []
    }
};
const authSessionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        enum: ["auth_session"],
        default: "auth_session"
    },
    key: {
        type: String,
        required: false,
        unique: true,
    },
    value: {
        type: AuthSessionValue,
        required: true,
        _id: false
    },
    expiration_date: {
        type: Date,
        required: true,
        default() {
            return new Date(Date.now() + 30 * 24 * 3600 * 1000); // Default expiration date is 30 days from now
        }
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
const AuthSession = mongoose_1.default.model('AuthSession', authSessionSchema);
exports.default = AuthSession;
