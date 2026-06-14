import { GeoIpType } from "./geoIp.type.js";
import { UserAgentType } from "./userAgent.type.js";

export type SessionType = {
    userId: string;
    geoIpFirstFetch: GeoIpType;
    geoIpLatestFetch: GeoIpType;
    geoIpLatestFetchExpireDate: string;
    userAgent: UserAgentType;
    inviteCode: string;
    sessionId: string;
    accessToken: string;
    accessTokenExpireDate: string;
    sessionToken: string;
    sessionTokenExpireDate: string;
    isTerminated: boolean;
    totalDuration: number;
    isConnected: boolean;
    firstConnectedDate: string;
    lastConnectedDate: string;
}