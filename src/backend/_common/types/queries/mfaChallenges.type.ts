export type MfaChallengesType = {
    mfaToken: string;
    userId: string;
    type: string;
    attempts: number;
    expireDate: string;
    completedDate: string;
    createdDate: string;
}