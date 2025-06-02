/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { ConnectionRequestStatus } from "../../models/ConnectionRequest";

export interface IUserConnectionResponse {
    users: any[];
    pagination: {
        currentPage: number;
        pageSize: number;
        totalPages?: number;
        totalUsers?: number;
    };
    requestDetails?: {
        status: ConnectionRequestStatus;
        timestamp: Date;
    };
}


