/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Types } from "mongoose";
import {
  EducationLevel,
  Education,
  EducationPreference,
} from "./userEducation.types";
import {
  ICity,
  IDistrict,
  IDivision,
  IState,
  IUpazila,
} from "./location.types";
import { CountryNamesEnum } from "./country_names.enum";
import {
  IAboutMe,
  IFamilyInfo,
  IEnhancedUserSettings,
} from "./userProfile.types";
import { IPartnerPreference } from "./partnerPreference";

export enum ProfileCreatedBy {
  SELF = "self",
  PARENT = "parent",
  SIBLINGS = "siblings",
  RELATIVE = "relative",
  FRIEND = "friend",
}

export interface IUserImage {
  url: String;
  id: String;
}

export interface IAddress {
  country: CountryNamesEnum.BANGLADESH;
  state?: IState;
  division?: IDivision;
  district?: IDistrict;
  upazila?: IUpazila;
  union?: ICity;
}

/*-------------- Gender -------------*/
export enum Gender {
  MALE = "male",
  FEMALE = "female",
}
/*-------------- Height -------------*/

export enum Height {
  // 4 feet range
  FOOT_4_0 = "4 foot 0 inch",
  FOOT_4_1 = "4 foot 1 inch",
  FOOT_4_2 = "4 foot 2 inch",
  FOOT_4_3 = "4 foot 3 inch",
  FOOT_4_4 = "4 foot 4 inch",
  FOOT_4_5 = "4 foot 5 inch",
  FOOT_4_6 = "4 foot 6 inch",
  FOOT_4_7 = "4 foot 7 inch",
  FOOT_4_8 = "4 foot 8 inch",
  FOOT_4_9 = "4 foot 9 inch",
  FOOT_4_10 = "4 foot 10 inch",
  FOOT_4_11 = "4 foot 11 inch",

  // 5 feet range
  FOOT_5_0 = "5 foot 0 inch",
  FOOT_5_1 = "5 foot 1 inch",
  FOOT_5_2 = "5 foot 2 inch",
  FOOT_5_3 = "5 foot 3 inch",
  FOOT_5_4 = "5 foot 4 inch",
  FOOT_5_5 = "5 foot 5 inch",
  FOOT_5_6 = "5 foot 6 inch",
  FOOT_5_7 = "5 foot 7 inch",
  FOOT_5_8 = "5 foot 8 inch",
  FOOT_5_9 = "5 foot 9 inch",
  FOOT_5_10 = "5 foot 10 inch",
  FOOT_5_11 = "5 foot 11 inch",

  // 6 feet range
  FOOT_6_0 = "6 foot 0 inch",
  FOOT_6_1 = "6 foot 1 inch",
  FOOT_6_2 = "6 foot 2 inch",
  FOOT_6_3 = "6 foot 3 inch",
  FOOT_6_4 = "6 foot 4 inch",
  FOOT_6_5 = "6 foot 5 inch",
  FOOT_6_6 = "6 foot 6 inch",
  FOOT_6_7 = "6 foot 7 inch",
  FOOT_6_8 = "6 foot 8 inch",
  FOOT_6_9 = "6 foot 9 inch",
  FOOT_6_10 = "6 foot 10 inch",
  FOOT_6_11 = "6 foot 11 inch",

  // 7 feet range
  FOOT_7_0 = "7 foot 0 inch",
  FOOT_7_1 = "7 foot 1 inch",
  FOOT_7_2 = "7 foot 2 inch",
  FOOT_7_3 = "7 foot 3 inch",
  FOOT_7_4 = "7 foot 4 inch",
  FOOT_7_5 = "7 foot 5 inch",
  FOOT_7_6 = "7 foot 6 inch",
  FOOT_7_7 = "7 foot 7 inch",
  FOOT_7_8 = "7 foot 8 inch",
  FOOT_7_9 = "7 foot 9 inch",
  FOOT_7_10 = "7 foot 10 inch",
  FOOT_7_11 = "7 foot 11 inch",

  // 8 feet range
  FOOT_8_0 = "8 foot 0 inch",
  FOOT_8_1 = "8 foot 1 inch",
  FOOT_8_2 = "8 foot 2 inch",
  FOOT_8_3 = "8 foot 3 inch",
  FOOT_8_4 = "8 foot 4 inch",
  FOOT_8_5 = "8 foot 5 inch",
  FOOT_8_6 = "8 foot 6 inch",
  FOOT_8_7 = "8 foot 7 inch",
  FOOT_8_8 = "8 foot 8 inch",
  FOOT_8_9 = "8 foot 9 inch",
  FOOT_8_10 = "8 foot 10 inch",
  FOOT_8_11 = "8 foot 11 inch",

