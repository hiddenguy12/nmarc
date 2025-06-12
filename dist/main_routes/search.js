"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rateRimiter_1 = __importDefault(require("../config/rateRimiter"));
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const country_names_enum_1 = require("../lib/types/country_names.enum");
const search_controller_1 = require("../controllers/search.controller");
const user_1 = require("../models/user");
const search_schema_1 = require("../lib/schema/search.schema");
const query_middleware_1 = __importDefault(require("../lib/middlewares/query.middleware"));
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const zod_1 = require("zod");
const countryWithLatLong_1 = require("../lib/data/countryWithLatLong");
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const districts_1 = require("../lib/data/districts");
const router = (0, express_1.Router)();
router.use((0, rateRimiter_1.default)(120 * 1000, 200));
router.use(query_middleware_1.default);
router.use(auth_middleware_1.validateBothProfiledUser);
router.get('/users/explore/country', async function (req, res) {
    try {
        const getOnlineUsersSchema = zod_1.z.object({
            country: zod_1.z.nativeEnum(country_names_enum_1.CountryNamesEnum).optional(),
            page: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().min(1).max(100)).optional().default('1'),
            limit: zod_1.z.string().regex(/^\d+$/).transform(Number).pipe(zod_1.z.number().min(1).max(50)).optional().default('20'),
        });
        // Validate query parameters
        const validation = getOnlineUsersSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: validation.error.errors,
                data: null
            });
        }
        const { country, page, limit } = validation.data;
        const skip = (page - 1) * limit;
        // Base query using your existing helper
        const baseQuery = {};
        // Handle country filtering
        if (country && country.toLowerCase() !== 'any') {
            baseQuery['location.country'] = country;
        }
        // Get list of all unique countries where users have signed up
        let userCountries = [];
        if (!country || country.toLowerCase() === 'any') {
            userCountries = await VideoProfile_1.default.distinct('location.country');
        }
        // Fetch users with sorting by online status
        const aggregationPipeline = [
            { $match: baseQuery },
            {
                $addFields: {
                    onlineSortOrder: {
                        $cond: [
                            { $eq: ["$status", "online"] },
                            0, // Online users first
                            1 // Offline users second
                        ]
                    }
                }
            },
            {
                $sort: {
                    onlineSortOrder: 1,
                    "lastActive": -1
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    email: 1,
                    'profileImage.url': 1,
                    status: 1,
                    lastActive: 1,
                    age: 1,
                    gender: 1,
                    "location.country": 1
                }
            }
        ];
        const [users, totalCount] = await Promise.all([
            VideoProfile_1.default.aggregate(aggregationPipeline),
            VideoProfile_1.default.countDocuments(baseQuery)
        ]);
        // Prepare response data
        const responseData = {
            success: true,
            data: {
                users: (0, search_controller_1.getUserWithCountryFlagsEmoji)(users),
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalPages: Math.ceil(totalCount / limit),
                    totalUsers: totalCount
                }
            }
        };
        // Add countries list if 'any' was requested
        if (!country || country.toLowerCase() === 'any') {
            responseData.data.countries = (0, search_controller_1.shuffleArray)(userCountries);
        }
        else {
            responseData.data.country = country;
        }
        // Set cache control headers
        res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds since this is real-time data
        return res.status(200).json(responseData);
    }
    catch (error) {
        console.error('[Online Users API Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/explore/country/near-by-me', async function (req, res) {
    try {
        const getOnlineUsersSchema = zod_1.z.object({
            country_count: zod_1.z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .pipe(zod_1.z.number().min(1).max(countryWithLatLong_1.countryCoordinates.length - 1))
                .optional()
                .default('50'),
            page: zod_1.z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .pipe(zod_1.z.number().min(1).max(100))
                .optional()
                .default('1'),
            limit: schemaComponents_1.limitValidation,
            latitude: zod_1.z.string()
                .transform(Number)
                .refine((val) => !isNaN(val), {
                message: "Latitude must be a valid number",
            })
                .refine((val) => val >= -90 && val <= 90, {
                message: "Latitude must be between -90 and 90",
            }),
            longitude: zod_1.z.string()
                .transform(Number)
                .refine((val) => !isNaN(val), {
                message: "Longitude must be a valid number",
            })
                .refine((val) => val >= -180 && val <= 180, {
                message: "Longitude must be between -180 and 180",
            }),
        });
        // Validate query parameters
        const validation = getOnlineUsersSchema.safeParse(req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: validation.error.errors,
                data: null
            });
        }
        const { page, limit, country_count, latitude, longitude } = validation.data;
        const skip = (page - 1) * limit;
        // Base query using your existing helper
        const baseQuery = {};
        // Get coordinates - either from request or from user's country
        let userLat = latitude;
        let userLong = longitude;
        // Find nearby countries based on coordinates
        let nearbyCountries = countryWithLatLong_1.countryCoordinates
            .map(({ name, latitude, longitude }) => ({
            name,
            distance: (0, search_controller_1.getDistance)(userLat, userLong, latitude, longitude)
        }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, country_count)
            .map(el => el.name);
        baseQuery['location.country'] = { $in: nearbyCountries };
        // Build aggregation pipeline
        let aggregate = [];
        aggregate.push({ $match: baseQuery });
        aggregate.push({
            $addFields: {
                onlineSortOrder: {
                    $cond: [
                        { $eq: ["$status", "online"] },
                        0, // Online users first
                        1 // Offline users second
                    ]
                }
            }
        });
        aggregate.push({
            $sort: {
                onlineSortOrder: 1,
                "lastActive": -1
            }
        });
        aggregate.push({ $skip: skip });
        aggregate.push({ $limit: limit });
        aggregate.push({
            $project: {
                name: 1,
                email: 1,
                'profileImage.url': 1,
                status: 1,
                lastActive: 1,
                age: 1,
                gender: 1,
                "location.country": 1
            }
        });
        const [users, totalCount] = await Promise.all([
            VideoProfile_1.default.aggregate(aggregate),
            VideoProfile_1.default.countDocuments(baseQuery)
        ]);
        // Set cache control headers
        let responseUsers = (0, search_controller_1.getUserWithCountryFlagsEmoji)(users);
        res.set('Cache-Control', 'public, max-age=60');
        return res.status(200).json({
            success: true,
            data: {
                users: responseUsers,
                pagination: {
                    currentPage: page,
                    pageSize: limit,
                    totalPages: Math.ceil(totalCount / limit),
                    totalUsers: totalCount
                },
                nearbyCountries: nearbyCountries,
                coordinates: {
                    latitude: userLat,
                    longitude: userLong
                }
            }
        });
    }
    catch (error) {
        console.error('[Nearby Users API Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
let userField = 'name _id email profileImage.url gender age onlineStatus';
router.get('/users/just-joined', async function (req, res) {
    try {
        const validationResult = search_schema_1.justJoinedSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { timeRange, limit, page, count: shouldCount } = validationResult.data;
        // Calculate the date range
        const daysAgo = parseInt(timeRange);
        const startDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
        let userInfo = (0, search_controller_1.getUserDataFromRequest)(req);
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Base query for finding users
        const baseQuery = {
            createdAt: { $gte: startDate },
            gender: { $ne: userInfo.gender },
        };
        // Find users using aggregation
        let aggregate = [
            { $match: baseQuery },
            { $sort: {
                    'onlineStatus.isOnline': -1,
                    'onlineStatus.lastActive': 1,
                    createdAt: -1
                } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1
                }
            }
        ];
        let users = await user_1.User.aggregate(aggregate);
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(10000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
                timeRange: `${timeRange} days`,
            }
        });
    }
    catch (error) {
        console.error(`recent profile listing api error:`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/online', async function (req, res) {
    try {
        let userInfo = (0, search_controller_1.getUserDataFromRequest)(req);
        // Validate query parameters
        const validationResult = search_schema_1.paginationSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount } = validationResult.data;
        // Base query for finding online users
        const baseQuery = {
            'onlineStatus.isOnline': true,
            gender: { $ne: userInfo.gender }
        };
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Find online users with aggregation
        let aggregate = [
            { $match: baseQuery },
            { $sort: { 'onlineStatus.lastActive': 1 } }, // Sort by most recently active
            { $skip: skip },
            { $limit: limit },
            { $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1
                } }
        ];
        let users = await user_1.User.aggregate(aggregate);
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(8000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        // Add cache control headers
        res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
            }
        });
    }
    catch (error) {
        console.error('Online users API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/premium', async function (req, res) {
    try {
        let userInfo = (0, search_controller_1.getUserDataFromRequest)(req);
        const validationResult = search_schema_1.paginationSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount } = validationResult.data;
        const baseQuery = {
            gender: { $ne: userInfo.gender },
            'membership.currentMembership.requestId': { $exists: true },
            'membership.currentMembership.membership_exipation_date': { $gt: new Date() }
        };
        const skip = (page - 1) * limit;
        // Use aggregation to prioritize online users
        let aggregate = [
            { $match: baseQuery },
            { $sort: {
                    'onlineStatus.isOnline': -1,
                    'onlineStatus.lastActive': 1
                } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1,
                    membership: 1
                }
            }
        ];
        let users = await user_1.User.aggregate(aggregate);
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(10000);
        }
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        res.set('Cache-Control', 'private, max-age=60');
        res.status(200).json({
            success: true,
            data: {
                users
            },
            error: null,
            message: 'PREMIUM_USERS_FOUND'
        });
        return;
    }
    catch (error) {
        console.error('[Premium Users Search Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/preferred-education', async function (req, res) {
    try {
        let userInfo = (0, search_controller_1.getUserDataFromRequest)(req);
        req.query.educationLevels && Array.isArray(req.query.educationLevels) === false && (req.query.educationLevels = [req.query.educationLevels]);
        const validationResult = search_schema_1.preferredEducationSearchSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount, educationLevels } = validationResult.data;
        // Calculate pagination
        const skip = (page - 1) * limit;
        let allEducationLevels = await user_1.User.distinct('education.level', { isEducated: true });
        // Base query for finding users
        const baseQuery = {
            gender: { $ne: userInfo.gender },
            isEducated: true,
            "education.level": { $in: educationLevels ? educationLevels : allEducationLevels }
        };
        // Use aggregation to prioritize online users
        let aggregate = [
            {
                $match: baseQuery
            },
            {
                $sort: {
                    'onlineStatus.isOnline': -1,
                    'onlineStatus.lastActive': 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1
                }
            }
        ];
        let users = await user_1.User.aggregate(aggregate);
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(10000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
                searchCriteria: {
                    educationLevels: educationLevels ? educationLevels : allEducationLevels
                },
                allEducationLevels
            }
        });
    }
    catch (error) {
        console.error('Preferred education API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/preferred-location', async function (req, res) {
    try {
        let userInfo = (0, search_controller_1.getUserDataFromRequest)(req);
        (typeof req.query.district_names === "string") && (req.query.district_names = [req.query.district_names]);
        const validationResult = search_schema_1.preferredLocationSearchSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount, district_names, latitude, longitude } = validationResult.data;
        // Calculate pagination
        const skip = (page - 1) * limit;
        let existingDistrict = await user_1.User.distinct('address.district.name', {});
        let nearestDistrictNames = [];
        if (district_names === undefined) {
            nearestDistrictNames = existingDistrict.map((eDistrict) => {
                return districts_1.Districts.find(element => element.name === eDistrict);
            })
                .filter((district) => {
                if (district)
                    return district;
            })
                .map((district) => {
                return ({
                    ...district,
                    distance: (0, search_controller_1.getDistance)(latitude, longitude, district?.lat, district?.long),
                });
            })
                .sort((a, b) => a.distance - b.distance)
                .map((district) => district?.name);
        }
        // Base query for finding users
        const baseQuery = {
            gender: { $ne: userInfo.gender },
            'address.district.name': { $in: district_names ? district_names : nearestDistrictNames }
        };
        // Use aggregation to prioritize online users
        let aggregate = [
            {
                $match: baseQuery
            },
            {
                $sort: {
                    'onlineStatus.isOnline': -1,
                    'onlineStatus.lastActive': 1
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1
                }
            }
        ];
        let users = await user_1.User.aggregate(aggregate);
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(10000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount,
            };
        }
        res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
                searchCriteria: {
                    district_names: district_names ? district_names : nearestDistrictNames
                }
            }
        });
    }
    catch (error) {
        console.error('Preferred location API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/users/mutual', async function (req, res) {
    try {
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        // Validate query parameters
        const validationResult = search_schema_1.paginationSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount } = validationResult.data;
        const userId = req.authSession.value.userId;
        // Get the current user's connections
        const currentUser = await user_1.User.findById(userId, 'connections')
            .lean();
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                error: { code: 'USER_NOT_FOUND' },
                data: null
            });
        }
        const baseQuery = {
            _id: {
                $in: currentUser.connections
            },
            'suspension.isSuspended': false
        };
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Use aggregation to prioritize online users
        let aggregate = [
            { $match: baseQuery },
            { $sort: {
                    'onlineStatus.isOnline': -1,
                    'onlineStatus.lastActive': 1
                } },
            { $skip: skip },
            { $limit: limit },
            { $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1
                } }
        ];
        let users = await user_1.User.aggregate(aggregate);
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery)
                .maxTimeMS(10000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        // Set cache control headers
        res.set('Cache-Control', 'private, max-age=60'); // Cache for 1 minute, private because it's user-specific
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination
            }
        });
    }
    catch (error) {
        console.error('[Mutual Connections API Error]', {
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString()
        });
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: { code: 'INTERNAL_SERVER_ERROR' },
            data: null
        });
    }
});
router.get('/users/filter', async function (req, res) {
    try {
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        // Handle array parameters that might come as strings
        (typeof req.query.languages === "string") && (req.query.languages = [req.query.languages]);
        (typeof req.query.division_ids === "string") && (req.query.division_ids = [req.query.division_ids]);
        (typeof req.query.maritalStatuses === "string") && (req.query.maritalStatuses = [req.query.maritalStatuses]);
        (typeof req.query.occupations === "string") && (req.query.occupations = [req.query.occupations]);
        const queryResult = search_schema_1.filterUsersSchema.safeParse(req.query);
        if (!queryResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: queryResult.error.errors,
                data: null
            });
        }
        const validatedQuery = queryResult.data;
        const userData = req.authSession.value;
        // Destructure all query parameters
        const { page, limit, count: shouldCount, languages, division_ids, isEducated, minWeight, maxWeight, minHeight, maxHeight, minAge, maxAge, maritalStatuses, occupations, minAnnualIncome, maxAnnualIncome, } = validatedQuery;
        // 1. Build hard filters (must-match)
        const baseQuery = (0, search_controller_1.getBaseSearchQuery)(req.authSession.value);
        // Always hard-filter suspended users and self
        baseQuery["suspension.isSuspended"] = false;
        baseQuery["_id"] = { $ne: userData.userId };
        // 2. Build dynamic scoring formula for soft-matching
        let scoreAdd = [];
        if (languages?.length > 0) {
            scoreAdd.push({
                $cond: [
                    { $gt: [{ $size: { $setIntersection: ["$languages", languages] } }, 0] },
                    1, 0
                ]
            });
        }
        if (division_ids?.length > 0) {
            scoreAdd.push({
                $cond: [
                    { $in: ["$address.division.id", division_ids] },
                    1, 0
                ]
            });
        }
        if (isEducated !== undefined) {
            scoreAdd.push({
                $cond: [
                    { $eq: ["$isEducated", isEducated] },
                    1, 0
                ]
            });
        }
        if (maritalStatuses?.length > 0) {
            scoreAdd.push({
                $cond: [
                    { $in: ["$maritalStatus", maritalStatuses] },
                    1, 0
                ]
            });
        }
        if (occupations?.length > 0) {
            scoreAdd.push({
                $cond: [
                    { $in: ["$occupation", occupations] },
                    1, 0
                ]
            });
        }
        if (minWeight || maxWeight) {
            let min = minWeight || 30, max = maxWeight || 200;
            scoreAdd.push({
                $cond: [
                    { $and: [
                            { $gte: ["$weight", min] },
                            { $lte: ["$weight", max] }
                        ] },
                    1, 0
                ]
            });
        }
        if (minAge || maxAge) {
            let min = minAge || 18, max = maxAge || 70;
            scoreAdd.push({
                $cond: [
                    { $and: [
                            { $gte: ["$age", min] },
                            { $lte: ["$age", max] }
                        ] },
                    1, 0
                ]
            });
        }
        if (minHeight && maxHeight) {
            let heights = (0, search_controller_1.searchHeightGenerator)(minHeight, maxHeight);
            scoreAdd.push({
                $cond: [
                    { $in: ["$height", heights] },
                    1, 0
                ]
            });
        }
        if (minAnnualIncome || maxAnnualIncome) {
            let min = minAnnualIncome || 0, max = maxAnnualIncome || 1000000000;
            scoreAdd.push({
                $cond: [
                    { $and: [
                            { $gte: ["$annualIncome.amount", min] },
                            { $lte: ["$annualIncome.amount", max] }
                        ] },
                    1, 0
                ]
            });
        }
        // 3. Pagination
        const skip = (page - 1) * limit;
        // 4. Aggregation pipeline
        const aggregatePipeline = [
            { $match: baseQuery },
            {
                $addFields: {
                    matchScore: { $add: scoreAdd }
                }
            },
            {
                $sort: {
                    matchScore: -1, // Most matched criteria first
                    "onlineStatus.isOnline": -1,
                    "onlineStatus.lastActive": 1
                }
            },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    name: 1,
                    _id: 1,
                    email: 1,
                    'profileImage.url': 1,
                    gender: 1,
                    age: 1,
                    onlineStatus: 1,
                    matchScore: 1
                }
            }
        ];
        // 5. Query execution
        const users = await user_1.User.aggregate(aggregatePipeline);
        // 6. Total count if needed
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery).maxTimeMS(10000);
        }
        // 7. Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        // 8. Set cache headers for better performance
        res.set('Cache-Control', 'public, max-age=60'); // Cache for 1 minute
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
                filterCriteria: {
                    languages,
                    division_ids,
                    isEducated,
                    weightRange: minWeight || maxWeight ? { min: minWeight, max: maxWeight } : undefined,
                    ageRange: minAge || maxAge ? { min: minAge, max: maxAge } : undefined,
                    heightRange: minHeight || maxHeight ? { min: minHeight, max: maxHeight } : undefined,
                    maritalStatuses,
                    occupations,
                    incomeRange: minAnnualIncome || maxAnnualIncome ? {
                        min: minAnnualIncome,
                        max: maxAnnualIncome,
                    } : undefined
                }
            }
        });
    }
    catch (error) {
        console.error('Filter users API error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.get('/users/suggested-for-you', async function (req, res) {
    try {
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        const validationResult = search_schema_1.paginationSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }
        const { page, limit, count: shouldCount } = validationResult.data;
        const userData = req.authSession.value;
        // Get current user's partner preferences and gender
        const currentUser = await user_1.User.findById(userData.userId, 'partnerPreference gender').lean();
        if (!currentUser)
            throw new Error("currentUser is null");
        if (!currentUser?.partnerPreference) {
            // If no preferences exist, create them automatically
            const userForPrefs = await user_1.User.findById(userData.userId);
            if (userForPrefs) {
                userForPrefs.createPreference();
                await userForPrefs.save();
                currentUser.partnerPreference = userForPrefs.partnerPreference;
            }
            else {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }
        }
        // Build base query including base search criteria
        const baseQuery = {
            ...(0, search_controller_1.getBaseSearchQuery)(userData), // Use existing helper for base query
            $or: []
        };
        const pref = currentUser.partnerPreference;
        // Add age preferences
        if (pref.ageRange?.min || pref.ageRange?.max) {
            baseQuery.age = {
                $gte: pref.ageRange.min,
                $lte: pref.ageRange.max
            };
        }
        if (pref.weightRange?.min || pref.weightRange?.max) {
            baseQuery.weight = {
                $gte: pref.weightRange.min,
                $lte: pref.weightRange.max
            };
        }
        // Add height preferences with proper validation
        if (pref.heightRange?.min && pref.heightRange?.max) {
            baseQuery.height = {
                $in: (0, search_controller_1.searchHeightGenerator)(pref.heightRange.min, pref.heightRange.max)
            };
        }
        // Add religion preferences
        if (pref.religion?.length > 0) {
            baseQuery.religion = { $in: pref.religion };
        }
        // Add marital status preferences
        if (pref.maritalStatus?.length > 0) {
            baseQuery.maritalStatus = { $in: pref.maritalStatus };
        }
        if (pref.education?.mustBeEducated)
            baseQuery['isEducated'] = true;
        baseQuery['education.level'] = { $in: [] };
        if (pref.education?.minimumLevel)
            baseQuery['education.level']['$in'].push(pref.education?.minimumLevel);
        if (pref.education?.preferredLevels && (pref.education?.preferredLevels.length >= 1)) {
            for (let i = 0; i < pref.education?.preferredLevels.length; i++) {
                const level = pref.education?.preferredLevels[i];
                if (!baseQuery['education.level']['$in'].includes(level))
                    baseQuery['education.level']['$in'].push(level);
            }
        }
        // Add income preferences with currency matching
        if (pref.profession?.minimumAnnualIncome)
            baseQuery.$or.push({
                'annualIncome.amount': {
                    $gte: pref.profession.minimumAnnualIncome.min,
                    $lte: pref.profession.minimumAnnualIncome.max
                }
            });
        if (pref.district)
            baseQuery.$or.push({ 'address.district.name': pref.district });
        // Calculate pagination
        const skip = (page - 1) * limit;
        let users = await user_1.User.find(baseQuery, userField)
            .sort({
            createdAt: -1,
            "onlineStatus.isOnline": 1,
            "onlineStatus.lastActive": -1
        })
            .skip(skip)
            .limit(limit)
            .lean();
        // Get total count if requested
        let totalCount = undefined;
        if (shouldCount === 'yes') {
            totalCount = await user_1.User.countDocuments(baseQuery)
                .maxTimeMS(10000);
        }
        // Prepare pagination info
        let pagination = {
            currentPage: page,
            pageSize: limit,
        };
        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            };
        }
        // Cache control - short cache due to frequent updates
        res.set('Cache-Control', 'private, max-age=60');
        return res.status(200).json({
            success: true,
            data: {
                users,
                pagination,
                searchCritiria: baseQuery
            },
            message: 'SUGGESTED_USERS_FOUND'
        });
    }
    catch (error) {
        console.error('[Suggested For You API error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
exports.default = router;
