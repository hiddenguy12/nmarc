"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAssetSchema = exports.createImageAssetSchema = void 0;
const zod_1 = require("zod");
const asset_1 = require("../../models/asset");
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
exports.createImageAssetSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Asset name is required')
        .max(255, 'Asset name too long')
        .refine(name => /^[^\\/:*?"<>|]+$/.test(name), {
        message: 'Asset name contains invalid characters'
    }),
    asset_type: zod_1.z.enum([asset_1.AssetType.IMAGE, asset_1.AssetType.VIDEO, asset_1.AssetType.DOCUMENT, asset_1.AssetType.AUDIO]),
    file: zod_1.z.object({
        size: zod_1.z.number()
            .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
        mimetype: zod_1.z.enum(ACCEPTED_IMAGE_TYPES, {
            errorMap: () => ({ message: 'Only .jpg, .jpeg, .png and .webp formats are supported' })
        }),
        originalname: zod_1.z.string()
    })
});
exports.updateAssetSchema = zod_1.z.object({
    name: zod_1.z.string()
        .min(1, 'Asset name is required')
        .max(255, 'Asset name too long')
        .refine(name => /^[^\\/:*?"<>|]+$/.test(name), {
        message: 'Asset name contains invalid characters'
    })
        .optional(),
    metadata: zod_1.z.record(zod_1.z.any()).optional(),
});
