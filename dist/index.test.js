"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
const connectDB_1 = require("./config/connectDB");
const user_1 = require("./models/user");
async function main() {
    try {
        await (0, connectDB_1.connectDB)();
        let user = await user_1.User.updateMany({}, { createdAt: Date.now() }).limit(1000);
    }
    catch (error) {
        console.error(error);
    }
}
main();
