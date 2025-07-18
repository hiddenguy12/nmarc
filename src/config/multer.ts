/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import type { Request } from 'express';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp' , 'application/pdf'];
// const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Configure multer storage
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        cb(null, 'uploads/');
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Enable file type filtering for images and PDFs
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images (jpeg, png, jpg, webp) and PDFs are allowed.'));
    }
};

// Create multer upload instance
export const upload = multer({
    storage: storage,
    // No file size limit for unlimited upload
    // limits: {
    //     fileSize: MAX_FILE_SIZE
    // },
    // fileFilter: fileFilter
});