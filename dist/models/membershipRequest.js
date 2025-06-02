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
exports.MembershipRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const memberdship_types_1 = require("../lib/types/memberdship.types");
const membershipRequestSchema = new mongoose_1.Schema({
    requestStatus: {
        type: String,
        enum: Object.values(memberdship_types_1.MembershipRequestStatus),
        default: memberdship_types_1.MembershipRequestStatus.PENDING,
        required: true
    },
    paymentInfo: {
        type: {
            transactionId: {
                type: String,
                required: true,
                trim: true,
                unique: false,
                index: false
            },
            amount: {
                type: Number,
                required: true,
                min: 0,
                validate: {
                    validator: Number.isInteger,
                    message: 'Amount must be a whole number'
                }
            },
            currency: {
                type: String,
                required: true,
                uppercase: true,
                minlength: 3,
                maxlength: 3,
                default: 'BDT'
            },
            paymentMethod: {
                type: String,
                enum: Object.values(memberdship_types_1.PaymentMethod), // Using the PaymentMethod enum
                required: true
            },
            paymentDate: {
                type: Date,
                required: true,
                default: Date.now
            },
            paidFrom: String
        },
        required: true
    },
    verifiedPhoneLimit: {
        type: Number,
        required: true,
        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Verified phone limit must be a whole number'
        }
    },
    verifiedPhoneViewed: {
        type: Number,
        default: 0,
        min: 0,
        validate: {
            validator: function (value) {
                return value <= this.verifiedPhoneLimit;
            },
            message: 'Viewed phones cannot exceed limit'
        }
    },
    hasProfileHighlighter: {
        type: Boolean,
        default: false
    },
    tier: {
        type: String,
        enum: Object.values(memberdship_types_1.MembershipTier),
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
    },
    adminNote: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    requestDate: {
        type: Date,
        required: true,
        default: Date.now,
        immutable: true
    },
    processedDate: {
        type: Date,
        validate: {
            validator: function (value) {
                return !value || value >= this.requestDate;
            },
            message: 'Processed date must be after request date'
        }
    },
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    requesterID: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
}, {
    timestamps: true
});
// Instance methods
membershipRequestSchema.methods.isActive = function () {
    const now = new Date();
    return (this.requestStatus === memberdship_types_1.MembershipRequestStatus.APPROVED &&
        now >= this.startDate &&
        now <= this.endDate);
};
membershipRequestSchema.methods.hasVerifiedPhonesRemaining = function () {
    return this.verifiedPhoneViewed < this.verifiedPhoneLimit;
};
membershipRequestSchema.methods.canBeProcessed = function () {
    return this.requestStatus === memberdship_types_1.MembershipRequestStatus.PENDING;
};
membershipRequestSchema.methods.approve = function (adminId) {
    if (!this.canBeProcessed()) {
        throw new Error('Request cannot be processed');
    }
    this.requestStatus = memberdship_types_1.MembershipRequestStatus.APPROVED;
    this.processedDate = new Date();
    this.processedBy = adminId;
};
membershipRequestSchema.methods.reject = function (adminId, note) {
    if (!this.canBeProcessed()) {
        throw new Error('Request cannot be processed');
    }
    this.requestStatus = memberdship_types_1.MembershipRequestStatus.REJECTED;
    this.processedDate = new Date();
    this.processedBy = adminId;
    if (note) {
        this.adminNote = note;
    }
};
membershipRequestSchema.methods.cancel = function () {
    if (this.requestStatus !== memberdship_types_1.MembershipRequestStatus.PENDING) {
        throw new Error('Only pending requests can be cancelled');
    }
    this.requestStatus = memberdship_types_1.MembershipRequestStatus.CANCELLED;
};
membershipRequestSchema.methods.useVerifiedPhone = async function () {
    if (!this.isActive() || !this.hasVerifiedPhonesRemaining()) {
        return false;
    }
    this.verifiedPhoneViewed += 1;
    this.save();
    return true;
};
exports.MembershipRequest = mongoose_1.default.model('MembershipRequest', membershipRequestSchema);
