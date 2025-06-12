/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import express, { Router, Request, Response } from "express";
import TemporarySession, { TemporarySessionNames } from "../models/temporarySession";
import { registrationUserSchema, LoginEnum, LoginSchema, tempSessionValidation, VerifyOtpSchema, ResetPasswordSchema, VerifyForgotPasswordOtpSchema, authSessionValidation } from "../lib/schema/auth.schema";
import { comparePasswords, GenerateOtp, giveAuthSessionId, generateSalt, hashPassword, giveAuthSession, giveAuthSessionValue, validatePhoneNumber } from "../controllers/auth.controller";
import crypto from 'crypto';
import { User } from "../models/user";
import { authEmails } from "../lib/mails/auth.emails";
import AuthSession, { IAuthSession } from "../models/AuthSession";
import rateLimiter from "../config/rateRimiter";
import { IUser, Language } from "../lib/types/user.types";
import { _idValidator, emailValidatior, passwordValidator } from "../lib/schema/schemaComponents";
import { validateUser, validateVideoProfile } from "../lib/middlewares/auth.middleware";
import { NODE_ENV } from "../config/env";
import { CountryNamesEnum } from "../lib/types/country_names.enum";
import generateMatrimonyId from "../lib/core/mid-geneator";
import { z, ZodError } from "zod";
import countryNames from "../lib/data/countryNames";
import VideoProfile, { IVideoProfile } from "../models/VideoProfile";
const router: Router = express.Router();



router.use(rateLimiter(600 * 100, 100));

