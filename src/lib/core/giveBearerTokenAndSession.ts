/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
import { Request } from "express";
import { extractBearerToken } from "../middlewares/auth.middleware";
import { authSessionValidation } from "../schema/auth.schema";
import AuthSession from "../../models/AuthSession";


export default async function getBearerTokenAndAuthSession(req: Request) {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) return { token: null, session: null };
    const validationResult = await authSessionValidation.safeParseAsync(token);
    if (!validationResult.success) return { token, session: null };
    const session = await AuthSession.findOne({ key: validationResult.data, expiration_date: { $gt: new Date() } });
    return { token, session };
  }