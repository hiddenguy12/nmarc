/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Request, Response, NextFunction, } from 'express';
import querystring from "querystring"

export default async function queryMiddleware(req: Request, res: Response, next: NextFunction) {
    for (const [key, value] of Object.entries(req.query)) {
        if (!value) delete req.query[key];
        if (typeof value === 'string' && value.includes(',')) {
            req.query[key] = value.split(',')
        }
    }
    next();
}