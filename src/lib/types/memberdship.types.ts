/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose from "mongoose";

// Enum for membership types
export enum MembershipTier {
    GOLD = 'GOLD',
    DIAMOND = 'DIAMOND',
    PLATINUM = 'PLATINUM'
}

// Enum for membership durations
export enum MembershipDuration {
    THREE_MONTHS = 3,
    SIX_MONTHS = 6,
    TWELVE_MONTHS = 12
}
export enum PaymentMethod {
    BKASH = 'Bkash',
    NAGAD = 'Nagad',
    ROCKET = 'Rocket',
}


export enum MembershipRequestStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled'

}

export interface IMembershipRequest {
    requestStatus: MembershipRequestStatus;
    paymentInfo: {
        transactionId: string;
        amount: number;
        currency: string;
        paymentDate: Date;
        paymentMethod: PaymentMethod; // Updated to use the enum
        verificationImage?: {
            url: string;
            id: string;
        };
        paidFrom : string
       
    };
    verifiedPhoneLimit: number;
    verifiedPhoneViewed: number;
    hasProfileHighlighter: boolean;
    tier: MembershipTier;
    duration: MembershipDuration;
    startDate: Date;
    endDate: Date;
    adminNote?: string;
    requestDate: Date;
    processedDate?: Date;
    processedBy?: mongoose.Types.ObjectId;
    requesterID: mongoose.Types.ObjectId;
    cancel() : void;
    useVerifiedPhone(): Promise<boolean>;
    hasVerifiedPhonesRemaining() :boolean;
    isActive() :boolean;
}
