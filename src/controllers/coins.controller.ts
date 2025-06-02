/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { readFileSync } from "fs";
import path from "path";


export interface PackageInfo {
    name: string;
    price: string;
    coins: string;
}

export interface CoinPackages {
    [packageId: string]: PackageInfo;
}


export default function giveCoinPackageDetails(package_id : string) {
    let coinPackages: CoinPackages = JSON.parse(
        readFileSync(path.join(__dirname, '../../data/coin.packages.json'), 'utf-8')
    );
    return coinPackages[package_id];
}

