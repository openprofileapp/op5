/**
 * Gracefully shuts down the server/application.
 *
 * This function is intended to be called during controlled shutdown
 * scenarios (e.g., SIGINT, SIGTERM). It should:
 * - Close database connections (if enabled)
 * - Exit the Node.js process with code 0
 *
 * @returns A promise that resolves once shutdown logging is complete.
 *
 * @example
 * process.on("SIGINT", async () => {
 *   await terminateApp(log, db);
 * });
 */

import { assertNotNull } from "../asserts/notNull.assert.js";

/* eslint-disable */
export default async function terminateApp(
    log: any,
    db?: any
) {
    assertNotNull(log);

    if (db) {
        await Promise.all(db.connections.map((c: { disconnect: () => any; }) => c.disconnect()));
    }

    await log.terminate("Application terminated").save();
    process.exit(0);
}
