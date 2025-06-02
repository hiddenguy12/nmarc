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
exports.SearchHistory = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const searchHistorySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    searchQuery: {
        religion: String,
        languages: [String],
        countries: [String],
        division_ids: [String],
        isEducated: Boolean,
        minWeight: Number,
        maxWeight: Number,
        minHeight: Number,
        maxHeight: Number,
        minAge: Number,
        maxAge: Number,
        maritalStatuses: [String],
        occupations: [String],
        minAnnualIncome: Number,
        maxAnnualIncome: Number,
        incomeCurrency: String
    },
    savedAt: {
        type: Date,
        default: Date.now,
        required: true,
    }
}, {
    timestamps: false
});
// Indexes for better query performance
searchHistorySchema.index({ searchedAt: -1 });
searchHistorySchema.index({ userId: 1, searchedAt: -1 });
// Compound index for efficient filtering
searchHistorySchema.index({
    userId: 1,
    'searchQuery.religion': 1,
    'searchQuery.countries': 1
});
exports.SearchHistory = mongoose_1.default.model('SearchHistory', searchHistorySchema);