// Create registration session endpoint
router.post("/create-registration-session", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const validationResult = await registrationUserSchema.safeParseAsync(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                errors: validationResult.error
            });
        }

        const userData = validationResult.data;


        let existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }


        existingUser = await User.findOne({
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

        const sessionKey = crypto.randomBytes(32).toString('hex').normalize();

        // Create a new session
        const session = await TemporarySession.create({
            name: TemporarySessionNames.REGISTRATION_SESSION,
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

    } catch (error) {
        console.error("Create registration session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

// Request registration OTP endpoint
router.post("/request-registration-otp", async function (req: Request, res: Response): Promise<Response | any> {
    try {

        let validationResult = await tempSessionValidation.safeParseAsync(req.body.sessionKey)

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
        const session = await TemporarySession.findOne()
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
        const otp = NODE_ENV === 'developement' ? 123456 : GenerateOtp() // 6-digit OTPc
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
                await session.deleteOne()
                break;

            case false:
                await session.save();
                break;
        }


        // Send OTP via email

        const emailSent = await authEmails.registrationOtpEmail(otp, userData.email)

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

    } catch (error) {
        console.error("Request registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


// Verify registration OTP endpoint
router.post("/verify-registration-otp", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await VerifyOtpSchema.safeParseAsync(req.body);

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
        const session = await TemporarySession.findOne({
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
        let existingUser = await User.findOne({ email: sessionData.email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }


        existingUser = await User.findOne({ "phoneInfo.number": sessionData.phoneInfo.number, "phoneInfo.country.phone_code": sessionData.phoneInfo.country.phone_code });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Phone number is already registered for the " + sessionData.phoneInfo.country.name + " user's",
                data: null
            });
        }

        let passwordSalt = generateSalt();
        let passwordHash = await hashPassword(sessionData.password, passwordSalt)

        // Save user data to the database
        const newUser = new User({
            mid: generateMatrimonyId(),
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
        authEmails.registrationSuccessEmail(newUser.email)
            .catch(error => console.error('registration Success Email sending Error'));


        // Delete the registration session
        await session.deleteOne();


        // Create auth token for successful verification
        const authToken = giveAuthSession();

        // Create auth session
        await AuthSession.create({
            key: authToken,
            value: giveAuthSessionValue(newUser)
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

    } catch (error) {
        console.error("Verify registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


router.post('/is-registration-successfull', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let schema = z.object({
            userId: z.optional(_idValidator),
            authToken: z.optional(authSessionValidation)
        })
            .refine(data => {
                return !!data.userId || !!data.authToken
            },
                {
                    message: "User Id or User Auth session is required",
                    path: ['userId', 'authToken']
                });
        let { userId, authToken } = schema.parse(req.body);
        let user;
        if (userId) {
            user = await User.findById(userId);
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
            })
            return;
        }
        if (authToken) {
            let session = await AuthSession.findOne({ key: authToken });
            if (session) {
                let userId = session?.value.userId;
                user = await User.findById(userId);
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
            })
            return;
        }

    } catch (error) {
        console.error('[is-registration-successful api error]', error);

        if (error instanceof ZodError) {
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
})


router.post('/login', async function (req: Request, res: Response): Promise<Response | any> {
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
        let existingUser: IUser | null = null;
        let loginType: LoginEnum;
        

        if (emailRegex.test(credential)) {
            // Handle email login
            loginType = LoginEnum.withEmail;
            const validateEmail = await emailValidatior.safeParseAsync(credential);

            if (!validateEmail.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    data: null
                });
            }

            existingUser = await User.findOne({ email: credential });
        } else {
            if (phoneRegex.test(credential) === false) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credential format. Please provide a valid email or phone number",
                    data: null
                });
            }


            loginType = LoginEnum.withPhone;

            existingUser = await User.findOne({
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


        const isPasswordValid = await comparePasswords({
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


        const authToken = giveAuthSession();

        // Remove any previous auth session for the user
        await AuthSession.deleteOne({ 'value.email': existingUser.email });

        // Create a new auth session for the user
        await AuthSession.create({
            key: authToken,
            value: giveAuthSessionValue(existingUser)
        });

        // Return the response with the new auth token
        return res.status(200).json({
            success: true,
            message: "Login successful.",
            data: {
                email: existingUser.email,
                name : existingUser.name,
                userId: existingUser._id,
                authToken: authToken,
                
            }
        });

    } catch (error) {
        console.error('[Login API Error]:', error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login. Please try again.",
            data: null
        });
    }
});


router.post('/reset-password', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await ResetPasswordSchema.safeParseAsync(req.body);

        if (!validationResult.success) {
            return res.status(400).json({
                success: false,
                message: validationResult.error.errors[0].message,
                data: null,
                error: validationResult.error
            });
        }

        let { userId, password, newPassword } = validationResult.data;

        let existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "There is no user registered with this account",
                data: null
            });
        }

        const isPasswordEqual = await comparePasswords({
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

        let newPasswordSalt = generateSalt();
        let newPasswordHash = await hashPassword(newPassword, newPasswordSalt);

        existingUser.password.salt = newPasswordSalt;
        existingUser.password.hashed = newPasswordHash;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfull",
            data: null
        })


    } catch (error) {
        console.error("Reset Password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            data: null
        });
    }
});


// Create forget password session
router.post("/create-forget-password-session", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        // Validate email
        const validationResult = await emailValidatior.safeParseAsync(req.body.email || "");

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
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
                data: null
            });
        }

        const sessionKey = crypto.randomBytes(32).toString('hex').normalize();

        // Create a new session
        const session = await TemporarySession.create({
            name: TemporarySessionNames.FORGET_PASSWORD_SESSION,
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

    } catch (error) {
        console.error("Create forget password session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


// Request forget password OTP
router.post("/request-forget-password-otp", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await tempSessionValidation.safeParseAsync(req.body.sessionKey);

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
        const session = await TemporarySession.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.FORGET_PASSWORD_SESSION);

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
        const otp = GenerateOtp();

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
        } else {
            await session.save();
        }

        // Send OTP via email
        const emailSent = await authEmails.forgotPasswordOtpEmail(otp, sessionData.email);

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

    } catch (error) {
        console.error("Request forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


// Verify forget password OTP and reset password
router.post("/verify-forget-password-otp", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await VerifyForgotPasswordOtpSchema.safeParseAsync(req.body);

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
        const session = await TemporarySession.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.FORGET_PASSWORD_SESSION);

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
        const user = await User.findById(sessionData.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        // Generate new password hash and salt
        const passwordSalt = generateSalt();
        const passwordHash = await hashPassword(newPassword, passwordSalt);

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

    } catch (error) {
        console.error("Verify forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


// Verify forget password OTP and reset password
router.post("/log-out", validateUser, async function (req: Request, res: Response): Promise<Response | any> {
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
        })
        return;
    } catch (error) {
        console.error("Log out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});


router.post("/create-registration-session/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        // Define schema for video profile registration
        const videoProfileRegistrationSchema = z.object({
            name: z.string().min(2, "Name must be at least 2 characters").max(120),
            email: emailValidatior,
            phone : z.string().regex(/^\d{10,15}$/),
            password: passwordValidator,
            gender: z.enum(["male", "female", "other"]),
            languages: z.array(z.nativeEnum(Language)).min(1, "At least one language is required"),
            location: z.object({
                country: z.enum([countryNames[0] , ...(countryNames.filter((el:any , index:number) => ((index > 0) && el)))]),
                longitude: z.number(),
                latitude: z.number()
            }),
            dateOfBirth :  z.string()
            .transform((str) => new Date(str))
            .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
                message: "Invalid dateOfBirth date format"
            })
            .refine((date) => date < new Date(), {
                message: "Date of birth cannot be in the future"
            })
            .refine(
                (date) => {
                const age = Math.floor((new Date().getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
                return age >= 16 && age <= 80;
            },
            {
                message: "You must be at least 16 to 80 years old"
            }
        ),
        })
        .transform((data) => ({ ...data , age : Math.floor((new Date().getTime() - data.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000))}))
        
        ;

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
        let existingUser = await VideoProfile.findOne({ email: userData.email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email is already registered",
                data: null
            });
        }

        const sessionKey = crypto.randomBytes(32).toString('hex').normalize();

        // Create a new session
        const session = await TemporarySession.create({
            name: TemporarySessionNames.VIDEO_PROFILE_REGISTATION,
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
    } catch (error) {
        console.error("Create video profile registration session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

router.post("/request-registration-otp/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await tempSessionValidation.safeParseAsync(req.body.sessionKey);

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
        const session = await TemporarySession.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.VIDEO_PROFILE_REGISTATION);

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
        const otp = NODE_ENV === 'developement' ? 123456 : GenerateOtp();

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
        } else {
            await session.save();
        }

        // Send OTP via email
        let emailSent =  await authEmails.registrationOtpEmail(otp ,userData.email );

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
    } catch (error) {
        console.error("Request video profile registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

router.post("/verify-registration-otp/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const validationResult = await VerifyOtpSchema.safeParseAsync(req.body);

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
        const session = await TemporarySession.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.VIDEO_PROFILE_REGISTATION);

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
        const passwordSalt = generateSalt();
        const passwordHash = await hashPassword(sessionData.password, passwordSalt);
        const authToken =  crypto.randomBytes(32).toString('hex').normalize();

        // Create new video profile user
        const newUser = await VideoProfile.create({
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
            auth : {
                authSession : authToken,
                lastLoggedIn :[ new Date()]
            },
            phone : sessionData.phone,
            dateOfBirth : sessionData.dateOfBirth ,
            age : sessionData.age 
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
    } catch (error) {
        console.error("Verify video profile registration OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

router.post('/is-registration-successfull/video-profile', async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let schema = z.object({
            userId: z.optional(_idValidator),
            authToken: z.optional(authSessionValidation)
        })
            .refine(data => {
                return !!data.userId || !!data.authToken
            },
                {
                    message: "User Id or User Auth session is required",
                    path: ['userId', 'authToken']
                });
        
        let { userId, authToken } = schema.parse(req.body);
        let user;
        
        if (userId) {
            user = await VideoProfile.findById(userId);
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
            let user = await VideoProfile.findOne({ 'auth.authSession' : authToken ,
                "auth.session_exp_date" : { $gt : new Date()} 
            }) ;

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

           
        } catch (error) {
        console.error('[is-registration-successful/video-profile api error]', error);

        if (error instanceof ZodError) {
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

router.post('/login/video-profile', async function (req: Request, res: Response): Promise<Response | any> {
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
        let existingUser: IVideoProfile | null = null;
        let loginType: LoginEnum;
        const phoneRegex = /^\d{10,15}$/;

        if (emailRegex.test(credential)) {
            // Handle email login
            loginType = LoginEnum.withEmail;
            const validateEmail = await emailValidatior.safeParseAsync(credential);

            if (!validateEmail.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid email format",
                    data: null
                });
            }

            existingUser = await VideoProfile.findOne({ email: credential });
        } else {
            if (phoneRegex.test(credential) === false) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credential format. Please provide a valid email or phone number",
                    data: null
                });
            }

            loginType = LoginEnum.withPhone;

            existingUser = await VideoProfile.findOne({
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
        const isPasswordValid = await comparePasswords({
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

        let authToken = crypto.randomBytes(32).toString('hex').normalize();

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
                email : existingUser.email
            }
        });
    } catch (error) {
        console.error("Video profile login error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
});

router.post("/create-forget-password-session/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        // Validate email
        const validationResult = await emailValidatior.safeParseAsync(req.body?.email );

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
        const existingUser = await VideoProfile.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: "No video profile account found with this email",
                data: null
            });
        }

        const sessionKey = crypto.randomBytes(32).toString('hex').normalize();

        // Create a new session
        const session = await TemporarySession.create({
            name: TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD,
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
    } catch (error) {
        console.error("Create video profile forget password session error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
})

router.post("/request-forget-password-otp/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        let validationResult = await tempSessionValidation.safeParseAsync(req.body.sessionKey);

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
        const session = await TemporarySession.findOne({})
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD);

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
        const otp = NODE_ENV === 'developement' ? 123456 : GenerateOtp();

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
        } else {
            await session.save();
        }

        // Send OTP via email
        const user = await VideoProfile.findById(sessionData.userId);
       

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Failed To find User Account from the email',
              
                data: null
            });
            return;
        }

        let isEmailSent =await authEmails.forgotPasswordOtpEmail(otp , user.email);

        if (!isEmailSent  ) {
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
    } catch (error) {
        console.error("Request video profile forget password OTP error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
})

router.post("/verify-forget-password-otp/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const validationResult = await VerifyForgotPasswordOtpSchema.safeParseAsync(req.body);

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
        const session = await TemporarySession.findOne()
            .where('key').equals(sessionKey)
            .where('name').equals(TemporarySessionNames.VIDEO_PROFILE_FORGET_PASSWORD);

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
        const user = await VideoProfile.findById(sessionData.userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
                data: null
            });
        }

        // Generate new password hash
        const passwordSalt = generateSalt();
        const passwordHash = await hashPassword(newPassword, passwordSalt);

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
    } catch (error) {
        console.error("Verify video profile forget password OTP error:", error);

        if (error instanceof ZodError) {
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
})

router.post("/reset-password/video-profile", async function (req: Request, res: Response): Promise<Response | any> {
    try {
        const validationResult = await ResetPasswordSchema.safeParseAsync(req.body);

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
        const existingUser = await VideoProfile.findById(userId);
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "There is no video profile user registered with this account",
                data: null
            });
        }

        // Verify current password
        const isPasswordEqual = await comparePasswords({
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
        let newPasswordSalt = generateSalt();
        let newPasswordHash = await hashPassword(newPassword, newPasswordSalt);

        // Update password
        existingUser.passwordDetails.salt = newPasswordSalt;
        existingUser.passwordDetails.hashed = newPasswordHash;

        await existingUser.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful",
            data: null
        });
    } catch (error) {
        console.error("Reset video profile password error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            data: null
        });
    }
})

router.post("/log-out/video-profile", validateVideoProfile, async function (req: Request, res: Response): Promise<Response | any> {
    try {

        if (!req.videoProfile && !req.videoProfile?._id) {
            res.status(401).json({
                success: false,
                message: 'Invalid request parameters',
            
                data: null
            });
            return;
        }
            let updatedUser = await VideoProfile.updateOne(
                {
                _id : req.videoProfile._id , 
                "auth.session_exp_date"   : { $gt : new Date()}
            } , 
            { 
                "auth.authSession" : undefined ,
                 "auth.session_exp_date" : new Date(),
                 status : "offline"
                }
            );
    
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
        
      
    } catch (error) {
        console.error("Video profile log out error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            data: null
        });
    }
})




export default router;