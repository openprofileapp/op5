import cors from "cors";

import { config } from "../../../../app.config.js";

const allowedDomains = Object.values(config.domains);

const allowedOrigins = allowedDomains.map(
    domain => `https://${domain}`
);

export const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        if (origin === "null") {
            if (!config.isProduction) {
                return callback(null, true);
            }
        }

        // DEVELOPER NEED: Save this to audits
        console.error(`CORS Blocked Origin: "${origin}"`);

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
});
