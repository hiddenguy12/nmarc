"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
const cloudinary_1 = require("cloudinary");
const env_1 = require("./env");
cloudinary_1.v2.config({ cloud_name: env_1.ClOUDINARY_CLOUD_NAME, api_key: env_1.ClOUDINARY_API_KEY, api_secret: env_1.ClOUDINARY_API_SECRET, secure: true });
// export async function uploadImagesToCloudinary({ name, folder = "" }: IImageUploadOptions): Promise<ICloudinaryUploadResponse> {
//     try {
//         let p = resolve(__dirname , `../../uploads/${name}`);
//         log(p)
//         if (existsSync(p) === false ) throw new Error('File does not exist at ' +p);
//         let response = await cloudinary.uploader.upload(p, {
//             public_id: randomUUID(),
//             unique_filename: true,
//             transformation: ["media_lib_thumb"]
//         });
//         return ({
//             success: true,
//             data: {
//                 cloudinary_id: response.public_id,
//                 url: response.url,
//                 format: response.format
//             },
//             error: null,
//         });
//     } catch (error: any) {
//         if (error?.message) {
//             return ({
//                 success: false,
//                 error: {
//                     message: error.message
//                 }
//             });
//         }
//         else return ({
//             success: false,
//             error: {
//                 message: 'Unknown Cloudinary error'
//             }
//         });
//     }
// }
// export async function uploadVideoToCloudinary({ path, folder = "", maxDuration = 300, maxFileSize = 100 * 1024 * 1024 }: IVideoUploadOptions): Promise<ICloudinaryVideoUploadResponse> {
//     try {
//         const response = await cloudinary.uploader.upload(path, {
//             public_id: crypto.randomBytes(32).toString('hex').normalize(),
//             folder: `videos${folder.length > 0 ? '/' + folder : ''}`,
//             resource_type: "video",
//             chunk_size: 6000000, // 6MB chunks for better upload handling
//             eager: [
//                 {
//                     format: 'mp4', transformation: [
//                         { quality: 'auto' },
//                         { width: 720, crop: 'scale' }
//                     ]
//                 },
//                 {
//                     format: 'jpg', transformation: [
//                         { width: 320, crop: 'scale' },
//                         { flags: 'thumbnail' }
//                     ]
//                 }
//             ],
//             eager_async: true,
//             eager_notification_url: process.env.VIDEO_PROCESSING_WEBHOOK_URL,
//             notification_url: process.env.VIDEO_PROCESSING_WEBHOOK_URL,
//             validation: {
//                 duration: maxDuration,
//                 size: maxFileSize
//             }
//         });
//         return {
//             success: true,
//             data: {
//                 cloudinary_id: response.public_id,
//                 url: response.secure_url,
//                 format: response.format,
//                 duration: response.duration,
//                 size: response.bytes,
//                 thumbnail_url: response.eager?.[1]?.secure_url
//             },
//             error: null
//         };
//     } catch (error: any) {
//         return {
//             success: false,
//             error: {
//                 message: error?.message || 'Unknown Cloudinary error'
//             }
//         };
//     }
// }
// export async function destroyCloudinaryFile(id:string) {
//     try {
//         await cloudinary.uploader.destroy(id);
//         return true
//     } catch (error) {
//         console.error(error);
//         return false;
//     }
// }
exports.default = cloudinary_1.v2;
