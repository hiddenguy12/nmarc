"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
const console_1 = require("console");
const env_1 = require("./env");
async function connectDB() {
    if (!env_1.MONGO_DB_URL2)
        throw new Error("You have not added mongo db url in env files error as geting Undefined in MONGO_DB_URL");
    await mongoose_1.default.connect(env_1.MONGO_DB_URL2)
        .then(e => (0, console_1.log)('Database Connected Alhamdulillah....'))
        .catch(error => console.error(error));
}
