/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose from "mongoose";
import { log } from "console";
import { MONGO_DB_URL, MONGO_DB_URL2 } from "./env";

export async function connectDB() { 
    if (!MONGO_DB_URL2) throw new Error("You have not added mongo db url in env files error as geting Undefined in MONGO_DB_URL");
    await mongoose.connect(MONGO_DB_URL2 )
    .then(e => log('Database Connected Alhamdulillah....'))
    .catch(error => console.error(error)) 
}