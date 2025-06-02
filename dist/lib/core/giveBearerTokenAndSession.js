"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getBearerTokenAndAuthSession;
const auth_middleware_1 = require("../middlewares/auth.middleware");
const auth_schema_1 = require("../schema/auth.schema");
const AuthSession_1 = __importDefault(require("../../models/AuthSession"));
async function getBearerTokenAndAuthSession(req) {
    const token = (0, auth_middleware_1.extractBearerToken)(req.headers.authorization);
    if (!token)
        return { token: null, session: null };
    const validationResult = await auth_schema_1.authSessionValidation.safeParseAsync(token);
    if (!validationResult.success)
        return { token, session: null };
    const session = await AuthSession_1.default.findOne({ key: validationResult.data, expiration_date: { $gt: new Date() } });
    return { token, session };
}
