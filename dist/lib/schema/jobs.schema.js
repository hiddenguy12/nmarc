"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOnlineStatusSchema = void 0;
const zod_1 = require("zod");
exports.updateOnlineStatusSchema = zod_1.z.object({
    secret: zod_1.z.string().trim().min(1024).max(1024)
});
