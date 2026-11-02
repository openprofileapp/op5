export type ConnectionNameType = 
    "GOOGLE" |
    "MICROSOFT" |
    "DISCORD" |
    "GITHUB" |
    "X"
;

export type ConnectionType = {
    userId: string;
    connectionId: string;
    connectionName: ConnectionNameType;
    connectionText: string;
    isMfa: boolean;
    connectedDate: string;
}
