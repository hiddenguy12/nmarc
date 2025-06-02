/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

export enum PhysicalStatus {
    NORMAL = 'normal',
    PHYSICALLY_CHALLENGED = 'physically_challenged',
    HEARING_IMPAIRED = 'hearing_impaired',
    VISUALLY_IMPAIRED = 'visually_impaired',
    SPEECH_IMPAIRED = 'speech_impaired',
    OTHER = 'other'
}

export enum ReligiousBranch {
    // Islamic Branches
    SUNNI = 'sunni',
    SHIA = 'shia',
    AHLE_HADITH = 'ahle_hadith',
    SUFI = 'sufi',
    
    // Hindu Branches
    SHAIVISM = 'shaivism',
    VAISHNAVISM = 'vaishnavism',
    SHAKTISM = 'shaktism',
    SMARTISM = 'smartism',
    
    // Buddhist Branches
    THERAVADA = 'theravada',
    MAHAYANA = 'mahayana',
    
    // Christian Branches
    CATHOLIC = 'catholic',
    PROTESTANT = 'protestant',
    ORTHODOX = 'orthodox',
    
    // Other
    OTHER = 'other',
    PREFER_NOT_TO_SAY = 'prefer_not_to_say'
}

export enum BadHabits {
    SMOKING = 'smoking',
    DRINKING = 'drinking',
    DRUG_ADDICTION = 'drug_addiction',
    OVER_EATING = 'over_eating',
    NONE = 'none'
}

export enum Sports {
    CRICKET = 'cricket',
    FOOTBALL = 'football',
    BASKETBALL = 'basketball',
    VOLLEYBALL = 'volleyball',
    TENNIS = 'tennis',
    BADMINTON = 'badminton',
    TABLE_TENNIS = 'table_tennis',
    SWIMMING = 'swimming',
    CHESS = 'chess',
    CARROM = 'carrom',
    HOCKEY = 'hockey',
    KABADDI = 'kabaddi',
    OTHER = 'other'
}

export enum Hobbies {
    READING = 'reading',
    WRITING = 'writing',
    PAINTING = 'painting',
    COOKING = 'cooking',
    GARDENING = 'gardening',
    PHOTOGRAPHY = 'photography',
    TRAVELING = 'traveling',
    SINGING = 'singing',
    DANCING = 'dancing',
    DRAWING = 'drawing',
    CRAFTING = 'crafting',
    COLLECTING = 'collecting',
    GAMING = 'gaming',
    BLOGGING = 'blogging',
    VLOGGING = 'vlogging',
    OTHER = 'other'
}

export enum MusicTypes {
    CLASSICAL = 'classical',
    POP = 'pop',
    ROCK = 'rock',
    JAZZ = 'jazz',
    BLUES = 'blues',
    COUNTRY = 'country',
    FOLK = 'folk',
    RELIGIOUS = 'religious',
    RAP = 'rap',
    OTHER = 'other'
}

export enum FoodTypes {
    VEGETARIAN = 'vegetarian',
    NON_VEGETARIAN = 'non_vegetarian',
    VEGAN = 'vegan',
    HALAL = 'halal',
    KOSHER = 'kosher',
    ALL = 'all'
}

export interface IAboutMe {
    description: string;
    physicalStatus: PhysicalStatus;
    religiousBranch: ReligiousBranch;
    badHabits: BadHabits[];
    interestedSports: Sports[];
    interestedHobbies: Hobbies[];
    interestedFoodTypes: FoodTypes[];
    interestedMusicTypes: MusicTypes[];
}

export interface IFamilyInfo {
    aboutFamily: string;
    familyOrigin: string;
    numberOfBrothers: number;
    numberOfSisters: number;
    numberOfMarriedBrothers: number;
    numberOfMarriedSisters: number;
}

export interface IBlockedProfile {
    userId: string;
    blockedAt: Date;
    reason?: string;
}

export enum SettingsPermissionType {
    EVERYONE = 'everyone',
    NONE = 'none',
    PREMIUM_USERS = 'premium_users',
    CONNECTED_USERS = 'connected_users'
}

export interface IEnhancedPrivacySettings {
    whoCanViewProfile: SettingsPermissionType;
    whoCanContactMe: SettingsPermissionType;
    showShortlistedNotification: boolean;
    showProfileViewNotification: boolean;
}

export interface IEnhancedNotificationSettings {
    dailyRecommendations: boolean;
    todaysMatch: boolean;
    profileViews: boolean;
    shortlists: boolean;
    messages: boolean;
    connectionRequests: boolean;
}

export interface IEnhancedUserSettings {
    blocked: IBlockedProfile[];
    privacy: IEnhancedPrivacySettings;
    notifications: IEnhancedNotificationSettings;
}