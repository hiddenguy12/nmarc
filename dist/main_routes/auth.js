"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const temporarySession_1 = __importStar(require("../models/temporarySession"));
const auth_schema_1 = require("../lib/schema/auth.schema");
const auth_controller_1 = require("../controllers/auth.controller");
const crypto_1 = __importDefault(require("crypto"));
const user_1 = require("../models/user");
const auth_emails_1 = require("../lib/mails/auth.emails");
const AuthSession_1 = __importDefault(require("../models/AuthSession"));
const rateRimiter_1 = __importDefault(require("../config/rateRimiter"));
const user_types_1 = require("../lib/types/user.types");
const schemaComponents_1 = require("../lib/schema/schemaComponents");
const auth_middleware_1 = require("../lib/middlewares/auth.middleware");
const env_1 = require("../config/env");
const mid_geneator_1 = __importDefault(require("../lib/core/mid-geneator"));
const zod_1 = require("zod");
const countryNames_1 = __importDefault(require("../lib/data/countryNames"));
const VideoProfile_1 = __importDefault(require("../models/VideoProfile"));
const router = express_1.default.Router();
router.use((0, rateRimiter_1.default)(600 * 100, 100));
// Create registration session endpoint
router.post("/create-registration-session", async function (req, res) {
    try {
        const validationResult = await auth_schema_1.registrationUserSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const userData = validationResult.data;
        let existingUser = await user_1.User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }
        existingUser = await user_1.User.findOne({
            "phoneInfo.number": userData.phoneInfo.number,
            "phoneInfo.country.phone_code": userData.phoneInfo.country.phone_code
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone number is already registered for the " + userData.phoneInfo.country.name + " user's",
                data: null
            });
        }
        const sessionKey = crypto_1.default.randomBytes(32).toString('hex').normalize();
        // Create a new session
        const session = await temporarySession_1.default.create({
            name: temporarySession_1.TemporarySessionNames.REGISTRATION_SESSION,
            key: sessionKey,
            value: JSON.stringify({
                hasOtpRequest: 10, // this is the limit of requesting otp 
                ...userData
            })
        });
        // Return the session key to the client
        return res.status(200).json({
            success: true,
            message: "Registration session created successfully",
            data: {
                sessionKey: session.key
            }
        });
    }
    catch (error) {
        console.error("Create registration session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
// Request registration OTP endpoint
router.post("/request-registration-otp", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.tempSessionValidation.safeParseAsync(req.body.sessionKey);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        let sessionKey = validationResult.data;
        if (!sessionKey) {
            return res.status(400).json({
                success: false,
                message: "Session key is required",
                data: null
            });
        }
        // Find the session
        const session = await temporarySession_1.default.findOne()
            .where('key').equals(sessionKey);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse user data from session
        const userData = JSON.parse(session.value);
        // Generate OTP
        const otp = env_1.NODE_ENV === 'developement' ? 123456 : (0, auth_controller_1.GenerateOtp)(); // 6-digit OTPc
        // NODE_ENV === 'developement' && console.log(`otp is ${otp}`);
        // Now User Has less request left
        userData.hasOtpRequest -= 1;
        // Store OTP in session
        session.value = JSON.stringify({
            ...userData,
            otp,
            otpExpiry: Date.now() + 70 * 1000 // OTP valid for 1 minutes 25 seconds
        });
        switch (userData.hasOtpRequest < 1) {
            case true:
                await session.deleteOne();
                break;
            case false:
                await session.save();
                break;
        }
        // Send OTP via email
        const emailSent = await auth_emails_1.authEmails.registrationOtpEmail(otp, userData.email);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP",
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: null
        });
    }
    catch (error) {
        console.error("Request registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
// Verify registration OTP endpoint
router.post("/verify-registration-otp", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.VerifyOtpSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const { sessionKey, otp } = validationResult.data;
        if (!sessionKey || !otp) {
            return res.status(400).json({
                success: false,
                message: "Session key and OTP are required",
                data: null
            });
        }
        // Find the session
        const session = await temporarySession_1.default.findOne({
            key: sessionKey,
        });
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Verify OTP
        if (!sessionData.otp || sessionData.otp != otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                data: null
            });
        }
        // Check OTP expiry
        if (Date.now() > sessionData.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
                data: null
            });
        }
        // Check if email is already registered
        let existingUser = await user_1.User.findOne({ email: sessionData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }
        existingUser = await user_1.User.findOne({ "phoneInfo.number": sessionData.phoneInfo.number, "phoneInfo.country.phone_code": sessionData.phoneInfo.country.phone_code });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone number is already registered for the " + sessionData.phoneInfo.country.name + " user's",
                data: null
            });
        }
        let passwordSalt = (0, auth_controller_1.generateSalt)();
        let passwordHash = await (0, auth_controller_1.hashPassword)(sessionData.password, passwordSalt);
        // Save user data to the database
        const newUser = new user_1.User({
            mid: (0, mid_geneator_1.default)(),
            profileCreatedBy: sessionData.profileCreatedBy,
            name: sessionData.name,
            gender: sessionData.gender,
            dateOfBirth: sessionData.dateOfBirth,
            email: sessionData.email,
            height: sessionData.height,
            weight: sessionData.weight,
            isEducated: sessionData.isEducated,
            education: sessionData.education,
            address: sessionData.address,
            phoneInfo: sessionData.phoneInfo,
            languages: sessionData.languages,
            religion: sessionData.religion,
            password: {
                hashed: passwordHash,
                salt: passwordSalt
            },
            createdAt: new Date(),
            age: sessionData.age,
            enhancedSettings: {
                blocked: [],
                privacy: {},
                notifications: {}
            }
        });
        newUser.createPreference();
        await newUser.save();
        // Send registration success email
        auth_emails_1.authEmails.registrationSuccessEmail(newUser.email)
            .catch(error => console.error('registration Success Email sending Error'));
        // Delete the registration session
        await session.deleteOne();
        // Create auth token for successful verification
        const authToken = (0, auth_controller_1.giveAuthSession)();
        // Create auth session
        await AuthSession_1.default.create({
            key: authToken,
            value: (0, auth_controller_1.giveAuthSessionValue)(newUser)
        });
        // Return success response
        return res.status(200).json({
            success: true,
            message: "OTP verified and registration successful",
            data: {
                userId: newUser._id,
                authToken
            }
        });
    }
    catch (error) {
        console.error("Verify registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post('/is-registration-successfull', async function (req, res) {
    try {
        let schema = zod_1.z.object({
            userId: zod_1.z.optional(schemaComponents_1._idValidator),
            authToken: zod_1.z.optional(auth_schema_1.authSessionValidation)
        })
            .refine(data => {
            return !!data.userId || !!data.authToken;
        }, {
            message: "User Id or User Auth session is required",
            path: ['userId', 'authToken']
        });
        let { userId, authToken } = schema.parse(req.body);
        let user;
        if (userId) {
            user = await user_1.User.findById(userId);
            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'No User is registered with this data ',
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    name: user.name,
                    _id: user._id
                },
                error: null,
                message: 'User is registered'
            });
            return;
        }
        if (authToken) {
            let session = await AuthSession_1.default.findOne({ key: authToken });
            if (session) {
                let userId = session?.value.userId;
                user = await user_1.User.findById(userId);
            }
            if (!user) {
                res.status(400).json({
                    success: false,
                    message: 'No User is registered with this data ',
                    data: null
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: {
                    name: user.name,
                    _id: user._id
                },
                error: null,
                message: 'User is registered'
            });
            return;
        }
    }
    catch (error) {
        console.error('[is-registration-successful api error]', error);
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/login', async function (req, res) {
    try {
        let { credential, password } = req.body;
        if (!credential || !password) {
            return res.status(400).json({
                success: false,
                message: "Credential and password are required",
                data: null
            });
        }
        if (typeof credential !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Credential and password are not string",
                data: null
            });
        }
        [credential, password] = [credential, password].map(el => el.trim());
        // Email regex remains the same as it's already robust
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10,15}$/;
        let existingUser = null;
        let loginType;
        if (emailRegex.test(credential)) {
            // Handle email login
            loginType = auth_schema_1.LoginEnum.withEmail;
            const validateEmail = await schemaComponents_1.emailValidatior.safeParseAsync(credential);
            if (!validateEmail.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    data: null
                });
            }
            existingUser = await user_1.User.findOne({ email: credential });
        }
        else {
            if (phoneRegex.test(credential) === false) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credential format. Please provide a valid email or phone number",
                    data: null
                });
            }
            loginType = auth_schema_1.LoginEnum.withPhone;
            existingUser = await user_1.User.findOne({
                'phoneInfo.number': credential
            });
        }
        // Rest of the login logic remains the same
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No account found with these credentials",
                data: null
            });
        }
        const isPasswordValid = await (0, auth_controller_1.comparePasswords)({
            password: password,
            hashedPassword: existingUser.password.hashed,
            salt: existingUser.password.salt
        });
        if (!isPasswordValid) {
            // Log failed attempts
            console.warn(`[Failed Login] ${new Date().toISOString()} - Invalid password for user: ${existingUser._id}`);
            return res.status(401).json({
                success: false,
                message: "Invalid password",
                data: null
            });
        }
        const authToken = (0, auth_controller_1.giveAuthSession)();
        console.log(authToken);
        // Remove any previous auth session for the user
        await AuthSession_1.default.deleteOne({ 'value.email': existingUser.email });
        // Create a new auth session for the user
        await AuthSession_1.default.create({
            key: authToken,
            value: (0, auth_controller_1.giveAuthSessionValue)(existingUser)
        });
        // Return the response with the new auth token
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                email: existingUser.email,
                name: existingUser.name,
                userId: existingUser._id,
                authToken: authToken,
            }
        });
    }
    catch (error) {
        console.error('[Login API Error]:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login. Please try again.",
            data: null
        });
    }
});
router.post('/reset-password', async function (req, res) {
    try {
        let validationResult = await auth_schema_1.ResetPasswordSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                error: validationResult.error
            });
        }
        let { userId, password, newPassword } = validationResult.data;
        let existingUser = await user_1.User.findById(userId);
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "There is no user registered with this account",
                data: null
            });
        }
        const isPasswordEqual = await (0, auth_controller_1.comparePasswords)({
            password: password,
            hashedPassword: existingUser.password.hashed,
            salt: existingUser.password.salt
        });
        if (!isPasswordEqual) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please try again.",
                data: null
            });
        }
        let newPasswordSalt = (0, auth_controller_1.generateSalt)();
        let newPasswordHash = await (0, auth_controller_1.hashPassword)(newPassword, newPasswordSalt);
        existingUser.password.salt = newPasswordSalt;
        existingUser.password.hashed = newPasswordHash;
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: "Password reset successfull",
            data: null
        });
    }
    catch (error) {
        console.error("Reset Password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            data: null
        });
    }
});
// Create forget password session
router.post("/create-forget-password-session", async function (req, res) {
    try {
        // Validate email
        const validationResult = await schemaComponents_1.emailValidatior.safeParseAsync(req.body.email || "");
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const email = validationResult.data;
        // Check if user exists
        const existingUser = await user_1.User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
                data: null
            });
        }
        const sessionKey = crypto_1.default.randomBytes(32).toString('hex').normalize();
        // Create a new session
        const session = await temporarySession_1.default.create({
            name: temporarySession_1.TemporarySessionNames.FORGET_PASSWORD_SESSION,
            key: sessionKey,
            value: JSON.stringify({
                hasOtpRequest: 10, // OTP request limit
                email,
                userId: existingUser._id
            })
        });
        return res.status(200).json({
            success: true,
            message: "Forget password session created successfully",
            data: {
                sessionKey: session.key
            }
        });
    }
    catch (error) {
        console.error("Create forget password session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
// Request forget password OTP
router.post("/request-forget-password-otp", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.tempSessionValidation.safeParseAsync(req.body.sessionKey);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        let sessionKey = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.FORGET_PASSWORD_SESSION);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Generate OTP
        const otp = (0, auth_controller_1.GenerateOtp)();
        // Update remaining OTP requests
        sessionData.hasOtpRequest -= 1;
        // Store OTP in session
        session.value = JSON.stringify({
            ...sessionData,
            otp,
            otpExpiry: Date.now() + 70 * 1000 // OTP valid for 1 minute 10 seconds
        });
        // Handle session based on remaining OTP requests
        if (sessionData.hasOtpRequest < 1) {
            await session.deleteOne();
        }
        else {
            await session.save();
        }
        // Send OTP via email
        const emailSent = await auth_emails_1.authEmails.forgotPasswordOtpEmail(otp, sessionData.email);
        if (!emailSent) {
            return res.status(500).json({
                success: false,
                message: "Failed to send OTP",
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: null
        });
    }
    catch (error) {
        console.error("Request forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
// Verify forget password OTP and reset password
router.post("/verify-forget-password-otp", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.VerifyForgotPasswordOtpSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const { sessionKey, otp, newPassword } = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.FORGET_PASSWORD_SESSION);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Verify OTP
        if (!sessionData.otp || sessionData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                data: null
            });
        }
        // Check OTP expiry
        if (Date.now() > sessionData.otpExpiry) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
                data: null
            });
        }
        // Find user and update password
        const user = await user_1.User.findById(sessionData.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }
        // Generate new password hash and salt
        const passwordSalt = (0, auth_controller_1.generateSalt)();
        const passwordHash = await (0, auth_controller_1.hashPassword)(newPassword, passwordSalt);
        // Update user's password
        user.password = {
            hashed: passwordHash,
            salt: passwordSalt
        };
        await user.save();
        // Delete the session
        await session.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            data: null
        });
    }
    catch (error) {
        console.error("Verify forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
// Verify forget password OTP and reset password
router.post("/log-out", auth_middleware_1.validateUser, async function (req, res) {
    try {
        if (!req.authSession || !req.authSession?.value) {
            res.status(401).json({
                success: false,
                message: 'Failed to authorize the user',
                data: null
            });
            return;
        }
        await req.authSession?.deleteOne();
        res.status(200).json({
            success: true,
            message: "Logout completed successfully",
            data: null
        });
        return;
    }
    catch (error) {
        console.error("Log out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/create-registration-session/video-profile", async function (req, res) {
    try {
        // Define schema for video profile registration
        const videoProfileRegistrationSchema = zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters").max(120),
            email: schemaComponents_1.emailValidatior,
            phone: zod_1.z.string().regex(/^\d{10,15}$/),
            password: schemaComponents_1.passwordValidator,
            gender: zod_1.z.enum(["male", "female", "other"]),
            languages: zod_1.z.array(zod_1.z.nativeEnum(user_types_1.Language)).min(1, "At least one language is required"),
            location: zod_1.z.object({
                country: zod_1.z.enum([countryNames_1.default[0], ...(countryNames_1.default.filter((el, index) => ((index > 0) && el)))]),
                longitude: zod_1.z.number(),
                latitude: zod_1.z.number()
            }),
            dateOfBirth: zod_1.z.string()
                .transform((str) => new Date(str))
                .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
                message: "Invalid dateOfBirth date format"
            })
                .refine((date) => date < new Date(), {
                message: "Date of birth cannot be in the future"
            })
                .refine((date) => {
                const age = Math.floor((new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 16 && age <= 80;
            }, {
                message: "You must be at least 16 to 80 years old"
            }),
        })
            .transform((data) => ({ ...data, age: Math.floor((new Date().getTime() - data.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) }));
        const validationResult = await videoProfileRegistrationSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const userData = validationResult.data;
        // Check if user already exists
        let existingUser = await VideoProfile_1.default.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }
        const sessionKey = crypto_1.default.randomBytes(32).toString('hex').normalize();
        // Create a new session
        const session = await temporarySession_1.default.create({
            name: temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_REGISTATION,
            key: sessionKey,
            value: JSON.stringify({
                hasOtpRequest: 10, // OTP request limit
                ...userData
            })
        });
        return res.status(200).json({
            success: true,
            message: "Video profile registration session created successfully",
            data: {
                sessionKey: session.key
            }
        });
    }
    catch (error) {
        console.error("Create video profile registration session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/request-registration-otp/video-profile", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.tempSessionValidation.safeParseAsync(req.body.sessionKey);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        let sessionKey = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_REGISTATION);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse user data from session
        const userData = JSON.parse(session.value);
        // Generate OTP
        const otp = env_1.NODE_ENV === 'developement' ? 123456 : (0, auth_controller_1.GenerateOtp)();
        // Decrease remaining OTP requests
        userData.hasOtpRequest -= 1;
        // Store OTP in session
        session.value = JSON.stringify({
            ...userData,
            otp,
            otpExpiry: Date.now() + 300 * 1000 // OTP valid for 5 minutes
        });
        // Handle session based on remaining OTP requests
        if (userData.hasOtpRequest < 1) {
            await session.deleteOne();
            return res.status(400).json({
                success: false,
                message: "OTP request limit exceeded",
                data: null
            });
        }
        else {
            await session.save();
        }
        // Send OTP via email
        let emailSent = await auth_emails_1.authEmails.registrationOtpEmail(otp, userData.email);
        if (!emailSent) {
            res.status(400).json({
                success: false,
                message: 'Failed To send Verification Otp',
                data: null
            });
            return;
        }
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: {
                email: userData.email,
                remainingAttempts: userData.hasOtpRequest
            }
        });
    }
    catch (error) {
        console.error("Request video profile registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/verify-registration-otp/video-profile", async function (req, res) {
    try {
        const validationResult = await auth_schema_1.VerifyOtpSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const { sessionKey, otp } = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_REGISTATION);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Verify OTP
        if (sessionData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                data: null
            });
        }
        // Check OTP expiry
        if (sessionData.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
                data: null
            });
        }
        // Generate password hash
        const passwordSalt = (0, auth_controller_1.generateSalt)();
        const passwordHash = await (0, auth_controller_1.hashPassword)(sessionData.password, passwordSalt);
        const authToken = crypto_1.default.randomBytes(32).toString('hex').normalize();
        // Create new video profile user
        const newUser = await VideoProfile_1.default.create({
            name: sessionData.name,
            email: sessionData.email,
            passwordDetails: {
                hashed: passwordHash,
                salt: passwordSalt
            },
            gender: sessionData.gender,
            languages: sessionData.languages,
            country: sessionData.country,
            location: sessionData.location,
            auth: {
                authSession: authToken,
                lastLoggedIn: [new Date()]
            },
            phone: sessionData.phone,
            dateOfBirth: sessionData.dateOfBirth,
            age: sessionData.age
        });
        // Delete temporary session
        await session.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Registration successful",
            data: {
                userId: newUser._id,
                authToken
            }
        });
    }
    catch (error) {
        console.error("Verify video profile registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post('/is-registration-successfull/video-profile', async function (req, res) {
    try {
        let schema = zod_1.z.object({
            userId: zod_1.z.optional(schemaComponents_1._idValidator),
            authToken: zod_1.z.optional(auth_schema_1.authSessionValidation)
        })
            .refine(data => {
            return !!data.userId || !!data.authToken;
        }, {
            message: "User Id or User Auth session is required",
            path: ['userId', 'authToken']
        });
        let { userId, authToken } = schema.parse(req.body);
        let user;
        if (userId) {
            user = await VideoProfile_1.default.findById(userId);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'No video profile user is registered with this data',
                    data: null
                });
            }
            return res.status(200).json({
                success: true,
                data: {
                    name: user.name,
                    _id: user._id
                },
                error: null,
                message: 'Video profile user is registered'
            });
        }
        if (authToken) {
            let user = await VideoProfile_1.default.findOne({ 'auth.authSession': authToken,
                "auth.session_exp_date": { $gt: new Date() }
            });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'No video profile user is registered with this data',
                    data: null
                });
            }
            return res.status(200).json({
                success: true,
                data: {
                    name: user.name,
                    _id: user._id
                },
                error: null,
                message: 'Video profile user is registered'
            });
        }
    }
    catch (error) {
        console.error('[is-registration-successful/video-profile api error]', error);
        if (error instanceof zod_1.ZodError) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null
        });
    }
});
router.post('/login/video-profile', async function (req, res) {
    try {
        let { credential, password } = req.body;
        if (!credential || !password) {
            return res.status(400).json({
                success: false,
                message: "Credential and password are required",
                data: null
            });
        }
        if (typeof credential !== 'string' || typeof password !== 'string') {
            return res.status(400).json({
                success: false,
                message: "Credential and password are not string",
                data: null
            });
        }
        [credential, password] = [credential, password].map(el => el.trim());
        // Email regex remains the same as it's already robust
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        let existingUser = null;
        let loginType;
        const phoneRegex = /^\d{10,15}$/;
        if (emailRegex.test(credential)) {
            // Handle email login
            loginType = auth_schema_1.LoginEnum.withEmail;
            const validateEmail = await schemaComponents_1.emailValidatior.safeParseAsync(credential);
            if (!validateEmail.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    data: null
                });
            }
            existingUser = await VideoProfile_1.default.findOne({ email: credential });
        }
        else {
            if (phoneRegex.test(credential) === false) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credential format. Please provide a valid email or phone number",
                    data: null
                });
            }
            loginType = auth_schema_1.LoginEnum.withPhone;
            existingUser = await VideoProfile_1.default.findOne({
                phone: credential
            });
        }
        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "No account found with these credentials",
                data: null
            });
        }
        // Verify password
        const isPasswordValid = await (0, auth_controller_1.comparePasswords)({
            password,
            hashedPassword: existingUser.passwordDetails.hashed,
            salt: existingUser.passwordDetails.salt
        });
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials",
                data: null
            });
        }
        let authToken = crypto_1.default.randomBytes(32).toString('hex').normalize();
        existingUser.auth.authSession = authToken;
        existingUser.auth.session_exp_date = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        existingUser.auth.lastLoggedIn.push(new Date());
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                userId: existingUser._id,
                authToken: authToken,
                name: existingUser.name,
                email: existingUser.email
            }
        });
    }
    catch (error) {
        console.error("Video profile login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/create-forget-password-session/video-profile", async function (req, res) {
    try {
        // Validate email
        const validationResult = await schemaComponents_1.emailValidatior.safeParseAsync(req.body?.email);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const email = validationResult.data;
        // Check if user exists
        const existingUser = await VideoProfile_1.default.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No video profile account found with this email",
                data: null
            });
        }
        const sessionKey = crypto_1.default.randomBytes(32).toString('hex').normalize();
        // Create a new session
        const session = await temporarySession_1.default.create({
            name: temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD,
            key: sessionKey,
            value: JSON.stringify({
                hasOtpRequest: 10, // OTP request limit
                email,
                userId: existingUser._id
            })
        });
        return res.status(200).json({
            success: true,
            message: "Forget password session created successfully",
            data: {
                sessionKey: session.key
            }
        });
    }
    catch (error) {
        console.error("Create video profile forget password session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/request-forget-password-otp/video-profile", async function (req, res) {
    try {
        let validationResult = await auth_schema_1.tempSessionValidation.safeParseAsync(req.body.sessionKey);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        let sessionKey = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Generate OTP
        const otp = env_1.NODE_ENV === 'developement' ? 123456 : (0, auth_controller_1.GenerateOtp)();
        // Update remaining OTP requests
        sessionData.hasOtpRequest -= 1;
        // Store OTP in session
        session.value = JSON.stringify({
            ...sessionData,
            otp,
            otpExpiry: Date.now() + 300 * 1000 // OTP valid for 5 minutes
        });
        // Handle session based on remaining OTP requests
        if (sessionData.hasOtpRequest < 1) {
            await session.deleteOne();
            return res.status(400).json({
                success: false,
                message: "OTP request limit exceeded",
                data: null
            });
        }
        else {
            await session.save();
        }
        // Send OTP via email
        const user = await VideoProfile_1.default.findById(sessionData.userId);
        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Failed To find User Account from the email',
                data: null
            });
            return;
        }
        let isEmailSent = await auth_emails_1.authEmails.forgotPasswordOtpEmail(otp, user.email);
        if (!isEmailSent) {
            res.status(400).json({
                success: false,
                message: 'Failed to send Forget Password Otp',
                data: null
            });
            return;
        }
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            data: {
                email: sessionData.email,
                remainingAttempts: sessionData.hasOtpRequest
            }
        });
    }
    catch (error) {
        console.error("Request video profile forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/verify-forget-password-otp/video-profile", async function (req, res) {
    try {
        const validationResult = await auth_schema_1.VerifyForgotPasswordOtpSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const { sessionKey, otp, newPassword } = validationResult.data;
        // Find the session
        const session = await temporarySession_1.default.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(temporarySession_1.TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD);
        if (!session) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired session",
                data: null
            });
        }
        // Parse session data
        const sessionData = JSON.parse(session.value);
        // Verify OTP
        if (sessionData.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
                data: null
            });
        }
        // Check OTP expiry
        if (sessionData.otpExpiry < Date.now()) {
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
                data: null
            });
        }
        // Find user
        const user = await VideoProfile_1.default.findById(sessionData.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }
        // Generate new password hash
        const passwordSalt = (0, auth_controller_1.generateSalt)();
        const passwordHash = await (0, auth_controller_1.hashPassword)(newPassword, passwordSalt);
        // Update user's password
        user.passwordDetails = {
            hashed: passwordHash,
            salt: passwordSalt
        };
        await user.save();
        // Delete the session
        await session.deleteOne();
        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            data: null
        });
    }
    catch (error) {
        console.error("Verify video profile forget password OTP error:", error);
        if (error instanceof zod_1.ZodError) {
            res.status(400).json({
                success: false,
                message: 'Invalid request parameters',
                error: error.errors,
                data: null
            });
            return;
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
router.post("/reset-password/video-profile", async function (req, res) {
    try {
        const validationResult = await auth_schema_1.ResetPasswordSchema.safeParseAsync(req.body);
        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }
        const { userId, password, newPassword } = validationResult.data;
        // Find user
        const existingUser = await VideoProfile_1.default.findById(userId);
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "There is no video profile user registered with this account",
                data: null
            });
        }
        // Verify current password
        const isPasswordEqual = await (0, auth_controller_1.comparePasswords)({
            password: password,
            hashedPassword: existingUser.passwordDetails.hashed,
            salt: existingUser.passwordDetails.salt
        });
        if (!isPasswordEqual) {
            return res.status(401).json({
                success: false,
                message: "Invalid password. Please try again.",
                data: null
            });
        }
        // Generate new password hash
        let newPasswordSalt = (0, auth_controller_1.generateSalt)();
        let newPasswordHash = await (0, auth_controller_1.hashPassword)(newPassword, newPasswordSalt);
        // Update password
        existingUser.passwordDetails.salt = newPasswordSalt;
        existingUser.passwordDetails.hashed = newPasswordHash;
        await existingUser.save();
        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            data: null
        });
    }
    catch (error) {
        console.error("Reset video profile password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            data: null
        });
    }
});
router.post("/log-out/video-profile", auth_middleware_1.validateVideoProfile, async function (req, res) {
    try {
        if (!req.videoProfile && !req.videoProfile?._id) {
            res.status(401).json({
                success: false,
                message: 'Invalid request parameters',
                data: null
            });
            return;
        }
        let updatedUser = await VideoProfile_1.default.updateOne({
            _id: req.videoProfile._id,
            "auth.session_exp_date": { $gt: new Date() }
        }, {
            "auth.authSession": undefined,
            "auth.session_exp_date": new Date(),
            status: "offline"
        });
        if (!updatedUser) {
            res.status(400).json({
                success: false,
                message: "Failed To Logged Out the User",
                data: null
            });
            return;
        }
        return res.status(200).json({
            success: true,
            message: "Logout completed successfully",
            data: null
        });
    }
    catch (error) {
        console.error("Video profile log out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});
exports.default = router;
