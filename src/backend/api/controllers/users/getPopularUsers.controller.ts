import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { config } from "../../../../../app.config.js";
import getUsersService from "../../services/getUsers.service.js";
import { GetFromType } from "../../../../_common/types/getFrom.type.js";
import { i18n } from "../../../_common/instances.js";

export const getPopularUsers = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertPlatformPermissions(req.session, "VIEW");

        const { 
            id,
            ref
        } = req.query;

        const characters = getUsersService({
            id: id as string, 
            sortBy: "popularDesc", 
            limit: config.limits.assetsPerPage, 
            getAs: req.session.userId,
            getFrom: ref as GetFromType
        })

        res.status(200).json(characters);
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
