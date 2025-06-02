/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema } from 'mongoose';
import { IMembershipRequest, MembershipTier, MembershipRequestStatus, PaymentMethod } from '../lib/types/memberdship.types';

const membershipRequestSchema = new Schema<IMembershipRequest>({
    requestStatus: {
        type: String,
        enum: Object.values(MembershipRequestStatus),
        default: MembershipRequestStatus.PENDING,
        required: true
    },
    paymentInfo: {
        type: {
            transactionId: {
                type: String,
                required: true,
                trim: true,
                unique : false,
                index : false

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
                enum: Object.values(PaymentMethod),  // Using the PaymentMethod enum
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
            validator: function (this: IMembershipRequest, value: number) {
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
        enum: Object.values(MembershipTier),
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
            validator: function (this: IMembershipRequest, value: Date) {
                return !value || value >= this.requestDate;
            },
            message: 'Processed date must be after request date'
        }
    },
    processedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    requesterID: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }
},
    {
        timestamps: true
    }
);




// Instance methods
membershipRequestSchema.methods.isActive = function (): boolean {
    const now = new Date();
    return (
        this.requestStatus === MembershipRequestStatus.APPROVED &&
        now >= this.startDate &&
        now <= this.endDate
    );
};

membershipRequestSchema.methods.hasVerifiedPhonesRemaining = function (): boolean {
    return this.verifiedPhoneViewed < this.verifiedPhoneLimit;
};

membershipRequestSchema.methods.canBeProcessed = function (): boolean {
    return this.requestStatus === MembershipRequestStatus.PENDING;
};

membershipRequestSchema.methods.approve = function (adminId: mongoose.Types.ObjectId): void {
    if (!this.canBeProcessed()) {
        throw new Error('Request cannot be processed');
    }
    this.requestStatus = MembershipRequestStatus.APPROVED;
    this.processedDate = new Date();
    this.processedBy = adminId;
};

membershipRequestSchema.methods.reject = function (adminId: mongoose.Types.ObjectId, note?: string): void {
    if (!this.canBeProcessed()) {
        throw new Error('Request cannot be processed');
    }
    this.requestStatus = MembershipRequestStatus.REJECTED;
    this.processedDate = new Date();
    this.processedBy = adminId;
    if (note) {
        this.adminNote = note;
    }
};

membershipRequestSchema.methods.cancel = function (): void {
    if (this.requestStatus !== MembershipRequestStatus.PENDING) {
        throw new Error('Only pending requests can be cancelled');
    }
    this.requestStatus = MembershipRequestStatus.CANCELLED;
};

membershipRequestSchema.methods.useVerifiedPhone = async function (): Promise<boolean> {
    if (!this.isActive() || !this.hasVerifiedPhonesRemaining()) {
        return false;
    }
    this.verifiedPhoneViewed += 1;
    this.save();
    return true;
};


export const MembershipRequest = mongoose.model<IMembershipRequest>('MembershipRequest', membershipRequestSchema);