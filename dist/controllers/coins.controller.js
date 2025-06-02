"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = giveCoinPackageDetails;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function giveCoinPackageDetails(package_id) {
    let coinPackages = JSON.parse((0, fs_1.readFileSync)(path_1.default.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
    return coinPackages[package_id];
}
