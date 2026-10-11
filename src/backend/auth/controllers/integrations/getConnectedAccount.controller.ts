import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { i18n } from "../../../_common/instances.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { ConnectionType } from "../../types/connection.type.js";
import { assertApiSecret } from "../../../_common/asserts/apiSecret.assert.js";

interface Props {
    type: string;
    id: string;
}

export const getConnectedAccountController = async (req: Request, res: Response) => {
    try {
        const { type, id } = req.params as unknown as Props;

        await assertApiSecret(req);

        const result = db.accounts.query<ConnectionType>(
            `
                SELECT userId
                FROM connections
                WHERE connectionId = ?
                AND connectionName = ?
                LIMIT 1
            `,
            [id, type.toUpperCase()]
        );
        
        assertDbSuccess(result);

        if (result.rowCount === 0) {
            return res.status(200).json({
                isConnected: false
            });
        }

        return res.status(200).json({
            isConnected: true,
            openprofileUserId: result.rows[0].userId
        });
    } catch(error) {
        if (error instanceof AdvancedError) {
            log.db.error(error).save();
            return res.status(error.code).json({
                id: error.id,
                message: error.message
            });
        } else {
            log.unknown.error(error).save();
            return res.status(500).json({
                message: i18n.t("responses.unknown"),
            });
        }
    }
};
