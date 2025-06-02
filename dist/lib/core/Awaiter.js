"use strict";
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah
*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Awaiter;
async function Awaiter(time = 1000) {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true);
        }, time);
    });
    return;
}
