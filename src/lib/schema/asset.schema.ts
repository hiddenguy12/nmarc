/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from 'zod';
import { AssetType } from '../../models/asset';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'] as const;

export const createImageAssetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(255, 'Asset name too long')
    .refine(name => /^[a-zA-Z0-9-_. ]+$/.test(name), {
      message: 'Asset name contains invalid characters'
    }),
  asset_type: z.enum([AssetType.IMAGE, AssetType.VIDEO, AssetType.DOCUMENT, AssetType.AUDIO]),
  file: z.object({
    size: z.number()
      .max(MAX_FILE_SIZE, `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`),
    mimetype: z.enum(ACCEPTED_IMAGE_TYPES, {
      errorMap: () => ({ message: 'Only .jpg, .jpeg, .png and .webp formats are supported' })
    }),
    originalname: z.string()
  })
});

export const updateAssetSchema = z.object({
  name: z.string()
    .min(1, 'Asset name is required')
    .max(255, 'Asset name too long')
    .refine(name => /^[a-zA-Z0-9-_. ]+$/.test(name), {
      message: 'Asset name contains invalid characters'
    })
    .optional(),
  metadata: z.record(z.any()).optional(),
});

export type CreateImageAssetInput = z.infer<typeof createImageAssetSchema>;