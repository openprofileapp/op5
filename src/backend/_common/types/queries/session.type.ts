import { GeoIpType } from "./geoIp.type.js";
import { UserAgentType } from "./userAgent.type.js";

export type SessionType = {
    userId: string;
    geoIpFirstFetch: GeoIpType;
    geoIpLatestFetch: GeoIpType;
    geoIpLatestFetchDate: string;
    userAgent: UserAgentType;
    inviteCode: string;
    token: string;
    socketId: string;
    isTerminated: boolean;
    totalDuration: number;
    isConnected: boolean;
    firstConnected: string;
    lastConnected: string;
}