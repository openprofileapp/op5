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

        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true
});