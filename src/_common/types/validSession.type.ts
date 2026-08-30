export type ValidSessionType = {
    sessionId: string;
    userId?: string;
    permissions: {
        value: string;
        array: string[];
    };
    locale: string;
    timezone: string;
    inviteCode: string;
    delegatedAccounts?: string[];
    mfaToken?: string;
    accessToken?: string;
};
