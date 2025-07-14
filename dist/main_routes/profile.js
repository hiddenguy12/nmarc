"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const rateRimiter_1 = __importDefault(require("../config/rateRimiter"));
const user_1 = require("../models/user");
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const zod_1 = require("zod");
const query_middleware_1 = __importDefault(require("../lib/middlewares/query.middleware"));
const updateUser_schema_1 = require("../lib/schema/updateUser.schema");
const membershipRequest_1 = require("../models/membershipRequest");
const partnerPreference_schema_1 = require("../lib/schema/partnerPreference.schema");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const multer_1 = require("../config/multer");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Constants
const RATE_LIMIT_WINDOW_MS = 120 * 1000; // 2 minutes
const RATE_LIMIT_MAX_REQUESTS = 150;
// Apply rate limiter
router.use((0, rateRimiter_1.default)(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS));
router.use(query_middleware_1.default);
router.get('/user-details/video-profile', auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        return res.status(200).json({
            success: true,
            data: {
                name: req.videoProfile.name,
                gender: req.videoProfile.gender,
                email: req.videoProfile.email,
                age: req.videoProfile.age,
                status: req.videoProfile.status,
                country: req.videoProfile.location?.country,
                _id: req.videoProfile._id,
                languages: req.videoProfile.languages,
                phone: req.videoProfile.phone,
                lastActive: req.videoProfile.lastActive,
                profileImage: req.videoProfile.profileImage,
                coverImage: req.videoProfile.coverImage,
                coins: req.videoProfile.video_calling_coins
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError',
            data: null
        });
    }
});
router.put('/user-details/video-profile', auth_middleware_1.validateVideoProfile, multer_1.upload.single('profileImage'), async function (req, res) {
    try {
        // Define validation schema with all fields as optional
        const updateSchema = zod_1.z.object({
            name: zod_1.z.string().optional(),
            gender: zod_1.z.enum(['male', 'female',]).optional(),
            status: zod_1.z.enum(['online', 'offline']).optional(),
            dateOfBirth: zod_1.z.string().transform(val => new Date(val)).optional(),
            age: zod_1.z.number().optional(),
            languages: zod_1.z.array(zod_1.z.string()).optional(),
            location: zod_1.z.object({
                country: zod_1.z.string().optional(),
                lat: zod_1.z.number().optional(),
                long: zod_1.z.number().optional()
            }).optional(),
            coverImage: zod_1.z.object({ url: zod_1.z.string().url(), id: zod_1.z.string().uuid() }).optional(),
            profileImage: zod_1.z.object({ url: zod_1.z.string().url(), id: zod_1.z.string().uuid() }).optional(),
        });
        // Validate request body (ignore profileImage if file is uploaded)
        let validatedData = {};
        if (req.file) {
            // If file is uploaded, skip profileImage in body
            const { profileImage, ...rest } = req.body;
            validatedData = updateSchema.omit({ profileImage: true }).parse(rest);
        }
        else {
            validatedData = updateSchema.parse(req.body);
        }
        // Find fields to update
        const updateData = {};
        if (validatedData.name)
            updateData.name = validatedData.name;
        if (validatedData.gender)
            updateData.gender = validatedData.gender;
        if (validatedData.status)
            updateData.status = validatedData.status;
        if (validatedData.dateOfBirth)
            updateData.dateOfBirth = validatedData.dateOfBirth;
        if (validatedData.age)
            updateData.age = validatedData.age;
        if (validatedData.languages)
            updateData.languages = validatedData.languages;
        if (validatedData.coverImage)
            updateData.coverImage = validatedData.coverImage;
        // Handle nested location object
        if (validatedData.location) {
            if (!updateData.location)
                updateData.location = {};
            if (validatedData.location.country !== undefined)
                updateData.location.country = validatedData.location.country;
            if (validatedData.location.lat !== undefined)
                updateData.location.lat = validatedData.location.lat;
            if (validatedData.location.long !== undefined)
                updateData.location.long = validatedData.location.long;
        }
        // Handle profileImage upload
        let newProfileImage = null;
        if (req.file) {
            // Upload to Cloudinary
            const result = await cloudinary_1.default.uploader.upload(req.file.path, {
                folder: 'video-profiles',
                public_id: req.videoProfile._id.toString() + '-' + Date.now(),
                overwrite: true,
                resource_type: 'image',
            });
            // Remove local file
            fs_1.default.unlinkSync(req.file.path);
            newProfileImage = {
                url: result.secure_url,
                id: result.public_id
            };
            updateData.profileImage = newProfileImage;
        }
        else if (validatedData.profileImage) {
            updateData.profileImage = validatedData.profileImage;
        }
        // Update lastActive timestamp
        updateData.lastActive = new Date();
        // Update user profile
        const updatedProfile = await VideoProfile_1.default.findByIdAndUpdate(req.videoProfile._id, { $set: updateData }, { new: true });
        if (!updatedProfile) {
            return res.status(404).json({
                success: false,
                message: 'User profile not found',
                error: 'NotFound',
                data: null
            });
        }
        // Return updated profile with selected fields
        return res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                name: updateData.name && updatedProfile.name,
                gender: updateData.gender && updatedProfile.gender,
                age: updateData.age && updatedProfile.age,
                status: updateData.status && updatedProfile.status,
                country: updatedProfile.location?.country,
                _id: updatedProfile._id,
                languages: updateData.languages && updatedProfile.languages,
                lastActive: updateData.lastActive && updatedProfile.lastActive,
                profileImage: updatedProfile.profileImage, // Always return the latest profileImage
                coverImage: updateData.coverImage && updatedProfile.coverImage,
            }
        });
    }
    catch (error) {
        console.error('Error updating profile:', error);
        // Handle zod validation errors
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                error: 'ValidationError',
                details: error.errors
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: 'InternalServerError',
            data: null
        });
    }
});
router.get('/user-details/matrimony', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let _id = req.authSession?.value?.userId;
        if (!_id)
            return res.sendStatus(401);
        let user = await user_1.User.findById(_id, 'name email phoneInfo profileImage coverImage occupation maritalStatus languages address education height age weight dateOfBirth gender profileCreatedBy mid onlineStatus aboutMe familyInfo membership').lean();
        if (!user)
            return res.sendStatus(204);
        let membership;
        if (user.membership?.currentMembership.requestId && user.membership?.currentMembership?.membership_exipation_date.getTime() > Date.now()) {
            membership = await membershipRequest_1.MembershipRequest.findById(user.membership?.currentMembership?.requestId, 'tier endDate verifiedPhoneLimit').lean();
            membership && delete membership._id;
            delete user.membership;
        }
        if (user.membership?.currentMembership?.requestId && user.membership?.currentMembership?.membership_exipation_date.getTime() < Date.now()) {
            await user_1.User.findByIdAndUpdate(user._id, {
                'membership.currentMembership.requestId': undefined,
                'membership.currentMembership.membership_exipation_date': undefined,
            });
        }
        if (!membership) {
            membership = { tier: 'FREE' };
        }
        res.status(200).json({
            success: true,
            data: {
                ...user,
                membership
            },
            error: null,
            message: 'OK'
        });
        return;
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        console.error('[matrimony User Details Api Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/user-details/matrimony/:id', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let _id = schemaComponents_1._idValidator.parse(req.params.id);
        let user = await user_1.User.findById(_id, 'name email phoneInfo profileImage coverImage occupation maritalStatus languages address education height age weight dateOfBirth gender profileCreatedBy mid onlineStatus aboutMe familyInfo').lean();
        if (!user)
            return res.sendStatus(204);
        res.status(200).json({
            success: true,
            data: {
                ...user,
            },
            error: null,
            message: 'OK'
        });
        return;
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        console.error('[matrimony User Details Api Error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/user-details/matrimony', auth_middleware_1.validateUser, async function (req, res) {
    try {
        // 1. Parse and validate request body
        const updateData = await updateUser_schema_1.updateUserSchema.parse(req.body);
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        // 2. Get user ID from auth session
        const userId = req.authSession.value.userId;
        let updatesData = {};
        // Basic Information
        if (updateData.name)
            updatesData['name'] = updateData.name;
        if (updateData.gender)
            updatesData['gender'] = updateData.gender;
        if (updateData.dateOfBirth)
            updatesData['dateOfBirth'] = updateData.dateOfBirth;
        if (updateData.weight)
            updatesData['weight'] = updateData.weight;
        if (updateData.height)
            updatesData['height'] = updateData.height;
        if (updateData.maritalStatus)
            updatesData['maritalStatus'] = updateData.maritalStatus;
        if (updateData.phoneInfo?.number)
            updatesData['phoneInfo.number'] = updateData.phoneInfo.number;
        if (updateData.address)
            updatesData['address'] = updateData.address;
        // education
        if (updateData.isEducated)
            updatesData['isEducated'] = updateData.isEducated;
        if (updateData.education)
            updatesData['education'] = updateData.education;
        // Background Information
        if (updateData.religion)
            updatesData['religion'] = updateData.religion;
        if (updateData.languages)
            updatesData['languages'] = updateData.languages;
        // Education & Career
        if (updateData.occupation)
            updatesData['occupation'] = updateData.occupation;
        if (updateData.annualIncome)
            updatesData['annualIncome'] = updateData.annualIncome;
        // profile image
        if (updateData.profileImage)
            updatesData['profileImage'] = updateData.profileImage;
        if (updateData.coverImage)
            updatesData['coverImage'] = updateData.coverImage;
        // Filter out undefined values
        updatesData = Object.fromEntries(Object.entries(updatesData).filter(([_, value]) => value !== undefined));
        if (Object.keys(updatesData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No parameters found to update the user',
                data: null
            });
        }
        // Add last update timestamp
        updatesData['lastUpdated'] = new Date();
        // Update the user and return the new document
        let updatedUser = await user_1.User.findByIdAndUpdate(userId, { $set: updatesData, }, {
            runValidators: true // Run model validators
        });
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                data: null
            });
        }
        updatedUser = updatedUser.toObject();
        let updatedFields = {};
        for (const [key, value] of Object.entries(updateData)) {
            updatedFields[key] = updatedUser[key];
        }
        return res.status(200).json({
            success: true,
            message: 'User details updated successfully',
            data: { updatedFields }
        });
    }
    catch (error) {
        console.error('[User Details Update api error]', { timestamp: new Date() });
        console.error(error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                data: null,
                errors: error.errors
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.put('/user-details/partner-preference/matrimony', auth_middleware_1.validateUser, async function (req, res) {
    try {
        // 1. Parse and validate request body against the partnerPreferenceSchema
        const updateData = await partnerPreference_schema_1.partnerPreferenceSchema.parseAsync(req.body);
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        // 2. Get user ID from auth session
        const userId = req.authSession.value.userId;
        // Check if any update parameters were provided
        let updatesData = {};
        // Conditionally add fields to updatesData
        if (updateData.ageRange)
            updatesData['partnerPreference.ageRange'] = updateData.ageRange;
        if (updateData.heightRange)
            updatesData['partnerPreference.heightRange'] = updateData.heightRange;
        if (updateData.weightRange)
            updatesData['partnerPreference.weightRange'] = updateData.weightRange;
        if (updateData.maritalStatus)
            updatesData['partnerPreference.maritalStatus'] = updateData.maritalStatus;
        if (updateData.district)
            updatesData['partnerPreference.district'] = updateData.district;
        // if (updateData.complexion) updatesData['partnerPreference.complexion'] = updateData.complexion;
        // if (updateData.physicalStatus) updatesData['partnerPreference.physicalStatus'] = updateData.physicalStatus;
        // if (updateData.religiousBranch) updatesData['partnerPreference.religiousBranch'] = updateData.religiousBranch;
        // if (updateData.dealBreakers) updatesData['partnerPreference.dealBreakers'] = updateData.dealBreakers;
        // if (updateData.locationPreference) updatesData['partnerPreference.locationPreference'] = updateData.locationPreference;
        if (updateData.education)
            updatesData['partnerPreference.education'] = updateData.education;
        if (updateData.profession)
            updatesData['partnerPreference.profession'] = updateData.profession;
        if (updateData.religion)
            updatesData['partnerPreference.religion'] = updateData.religion;
        // if (updateData.motherTongue) updatesData['partnerPreference.motherTongue'] = updateData.motherTongue;
        // if (updateData.familyValues) updatesData['partnerPreference.familyValues'] = updateData.familyValues;
        // if (updateData.familyBackground) updatesData['partnerPreference.familyBackground'] = updateData.familyBackground;
        // Filter out undefined values (though Zod should handle this implicitly)
        updatesData = Object.fromEntries(Object.entries(updatesData).filter(([_, value]) => value !== undefined));
        if (Object.keys(updatesData).length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No partner preference parameters found to update',
                data: null
            });
        }
        // Add last update timestamp to the partnerPreference sub-document
        updatesData['partnerPreference.lastUpdated'] = new Date();
        // Update the user's partner preferences
        const updatedUser = await user_1.User.findByIdAndUpdate(userId, { $set: updatesData }, { new: true, runValidators: true } // 'new: true' returns the modified document, 'runValidators' ensures schema validation
        );
        if (!updatedUser) {
            res.status(400).json({
                success: false,
                message: 'Failed to Update the User',
                data: null
            });
            return;
        }
        return res.status(200).json({
            success: true,
            message: 'Partner preference updated successfully',
            data: { updatedPreference: updatedUser.partnerPreference }
        });
    }
    catch (error) {
        console.error('[Partner Preference Update api error]', { timestamp: new Date() });
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                data: null,
                errors: error.errors
            });
        }
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/user-details/profile-completion-score', auth_middleware_1.validateUser, async function (req, res) {
    try {
        let profileFields = [
            'name',
            'gender',
            'dateOfBirth',
            'weight',
            'height',
            'maritalStatus',
            'phoneInfo.number',
            'address.district.id',
            'age',
            'isEducated',
            'education.level',
            'education.certificate',
            'religion',
            'languages',
            'occupation',
            'annualIncome.amount',
            'profileImage.url'
        ];
        let missingFields = [];
        let foundFields = [];
        let user = await user_1.User.findById(req.authSession?.value.userId).lean();
        if (!user)
            throw 'user not found';
        let highestScore = profileFields.length * 10;
        let totalScore = 0;
        for (let i = 0; i < profileFields.length; i++) {
            let el = profileFields[i];
            switch (el.split('.').length) {
                case 2: {
                    let [firstEl, lastEl] = el.split('.');
                    if (user[firstEl] && user[firstEl][lastEl]) {
                        totalScore += 10;
                        foundFields.push(el);
                    }
                    else
                        missingFields.push(el);
                    break;
                }
                case 3: {
                    let [firstEl, middleEl, lastEl] = el.split('.');
                    if (user[firstEl] && user[firstEl][middleEl] && user[firstEl][middleEl][lastEl]) {
                        totalScore += 10;
                        foundFields.push(el);
                    }
                    else
                        missingFields.push(el);
                    break;
                }
                default:
                    if (user[el]) {
                        totalScore += 10;
                        foundFields.push(el);
                    }
                    else
                        missingFields.push(el);
                    break;
            }
        }
        if (user.profileImage.url === 'https://res.cloudinary.com/dyptu4vd2/image/upload/v1748022824/ahxfhq76i0auizajvl6h.png')
            totalScore -= 10; // because Image is a avatar
        let score = totalScore / highestScore * 100;
        return res.status(200).json({
            success: true,
            data: {
                score: score.toFixed(2) + '%',
                missing_profile_fields: missingFields,
                completed_profile_fields: foundFields
            }
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.default = router;
