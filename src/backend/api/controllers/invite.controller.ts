import type { Request, Response } from "express";

import getInviteByOwner from "../services/getInviteByOwner.service.js";
import getInviteByCode from "../services/getInviteByCode.service.js";

export const getInvitesController = async (req: Request, res: Response) => {
    // If admin, display all invites
    // DO NOT CALL isTokenOrSecretAuthorized ANYWHERE HERE ELSE IT CALLS RECURSEIVELY. ONLY NON AUTH-CALLED CONTROLLERS

    return res.status(400).json({ error: "Invalid parameter"});
};

export const getInviteByCodeController = async (req: Request, res: Response) => {
    const { inviteCode } = req.params;

    if (!inviteCode) {
        return res.status(400).json({ error: "Invalid parameter" });
    }

    // Only display if owner or admin
    // DO NOT CALL isTokenOrSecretAuthorized ANYWHERE HERE ELSE IT CALLS RECURSEIVELY. ONLY NON AUTH-CALLED CONTROLLERS

    res.status(200).json({
        ...getInviteByCode(inviteCode as string)
    });
};

export const getInvitesByOwnerController = async (req: Request, res: Response) => {
    const { ownerId } = req.params;

    // Only display if owner or admin
    // DO NOT CALL isTokenOrSecretAuthorized ANYWHERE HERE ELSE IT CALLS RECURSEIVELY. ONLY NON AUTH-CALLED CONTROLLERS

    if (!ownerId) {
        return res.status(400).json({ error: "Invalid parameter" });
    }

    res.status(200).json({
        ...getInviteByOwner(ownerId as string)
    });
};