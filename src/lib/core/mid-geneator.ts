/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import countryCodeObjects from "../data/countryCodeObjects";

export default function generateMatrimonyId( digit: number = 2): string {
    const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const chr = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ];

    let mid = `MBD`;
    for (let i = 0; i < digit; i++) {
        mid += nums[Math.floor(Math.random() * nums.length)];
        mid += nums[Math.floor(Math.random() * nums.length)];
        mid += nums[Math.floor(Math.random() * nums.length)];
        mid += chr[Math.floor(Math.random() * chr.length)];
    }
    return mid;
}