/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ InshaAllah
*/

import { Router, Request, Response, NextFunction } from "express";
import { z, ZodError } from "zod";
import { ICity, IDistrict, IUpazila } from "../lib/types/location.types";
import { Unions } from "../lib/data/unions";
import { Upazilas } from "../lib/data/upazilas";
import { Districts } from "../lib/data/districts";
import { Divisions } from "../lib/data/divisions";
import countryNames from "../lib/data/countryNames";
import { countryAndCurrency } from "../lib/types/currencyCodes.enum";
import { EducationLevel } from "../lib/types/userEducation.types";
import { Language, MaritalStatus, Religion } from "../lib/types/user.types";
import rateLimiter from "../config/rateRimiter";
import getEducationCertificates from "../lib/core/getEducationCertificates";
import { ReligiousBranch } from "../lib/types/userProfile.types";
import Gifts from "../models/Gifts";
import { readFileSync } from "node:fs";
import path from "node:path";



const router: Router = Router();
router.use(rateLimiter(30 * 1000, 100))



router.get('/coins-data' ,  async function (req: Request, res: Response): Promise<any> {
    try {
        let data: any = JSON.parse(readFileSync(path.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
        return res.status(200).json({
            success: true,
            data: {    coin_packages: data
            }
        });
    } catch (error) {
        console.error('[/coins/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});

router.get('/gifts', async (req: Request, res: Response) => {
    try {
        const gifts = await Gifts.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Gifts fetched successfully",
            data: {
                gifts
            }
        });
    } catch (error) {
        console.error('Error fetching gifts:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch gifts",
            error: "Internal server error"
        });
    }
})




router.get("/location/country-names", async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({ success: true, message: "ok", data: { names: countryNames } })
});

router.get("/location/divisions", async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({ success: true, message: "ok", data: Divisions })
});

router.get("/location/districts", async function (req: Request, res: Response): Promise<any> {
    try {
        let divisionSchema = z.number().gte(1).lte(8)
        let { success, error, data } = await divisionSchema.safeParseAsync(Number(req.query.division_id))
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message,
                errorDetails: error
            });
            return;
        }

        if (success && data) {



            let districts = Districts.filter(function (element: IDistrict): object | undefined {
                if (element.division_id === String(data)) {
                    return element;
                }
            });

            res.status(200).json({
                success: true,
                data: districts
            })
            return;
        }
    } catch (error) {
        console.error("district location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;;
    }
});

router.get("/location/upazilas", async function (req: Request, res: Response): Promise<any> {
    try {
        let districtSchema = z.number().positive().gte(1).lte(64);
        let { success, error, data } = await districtSchema.safeParseAsync(Number(req.query.district_id))
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message
            });
            return;
        }

        if (success && data) {

            let upazilas = Upazilas.filter(function (element: IUpazila): object | undefined {
                if (element.district_id === String(data)) {
                    return element;
                }
            });
            res.status(200).json({
                success: true,
                data: upazilas
            })
            return;
        }
    } catch (error) {
        console.error("upazila location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;
    }
});

router.get("/location/unions", async function (req: Request, res: Response): Promise<any> {
    try {
        let upazilaSchema = z.number().positive().gte(1).lte(494)
        let { success, error, data } = await upazilaSchema.safeParseAsync(Number(req.query.upazila_id))
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message
            });
            return;
        }

        if (success && data) {

            let cities = Unions.filter(function (element: ICity) {
                if (element.upazilla_id === String(data)) {
                    return element;
                }
            });
            res.status(200).json({
                success: true,
                data: cities
            })
            return;
        }
    } catch (error) {
        console.error("city location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;
    }
})

router.get('/currency', async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({
        success: true,
        data: { countryAndCurrency }
    })
});


router.get('/languages', async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({
        success: true,
        data: {
            levels: Object.values(Language)
        }
    })
});


router.get('/education', async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({
        success: true,
        data: {
            levels: Object.values(EducationLevel)
        }
    })
});

router.get('/marital-status', async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({
        success: true,
        data: {
            marital_statuses: Object.values(MaritalStatus)
        }
    })
});

router.get('/certificates', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const educationLevelValidator = z.nativeEnum(EducationLevel);
        const validationResult = await educationLevelValidator.safeParseAsync(req.query.education_level);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid education level provided",
                errors: validationResult.error
            });
        }

        const educationLevel = validationResult.data as EducationLevel;
        const certificates = getEducationCertificates(educationLevel);


        return res.status(200).json({
            success: true,
            message: `Certificates for ${educationLevel}`,
            data: { certificates }
        });
    } catch (error) {
        console.error('/data/certificate api error ', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

router.get('/religions', async function (req: Request, res: Response): Promise<any> {
    return res.status(200).json({
        success: true,
        data: {
            marital_statuses: Object.values(Religion)
        }
    })
});

router.get('/religional-branch', async function (req: Request, res: Response): Promise<any> {
    try {
        let regionalBranches: any = {};
        regionalBranches[Religion.ISLAM] = Object.values(ReligiousBranch).slice(0, 4);
        regionalBranches[Religion.HINDUISM] = Object.values(ReligiousBranch).slice(4, 9);
        regionalBranches[Religion.BUDDHISM] = Object.values(ReligiousBranch).slice(9, 11);
        regionalBranches[Religion.CHRISTIANITY] = Object.values(ReligiousBranch).slice(11, 13);
        regionalBranches["OHTERS"] = Object.values(ReligiousBranch).slice(13, 15);

        let schema = z.enum([Religion.ISLAM, Religion.HINDUISM, Religion.BUDDHISM, Religion.CHRISTIANITY, "OHTERS"]);

        let religion = schema.parse(req.query.religion);

        return res.status(200).json({
            success: true,
            data: {
                branches: regionalBranches[religion]
            }
        })
    } catch (error) {
        if (error instanceof ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error,
                data: null
            });
            return;
        }
        console.error('[religional Branch error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});


export default router;