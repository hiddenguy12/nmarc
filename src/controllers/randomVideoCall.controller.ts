/* بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ ﷺ InshaAllah */

import { Aggregate, AggregateExtract } from "mongoose";
import { IRandomVideoCall, RandomVideoCall } from "../models/RandomVideoCall"

class RandomVideoController {
    constructor() {
        
    }
    
    public async CheckVideoCallsOfUsersActive(latitude: number, longitude: number, language: string[]): Promise<null | IRandomVideoCall> {
        // Find users who are searching for a call, not connected yet, and within 2km distance
        // Also match at least one language preference
        let aggregation: any = [
            {
                $match: {
                    status: 'searching',
                    connectedWith: { $exists: false },
                    location: {
                        $near: {
                            $geometry: {
                                type: 'Point',
                                coordinates: [longitude, latitude]
                            },
                            $minDistance: 2000,
                            $maxDistance: 100000 // 100km in meters
                        }
                    },
                    // Match at least one language from the provided array
                    $expr: {
                        $gt: [
                            { $size: { $setIntersection: ["$languages", language] } },
                            0
                        ]
                    }
                }
            },
            {
                $limit: 1
            }
        ];
        
        let videoCall = await RandomVideoCall.aggregate(aggregation);

        if (videoCall[0]) return videoCall[0];
        else return null;
    }

   
    static GetIntance() {
        return (new RandomVideoController())
    }
}


