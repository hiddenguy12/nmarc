"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDistance = getDistance;
exports.findNearestDistricts = findNearestDistricts;
exports.searchHeightGenerator = searchHeightGenerator;
exports.getBaseSearchQuery = getBaseSearchQuery;
exports.getUserWithCountryFlagsEmoji = getUserWithCountryFlagsEmoji;
exports.getUserDataFromRequest = getUserDataFromRequest;
exports.shuffleArray = shuffleArray;
const districts_1 = require("../lib/data/districts");
const CountryAndFlags_1 = __importDefault(require("../lib/data/CountryAndFlags"));
const env_1 = require("../config/env");
// --------------------- Distance Utility ---------------------
function getDistance(lat1, lon1, lat2, lon2) {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
// --------------------- Nearest Districts ---------------------
function findNearestDistricts(lat, lon, count = 5) {
    return districts_1.Districts
        .map((district) => ({
        ...district,
        distance: getDistance(lat, lon, district.lat, district.long),
    }))
        .slice(0, count);
}
// --------------------- Search Height Range ---------------------
function searchHeightGenerator(min, max) {
    const heights = [];
    for (let foot = min; foot <= max; foot++) {
        for (let inc = 0; inc <= 11; inc++) {
            heights.push(`${foot} foot ${inc} inch`);
        }
    }
    return heights;
}
// --------------------- Base Query ---------------------
function getBaseSearchQuery(userData) {
    return {
        _id: { $ne: userData.userId },
        gender: { $ne: userData.gender },
    };
}
// --------------------- Add Country Flags ---------------------
function getUserWithCountryFlagsEmoji(UserList) {
    return UserList.map(element => {
        element['lag'] = env_1.BASE_URL + (CountryAndFlags_1.default.find(country => country.name === element.location.country)?.flag ||
            "/static/flags/other-country.png");
        return element;
    });
}
function getUserDataFromRequest(req) {
    if (req.profileType === 'videoProfile' && req.videoProfile) {
        const user = req.videoProfile;
        return {
            gender: user.gender,
            languages: user.languages
        };
    }
    if (req.profileType === 'matrimony_profile' && req.authSession?.value) {
        const user = req.authSession.value;
        return {
            gender: user.gender,
            languages: user.languages
        };
    }
    throw new Error("Failed to get User Data from Request");
}
// --------------------- Shuffle Array ---------------------
function shuffleArray(array) {
    if (!array)
        return [];
    let currentIndex = array.length;
    const newArray = [];
    while (currentIndex !== 0) {
        const randomIndex = Math.floor(Math.random() * currentIndex);
        newArray.push(array[randomIndex]);
        array = array.filter((_, i) => i !== randomIndex);
        currentIndex = array.length;
    }
    return newArray;
}
