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
exports.ConnectionRequest = exports.ConnectionRequestStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Define the connection request status enum
var ConnectionRequestStatus;
(function (ConnectionRequestStatus) {
    ConnectionRequestStatus["PENDING"] = "pending";
    ConnectionRequestStatus["ACCEPTED"] = "accepted";
    ConnectionRequestStatus["REJECTED"] = "rejected";
    ConnectionRequestStatus["WITHDRAWN"] = "withdrawn";
})(ConnectionRequestStatus || (exports.ConnectionRequestStatus = ConnectionRequestStatus = {}));
// Schema for connection request
const connectionRequestSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recipient: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: Object.values(ConnectionRequestStatus),
        default: ConnectionRequestStatus.PENDING,
        required: true,
        index: true
    },
    initialMessage: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: {
        type: Date
    },
    rejectedAt: {
        type: Date
    },
    withdrawnAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        trim: true
    }
});
// Compound index to ensure one active request between users
connectionRequestSchema.index({ sender: 1, recipient: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });
// Methods
connectionRequestSchema.methods.accept = async function () {
    this.status = ConnectionRequestStatus.ACCEPTED;
    this.acceptedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
};
connectionRequestSchema.methods.reject = async function (reason) {
    this.status = ConnectionRequestStatus.REJECTED;
    this.rejectedAt = new Date();
    this.updatedAt = new Date();
    if (reason) {
        this.rejectionReason = reason;
    }
    return this.save();
};
connectionRequestSchema.methods.withdraw = async function () {
    this.status = ConnectionRequestStatus.WITHDRAWN;
    this.withdrawnAt = new Date();
    this.updatedAt = new Date();
    return this.save();
};
connectionRequestSchema.methods.getStatus = function () {
    return this.status;
};
// Pre-save middleware to update the updatedAt timestamp
connectionRequestSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.ConnectionRequest = mongoose_1.default.model('ConnectionRequest', connectionRequestSchema);
