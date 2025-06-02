"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const admin = __importStar(require("firebase-admin"));
const path_1 = __importDefault(require("path"));
class FirebaseAdmin {
    static instance;
    initialized = false;
    constructor() {
        this.initializeApp();
    }
    initializeApp() {
        try {
            if (!this.initialized) {
                // Using service account credentials JSON file
                const serviceAccount = require(path_1.default.join(__dirname, '../../firebase-service-account.json'));
                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount),
                    // Add other configurations if needed
                });
                this.initialized = true;
                console.log('Firebase Admin initialized successfully');
            }
        }
        catch (error) {
            console.error('Firebase Admin initialization error:', error);
            throw error;
        }
    }
    static getInstance() {
        if (!FirebaseAdmin.instance) {
            FirebaseAdmin.instance = new FirebaseAdmin();
        }
        return FirebaseAdmin.instance;
    }
    getMessaging() {
        return admin.messaging();
    }
}
function getFireBaseAdmin() {
    return FirebaseAdmin.getInstance();
}
exports.default = getFireBaseAdmin;
