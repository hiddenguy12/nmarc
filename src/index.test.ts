/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { randomUUID } from "node:crypto";
import { connectDB } from "./config/connectDB";
import { User } from "./models/user";

async function main() {
    try {
        await connectDB();

       let user =await User.updateMany({} , { createdAt : Date.now() }).limit(1000);
    } catch (error) {
        console.error(error);
    }
}
main()