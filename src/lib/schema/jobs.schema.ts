/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { z } from "zod";

export const updateOnlineStatusSchema = z.object({
    secret: z.string().trim().min(1024).max(1024)
});