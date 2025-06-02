"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = sendNotification;
exports.sendNotifications = sendNotifications;
async function sendNotification(token, { data, title, body }) {
    try {
        // let getFireBaseAdmin = require("../../config/firebase.config");
        // let firebaseAdmin = getFireBaseAdmin()
        // const message = {
        //     token,
        //     notification: { title , body },
        //     data,
        //   };
        // await firebaseAdmin.getMessaging().send(message);
        return true;
    }
    catch (error) {
        console.error(`[Firebase Messaging error]`, error);
        return false;
    }
}
async function sendNotifications(tokens, { data, title, body }) {
    // try {
    //     let getFireBaseAdmin = require("../../config/firebase.config");
    //     let firebaseAdmin = getFireBaseAdmin();
    //     const message = {
    //         tokens,
    //         notification: { title, body },
    //         data,
    //     };
    //     const response = await firebaseAdmin.getMessaging().sendEachForMulticast(message);
    //     return [true, response];
    // } catch (error) {
    // console.error(`[Firebase Messaging error]`, error);
    return [false, undefined];
    // }
}
