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
exports.Asset = exports.AssetType = void 0;
const crypto_1 = require("crypto");
const mongoose_1 = __importStar(require("mongoose"));
var AssetType;
(function (AssetType) {
    AssetType["IMAGE"] = "image";
    AssetType["VIDEO"] = "video";
    AssetType["DOCUMENT"] = "document";
    AssetType["AUDIO"] = "audio";
})(AssetType || (exports.AssetType = AssetType = {}));
const UploadInfoSchema = new mongoose_1.Schema({
    host: {
        type: String,
        required: [true, 'Host service name is required'],
        trim: true
    },
    host_id: {
        type: String,
        required: [true, 'Host ID is required'],
        trim: true
    },
    path: {
        type: String,
        required: false,
        trim: true
    }
}, { _id: false }); // Disable _id for subdocument
const AssetSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        index: true,
        unique: true,
        immutable: true,
        default: crypto_1.randomUUID
    },
    name: {
        type: String,
        required: false,
        trim: true,
    },
    url: {
        type: String,
        required: [true, 'Asset URL is required'],
        unique: true,
        trim: true
    },
    asset_type: {
        type: String,
        enum: Object.values(AssetType),
        required: [true, 'Asset type is required'],
    },
    size: {
        type: Number,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Size must be an integer'
        }
    },
    uploadInfo: {
        type: UploadInfoSchema,
        required: [true, 'Upload information is required']
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    }
});
exports.Asset = mongoose_1.default.model('Asset', AssetSchema);
