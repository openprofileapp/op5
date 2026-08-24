import dotenv from "dotenv";
import path from "path";
import fs from "fs";

import { config } from "../../../app.config.js";
import { assertNotNull } from "../asserts/notNull.assert.js";

dotenv.config();

/**
 * Get the value of an environment variable
 */
export default function getEnv(key: string) {
    const value = process.env[key];

    if (key === "SSL") {
        return {
            cert: fs.readFileSync(
                path.join(config.folders.root, value as string, ".crt")
            ),
            key: fs.readFileSync(
                path.join(config.folders.root, value as string, ".key")
            )
        }
    }
    
    assertNotNull(key);

    return value;
}
