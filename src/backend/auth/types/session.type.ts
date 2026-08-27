import { GeoIpType } from "../../../_common/types/geoIp.type.js";
import { UserAgentType } from "./userAgent.type.js";

export type SessionType = {
    sessionId: string;
    userId: string;
    geoIpFirstFetch: GeoIpType;
    geoIpLatestFetch: GeoIpType;
    geoIpLatestFetchExpireDate: string;
    userAgent: UserAgentType;
    inviteCode: string;
    accessToken: string;
    accessTokenExpireDate: string;
    mfaToken: string;
    mfaTokenExpireDate: string;
    mfaStatus: string;
    sessionToken: string;
    sessionTokenExpireDate: string;
    delegationToken: string;
    isTerminated: boolean;
    totalDuration: number;
    isConnected: boolean;
    firstConnectedDate: string;
    lastConnectedDate: string;
}

export type FetchSessionType = {
    sessionId: string;
    userId?: string | null;
    permissions: {
        value: string;
        array: string[];
    };
    locale: string;
    timezone: string;
    action?: string;
    delegatedAccounts?: string[];
};
