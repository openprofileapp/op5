import { Database } from "kage-library";

import { config } from "../../../../app.config.js";
import { log } from "../instances.js";

export const db = {
    accounts: new Database("data/databases/accounts.sqlite")
};

db.accounts.transaction(q => {
    if (!q("SELECT * FROM sessions LIMIT 1").success) { 
        const result = q(`${config.folders.sql.auth}/accounts/sessions.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM users LIMIT 1").success) { 
        const result = q(`${config.folders.sql.auth}/accounts/users.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM bots LIMIT 1").success) { 
        const result = q(`${config.folders.sql.auth}/accounts/bots.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM connections LIMIT 1").success) { 
        const result = q(`${config.folders.sql.auth}/accounts/connections.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };

    if (!q("SELECT * FROM emails LIMIT 1").success) { 
        const result = q(`${config.folders.sql.auth}/accounts/emails.sql`);
        if (!result.success) return log.db.error(result.error).save();
    };
});

// Migration (old databases)
export const mdb = {
    accounts: new Database("data/databases/v5.0.237/accounts.db")
};

async function waitForMDB() {
    const check = () => {
        if (
            mdb?.accounts
        ) {
            // Import migration files here
            import("./migration/accounts/connections.db.migration.js");
            import("./migration/accounts/emails.db.migration.js");
            import("./migration/accounts/users.db.migration.js");
            import("./migration/accounts/bots.db.migration.js");

            return;
        }

        setTimeout(check, 10);
    };

    check();
}

waitForMDB();