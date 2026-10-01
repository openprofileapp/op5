import type { Request, Response } from "express";
import { AdvancedError } from "kage-library";

import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { db } from "../../databases/db.js";
import { log, snowflake } from "../../instances.js";
import uploadFile from "../../../_common/helpers/uploadFile.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import { i18n } from "../../../_common/instances.js";

export const insertBlock = async (req: Request, res: Response) => {
    try {
        const { icon, label, description, type, tags } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "CREATE_ASSETS");

        if (!type) {
            throw new AdvancedError({
                code: 400,
                message: "A block type is required"
            });
        }

        const id = snowflake.gen();
        let uploadedMedia;

        if (icon) {
            uploadedMedia = await uploadFile({
                folder: `media/${id}`,
                fileInput: icon
            });
        }

        const insertResult = db.blocks.query(
            `INSERT INTO drafts (
                blockId,
                ownerId,
                categoryType,
                icon,
                displayName,
                about,
                tags,
                source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                req.session.userId,
                type,
                uploadedMedia?.path ?? null,
                label ?? null,
                description ?? null,
                JSON.stringify(tags || []),
                req.session.userId === "9534968913312158" ? "official" : "community"
            ]
        );

        assertDbSuccess(insertResult);

        return res.status(201).json({
            ok: true,
            id
        });
    } catch (error) {
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
