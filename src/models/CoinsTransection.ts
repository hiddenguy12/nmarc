/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId; 
  amount: string;                  
  currency: string;                
  package : string;
  paymentMethod?: string;          
  
  transactionId?: string;          
  status: 'pending' | 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  coins : number;
  admin_note : string;
  paying_phone_number : string;
}

const TransactionSchema: Schema<ITransaction> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'VideoProfile', required: true },
    amount: { type: String, required: true },
    currency: { type: String, default: 'USD' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    package : {type : String , required : true , enum : ['package_1', 'package_2', 'package_3', 'package_4'] },
    status: {
      type: String,
      enum: ['pending', 'success', 'failed'],
      default: 'pending'
    },
    coins : Number , 
    paying_phone_number : String,
    admin_note : String
  },
  { timestamps: true }
);

export default mongoose.model<ITransaction>('CoinsTransection', TransactionSchema);
