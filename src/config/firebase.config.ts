/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import * as admin from 'firebase-admin';
import path from 'path';

class FirebaseAdmin {
    private static instance: FirebaseAdmin;
    private initialized: boolean = false;

    private constructor() {
        this.initializeApp();
    }

    private initializeApp(): void {
        try {
            if (!this.initialized) {
                // Using service account credentials JSON file
                const serviceAccount = require(path.join(__dirname, '../../firebase-service-account.json'));
                
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    // Add other configurations if needed
                });
                
                this.initialized = true;
                console.log('Firebase Admin initialized successfully');
            }
        } catch (error) {
            console.error('Firebase Admin initialization error:', error);
            throw error;
        }
    }

    public static getInstance(): FirebaseAdmin {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
        }
        return FirebaseAdmin.instance;
    }

    public getMessaging(): admin.messaging.Messaging {
        return admin.messaging();
    }
}

function getFireBaseAdmin() {
    return FirebaseAdmin.getInstance()
}


export default getFireBaseAdmin;