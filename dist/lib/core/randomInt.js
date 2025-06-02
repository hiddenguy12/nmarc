"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomIntFromArray = exports.randomDataFromArray = void 0;
const randomDataFromArray = (arr) => arr[~~(arr.length * Math.random())];
exports.randomDataFromArray = randomDataFromArray;
const randomIntFromArray = (arr) => arr[~~(arr.length * Math.random())];
exports.randomIntFromArray = randomIntFromArray;
