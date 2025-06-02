"use strict";
/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = queryMiddleware;
async function queryMiddleware(req, res, next) {
    for (const [key, value] of Object.entries(req.query)) {
        if (!value)
            delete req.query[key];
        if (typeof value === 'string' && value.includes(',')) {
            req.query[key] = value.split(',');
        }
    }
    next();
}