  // 9 feet range
  FOOT_9_0 = "9 foot 0 inch",
  FOOT_9_1 = "9 foot 1 inch",
  FOOT_9_2 = "9 foot 2 inch",
  FOOT_9_3 = "9 foot 3 inch",
  FOOT_9_4 = "9 foot 4 inch",
  FOOT_9_5 = "9 foot 5 inch",
  FOOT_9_6 = "9 foot 6 inch",
  FOOT_9_7 = "9 foot 7 inch",
  FOOT_9_8 = "9 foot 8 inch",
  FOOT_9_9 = "9 foot 9 inch",
  FOOT_9_10 = "9 foot 10 inch",
  FOOT_9_11 = "9 foot 11 inch",
}

/*-------------- Religion -------------*/
export enum Religion {
  CHRISTIANITY = "Christianity",
  ISLAM = "Islam",
  HINDUISM = "Hinduism",
  BUDDHISM = "Buddhism",
  JUDAISM = "Judaism",
  SIKHISM = "Sikhism",
  BAHAI_FAITH = "Bahá'í Faith",
  JAINISM = "Jainism",
  SHINTO = "Shinto",
  TAOISM = "Taoism",
  CONFUCIANISM = "Confucianism",
  ZOROASTRIANISM = "Zoroastrianism",
  TRADITIONAL_AFRICAN = "Traditional African Religions",
  NATIVE_AMERICAN = "Native American Religions",
  RASTAFARIANISM = "Rastafarianism",
  WICCA = "Wicca",
  PAGANISM = "Paganism",
}

/*-------------- Language -------------*/
interface IOnlineStatus {
  isOnline: boolean;
  lastSeen: Date;
  lastActive: Date;
}

export enum Language {
  MANDARIN_CHINESE = "Mandarin Chinese",
  SPANISH = "Spanish",
  ENGLISH = "English",
  HINDI = "Hindi",
  ARABIC = "Arabic",
  BENGALI = "Bengali",
  PORTUGUESE = "Portuguese",
  RUSSIAN = "Russian",
  JAPANESE = "Japanese",
  PUNJABI = "Punjabi",
  GERMAN = "German",
  JAVANESE = "Javanese",
  WU_CHINESE = "Wu Chinese",
  TELUGU = "Telugu",
  VIETNAMESE = "Vietnamese",
  MARATHI = "Marathi",
  FRENCH = "French",
  KOREAN = "Korean",
  TAMIL = "Tamil",
  ITALIAN = "Italian",
  TURKISH = "Turkish",
  URDU = "Urdu",
  GUJARATI = "Gujarati",
  POLISH = "Polish",
  UKRAINIAN = "Ukrainian",
  PERSIAN = "Persian",
  MALAY = "Malay",
  KANNADA = "Kannada",
  XIANG_CHINESE = "Xiang Chinese",
  MALAYALAM = "Malayalam",
  SUNDANESE = "Sundanese",
  HAUSA = "Hausa",
  ODIA = "Odia",
  BURMESE = "Burmese",
  HAKKA_CHINESE = "Hakka Chinese",
  TAGALOG = "Tagalog/Filipino",
  CANTONESE = "Yue Chinese/Cantonese",
  THAI = "Thai",
  SWAHILI = "Swahili",
  ROMANIAN = "Romanian",
  DUTCH = "Dutch",
  KURDISH = "Kurdish",
  YORUBA = "Yoruba",
  AMHARIC = "Amharic",
  INDONESIAN = "Indonesian",
  GREEK = "Greek",
  CZECH = "Czech",
  SINDHI = "Sindhi",
  UZBEK = "Uzbek",
  HUNGARIAN = "Hungarian",
  BELARUSIAN = "Belarusian",
  HEBREW = "Hebrew",
  AZERBAIJANI = "Azerbaijani",
  SLOVAK = "Slovak",
  BULGARIAN = "Bulgarian",
  SERBIAN = "Serbian",
  DANISH = "Danish",
  FINNISH = "Finnish",
  NORWEGIAN = "Norwegian",
  SWEDISH = "Swedish",
  CROATIAN = "Croatian",
  LITHUANIAN = "Lithuanian",
  SLOVENIAN = "Slovenian",
  LATVIAN = "Latvian",
  ESTONIAN = "Estonian",
  GEORGIAN = "Georgian",
  ARMENIAN = "Armenian",
  ALBANIAN = "Albanian",
  MONGOLIAN = "Mongolian",
  KAZAKH = "Kazakh",
  NEPALI = "Nepali",
  ASSAMESE = "Assamese",
  TIBETAN = "Tibetan",
  KHMER = "Khmer",
  LAO = "Lao",
  PASHTO = "Pashto",
  ZULU = "Zulu",
  XHOSA = "Xhosa",
  IGBO = "Igbo",
}

