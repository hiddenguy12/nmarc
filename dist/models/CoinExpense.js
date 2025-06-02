"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinExpense = void 0;
const mongoose_1 = require("mongoose");
const coinExpenseSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
exports.CoinExpense = (0, mongoose_1.model)('CoinExpense', coinExpenseSchema);
