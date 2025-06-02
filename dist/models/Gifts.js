"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
let schema = new mongoose_1.Schema({
    name: {
        type: String,
        required: false
    },
    image: {
        id: String,
        url: String
    },
    coins: Number,
}, { timestamps: true });
const Gifts = (0, mongoose_1.model)('Gift', schema);
exports.default = Gifts;