interface IPhoneCountry {
  name: string;
  phone_code: string;
}

interface IPhone {
  country: IPhoneCountry;
  number: string;
}

export interface IPassword {
  hashed: string;
  salt: string;
}

export enum SettingsType {
  allowed = "allowed",
  notAllowed = "not_allowed",
}

// Add these new enums after the existing ones

export enum MaritalStatus {
  NEVER_MARRIED = "never_married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
  SEPARATED = "separated",
  ANNULLED = "annulled",
}

export enum Occupation {
  // Professional
  DOCTOR = "doctor",
  ENGINEER = "engineer",
  LAWYER = "lawyer",
  TEACHER = "teacher",
  PROFESSOR = "professor",
  ACCOUNTANT = "accountant",
  ARCHITECT = "architect",
  AGRICULTURIST = "agriculturist",
  JOURNALIST = "journalist",
  SCIENTIST = "scientist",
  PSYCHOLOGIST = "psychologist",
  SOCIAL_WORKER = "social_worker",
  ECONOMIST = "economist",
  STATISTICIAN = "statistician",
  LIBRARIAN = "librarian",

  // Business
  BUSINESS_OWNER = "business_owner",
  ENTREPRENEUR = "entrepreneur",
  SALES_MANAGER = "sales_manager",
  MARKETING_MANAGER = "marketing_manager",
  SUPPLY_CHAIN_MANAGER = "supply_chain_manager",
  RETAILER = "retailer",
  WHOLESALER = "wholesaler",
  IMPORTER = "importer",
  EXPORTER = "exporter",

  // Technology
  SOFTWARE_ENGINEER = "software_engineer",
  DATA_SCIENTIST = "data_scientist",
  IT_PROFESSIONAL = "it_professional",
  WEB_DEVELOPER = "web_developer",
  MOBILE_APP_DEVELOPER = "mobile_app_developer",
  NETWORK_ENGINEER = "network_engineer",
  SYSTEMS_ADMINISTRATOR = "systems_administrator",
  CYBERSECURITY_ANALYST = "cybersecurity_analyst",
  DATABASE_ADMINISTRATOR = "database_administrator",

  // Healthcare
  NURSE = "nurse",
  PHARMACIST = "pharmacist",
  DENTIST = "dentist",
  MEDICAL_TECHNOLOGIST = "medical_technologist",
  PHYSIOTHERAPIST = "physiotherapist",
  OCCUPATIONAL_THERAPIST = "occupational_therapist",
  PARAMEDIC = "paramedic",
  HOMEOPATH = "homeopath",
  AYURVEDIC_PRACTITIONER = "ayurvedic_practitioner",
  UNANI_PRACTITIONER = "unani_practitioner",

  // Government
  GOVERNMENT_EMPLOYEE = "government_employee",
  POLICE_OFFICER = "police_officer",
  MILITARY_PERSONNEL = "military_personnel",
  ADMINISTRATIVE_OFFICER = "administrative_officer",
  DIPLOMAT = "diplomat",
  CIVIL_SERVANT = "civil_servant",
  FOREST_OFFICER = "forest_officer",
  FISHERIES_OFFICER = "fisheries_officer",

  // Finance
  BANKER = "banker",
  FINANCIAL_ANALYST = "financial_analyst",
  INSURANCE_AGENT = "insurance_agent",
  BROKER = "broker",
  INVESTMENT_BANKER = "investment_banker",

  // Agriculture
  FARMER = "farmer",
  FISHERMAN = "fisherman",
  POULTRY_FARMER = "poultry_farmer",
  DAIRY_FARMER = "dairy_farmer",

  // Manufacturing
  FACTORY_WORKER = "factory_worker",
  PRODUCTION_MANAGER = "production_manager",
  GARMENT_WORKER = "garment_worker",

