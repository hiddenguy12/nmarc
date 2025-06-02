/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */





export interface NotificationPayload {
    title: string;
    body: string;
    imageUrl?: string;
    data?: Record<string, string>;
}



export async function sendNotification(token:string ,{data , title , body}:NotificationPayload ) :Promise<boolean> {
    try {
        // let getFireBaseAdmin = require("../../config/firebase.config");
        // let firebaseAdmin = getFireBaseAdmin()
        // const message = {
        //     token,
        //     notification: { title , body },
        //     data,
        //   };
        // await firebaseAdmin.getMessaging().send(message);
        return true  ;  
    } catch (error) {
        console.error(`[Firebase Messaging error]` , error); 
        
         return false;
    }
}

export async function sendNotifications(tokens: string[], { data, title, body }: NotificationPayload): Promise<[boolean, any]> {
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
