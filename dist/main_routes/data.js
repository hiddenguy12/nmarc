"use strict";
/*
بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  ﷺ InshaAllah
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const unions_1 = require("../lib/data/unions");
const upazilas_1 = require("../lib/data/upazilas");
const districts_1 = require("../lib/data/districts");
const divisions_1 = require("../lib/data/divisions");
const countryNames_1 = __importDefault(require("../lib/data/countryNames"));
const currencyCodes_enum_1 = require("../lib/types/currencyCodes.enum");
const userEducation_types_1 = require("../lib/types/userEducation.types");
const user_types_1 = require("../lib/types/user.types");
const rateRimiter_1 = __importDefault(require("../config/rateRimiter"));
const getEducationCertificates_1 = __importDefault(require("../lib/core/getEducationCertificates"));
const userProfile_types_1 = require("../lib/types/userProfile.types");
const Gifts_1 = __importDefault(require("../models/Gifts"));
const node_fs_1 = require("node:fs");
const node_path_1 = __importDefault(require("node:path"));
const router = (0, express_1.Router)();
router.use((0, rateRimiter_1.default)(30 * 1000, 100));
router.get('/coins-data', async function (req, res) {
    try {
        let data = JSON.parse((0, node_fs_1.readFileSync)(node_path_1.default.join(__dirname, '../../data/coin.packages.json'), 'utf-8'));
        return res.status(200).json({
            success: true,
            data: { coin_packages: data
            }
        });
    }
    catch (error) {
        console.error('[/coins/pricing api error]', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.get('/gifts', async (req, res) => {
    try {
        const gifts = await Gifts_1.default.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            message: "Gifts fetched successfully",
            data: {
                gifts
            }
        });
    }
    catch (error) {
        console.error('Error fetching gifts:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch gifts",
            error: "Internal server error"
        });
    }
});
router.get("/location/country-names", async function (req, res) {
    return res.status(200).json({ success: true, message: "ok", data: { names: countryNames_1.default } });
});
router.get("/location/divisions", async function (req, res) {
    return res.status(200).json({ success: true, message: "ok", data: divisions_1.Divisions });
});
router.get("/location/districts", async function (req, res) {
    try {
        let divisionSchema = zod_1.z.number().gte(1).lte(8);
        let { success, error, data } = await divisionSchema.safeParseAsync(Number(req.query.division_id));
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message,
                errorDetails: error
            });
            return;
        }
        if (success && data) {
            let districts = districts_1.Districts.filter(function (element) {
                if (element.division_id === String(data)) {
                    return element;
                }
            });
            res.status(200).json({
                success: true,
                data: districts
            });
            return;
        }
    }
    catch (error) {
        console.error("district location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;
        ;
    }
});
router.get("/location/upazilas", async function (req, res) {
    try {
        let districtSchema = zod_1.z.number().positive().gte(1).lte(64);
        let { success, error, data } = await districtSchema.safeParseAsync(Number(req.query.district_id));
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message
            });
            return;
        }
        if (success && data) {
            let upazilas = upazilas_1.Upazilas.filter(function (element) {
                if (element.district_id === String(data)) {
                    return element;
                }
            });
            res.status(200).json({
                success: true,
                data: upazilas
            });
            return;
        }
    }
    catch (error) {
        console.error("upazila location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;
    }
});
router.get("/location/unions", async function (req, res) {
    try {
        let upazilaSchema = zod_1.z.number().positive().gte(1).lte(494);
        let { success, error, data } = await upazilaSchema.safeParseAsync(Number(req.query.upazila_id));
        if (error) {
            res.status(400).json({
                success: false,
                error: error.errors[0].message
            });
            return;
        }
        if (success && data) {
            let cities = unions_1.Unions.filter(function (element) {
                if (element.upazilla_id === String(data)) {
                    return element;
                }
            });
            res.status(200).json({
                success: true,
                data: cities
            });
            return;
        }
    }
    catch (error) {
        console.error("city location data error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
        return;
    }
});
router.get('/currency', async function (req, res) {
    return res.status(200).json({
        success: true,
        data: { countryAndCurrency: currencyCodes_enum_1.countryAndCurrency }
    });
});
router.get('/languages', async function (req, res) {
    return res.status(200).json({
        success: true,
        data: {
            levels: Object.values(user_types_1.Language)
        }
    });
});
router.get('/education', async function (req, res) {
    return res.status(200).json({
        success: true,
        data: {
            levels: Object.values(userEducation_types_1.EducationLevel)
        }
    });
});
router.get('/marital-status', async function (req, res) {
    return res.status(200).json({
        success: true,
        data: {
            marital_statuses: Object.values(user_types_1.MaritalStatus)
        }
    });
});
router.get('/certificates', async function (req, res) {
    try {
        const educationLevelValidator = zod_1.z.nativeEnum(userEducation_types_1.EducationLevel);
        const validationResult = await educationLevelValidator.safeParseAsync(req.query.education_level);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid education level provided",
                errors: validationResult.error
            });
        }
        const educationLevel = validationResult.data;
        const certificates = (0, getEducationCertificates_1.default)(educationLevel);
        return res.status(200).json({
            success: true,
            message: `Certificates for ${educationLevel}`,
            data: { certificates }
        });
    }
    catch (error) {
        console.error('/data/certificate api error ', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.get('/religions', async function (req, res) {
    return res.status(200).json({
        success: true,
        data: {
            marital_statuses: Object.values(user_types_1.Religion)
        }
    });
});
router.get('/religional-branch', async function (req, res) {
    try {
        let regionalBranches = {};
        regionalBranches[user_types_1.Religion.ISLAM] = Object.values(userProfile_types_1.ReligiousBranch).slice(0, 4);
        regionalBranches[user_types_1.Religion.HINDUISM] = Object.values(userProfile_types_1.ReligiousBranch).slice(4, 9);
        regionalBranches[user_types_1.Religion.BUDDHISM] = Object.values(userProfile_types_1.ReligiousBranch).slice(9, 11);
        regionalBranches[user_types_1.Religion.CHRISTIANITY] = Object.values(userProfile_types_1.ReligiousBranch).slice(11, 13);
        regionalBranches["OHTERS"] = Object.values(userProfile_types_1.ReligiousBranch).slice(13, 15);
        let schema = zod_1.z.enum([user_types_1.Religion.ISLAM, user_types_1.Religion.HINDUISM, user_types_1.Religion.BUDDHISM, user_types_1.Religion.CHRISTIANITY, "OHTERS"]);
        let religion = schema.parse(req.query.religion);
        return res.status(200).json({
            success: true,
            data: {
                branches: regionalBranches[religion]
            }
        });
    }
    catch (error) {
        if (error instanceof zod_1.ZodError) {
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
exports.default = router;
