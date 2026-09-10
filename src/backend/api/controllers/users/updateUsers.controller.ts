import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import whatIs from "../../helpers/whatIs.js";

const VALID_VISIBILITIES = ["default", "public", "registered", "followers", "friends", "private"] as const;
const ALLOWED_VISIBILITIES = ["public", "unlisted", "registered", "followers", "friends", "private"];
const VALID_SEND_VISIBILITIES = ["default", "registered", "followers", "friends", "private"] as const;
const VALID_TYPES = ["user", "author", "publisher"] as const;
const VALID_PRESENCES = ["online", "idle", "dnd", "hidden"] as const;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TAG_REGEX = /^[a-z-]+$/;

export const updateUsers = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const { data } = req.body;
        
        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        if (userId !== req.session.userId) {
            throw new AdvancedError({
                code: 401,
                message: i18n.t("responses.unauthorized")
            });
        }

        if (!data || typeof data !== "object" || Object.keys(data).length === 0) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        const whatIsData = whatIs(userId);

        const currentUserResult = db.users.query(
            `SELECT * FROM users WHERE id = ?`,
            [userId]
        );

        assertDbSuccess(currentUserResult);

        const currentUser = currentUserResult.rows?.[0];

        if (!currentUser) {
            throw new AdvancedError({
                code: 404,
                message: i18n.t("responses.accountNotFound")
            });
        }

        const allowedFields = new Set([
            "displayName",
            "avatar",
            "animatedAvatar",
            "banner",
            "status",
            "about",
            "markdown",
            "tags",
            "pronouns",
            "birthdate",
            "birthdateVisibility",
            "foundedDate",
            "foundedDateVisibility",
            "location",
            "isAuraEnabled",
            "auraType",
            "auraPrimary",
            "auraSecondary",
            "type",
            "isDeveloper",
            "isSensitive",
            "isMature",
            "visibility",
            "areFriendRequestsEnabled",
            "sendMessages",
            "sendComments",
            "presence",
            "presenceVisibility",
        ]);

        const updates: string[] = [];
        const values: unknown[] = [];

        for (const [key, value] of Object.entries(data)) {
            if (!allowedFields.has(key) || value === undefined) {
                continue;
            }

            if (
                [
                    "animatedAvatar", 
                    "isAuraEnabled", 
                    "auraType", 
                    "auraPrimary", 
                    "auraSecondary"
                ].includes(key)
            ) {
                if (!whatIsData.isPremium) {
                    throw new AdvancedError({
                        code: 403,
                        message: i18n.t("responses.premiumRequired")
                    });
                }
            }

            if (key === "about") {
                if (typeof value !== "string" || value.length > 320) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidAboutLength")
                    });
                }
            }

            if (key === "markdown") {
                if (typeof value !== "string" || value.length > 16384) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidMarkdownLength")
                    });
                }
            }

            if (key === "tags") {
                let parsedTags: string[] = [];

                if (typeof value === "string") {
                    parsedTags = value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);
                } else if (Array.isArray(value)) {
                    parsedTags = value.map((t) => (typeof t === "string" ? t.trim() : ""));
                } else {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                if (parsedTags.length === 0 || !parsedTags.every((t) => TAG_REGEX.test(t))) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                updates.push(`${key} = ?`);
                values.push(JSON.stringify(parsedTags));
                continue;
            }

            if (key === "birthdate" || key === "foundedDate") {
                if (value !== null && (typeof value !== "string" || !DATE_REGEX.test(value) || isNaN(Date.parse(value)))) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidDateFormat")
                    });
                }
            }

            if (key === "birthdateVisibility" || key === "foundedDateVisibility" || key === "presenceVisibility") {
                if (!VALID_VISIBILITIES.includes(value as typeof VALID_VISIBILITIES[number])) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidVisibility")
                    });
                }
            }

            if (key === "presence") {
                if (!VALID_PRESENCES.includes(value as typeof VALID_PRESENCES[number])) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidPresence")
                    });
                }
            }

            if (key === "visibility") {
                if (currentUser.visibility === "hidden") {
                    throw new AdvancedError({
                        code: 401,
                        message: i18n.t("responses.cannotChangeHiddenState")
                    });
                }

                if (!ALLOWED_VISIBILITIES.includes(value as string)) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidVisibility")
                    });
                }
            }

            if (key === "sendMessages" || key === "sendComments") {
                if (currentUser[key] === "hidden") {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.cannotChangeHiddenState")
                    });
                }

                if (!VALID_SEND_VISIBILITIES.includes(value as typeof VALID_SEND_VISIBILITIES[number])) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidVisibility")
                    });
                }
            }

            if (key === "type") {
                if (!VALID_TYPES.includes(value as typeof VALID_TYPES[number])) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidType")
                    });
                }
            }

            if (
                [
                    "isDeveloper", 
                    "isSensitive", 
                    "isMature", 
                    "areFriendRequestsEnabled", 
                    "isAuraEnabled"
                ].includes(key)
            ) {
                if (typeof value !== "boolean") {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.malformedRequest")
                    });
                }
            }

            updates.push(`${key} = ?`);
            values.push(value);
        }

        if (updates.length === 0) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        values.push(userId);

        const result = db.users.query(
            `UPDATE users SET ${updates.join(", ")} WHERE id = ?`,
            values
        );

        assertDbSuccess(result);

        return res.status(200).json({
            ok: true,
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
