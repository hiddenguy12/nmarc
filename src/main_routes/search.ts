/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Router, Request, Response, RequestHandler, NextFunction, } from "express";
import rateLimiter from "../config/rateRimiter";
import { validateBothProfiledUser, validateUser } from "../lib/middlewares/auth.middleware";
import { IAuthSession } from "../models/AuthSession";
import { CountryNamesEnum } from "../lib/types/country_names.enum";
import { findNearestDistricts, getBaseSearchQuery, getDistance, getUserDataFromRequest, getUserWithCountryFlagsEmoji, searchHeightGenerator, shuffleArray } from "../controllers/search.controller";
import { User } from "../models/user";
import { FilterUsersQueryParams, filterUsersSchema, getUserByMIDSchema, justJoinedSchema, preferredEducationSearchSchema, preferredLocationSearchSchema, preferredOccupationSearchSchema, paginationSchema, todaysMatchSchema, searchHistorySchema, exploreByCountrySchema, exploreByDivisionSchema } from "../lib/schema/search.schema";
import { IProfileView, ProfileView } from "../models/ProfileView";
import queryMiddleware from "../lib/middlewares/query.middleware";
import { EducationLevel } from "../lib/types/userEducation.types";
import { IUser, Occupation } from "../lib/types/user.types";
import { ShortList } from "../models/ShortListedProfiles";
import { SearchHistory } from "../models/SearchHistory";
import { _idValidator, limitValidation } from "../lib/schema/schemaComponents";
import { z, ZodError } from "zod";
import { SmsSendedProfile } from "../models/SmsSendedProfile";
import { SendMailedProfile } from "../models/SendMailedProfile";
import { LikedProfile } from "../models/LikedProfile";
import { RequestMobileNumberView } from "../models/RequestMobileNumberView";
import { ConnectionRequest } from "../models/ConnectionRequest";
import { log } from "console";
import { UserRecord } from "firebase-admin/lib/auth/user-record";
import { randomDataFromArray } from "../lib/core/randomInt";
import { calculateDistance, countryCoordinates, getCountriesNearby } from "../lib/data/countryWithLatLong";
import countryNames from "../lib/data/countryNames";
import VideoProfile, { IVideoProfile } from "../models/VideoProfile";
import { Districts } from "../lib/data/districts";


const router: Router = Router();

router.use(rateLimiter(120 * 1000, 200));
router.use(queryMiddleware)
router.use(validateBothProfiledUser);



