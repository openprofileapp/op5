import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { config } from "../../../../../app.config.js";
import getUsersService from "../../services/getUsers.service.js";
import { SortByType } from "../../../../_common/types/sortBy.type.js";
import { GetFromType } from "../../../../_common/types/getFrom.type.js";
import { i18n } from "../../../_common/instances.js";

export const getUsers = async (req: Request, res: Response) => {
    try {
        await assertBearer(req); 
        assertPlatformPermissions(req.session, "VIEW");

        const { 
            id,
            sortBy,
            page, 
            limit = config.limits.assetsPerPage,
            q: query,
            ref
        } = req.query;

        const offset = 
            (Number(page) || 1) * 
            Number(limit) - 
            Number(limit);

        const characters = getUsersService({
            id: id as string, 
            sortBy: sortBy as SortByType, 
            offset: offset,
            limit: limit as number, 
            query: query as string, 
            getAs: req.session.userId,
            getFrom: ref as GetFromType,
            delegatedAccounts: req.session?.delegatedAccounts
        })

        res.status(200).json({
            ...characters,
            pages: Math.ceil(characters.count / Number(limit)),
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
