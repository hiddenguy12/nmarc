/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import type { Request } from 'express';

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp' , 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, PDF, and WEBP files are allowed.'));
        return;
    }

    if (file.mimetype !== 'application/pdf' && file.size > 5 * 1024 * 1024) return cb(new Error('Image can noy be bigger than 5 MB'));
   
    if (file.mimetype === 'application/pdf' && file.size > 10 * 1024 * 1024) return cb(new Error('pdf can noy be bigger than 10 MB'));
    
    cb(null, true);
};

// Create multer upload instance
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});