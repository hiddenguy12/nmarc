"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EducationLevel = exports.Occupation = exports.MaritalStatus = exports.SettingsType = exports.Language = exports.Religion = exports.Height = exports.Gender = exports.ProfileCreatedBy = void 0;
const userEducation_types_1 = require("./userEducation.types");
Object.defineProperty(exports, "EducationLevel", { enumerable: true, get: function () { return userEducation_types_1.EducationLevel; } });
var ProfileCreatedBy;
(function (ProfileCreatedBy) {
    ProfileCreatedBy["SELF"] = "self";
    ProfileCreatedBy["PARENT"] = "parent";
    ProfileCreatedBy["SIBLINGS"] = "siblings";
    ProfileCreatedBy["RELATIVE"] = "relative";
    ProfileCreatedBy["FRIEND"] = "friend";
})(ProfileCreatedBy || (exports.ProfileCreatedBy = ProfileCreatedBy = {}));
/*-------------- Gender -------------*/
var Gender;
(function (Gender) {
    Gender["MALE"] = "male";
    Gender["FEMALE"] = "female";
})(Gender || (exports.Gender = Gender = {}));
/*-------------- Height -------------*/
var Height;
(function (Height) {
    // 4 feet range
    Height["FOOT_4_0"] = "4 foot 0 inch";
    Height["FOOT_4_1"] = "4 foot 1 inch";
    Height["FOOT_4_2"] = "4 foot 2 inch";
    Height["FOOT_4_3"] = "4 foot 3 inch";
    Height["FOOT_4_4"] = "4 foot 4 inch";
    Height["FOOT_4_5"] = "4 foot 5 inch";
    Height["FOOT_4_6"] = "4 foot 6 inch";
    Height["FOOT_4_7"] = "4 foot 7 inch";
    Height["FOOT_4_8"] = "4 foot 8 inch";
    Height["FOOT_4_9"] = "4 foot 9 inch";
    Height["FOOT_4_10"] = "4 foot 10 inch";
    Height["FOOT_4_11"] = "4 foot 11 inch";
    // 5 feet range
    Height["FOOT_5_0"] = "5 foot 0 inch";
    Height["FOOT_5_1"] = "5 foot 1 inch";
    Height["FOOT_5_2"] = "5 foot 2 inch";
    Height["FOOT_5_3"] = "5 foot 3 inch";
    Height["FOOT_5_4"] = "5 foot 4 inch";
    Height["FOOT_5_5"] = "5 foot 5 inch";
    Height["FOOT_5_6"] = "5 foot 6 inch";
    Height["FOOT_5_7"] = "5 foot 7 inch";
    Height["FOOT_5_8"] = "5 foot 8 inch";
    Height["FOOT_5_9"] = "5 foot 9 inch";
    Height["FOOT_5_10"] = "5 foot 10 inch";
    Height["FOOT_5_11"] = "5 foot 11 inch";
    // 6 feet range
    Height["FOOT_6_0"] = "6 foot 0 inch";
    Height["FOOT_6_1"] = "6 foot 1 inch";
    Height["FOOT_6_2"] = "6 foot 2 inch";
    Height["FOOT_6_3"] = "6 foot 3 inch";
    Height["FOOT_6_4"] = "6 foot 4 inch";
    Height["FOOT_6_5"] = "6 foot 5 inch";
    Height["FOOT_6_6"] = "6 foot 6 inch";
    Height["FOOT_6_7"] = "6 foot 7 inch";
    Height["FOOT_6_8"] = "6 foot 8 inch";
    Height["FOOT_6_9"] = "6 foot 9 inch";
    Height["FOOT_6_10"] = "6 foot 10 inch";
    Height["FOOT_6_11"] = "6 foot 11 inch";
    // 7 feet range
    Height["FOOT_7_0"] = "7 foot 0 inch";
    Height["FOOT_7_1"] = "7 foot 1 inch";
    Height["FOOT_7_2"] = "7 foot 2 inch";
    Height["FOOT_7_3"] = "7 foot 3 inch";
    Height["FOOT_7_4"] = "7 foot 4 inch";
    Height["FOOT_7_5"] = "7 foot 5 inch";
    Height["FOOT_7_6"] = "7 foot 6 inch";
    Height["FOOT_7_7"] = "7 foot 7 inch";
    Height["FOOT_7_8"] = "7 foot 8 inch";
    Height["FOOT_7_9"] = "7 foot 9 inch";
    Height["FOOT_7_10"] = "7 foot 10 inch";
    Height["FOOT_7_11"] = "7 foot 11 inch";
    // 8 feet range
    Height["FOOT_8_0"] = "8 foot 0 inch";
    Height["FOOT_8_1"] = "8 foot 1 inch";
    Height["FOOT_8_2"] = "8 foot 2 inch";
    Height["FOOT_8_3"] = "8 foot 3 inch";
    Height["FOOT_8_4"] = "8 foot 4 inch";
    Height["FOOT_8_5"] = "8 foot 5 inch";
    Height["FOOT_8_6"] = "8 foot 6 inch";
    Height["FOOT_8_7"] = "8 foot 7 inch";
    Height["FOOT_8_8"] = "8 foot 8 inch";
    Height["FOOT_8_9"] = "8 foot 9 inch";
    Height["FOOT_8_10"] = "8 foot 10 inch";
    Height["FOOT_8_11"] = "8 foot 11 inch";
    // 9 feet range
    Height["FOOT_9_0"] = "9 foot 0 inch";
    Height["FOOT_9_1"] = "9 foot 1 inch";
    Height["FOOT_9_2"] = "9 foot 2 inch";
    Height["FOOT_9_3"] = "9 foot 3 inch";
    Height["FOOT_9_4"] = "9 foot 4 inch";
    Height["FOOT_9_5"] = "9 foot 5 inch";
    Height["FOOT_9_6"] = "9 foot 6 inch";
    Height["FOOT_9_7"] = "9 foot 7 inch";
    Height["FOOT_9_8"] = "9 foot 8 inch";
    Height["FOOT_9_9"] = "9 foot 9 inch";
    Height["FOOT_9_10"] = "9 foot 10 inch";
    Height["FOOT_9_11"] = "9 foot 11 inch";
})(Height || (exports.Height = Height = {}));
/*-------------- Religion -------------*/
var Religion;
(function (Religion) {
    Religion["CHRISTIANITY"] = "Christianity";
    Religion["ISLAM"] = "Islam";
    Religion["HINDUISM"] = "Hinduism";
    Religion["BUDDHISM"] = "Buddhism";
    Religion["JUDAISM"] = "Judaism";
    Religion["SIKHISM"] = "Sikhism";
    Religion["BAHAI_FAITH"] = "Bah\u00E1'\u00ED Faith";
    Religion["JAINISM"] = "Jainism";
    Religion["SHINTO"] = "Shinto";
    Religion["TAOISM"] = "Taoism";
    Religion["CONFUCIANISM"] = "Confucianism";
    Religion["ZOROASTRIANISM"] = "Zoroastrianism";
    Religion["TRADITIONAL_AFRICAN"] = "Traditional African Religions";
    Religion["NATIVE_AMERICAN"] = "Native American Religions";
    Religion["RASTAFARIANISM"] = "Rastafarianism";
    Religion["WICCA"] = "Wicca";
    Religion["PAGANISM"] = "Paganism";
})(Religion || (exports.Religion = Religion = {}));
var Language;
(function (Language) {
    Language["MANDARIN_CHINESE"] = "Mandarin Chinese";
    Language["SPANISH"] = "Spanish";
    Language["ENGLISH"] = "English";
    Language["HINDI"] = "Hindi";
    Language["ARABIC"] = "Arabic";
    Language["BENGALI"] = "Bengali";
    Language["PORTUGUESE"] = "Portuguese";
    Language["RUSSIAN"] = "Russian";
    Language["JAPANESE"] = "Japanese";
    Language["PUNJABI"] = "Punjabi";
    Language["GERMAN"] = "German";
    Language["JAVANESE"] = "Javanese";
    Language["WU_CHINESE"] = "Wu Chinese";
    Language["TELUGU"] = "Telugu";
    Language["VIETNAMESE"] = "Vietnamese";
    Language["MARATHI"] = "Marathi";
    Language["FRENCH"] = "French";
    Language["KOREAN"] = "Korean";
    Language["TAMIL"] = "Tamil";
    Language["ITALIAN"] = "Italian";
    Language["TURKISH"] = "Turkish";
    Language["URDU"] = "Urdu";
    Language["GUJARATI"] = "Gujarati";
    Language["POLISH"] = "Polish";
    Language["UKRAINIAN"] = "Ukrainian";
    Language["PERSIAN"] = "Persian";
    Language["MALAY"] = "Malay";
    Language["KANNADA"] = "Kannada";
    Language["XIANG_CHINESE"] = "Xiang Chinese";
    Language["MALAYALAM"] = "Malayalam";
    Language["SUNDANESE"] = "Sundanese";
    Language["HAUSA"] = "Hausa";
    Language["ODIA"] = "Odia";
    Language["BURMESE"] = "Burmese";
    Language["HAKKA_CHINESE"] = "Hakka Chinese";
    Language["TAGALOG"] = "Tagalog/Filipino";
    Language["CANTONESE"] = "Yue Chinese/Cantonese";
    Language["THAI"] = "Thai";
    Language["SWAHILI"] = "Swahili";
    Language["ROMANIAN"] = "Romanian";
    Language["DUTCH"] = "Dutch";
    Language["KURDISH"] = "Kurdish";
    Language["YORUBA"] = "Yoruba";
    Language["AMHARIC"] = "Amharic";
    Language["INDONESIAN"] = "Indonesian";
    Language["GREEK"] = "Greek";
    Language["CZECH"] = "Czech";
    Language["SINDHI"] = "Sindhi";
    Language["UZBEK"] = "Uzbek";
    Language["HUNGARIAN"] = "Hungarian";
    Language["BELARUSIAN"] = "Belarusian";
    Language["HEBREW"] = "Hebrew";
    Language["AZERBAIJANI"] = "Azerbaijani";
    Language["SLOVAK"] = "Slovak";
    Language["BULGARIAN"] = "Bulgarian";
    Language["SERBIAN"] = "Serbian";
    Language["DANISH"] = "Danish";
    Language["FINNISH"] = "Finnish";
    Language["NORWEGIAN"] = "Norwegian";
    Language["SWEDISH"] = "Swedish";
    Language["CROATIAN"] = "Croatian";
    Language["LITHUANIAN"] = "Lithuanian";
    Language["SLOVENIAN"] = "Slovenian";
    Language["LATVIAN"] = "Latvian";
    Language["ESTONIAN"] = "Estonian";
    Language["GEORGIAN"] = "Georgian";
    Language["ARMENIAN"] = "Armenian";
    Language["ALBANIAN"] = "Albanian";
    Language["MONGOLIAN"] = "Mongolian";
    Language["KAZAKH"] = "Kazakh";
    Language["NEPALI"] = "Nepali";
    Language["ASSAMESE"] = "Assamese";
    Language["TIBETAN"] = "Tibetan";
    Language["KHMER"] = "Khmer";
    Language["LAO"] = "Lao";
    Language["PASHTO"] = "Pashto";
    Language["ZULU"] = "Zulu";
    Language["XHOSA"] = "Xhosa";
    Language["IGBO"] = "Igbo";
})(Language || (exports.Language = Language = {}));
var SettingsType;
(function (SettingsType) {
    SettingsType["allowed"] = "allowed";
    SettingsType["notAllowed"] = "not_allowed";
})(SettingsType || (exports.SettingsType = SettingsType = {}));
// Add these new enums after the existing ones
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["NEVER_MARRIED"] = "never_married";
    MaritalStatus["DIVORCED"] = "divorced";
    MaritalStatus["WIDOWED"] = "widowed";
    MaritalStatus["SEPARATED"] = "separated";
    MaritalStatus["ANNULLED"] = "annulled";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var Occupation;
