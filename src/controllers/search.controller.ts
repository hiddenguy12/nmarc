/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { IDistrict } from '../lib/types/location.types';
import { Districts } from '../lib/data/districts';
import { IAuthSession, IAuthSessionValue } from '../models/AuthSession';
import countryFlagsEmoji from '../lib/data/CountryAndFlags';
import { BASE_URL } from '../config/env';
import { IVideoProfile } from '../models/VideoProfile';
import { Gender } from '../lib/types/user.types';
import { Request } from 'express';


// --------------------- Distance Utility ---------------------
export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// --------------------- Nearest Districts ---------------------
export function findNearestDistricts(lat: number, lon: number, count = 5): IDistrict[] {
  return Districts
    .map((district) => ({
      ...district,
      distance: getDistance(lat, lon, district.lat, district.long),
    }))
    .slice(0, count);
}

// --------------------- Search Height Range ---------------------
export function searchHeightGenerator(min: number, max: number): string[] {
  const heights: string[] = [];
  for (let foot = min; foot <= max; foot++) {
    for (let inc = 0; inc <= 11; inc++) {
      heights.push(`${foot} foot ${inc} inch`);
    }
  }
  return heights;
}

// --------------------- Base Query ---------------------
export function getBaseSearchQuery(userData: IAuthSession['value']) {
  return {
    _id: { $ne: userData.userId },
    gender: { $ne: userData.gender },
  };
}

// --------------------- Add Country Flags ---------------------
export function getUserWithCountryFlagsEmoji(UserList: any[]) {
  return UserList.map(element => {
    element['lag'] = BASE_URL + (
      countryFlagsEmoji.find(country => country.name === element.location.country)?.flag ||
      "/static/flags/other-country.png"
    );
    return element;
  });
}

// --------------------- Get User Data from Request ---------------------
interface IUserData {
  gender: string;
  languages: string[];
}

export function getUserDataFromRequest(req: Request): IUserData | never {
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
export function shuffleArray<T>(array: T[] | null | undefined): T[] {
  if (!array) return [];

  let currentIndex = array.length;
  const newArray: T[] = [];

  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    newArray.push(array[randomIndex]);
    array = array.filter((_, i) => i !== randomIndex);
    currentIndex = array.length;
  }

  return newArray;
}
