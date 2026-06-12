export type GeoIpType = {
    ip: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    locale: string;
    timezone: string;
    city: string;
    state: string;
    country: string;
    continent: string;
};