router.get('/users/explore/country',
    async function (req: Request, res: Response): Promise<any> {
        try {
           
            const getOnlineUsersSchema = z.object({
                country: z.nativeEnum(CountryNamesEnum).optional(),
                page: z.string().regex(/^\d+$/).transform(Number).pipe(
                    z.number().min(1).max(100)
                ).optional().default('1'),
                limit: z.string().regex(/^\d+$/).transform(Number).pipe(
                    z.number().min(1).max(50)
                ).optional().default('20'),
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
            const baseQuery: any = {
                
            };

            // Handle country filtering
            if (country && country.toLowerCase() !== 'any') {
                baseQuery['location.country'] = country;
            }

            // Get list of all unique countries where users have signed up
            let userCountries: any[] = [];
            if (!country || country.toLowerCase() === 'any') {
                userCountries = await VideoProfile.distinct('location.country');
            }

            // Fetch users with sorting by online status
            const aggregationPipeline: any = [
                { $match: baseQuery },
                {
                    $addFields: {
                        onlineSortOrder: {
                            $cond: [
                                { $eq: ["$status", "online"] },
                                0,  // Online users first
                                1   // Offline users second
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
                VideoProfile.aggregate(aggregationPipeline),
                VideoProfile.countDocuments(baseQuery)
            ]);

            // Prepare response data
            const responseData: any = {
                success: true,
                data: {
                    users: getUserWithCountryFlagsEmoji(users),
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
                responseData.data.countries =shuffleArray( userCountries);
            } else {
                responseData.data.country = country;
            }

            // Set cache control headers
            res.set('Cache-Control', 'public, max-age=30'); // Cache for 30 seconds since this is real-time data

            return res.status(200).json(responseData);

        } catch (error) {
            console.error('[Online Users API Error]:', error);
            return res.status(500).json({
                success: false,
                message: 'Internal server error',
                data: null
            });
        }
    }
);

router.get('/users/explore/country/near-by-me',async function (req: Request, res: Response): Promise<any> {
    try {
        const getOnlineUsersSchema = z.object({
            country_count: z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .pipe(z.number().min(1).max(countryCoordinates.length - 1))
                .optional()
                .default('50'),
            page: z.string()
                .regex(/^\d+$/)
                .transform(Number)
                .pipe(z.number().min(1).max(100))
                .optional()
                .default('1'),
            limit: limitValidation,
            latitude: z.string()
            .transform(Number)
            .refine((val) => !isNaN(val), { // Add validation after transform
              message: "Latitude must be a valid number",
            })
            .refine((val) => val >= -90 && val <= 90, {
              message: "Latitude must be between -90 and 90",
            }),
          longitude: z.string()
            .transform(Number)
            .refine((val) => !isNaN(val), { // Add validation after transform
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
        const baseQuery: any = {};

        // Get coordinates - either from request or from user's country
         let  userLat = latitude;
         let  userLong = longitude;
       
        // Find nearby countries based on coordinates
        let nearbyCountries = countryCoordinates
            .map(({ name, latitude, longitude }) => ({
                name,
                distance: getDistance(userLat, userLong, latitude, longitude)
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(0, country_count)
            .map(el => el.name);

        baseQuery['location.country'] = { $in: nearbyCountries };

        // Build aggregation pipeline
        let aggregate: any = [];

        aggregate.push({ $match: baseQuery });
        aggregate.push(
            {
                $addFields: {
                    onlineSortOrder: {
                        $cond: [
                            { $eq: ["$status", "online"] },
                            0,  // Online users first
                            1   // Offline users second
                        ]
                    }
                }
            }
        );
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
            VideoProfile.aggregate(aggregate),
            VideoProfile.countDocuments(baseQuery)
        ]);

        // Set cache control headers
        let responseUsers = getUserWithCountryFlagsEmoji(users);
        res.set('Cache-Control', 'public, max-age=60');

        return res.status(200).json({
            success: true,
            data: {
                users:responseUsers ,
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

    } catch (error) {
        console.error('[Nearby Users API Error]:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});


let userField = 'name _id email profileImage.url gender age onlineStatus';


router.get('/users/just-joined', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const validationResult = justJoinedSchema.safeParse(req.query);
        
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
        let userInfo = getUserDataFromRequest(req) ;
        // Calculate pagination
        const skip = (page - 1) * limit;

        // Base query for finding users
        const baseQuery = {
            createdAt: { $gte: startDate },
            gender : { $ne : userInfo.gender },
        };

        // Find users using aggregation
        let aggregate: any = [
            { $match: baseQuery },
            { $sort: { 
                'onlineStatus.isOnline': -1,
                'onlineStatus.lastActive': 1,
                createdAt: -1 
            }},
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
            }}
        ];

        let users = await User.aggregate(aggregate);

        // Get total count if requested
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(10000);
        }

        // Prepare pagination info
        let pagination: object = {
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

    } catch (error) {
        console.error(`recent profile listing api error:`, error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/users/online', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let userInfo = getUserDataFromRequest(req);
        
        // Validate query parameters
        const validationResult = paginationSchema.safeParse(req.query);

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
        let aggregate:any = [
            { $match: baseQuery },
            { $sort: { 'onlineStatus.lastActive': 1 }}, // Sort by most recently active
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
            }}
        ];

        let users = await User.aggregate(aggregate);

        // Get total count if requested
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(8000);
        }

        // Prepare pagination info
        let pagination: object = {
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

    } catch (error) {
        console.error('Online users API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/users/premium', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let userInfo = getUserDataFromRequest(req);

        const validationResult = paginationSchema.safeParse(req.query);
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
        let aggregate:any = [
            { $match: baseQuery },
            { $sort: { 
                'onlineStatus.isOnline': -1,
                'onlineStatus.lastActive': 1
            }},
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
            }}
        ];

        let users = await User.aggregate(aggregate);

        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(10000);
        }


        let pagination: object = {
            currentPage: page,
            pageSize: limit,
        };

        if (totalCount !== undefined) {
            pagination = {
                ...pagination,
                totalPages: Math.ceil(totalCount / limit),
                totalUsers: totalCount
            }
        }

        res.set('Cache-Control', 'private, max-age=60');

        res.status(200).json({
            success: true,
            data: {
                users
            },

            error: null,
            message: 'PREMIUM_USERS_FOUND'
        })
        return;

    } catch (error) {
        console.error('[Premium Users Search Api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/users/preferred-education', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let userInfo = getUserDataFromRequest(req);

        req.query.educationLevels && Array.isArray(req.query.educationLevels) === false && (req.query.educationLevels = [req.query.educationLevels]);
        const validationResult = preferredEducationSearchSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }

        const {
            page,
            limit,
            count: shouldCount,
            educationLevels
        } = validationResult.data;

        // Calculate pagination
        const skip = (page - 1) * limit;
  
  
        let allEducationLevels =await User.distinct('education.level' , { isEducated: true });

        // Base query for finding users
        const baseQuery = {
            gender: { $ne: userInfo.gender },
            isEducated: true,
            "education.level": { $in: educationLevels ? educationLevels : allEducationLevels }
        };
      
        // Use aggregation to prioritize online users
        let aggregate: any = [
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

        let users = await User.aggregate(aggregate);

        // Get total count if requested
        let totalCount: number | undefined = undefined;

        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(10000);
        }

        // Prepare pagination info
        let pagination: object = {
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
                    educationLevels : educationLevels? educationLevels :  allEducationLevels 
                },
                allEducationLevels
            }
        });

    } catch (error) {
        console.error('Preferred education API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/users/preferred-location', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let userInfo = getUserDataFromRequest(req);
        
        (typeof req.query.district_names === "string") && (req.query.district_names = [req.query.district_names]);
        const validationResult = preferredLocationSearchSchema.safeParse(req.query);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                error: validationResult.error.errors,
                data: null
            });
        }

        const {
            page,
            limit,
            count: shouldCount,
            district_names,
            latitude ,
            longitude
        } = validationResult.data;

        // Calculate pagination
        const skip = (page - 1) * limit;


        let existingDistrict = await User.distinct( 'address.district.name' , {})
        let nearestDistrictNames : any[] =[];

        if (district_names === undefined) {
            nearestDistrictNames = existingDistrict.map((eDistrict) => {
                return Districts.find(element => element.name === eDistrict)
            })
                .filter((district) => {
                    if (district) return district;
                })
                .map((district) => {
                    return ({
                        ...district,
                        distance: getDistance(latitude as number, longitude as number, district?.lat as number, district?.long as number),
                    })
                })
                .sort((a, b) => a.distance - b.distance)
                .map((district) => district?.name);

        }
     
        // Base query for finding users
        const baseQuery: any = {
            gender: { $ne: userInfo.gender },
            'address.district.name': { $in: district_names ? district_names : nearestDistrictNames }
        };

 
        
        // Use aggregation to prioritize online users
        let aggregate:any = [
            { 
                $match: baseQuery
            },
            { 
                $sort: { 
                'onlineStatus.isOnline': -1,
                'onlineStatus.lastActive': 1
            }},
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

        let users = await User.aggregate(aggregate);

        // Get total count if requested
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(10000);
        }

        // Prepare pagination info
        let pagination: object = {
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
                    district_names : district_names ? district_names : nearestDistrictNames
                }
            }
        });

    } catch (error) {
        console.error('Preferred location API error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});


router.get('/users/mutual', async function (req: Request, res: Response): Promise<Response | any> {
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
        const validationResult = paginationSchema.safeParse(req.query);
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
        const currentUser = await User.findById(userId, 'connections')
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
        let aggregate:any = [
            { $match: baseQuery },
            { $sort: { 
                'onlineStatus.isOnline': -1,
                'onlineStatus.lastActive': 1
            }},
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
            }}
        ];

        let users = await User.aggregate(aggregate);

        // Get total count if requested
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery)
                .maxTimeMS(10000);
        }

        // Prepare pagination info
        let pagination: object = {
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

    } catch (error) {
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


router.get('/users/filter', async function (req: Request, res: Response): Promise<Response | any> {
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

        const queryResult = filterUsersSchema.safeParse(req.query);
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
        const {
            page,
            limit,
            count: shouldCount,
            languages,
            division_ids,
            isEducated,
            minWeight,
            maxWeight,
            minHeight,
            maxHeight,
            minAge,
            maxAge,
            maritalStatuses,
            occupations,
            minAnnualIncome,
            maxAnnualIncome,
        } = validatedQuery;

        // 1. Build hard filters (must-match)
        const baseQuery: any = getBaseSearchQuery(req.authSession.value);

        // Always hard-filter suspended users and self
        baseQuery["suspension.isSuspended"] = false;
        baseQuery["_id"] = { $ne: userData.userId };

        // 2. Build dynamic scoring formula for soft-matching
        let scoreAdd: any[] = [];

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
            let heights = searchHeightGenerator(minHeight, maxHeight);
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
        const aggregatePipeline: any[] = [
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
        const users = await User.aggregate(aggregatePipeline);

        // 6. Total count if needed
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery).maxTimeMS(10000);
        }

        // 7. Prepare pagination info
        let pagination: object = {
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

    } catch (error) {
        console.error('Filter users API error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


router.get('/users/suggested-for-you', async function (req: Request, res: Response): Promise<Response | any> {
    try {

        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',

                data: null
            });
            return;
        }

        const validationResult = paginationSchema.safeParse(req.query);
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
        const currentUser = await User.findById(userData.userId, 'partnerPreference gender').lean();


        if (!currentUser) throw new Error("currentUser is null");


        if (!currentUser?.partnerPreference) {
            // If no preferences exist, create them automatically
            const userForPrefs = await User.findById(userData.userId);
            if (userForPrefs) {
                userForPrefs.createPreference();
                await userForPrefs.save();
                currentUser.partnerPreference = userForPrefs.partnerPreference;
            } else {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                    data: null
                });
            }
        }

        // Build base query including base search criteria
        const baseQuery: any | object = {
            ...getBaseSearchQuery(userData), // Use existing helper for base query
            $or : []
        };

        const pref = currentUser.partnerPreference;

        // Add age preferences
        if (pref.ageRange?.min || pref.ageRange?.max) {
            baseQuery.age = {
                $gte : pref.ageRange.min ,
                $lte: pref.ageRange.max
            };
        }

         if (pref.weightRange?.min || pref.weightRange?.max) {
            baseQuery.weight = {
                $gte : pref.weightRange.min ,
                $lte: pref.weightRange.max
            };
        }

        // Add height preferences with proper validation
        if (pref.heightRange?.min && pref.heightRange?.max) {
            baseQuery.height = {
                $in: searchHeightGenerator(
                    pref.heightRange.min,
                    pref.heightRange.max
                )
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

        if (pref.education?.mustBeEducated) baseQuery['isEducated'] =true;
        baseQuery['education.level'] = { $in: []  };

        if (pref.education?.minimumLevel) baseQuery['education.level']['$in'].push(pref.education?.minimumLevel);
        
        if (pref.education?.preferredLevels && (pref.education?.preferredLevels.length >= 1)) {
            for (let i = 0; i < pref.education?.preferredLevels.length; i++) {
                const level = pref.education?.preferredLevels[i];
                if (!baseQuery['education.level']['$in'].includes(level)) baseQuery['education.level']['$in'].push(level);
            }
        }
      
       
        // Add income preferences with currency matching
        if (pref.profession?.minimumAnnualIncome) baseQuery.$or.push({
            'annualIncome.amount': {
                $gte: pref.profession.minimumAnnualIncome.min,
                $lte: pref.profession.minimumAnnualIncome.max
            }
        });

        if (pref.district) baseQuery.$or.push({'address.district.name' : pref.district  })
        
            

        
        // Calculate pagination
        const skip = (page - 1) * limit;

        let users = await User.find(baseQuery, userField)
            .sort({
                createdAt: -1,
                "onlineStatus.isOnline": 1,
                "onlineStatus.lastActive": -1
            })
            .skip(skip)
            .limit(limit)
            .lean();

        // Get total count if requested
        let totalCount: number | undefined = undefined;
        if (shouldCount === 'yes') {
            totalCount = await User.countDocuments(baseQuery)
                .maxTimeMS(10000);
        }

        // Prepare pagination info
        let pagination: object = {
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
                searchCritiria : baseQuery
            },
            message: 'SUGGESTED_USERS_FOUND'
        });

    } catch (error) {
        console.error('[Suggested For You API error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});







export default router;