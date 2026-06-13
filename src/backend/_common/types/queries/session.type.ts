import { GeoIpType } from "./geoIp.type.js";
import { UserAgentType } from "./userAgent.type.js";

export type SessionType = {
    userId: string;
    geoIpFirstFetch: GeoIpType;
    geoIpLatestFetch: GeoIpType;
    geoIpLatestFetchDate: string;
    userAgent: UserAgentType;
    inviteCode: string;
    sessionId: string;
    accessToken: string;
    sessionToken: string;
    accessTokenExpireDate: string;
    sessionTokenExpireDate: string;
    isTerminated: boolean;
    totalDuration: number;
    isConnected: boolean;
    firstConnectedDate: string;
    lastConnectedDate: string;
}