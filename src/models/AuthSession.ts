/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Mongoose, ObjectId, Schema, } from 'mongoose';
import { EducationLevel, Gender, Height, Language, MaritalStatus, Occupation, Religion } from '../lib/types/user.types';
import { CountryNamesEnum } from '../lib/types/country_names.enum';



interface IAddress {
    lat?: number;
    long?: number;
    division?: string;
    district?: string;
    upazilla?: string;
    union?: string;
   
}

interface IPhone {
    number?: string;
    code?: string;
}

interface IPreference {
    gender: Gender
}

export interface IAuthSessionValue {
    // Basic User Info
    email: string;
    userId: ObjectId | any;

    // Location Info
    address: {
        country: string;
        lat?: number;
        long?: number;
        division?: string;
        district?: string;
        upazila?: string;
        union?: string;
    };

    // Contact Info
    phone: {
        number?: string;
        code?: string;
    };

    // Personal Attributes
    gender: Gender;
    height: Height;
    weight: number;
    religion: Religion;
    languages: Language[];
    maritalStatus?: MaritalStatus;

    // Education & Profession
    isEducated: boolean;
    education?: Education[];
    occupation?: Occupation;

    // Partner Preferences
    partnerPreferences: {
        ageRange: {
            min: number;
            max: number;
        };
        heightRange: {
            min: number;
            max: number;
        };
        weightRange: {
            min: number;
            max: number;
        };
        maritalStatus: MaritalStatus[];
        education?: {
            minimumLevel: EducationLevel;
            mustBeEducated: boolean;
            preferredLevels?: EducationLevel[];
        };
        religion: Religion[];
        occupation?: Occupation[];
        location?: {
            prefferedDistrictIds : number[]
        };
    };

    // Security & Privacy
    blockedProfiles: mongoose.Types.ObjectId[];
}

interface Education {
    level: EducationLevel
}

export interface IAuthSession extends Document {
    name: "auth_session";
    value: IAuthSessionValue;
    key?: string;
    expiration_date: Date;
    created_at: Date;
    updated_at?: Date;
}

const AuthSessionValue = {
    email: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose.SchemaTypes.ObjectId,
        required: true,
        ref : "User"
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
        enum: Object.values(Gender),
        required: true
    },
    partnerPreferences: {
        type: {
            ageRange: {
                min: { type: Number, },
                max: { type: Number, }
            },
            heightRange: {
                min: { type: Number,  },
                max: { type: Number,  }
            },
            weightRange: {
                min: { type: Number, },
                max: { type: Number, }
            },
            maritalStatus: [{
                type: String,
                enum: Object.values(MaritalStatus),
             
            }],
            education: {
                minimumLevel: {
                    type: String,
                    enum: Object.values(EducationLevel)
                },
                mustBeEducated: Boolean,
                preferredLevels: [{
                    type: String,
                    enum: Object.values(EducationLevel)
                }]
            },
            religion: [{
                type: String,
                enum: Object.values(Religion),
            
            }],
            occupation: [{
                type: String,
                enum: Object.values(Occupation)
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
            enum: Object.values(EducationLevel)
        },
    }],
    height: {
        type: String,
        required: true,
        enum: Object.values(Height)
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
                type: mongoose.SchemaTypes.ObjectId
            }
        ],
        default: []
    }


}

const authSessionSchema = new Schema<IAuthSession>(
    {
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
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        }
    }
);

const AuthSession = mongoose.model<IAuthSession>('AuthSession', authSessionSchema);
export default AuthSession;