(function (Occupation) {
    // Professional
    Occupation["DOCTOR"] = "doctor";
    Occupation["ENGINEER"] = "engineer";
    Occupation["LAWYER"] = "lawyer";
    Occupation["TEACHER"] = "teacher";
    Occupation["PROFESSOR"] = "professor";
    Occupation["ACCOUNTANT"] = "accountant";
    Occupation["ARCHITECT"] = "architect";
    Occupation["AGRICULTURIST"] = "agriculturist";
    Occupation["JOURNALIST"] = "journalist";
    Occupation["SCIENTIST"] = "scientist";
    Occupation["PSYCHOLOGIST"] = "psychologist";
    Occupation["SOCIAL_WORKER"] = "social_worker";
    Occupation["ECONOMIST"] = "economist";
    Occupation["STATISTICIAN"] = "statistician";
    Occupation["LIBRARIAN"] = "librarian";
    // Business
    Occupation["BUSINESS_OWNER"] = "business_owner";
    Occupation["ENTREPRENEUR"] = "entrepreneur";
    Occupation["SALES_MANAGER"] = "sales_manager";
    Occupation["MARKETING_MANAGER"] = "marketing_manager";
    Occupation["SUPPLY_CHAIN_MANAGER"] = "supply_chain_manager";
    Occupation["RETAILER"] = "retailer";
    Occupation["WHOLESALER"] = "wholesaler";
    Occupation["IMPORTER"] = "importer";
    Occupation["EXPORTER"] = "exporter";
    // Technology
    Occupation["SOFTWARE_ENGINEER"] = "software_engineer";
    Occupation["DATA_SCIENTIST"] = "data_scientist";
    Occupation["IT_PROFESSIONAL"] = "it_professional";
    Occupation["WEB_DEVELOPER"] = "web_developer";
    Occupation["MOBILE_APP_DEVELOPER"] = "mobile_app_developer";
    Occupation["NETWORK_ENGINEER"] = "network_engineer";
    Occupation["SYSTEMS_ADMINISTRATOR"] = "systems_administrator";
    Occupation["CYBERSECURITY_ANALYST"] = "cybersecurity_analyst";
    Occupation["DATABASE_ADMINISTRATOR"] = "database_administrator";
    // Healthcare
    Occupation["NURSE"] = "nurse";
    Occupation["PHARMACIST"] = "pharmacist";
    Occupation["DENTIST"] = "dentist";
    Occupation["MEDICAL_TECHNOLOGIST"] = "medical_technologist";
    Occupation["PHYSIOTHERAPIST"] = "physiotherapist";
    Occupation["OCCUPATIONAL_THERAPIST"] = "occupational_therapist";
    Occupation["PARAMEDIC"] = "paramedic";
    Occupation["HOMEOPATH"] = "homeopath";
    Occupation["AYURVEDIC_PRACTITIONER"] = "ayurvedic_practitioner";
    Occupation["UNANI_PRACTITIONER"] = "unani_practitioner";
    // Government
    Occupation["GOVERNMENT_EMPLOYEE"] = "government_employee";
    Occupation["POLICE_OFFICER"] = "police_officer";
    Occupation["MILITARY_PERSONNEL"] = "military_personnel";
    Occupation["ADMINISTRATIVE_OFFICER"] = "administrative_officer";
    Occupation["DIPLOMAT"] = "diplomat";
    Occupation["CIVIL_SERVANT"] = "civil_servant";
    Occupation["FOREST_OFFICER"] = "forest_officer";
    Occupation["FISHERIES_OFFICER"] = "fisheries_officer";
    // Finance
    Occupation["BANKER"] = "banker";
    Occupation["FINANCIAL_ANALYST"] = "financial_analyst";
    Occupation["INSURANCE_AGENT"] = "insurance_agent";
    Occupation["BROKER"] = "broker";
    Occupation["INVESTMENT_BANKER"] = "investment_banker";
    // Agriculture
    Occupation["FARMER"] = "farmer";
    Occupation["FISHERMAN"] = "fisherman";
    Occupation["POULTRY_FARMER"] = "poultry_farmer";
    Occupation["DAIRY_FARMER"] = "dairy_farmer";
    // Manufacturing
    Occupation["FACTORY_WORKER"] = "factory_worker";
    Occupation["PRODUCTION_MANAGER"] = "production_manager";
    Occupation["GARMENT_WORKER"] = "garment_worker";
    // Service
    Occupation["DRIVER"] = "driver";
    Occupation["WAITER"] = "waiter";
    Occupation["COOK"] = "cook";
    Occupation["CLEANER"] = "cleaner";
    Occupation["SECURITY_GUARD"] = "security_guard";
    Occupation["TOUR_GUIDE"] = "tour_guide";
    Occupation["HAIRDRESSER"] = "hairdresser";
    Occupation["BEAUTICIAN"] = "beautician";
    // Education
    Occupation["LECTURER"] = "lecturer";
    Occupation["SCHOOL_PRINCIPAL"] = "school_principal";
    Occupation["EDUCATION_ADMINISTRATOR"] = "education_administrator";
    Occupation["TUTOR"] = "tutor";
    // Arts and Culture
    Occupation["ARTIST"] = "artist";
    Occupation["MUSICIAN"] = "musician";
    Occupation["WRITER"] = "writer";
    Occupation["ACTOR"] = "actor";
    Occupation["FILMMAKER"] = "filmmaker";
    Occupation["DESIGNER"] = "designer";
    Occupation["PHOTOGRAPHER"] = "photographer";
    Occupation["DANCER"] = "dancer";
    // Non-Profit
    Occupation["NGO_WORKER"] = "ngo_worker";
    Occupation["CHARITY_WORKER"] = "charity_worker";
    Occupation["DEVELOPMENT_WORKER"] = "development_worker";
    // Others
    Occupation["STUDENT"] = "student";
    Occupation["SELF_EMPLOYED"] = "self_employed";
    Occupation["RETIRED"] = "retired";
    Occupation["HOMEMAKER"] = "homemaker";
    Occupation["UNEMPLOYED"] = "unemployed";
    Occupation["OTHER"] = "other";
    Occupation["DAILY_LABORER"] = "daily_laborer";
    Occupation["CONSTRUCTION_WORKER"] = "construction_worker";
})(Occupation || (exports.Occupation = Occupation = {}));
