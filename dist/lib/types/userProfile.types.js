"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPermissionType = exports.FoodTypes = exports.MusicTypes = exports.Hobbies = exports.Sports = exports.BadHabits = exports.ReligiousBranch = exports.PhysicalStatus = void 0;
var PhysicalStatus;
(function (PhysicalStatus) {
    PhysicalStatus["NORMAL"] = "normal";
    PhysicalStatus["PHYSICALLY_CHALLENGED"] = "physically_challenged";
    PhysicalStatus["HEARING_IMPAIRED"] = "hearing_impaired";
    PhysicalStatus["VISUALLY_IMPAIRED"] = "visually_impaired";
    PhysicalStatus["SPEECH_IMPAIRED"] = "speech_impaired";
    PhysicalStatus["OTHER"] = "other";
})(PhysicalStatus || (exports.PhysicalStatus = PhysicalStatus = {}));
var ReligiousBranch;
(function (ReligiousBranch) {
    // Islamic Branches
    ReligiousBranch["SUNNI"] = "sunni";
    ReligiousBranch["SHIA"] = "shia";
    ReligiousBranch["AHLE_HADITH"] = "ahle_hadith";
    ReligiousBranch["SUFI"] = "sufi";
    // Hindu Branches
    ReligiousBranch["SHAIVISM"] = "shaivism";
    ReligiousBranch["VAISHNAVISM"] = "vaishnavism";
    ReligiousBranch["SHAKTISM"] = "shaktism";
    ReligiousBranch["SMARTISM"] = "smartism";
    // Buddhist Branches
    ReligiousBranch["THERAVADA"] = "theravada";
    ReligiousBranch["MAHAYANA"] = "mahayana";
    // Christian Branches
    ReligiousBranch["CATHOLIC"] = "catholic";
    ReligiousBranch["PROTESTANT"] = "protestant";
    ReligiousBranch["ORTHODOX"] = "orthodox";
    // Other
    ReligiousBranch["OTHER"] = "other";
    ReligiousBranch["PREFER_NOT_TO_SAY"] = "prefer_not_to_say";
})(ReligiousBranch || (exports.ReligiousBranch = ReligiousBranch = {}));
var BadHabits;
(function (BadHabits) {
    BadHabits["SMOKING"] = "smoking";
    BadHabits["DRINKING"] = "drinking";
    BadHabits["DRUG_ADDICTION"] = "drug_addiction";
    BadHabits["OVER_EATING"] = "over_eating";
    BadHabits["NONE"] = "none";
})(BadHabits || (exports.BadHabits = BadHabits = {}));
var Sports;
(function (Sports) {
    Sports["CRICKET"] = "cricket";
    Sports["FOOTBALL"] = "football";
    Sports["BASKETBALL"] = "basketball";
    Sports["VOLLEYBALL"] = "volleyball";
    Sports["TENNIS"] = "tennis";
    Sports["BADMINTON"] = "badminton";
    Sports["TABLE_TENNIS"] = "table_tennis";
    Sports["SWIMMING"] = "swimming";
    Sports["CHESS"] = "chess";
    Sports["CARROM"] = "carrom";
    Sports["HOCKEY"] = "hockey";
    Sports["KABADDI"] = "kabaddi";
    Sports["OTHER"] = "other";
})(Sports || (exports.Sports = Sports = {}));
var Hobbies;
(function (Hobbies) {
    Hobbies["READING"] = "reading";
    Hobbies["WRITING"] = "writing";
    Hobbies["PAINTING"] = "painting";
    Hobbies["COOKING"] = "cooking";
    Hobbies["GARDENING"] = "gardening";
    Hobbies["PHOTOGRAPHY"] = "photography";
    Hobbies["TRAVELING"] = "traveling";
    Hobbies["SINGING"] = "singing";
    Hobbies["DANCING"] = "dancing";
    Hobbies["DRAWING"] = "drawing";
    Hobbies["CRAFTING"] = "crafting";
    Hobbies["COLLECTING"] = "collecting";
    Hobbies["GAMING"] = "gaming";
    Hobbies["BLOGGING"] = "blogging";
    Hobbies["VLOGGING"] = "vlogging";
    Hobbies["OTHER"] = "other";
})(Hobbies || (exports.Hobbies = Hobbies = {}));
var MusicTypes;
(function (MusicTypes) {
    MusicTypes["CLASSICAL"] = "classical";
    MusicTypes["POP"] = "pop";
    MusicTypes["ROCK"] = "rock";
    MusicTypes["JAZZ"] = "jazz";
    MusicTypes["BLUES"] = "blues";
    MusicTypes["COUNTRY"] = "country";
    MusicTypes["FOLK"] = "folk";
    MusicTypes["RELIGIOUS"] = "religious";
    MusicTypes["RAP"] = "rap";
    MusicTypes["OTHER"] = "other";
})(MusicTypes || (exports.MusicTypes = MusicTypes = {}));
var FoodTypes;
(function (FoodTypes) {
    FoodTypes["VEGETARIAN"] = "vegetarian";
    FoodTypes["NON_VEGETARIAN"] = "non_vegetarian";
    FoodTypes["VEGAN"] = "vegan";
    FoodTypes["HALAL"] = "halal";
    FoodTypes["KOSHER"] = "kosher";
    FoodTypes["ALL"] = "all";
})(FoodTypes || (exports.FoodTypes = FoodTypes = {}));
var SettingsPermissionType;
(function (SettingsPermissionType) {
    SettingsPermissionType["EVERYONE"] = "everyone";
    SettingsPermissionType["NONE"] = "none";
    SettingsPermissionType["PREMIUM_USERS"] = "premium_users";
    SettingsPermissionType["CONNECTED_USERS"] = "connected_users";
})(SettingsPermissionType || (exports.SettingsPermissionType = SettingsPermissionType = {}));
