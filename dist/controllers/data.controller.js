"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.giveLocationData = giveLocationData;
exports.giveLocationDataSync = giveLocationDataSync;
async function giveLocationData(filename) {
    let data = require(`../../data/${filename}.json`);
    return data;
}
function giveLocationDataSync(filename) {
    let data = require(`../../data/${filename}.json`);
    return data;
}
