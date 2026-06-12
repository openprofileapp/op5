export type UserAgentOsType = {
    name: string;
    version: string;
    short_name: string;
    platform: string;
    family: string;
};

export type UserAgentClientType = {
    type: string;
    name: string;
    short_name: string;
    version: string;
    engine: string;
    engine_version: string;
    family: string;
};

export type UserAgentDeviceType = {
    id: string;
    type: string;
    brand: string;
    model: string;
};

export type UserAgentType = {
    string: string;
    os: UserAgentOsType;
    client: UserAgentClientType;
    device: UserAgentDeviceType;
    isBot: boolean;
};