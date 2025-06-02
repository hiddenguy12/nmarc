/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Schema, model, Document, Types } from 'mongoose';

export type CoinExpenseItemType = 'video_call' | 'gift';

export interface ICoinExpense extends Document {
  userId: Types.ObjectId;
  coins: number;
  expense_type: CoinExpenseItemType;
  expending_date: Date;
}

const coinExpenseSchema = new Schema<ICoinExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'VideoProfile',
    required: true,
  },
  coins: {
    type: Number,
    required: true,
    min: 1,
  },
  expense_type: {
    type: String,
    enum: ['video_call', 'gift'],
    required: true,
  },
  expending_date: {
    type: Date,
    default: Date.now,
  },
});

export const CoinExpense = model<ICoinExpense>('CoinExpense', coinExpenseSchema);
