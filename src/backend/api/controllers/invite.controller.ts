import type { Request, Response } from "express";

import isBearerTokenAuthorized from "../helpers/isBearerTokenAuthorized.js";
import getInviteByOwner from "../services/getInviteByOwner.service.js";
import getInviteByCode from "../services/getInviteByCode.service.js";

export const getInvitesController = async (req: Request, res: Response) => {
    // If admin, display all invites
    if (!await isBearerTokenAuthorized(req.headers.authorization)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    return res.status(400).json({ error: "Invalid parameter"});
};

export const getInviteByCodeController = async (req: Request, res: Response) => {
    const { inviteCode } = req.params;

    if (!inviteCode) {
        return res.status(400).json({ error: "Invalid parameter" });
    }

    // Only display if owner or admin
    if (!await isBearerTokenAuthorized(req.headers.authorization)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    res.status(200).json({
        ...getInviteByCode(inviteCode as string)
    });
};

export const getInvitesByOwnerController = async (req: Request, res: Response) => {
    const { ownerId } = req.params;

    // Only display if owner or admin
    if (!await isBearerTokenAuthorized(req.headers.authorization)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (!ownerId) {
        return res.status(400).json({ error: "Invalid parameter" });
    }

    res.status(200).json({
        ...getInviteByOwner(ownerId as string)
    });
};