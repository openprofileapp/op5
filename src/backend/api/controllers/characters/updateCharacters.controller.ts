import type { Request, Response } from "express";

import { AdvancedError } from "kage-library";

import { log } from "../../instances.js";
import { assertBearer } from "../../../_common/asserts/bearer.assert.js";
import { assertPlatformPermissions } from "../../../_common/asserts/platformPermissions.assert.js";
import { i18n } from "../../../_common/instances.js";
import { assertAccount } from "../../../_common/asserts/account.assert.js";
import { db } from "../../databases/db.js";
import { assertDbSuccess } from "../../../../_common/asserts/dbSuccess.assert.js";
import whatIs from "../../services/whatIs.service.js";
import uploadFile from "../../../_common/helpers/uploadFile.js";
import { DraftCharacterType } from "../../../../_common/types/characters/character.type.js";
import { MediaType } from "../../../../_common/types/media.type.js";

const ALLOWED_VISIBILITIES = ["public", "unlisted", "registered", "followers", "friends", "private"];
const VALID_SEND_VISIBILITIES = ["default", "public", "registered", "followers", "friends", "private"] as const;
const TAG_REGEX = /^[a-z-]+$/;

export const updateCharacters = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data } = req.body;

        await assertBearer(req); 
        assertAccount(req.session);
        assertPlatformPermissions(req.session, "WRITE");

        const currentresult = db.characters.query<DraftCharacterType>(
            "SELECT * FROM drafts WHERE id = ? LIMIT 1",
            [id]
        );

        assertDbSuccess(currentresult);

        if (currentresult.rowCount < 1) {
            throw new AdvancedError({ 
                code: 404, 
                message: i18n.t("responses.characterNotFound")
            });
        }

        const currentCharacter = currentresult.rows?.[0];
        const whatIsData = whatIs(currentCharacter.ownerId);

        if (currentCharacter.ownerId !== req.session.userId) {
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

        const allowedFields = new Set([
            "displayName",
            "avatar",
            "animatedAvatar",
            "banner",
            "about",
            "tags",
            "isAuraEnabled",
            "license",
            "auraType",
            "auraPrimary",
            "auraSecondary",
            "isConfidential",
            "isSensitive",
            "isMature",
            "visibility",
            "readVisibility",
            "sendComments",
            "media"
        ]);

        let uploadedAvatar;
        let uploadedAnimatedAvatar;
        let uploadedBanner;

        if (data.avatar) {
            uploadedAvatar = await uploadFile({
                folder: `users/avatars/${id}`,
                fileInput: data.avatar
            });
        }

        if (data.animatedAvatar) {
            uploadedAnimatedAvatar = await uploadFile({
                folder: `users/avatars/${id}`,
                fileInput: data.animatedAvatar
            });
        }

        if (data.banner) {
            uploadedBanner = await uploadFile({
                folder: `users/banners/${id}`,
                fileInput: data.banner
            });
        }

        const updates: string[] = [];
        const values: unknown[] = [];
        let media: MediaType[] | undefined;

        // eslint-disable-next-line prefer-const
        for (let [key, value] of Object.entries(data)) {
            if (!allowedFields.has(key) || value === undefined) {
                continue;
            }

            if (key === "media") {
                if (!Array.isArray(value)) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.malformedRequest")
                    });
                }

                media = value;
                continue;
            }

            if (key === "displayName") {
                if (typeof value !== "string" || value.length > 32) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidDisplayNameLength")
                    });
                }
            }

            if (key === "avatar") {
                value = uploadedAvatar?.path;
            } else if (key === "animatedAvatar") {
                value = uploadedAnimatedAvatar?.path;
            } else if (key === "banner") {
                value = uploadedBanner?.path;
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

            if (key === "tags") {
                let parsedTags: string[] = [];

                if (typeof value === "string") {
                    parsedTags = value
                        .split(",")
                        .map((t) => t.trim())
                        .filter((t) => t.length > 0);
                } else if (Array.isArray(value)) {
                    parsedTags = value
                        .map((t) => (typeof t === "string" ? t.trim() : ""))
                        .filter((t) => t.length > 0);
                } else {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                const isValid =
                    parsedTags.length > 0 &&
                    parsedTags.every(
                        (t) => t.length >= 3 && t.length <= 24 && TAG_REGEX.test(t)
                    );

                if (!isValid) {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.invalidTagsFormat")
                    });
                }

                updates.push(`${key} = ?`);
                values.push(JSON.stringify(parsedTags));
                continue;
            }

            if (key === "visibility" || key === "readVisibility") {
                if (currentCharacter.visibility === "hidden") {
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

            if (key === "sendComments") {
                if (currentCharacter[key] === "hidden") {
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

            if (key === "isMature" && !req.session.isAdult) {
                throw new AdvancedError({
                    code: 400,
                    message: i18n.t("responses.notAdult")
                });
            }

            if (
                [
                    "isConfidential", 
                    "isSensitive", 
                    "isMature", 
                    "isAuraEnabled"
                ].includes(key)
            ) {
                if (typeof value !== "boolean" && typeof value !== "number") {
                    throw new AdvancedError({
                        code: 400,
                        message: i18n.t("responses.malformedRequest")
                    });
                }

                if (typeof value === "number") {
                    if (value !== 0 && value !== 1) {
                        throw new AdvancedError({
                            code: 400,
                            message: i18n.t("responses.malformedRequest")
                        });
                    }
                    value = Boolean(value);
                }
            }

            updates.push(`${key} = ?`);
            values.push(typeof value === "boolean" ? (value ? 1 : 0) : value);
        }

        if (updates.length === 0 && !media) {
            throw new AdvancedError({
                code: 400,
                message: i18n.t("responses.malformedRequest")
            });
        }

        if (updates.length > 0) {
            values.push(id);

            const result = db.characters.query(
                `UPDATE drafts SET ${updates.join(", ")} WHERE id = ?`,
                values
            );

            assertDbSuccess(result);
        }

        if (media) {
            const validMedia = media.filter(
                (m): m is NonNullable<typeof m> =>
                    Boolean(m && typeof m.url === "string")
            );

            if (validMedia.length > 9) {
                throw new AdvancedError({
                    code: 400,
                    message: i18n.t("responses.mediaLimit")
                });
            }

            const result = db.media.query<MediaType>(
                "SELECT * FROM draft_overview WHERE assetId = ?",
                [id]
            );

            assertDbSuccess(result);

            const existingMedia = result.rows ?? [];
            const existingUrls = new Set(existingMedia.map((item) => item.url));

            const finalMedia = await Promise.all(
                validMedia.map(async (item) => {
                    if (existingUrls.has(item.url)) {
                        return item;
                    }

                    const uploadedMedia = await uploadFile({
                        folder: `media/${id}`,
                        fileInput: item.url
                    });

                    return {
                        ...item,
                        url: uploadedMedia?.path
                    };
                })
            );

            const deleteResult = db.media.query(
                "DELETE FROM draft_overview WHERE assetId = ?",
                [id]
            );

            assertDbSuccess(deleteResult);

            if (finalMedia.length === 0) {
                return res.status(200).json({
                    ok: true,
                });
            }

            const valuePlaceholders = finalMedia
                .map(() => "(?, ?, ?, ?, ?, ?, ?)")
                .join(", ");

            const queryParams = finalMedia.flatMap((item, position) => [
                id,
                item.url,
                item.description ?? null,
                item.credit ?? null,
                position,
                item.visibility ?? "default",
                req.session.userId
            ]);

            const insertResult = db.media.query(
                `INSERT INTO draft_overview (
                    assetId,
                    url,
                    description,
                    credit,
                    position,
                    visibility,
                    addedBy
                ) VALUES ${valuePlaceholders}`,
                queryParams
            );

            assertDbSuccess(insertResult);
        }

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
