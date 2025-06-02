/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import mongoose, { Schema } from 'mongoose';

export interface ISearchHistory extends Document {
    userId: mongoose.Types.ObjectId;
    searchQuery: {
        languages?: string[];
        division_ids?: string[];
        isEducated?: boolean;
        minWeight?: number;
        maxWeight?: number;
        minHeight?: number;
        maxHeight?: number;
        minAge?: number;
        maxAge?: number;
        maritalStatuses?: string[];
        occupations?: string[];
        minAnnualIncome?: number;
        maxAnnualIncome?: number;
    };
    title : string;
    savedAt : Date

}

const searchHistorySchema = new Schema<ISearchHistory>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title :{
        type :String ,
        required : true,
        trim: true , 
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
    savedAt  : {
        type : Date , 
        default : Date.now,
        required : true,
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

export const SearchHistory = mongoose.model<ISearchHistory>('SearchHistory', searchHistorySchema);