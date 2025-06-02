/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */


import mongoose, { Schema } from 'mongoose';
import { User } from './user';


// Define the connection request status enum
export enum ConnectionRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn'
}

// Interface for the connection request document
export interface IConnectionRequest extends mongoose.Document {
    sender: mongoose.Types.ObjectId;
    recipient: mongoose.Types.ObjectId;
    status: ConnectionRequestStatus;
    initialMessage?: string;
    createdAt: Date;
    updatedAt: Date;
    acceptedAt?: Date;
    rejectedAt?: Date;
    withdrawnAt?: Date;
    rejectionReason ?: string;
    // Methods
    accept(): Promise<IConnectionRequest>;
    reject(reason?: string): Promise<IConnectionRequest>;
    withdraw(): Promise<IConnectionRequest>;
    getStatus(): ConnectionRequestStatus;
}

interface IConnectionRequestMethods {
    getConnectionStatus () : {
        status : 'connected' |  'outgoing_request' |  'incoming_request' |  'not_connected' ,
        since : Date
    }
}
// Schema for connection request
const connectionRequestSchema = new Schema<IConnectionRequest ,IConnectionRequestMethods>({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    recipient: {
        type: Schema.Types.ObjectId,
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
    rejectionReason : {
        type: String,
        trim: true
    }
});


// Compound index to ensure one active request between users
connectionRequestSchema.index({ sender: 1, recipient: 1, status: 1 }, { unique: true, partialFilterExpression: { status: 'pending' } });

// Methods
connectionRequestSchema.methods.accept = async function(): Promise<IConnectionRequest> {
    this.status = ConnectionRequestStatus.ACCEPTED;
    this.acceptedAt = new Date();
    this.updatedAt = new Date();
    return this.save();
};

connectionRequestSchema.methods.reject = async function(reason?: string): Promise<IConnectionRequest> {
    this.status = ConnectionRequestStatus.REJECTED;
    this.rejectedAt = new Date();
    this.updatedAt = new Date();
    if (reason) {
        this.rejectionReason = reason;
    }
    return this.save();
};

connectionRequestSchema.methods.withdraw = async function(): Promise<IConnectionRequest> {
    this.status = ConnectionRequestStatus.WITHDRAWN;
    this.withdrawnAt = new Date();
    this.updatedAt = new Date();
    return this.save();
};

connectionRequestSchema.methods.getStatus = function(): ConnectionRequestStatus {
    return this.status;
};

// Pre-save middleware to update the updatedAt timestamp
connectionRequestSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

export const ConnectionRequest = mongoose.model<IConnectionRequest>('ConnectionRequest', connectionRequestSchema);