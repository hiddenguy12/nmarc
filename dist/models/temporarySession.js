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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporarySessionNames = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var TemporarySessionNames;
(function (TemporarySessionNames) {
    TemporarySessionNames["FORGET_PASSWORD_SESSION"] = "forget_password_session";
    TemporarySessionNames["REGISTRATION_SESSION"] = "registration_session";
    TemporarySessionNames["VIDEO_PROFILE_REGISTATION"] = "video_profile_regirstation_session";
    TemporarySessionNames["VIDEO_PROFILE_FORGET_PASSWORD"] = "video_profile_forget_password";
})(TemporarySessionNames || (exports.TemporarySessionNames = TemporarySessionNames = {}));
let temporarySessionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        enum: Object.values(TemporarySessionNames)
    },
    key: {
        type: String,
        required: false,
    },
    value: {
        type: String,
        required: true,
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
temporarySessionSchema.index({ created_at: 1 }, { expireAfterSeconds: 600 });
// The temporary session will automatically be deleted after 600 seconds of creation
const TemporarySession = mongoose_1.default.model('TemporarySession', temporarySessionSchema);
exports.default = TemporarySession;
