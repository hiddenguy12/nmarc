"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
// File filter function
const fileFilter = (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(new Error('Invalid file type. Only JPEG, PNG, JPG, PDF, and WEBP files are allowed.'));
        return;
    }
    if (file.mimetype !== 'application/pdf' && file.size > 5 * 1024 * 1024)
        return cb(new Error('Image can noy be bigger than 5 MB'));
    if (file.mimetype === 'application/pdf' && file.size > 10 * 1024 * 1024)
        return cb(new Error('pdf can noy be bigger than 10 MB'));
    cb(null, true);
};
// Create multer upload instance
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter: fileFilter
});
