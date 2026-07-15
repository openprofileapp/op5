export type ValidSessionType = {
    sessionId?: string;
    userId?: string;
    permissions?: {
        value: string;
        array: string[];
    };
    locale?: string;
    timezone?: string;
    action?: string; // Only part of session fetch
};