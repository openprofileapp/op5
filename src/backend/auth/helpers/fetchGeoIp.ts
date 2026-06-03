import CountryLanguage from '@ladjs/country-language';

import { wc, geoip2, log } from "../server.js";
import { config } from '../../../../app.config.js';

type GeoIp = {
    ip?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    locale?: string;
    timezone?: string;
    city?: string;
    state?: string;
    country?: string;
    continent?: string;
}

/**
 * Fetches the geolocation info based of an IP address
 * @param {string} ip - The ip to fetch the geolocation of (required)
 * @returns {object} The geolocation object
*/
export default async function fetchGeoIp(ip: string): Promise<GeoIp> {
    if (!ip) return {};

    // Validate IP
    let address = ip.trim();
    if (address.includes("::ffff:")) {
        address = address.replace("::ffff:", "");
    }

    if (!config.isProduction) {
        const localAddresses = [
            "localhost",
            "127.0.0.1",
            "::1"
        ];

        function isLocalAddress(ip: string) {
            return (
                localAddresses.includes(ip) ||
                ip.startsWith("10.") ||
                ip.startsWith("192.168.") ||
                /^172\.(1[6-9]|2\d|3[0-1])\./.test(ip)
            );
        }

        if (isLocalAddress(address)) {
            const { ip } = await wc.callAPI("https://api.ipify.org?format=json") as { ip: string; };
            address = ip;
        }
    }

    // Format geoData
    const geoData = geoip2.get(address);
    if (!geoData || ! geoData?.subdivisions) return {}

    let language = config.metadata.locale as string;

    CountryLanguage.getCountryMsLocales(geoData?.country?.iso_code as string, function (err, locales) {
        if (err) {
            log.auth.error(err).save();
        } else {
            if (locales.length > 0) {
                language = locales[0].langCultureName;
            }
        }
    });

    return { 
        ip: address,
        latitude: geoData?.location?.latitude as number,
        longitude: geoData?.location?.longitude as number,
        accuracy: geoData?.location?.accuracy_radius as number,
        locale: language,
        timezone: geoData?.location?.time_zone as string,
        city: geoData?.city?.names?.en as string,
        state: geoData?.subdivisions[0]?.names?.en as string,
        country: geoData?.country?.names?.en as string,
        continent: geoData?.continent?.names?.en as string,
    };
}