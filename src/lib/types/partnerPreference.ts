/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { CountryNamesEnum } from './country_names.enum';
import { Religion, Language, Height, MaritalStatus, Occupation } from './user.types';
import { EducationLevel } from './userEducation.types';
import { PhysicalStatus, ReligiousBranch, BadHabits } from './userProfile.types';
import { CurrencyCode } from './currencyCodes.enum';

export enum ComplexionPreference {
    VERY_FAIR = "very_fair",
    FAIR = "fair",
    WHEATISH = "wheatish",
    DARK = "dark",
    ANY = "any"
}

export enum EmploymentSector {
    GOVERNMENT = "government",
    PRIVATE = "private",
    BUSINESS = "business",
    DEFENSE = "defense",
    SELF_EMPLOYED = "self_employed",
    NOT_WORKING = "not_working",
    ANY = "any"
}

export enum FamilyValues {
    TRADITIONAL = "traditional",
    MODERATE = "moderate",
    LIBERAL = "liberal",
    ANY = "any"
}

export enum PreferredLocation {
    SAME_CITY = "same_city",
    SAME_STATE = "same_state",
    SAME_COUNTRY = "same_country",
    ANYWHERE = "anywhere"
}

export interface IIncomeRange {
    min: number;
    max: number;
    currency: CurrencyCode;
}

export interface IPartnerPreference {
    // Basic Demographics
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

    // Personal Attributes
    maritalStatus: MaritalStatus[];
    district : string ;
    complexion?: ComplexionPreference[];
    physicalStatus: PhysicalStatus[];
    religiousBranch?: ReligiousBranch[];
    dealBreakers?: BadHabits[];

    // Location Preferences
    locationPreference: {
        preferredDistrictIds: number[]; // District/City IDs
    };

    // Education & Career
    education: {
        minimumLevel: EducationLevel;
        preferredLevels?: EducationLevel[];
        mustBeEducated: boolean;
        preferredInstitutions?: string[];
    };

    profession: {
        acceptedOccupations?: Occupation[];
        preferredSectors?: EmploymentSector[];
        minimumAnnualIncome?: IIncomeRange;
    };

    // Cultural & Religious
    religion: Religion[];
    motherTongue?: Language[];
    familyValues?: FamilyValues[];

    // Additional Preferences
    familyBackground?: {
        maxSiblings?: number;
        preferredFamilyType?: string[];
        preferredFamilyStatus?: string[];
    };

    // Metadata
    lastUpdated: Date;
}