  // Service
  DRIVER = "driver",
  WAITER = "waiter",
  COOK = "cook",
  CLEANER = "cleaner",
  SECURITY_GUARD = "security_guard",
  TOUR_GUIDE = "tour_guide",
  HAIRDRESSER = "hairdresser",
  BEAUTICIAN = "beautician",

  // Education
  LECTURER = "lecturer",
  SCHOOL_PRINCIPAL = "school_principal",
  EDUCATION_ADMINISTRATOR = "education_administrator",
  TUTOR = "tutor",

  // Arts and Culture
  ARTIST = "artist",
  MUSICIAN = "musician",
  WRITER = "writer",
  ACTOR = "actor",
  FILMMAKER = "filmmaker",
  DESIGNER = "designer",
  PHOTOGRAPHER = "photographer",
  DANCER = "dancer",

  // Non-Profit
  NGO_WORKER = "ngo_worker",
  CHARITY_WORKER = "charity_worker",
  DEVELOPMENT_WORKER = "development_worker",

  // Others
  STUDENT = "student",
  SELF_EMPLOYED = "self_employed",
  RETIRED = "retired",
  HOMEMAKER = "homemaker",
  UNEMPLOYED = "unemployed",
  OTHER = "other",
  DAILY_LABORER = "daily_laborer",
  CONSTRUCTION_WORKER = "construction_worker",
}

interface IAnualIncome {
  amount: number;
  currency: string;
}

interface ISuspension {
  isSuspended: boolean;
  suspensions: [
    {
      reason: string;
      date: string;
    }
  ];
}

export interface IUserMembership {
  currentMembership: {
    requestId: string;
    membership_exipation_date: Date;
  };
}

export interface IUserCoinHistoryEntry {
  userId: Types.ObjectId;
  status: 'sent' | 'received';
  giftId: Types.ObjectId;
  coinAmount: number;
  coinName: string;
  date: Date;
}

export interface IUser extends Document {
  // Basic Profile Information
  mid: string; // Unique matrimony ID
  name: string; // User's full name
  email: string; // User's email address
  gender: Gender; // User's gender
  dateOfBirth: Date; // User's date of birth
  age: number; // User's calculated age
  profileCreatedBy: ProfileCreatedBy; // Who created this profile
  createdAt: Date;

  // Profile creation timestamp

  // Physical Attributes
  height: Height; // User's height
  weight: number; // User's weight in kg

  // Contact Information
  address: IAddress; // User's address details
  phoneInfo: IPhone; // User's phone information

  // Authentication & Security
  password: IPassword; // Hashed password and salt

  // Profile Media
  profileImage: IUserImage; // Primary profile picture
  coverImage?: IUserImage; // Optional cover photo
  userImages: IUserImage[]; // Additional profile images

  // Educational & Professional Details
  isEducated: boolean; // Education status
  education: Education[]; // Educational background
  occupation?: Occupation; // Professional occupation
  annualIncome?: IAnualIncome; // Yearly income details

  // Personal Attributes
  languages: Language[]; // Languages known
  religion: Religion; // Religious belief
  maritalStatus?: MaritalStatus; // Current marital status

  // Additional Profile Information
  aboutMe?: IAboutMe; // Detailed self-description
  familyInfo?: IFamilyInfo; // Family background

  // Preferences & Settings
  partnerPreference: IPartnerPreference; // Partner preferences
  enhancedSettings: IEnhancedUserSettings; // Advanced settings

  // Status Tracking
  onlineStatus: IOnlineStatus; // User's online status
  suspension: ISuspension; // Account suspension details

  // Membership Management
  membership?: IUserMembership; // Premium membership details

  // Coin System
  totalCoin: number;
  coinHistory: IUserCoinHistoryEntry[];

  // connections
  connections: mongoose.Types.ObjectId[];
  pendingIncomingRequests: mongoose.Types.ObjectId[];
  pendingOutgoingRequests: mongoose.Types.ObjectId[];

  // Messaging rooms
  messagingRooms: {
    connectedRooms: mongoose.Types.ObjectId[];
    blockedRooms: mongoose.Types.ObjectId[];
  };
  socket_ids: {
    notification_socket: string;
    messaging_socket: string;
    video_calling_socket: string;
  };
  // Instance Methods
  createPreference(): IUser;
  createMID(): string;
  hasActiveMembership(): boolean;

  // Friendly Methods
  friendRequests: Types.ObjectId[]; // বা IUser[] যদি populate করা হয়
  sentRequests: Types.ObjectId[];
  friends: Types.ObjectId[];
}

export { Education, EducationPreference, EducationLevel };
