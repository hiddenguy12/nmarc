/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { IUser } from '../types/user.types';
import { EducationLevel } from '../types/userEducation.types';
import { IPartnerPreference } from '../types/partnerPreference';

interface IMatchScore {
    totalScore: number;
    categoryScores: {
        basicCriteria: number;
        education: number;
        location: number;
        age: number;
        occupation: number;
        religion: number;
        language: number;
        familyValues: number;
    };
    compatibility: string; // Excellent, Good, Average, Below Average
    details: {
        [key: string]: {
            score: number;
            reason: string;
        }
    };
}

export class MatchScoreService {
    private static readonly EDUCATION_LEVELS_ORDER = Object.values(EducationLevel);
    private static readonly SCORE_WEIGHTS :any= {
        basicCriteria: 15,   // Basic matching criteria
        education: 15,       // Educational compatibility
        location: 10,        // Location preferences
        age: 15,            // Age compatibility
        occupation: 10,      // Professional compatibility
        religion: 20,        // Religious compatibility
        language: 10,        // Language compatibility
        familyValues: 5      // Family values compatibility
    };

    static calculateMatchScore(user1: IUser, user2: IUser): IMatchScore {
        const scores = {
            basicCriteria: this.calculateBasicCriteriaScore(user1, user2),
            education: this.calculateEducationScore(user1, user2),
            location: this.calculateLocationScore(user1, user2),
            age: this.calculateAgeScore(user1, user2),
            occupation: this.calculateOccupationScore(user1, user2),
            religion: this.calculateReligionScore(user1, user2),
            language: this.calculateLanguageScore(user1, user2),
            familyValues: this.calculateFamilyValuesScore(user1, user2)
        };

        const weightedTotal = Object.entries(scores).reduce((total, [category , score] : [any , number]) => {
            return total + (score * (this.SCORE_WEIGHTS[category] / 100));
        }, 0);

        return {
            totalScore: Math.round(weightedTotal * 100),
            categoryScores: scores,
            compatibility: this.getCompatibilityLabel(weightedTotal * 100),
            details: this.generateMatchDetails(user1, user2, scores)
        };
    }

    private static calculateBasicCriteriaScore(user1: IUser, user2: IUser): number {
        const criteria1 = user1.partnerPreference;
        const criteria2 = user2.partnerPreference;

        let score = 1;

        // Check if each user meets the other's basic criteria
        if (!this.meetsBasicCriteria(user1, criteria2) || 
            !this.meetsBasicCriteria(user2, criteria1)) {
            score = 0;
        }

        return score;
    }

    private static calculateEducationScore(user1: IUser, user2: IUser): number {
        if (!user1.isEducated || !user2.isEducated) return 0.5;

        const edu1 = this.getHighestEducation(user1);
        const edu2 = this.getHighestEducation(user2);
        
        const levelDiff = Math.abs(
            this.EDUCATION_LEVELS_ORDER.indexOf(edu1) - 
            this.EDUCATION_LEVELS_ORDER.indexOf(edu2)
        );

        return Math.max(0, 1 - (levelDiff * 0.2));
    }

    private static calculateAgeScore(user1: IUser, user2: IUser): number {
        const pref1 = user1.partnerPreference.ageRange;
        const pref2 = user2.partnerPreference.ageRange;

        const ageInRange1 = user2.age >= pref1.min && user2.age <= pref1.max;
        const ageInRange2 = user1.age >= pref2.min && user1.age <= pref2.max;

        if (!ageInRange1 || !ageInRange2) return 0;

        const ageDiff = Math.abs(user1.age - user2.age);
        return Math.max(0, 1 - (ageDiff * 0.1));
    }

    private static calculateLocationScore(user1: IUser, user2: IUser): number {
        const loc1 = user1.address;
        const loc2 = user2.address;

        if (loc1.country !== loc2.country) return 0.3;
        if (loc1.division?.id === loc2.division?.id) return 1;
        if (loc1.district?.id === loc2.district?.id) return 0.8;
        
        return 0.5;
    }

    private static calculateReligionScore(user1: IUser, user2: IUser): number {
        if (user1.religion !== user2.religion) return 0;
        if (user1.aboutMe?.religiousBranch === user2.aboutMe?.religiousBranch) return 1;
        return 0.7;
    }

    private static calculateLanguageScore(user1: IUser, user2: IUser): number {
        const commonLanguages = user1.languages.filter(lang => 
            user2.languages.includes(lang)
        );
        return commonLanguages.length > 0 ? 
            Math.min(1, commonLanguages.length / 2) : 0;
    }

    private static calculateOccupationScore(user1: IUser, user2: IUser): number {
        if (!user1.occupation || !user2.occupation) return 0.5;

        const pref1 = user1.partnerPreference.profession?.acceptedOccupations || [];
        const pref2 = user2.partnerPreference.profession?.acceptedOccupations || [];

        const matches1 = pref1.includes(user2.occupation);
        const matches2 = pref2.includes(user1.occupation);

        return (matches1 && matches2) ? 1 : 
               (matches1 || matches2) ? 0.7 : 0.4;
    }

    private static calculateFamilyValuesScore(user1: IUser, user2: IUser): number {
        if (!user1.familyInfo || !user2.familyInfo) return 0.5;
        
        // Implement family values comparison logic here
        return 0.8; // Placeholder
    }

    private static getHighestEducation(user: IUser): EducationLevel {
        if (!user.education?.length) return EducationLevel.PRIMARY_EDUCATION;
        
        return user.education.reduce((highest:any, current :any) => {
            const currentIndex = this.EDUCATION_LEVELS_ORDER.indexOf(current.level);
            const highestIndex = this.EDUCATION_LEVELS_ORDER.indexOf(highest);
            return currentIndex > highestIndex ? current.level : highest;
        }, EducationLevel.PRIMARY_EDUCATION);
    }

    private static meetsBasicCriteria(user: IUser, criteria: IPartnerPreference): boolean {
        return user.age >= criteria.ageRange.min &&
               user.age <= criteria.ageRange.max &&
               criteria.religion.includes(user.religion) &&
               (!criteria.education?.mustBeEducated || user.isEducated);
    }

    private static getCompatibilityLabel(score: number): string {
        if (score >= 80) return "Excellent Match";
        if (score >= 60) return "Good Match";
        if (score >= 40) return "Average Match";
        return "Below Average Match";
    }

    private static generateMatchDetails(user1: IUser, user2: IUser, scores: any): any {
        // Implement detailed matching reasons
        return {
            education: {
                score: scores.education * 100,
                reason: this.getEducationMatchReason(user1, user2)
            },
            // Add other categories with reasons
        };
    }

    private static getEducationMatchReason(user1: IUser, user2: IUser): string {
        const edu1 = this.getHighestEducation(user1);
        const edu2 = this.getHighestEducation(user2);
        
        if (edu1 === edu2) return "Both have same education level";
        return `Education levels are ${Math.abs(
            this.EDUCATION_LEVELS_ORDER.indexOf(edu1) - 
            this.EDUCATION_LEVELS_ORDER.indexOf(edu2)
        )} levels apart`;
    }
}