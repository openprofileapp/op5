import { Router } from "express";

import { getMfaMethodsController } from "../controllers/mfa.controller.js";

const mfaRoutes = Router();

mfaRoutes.get("/methods", getMfaMethodsController);
// mfaRoutes.post("/verify", verifyMfaChallenge);

// mfaRoutes.get("/webauthn/options", getWebAuthnOptions);
// mfaRoutes.post("/webauthn/verify", verifyWebAuthnChallenge);

export default mfaRoutes;


// OPTIONS
//
// CHECK DB IS MFA IS ENABLED
//
// For totop; check the ACCOUNTS/USER TOTP SECRET
// For backup codes; CHECK BACKUP CODES TABLE
// FOR LOGIN; CHECK LOGIN CONNECTIONS TABLE







/*
router.get("/mfa/methods", async (req, res) => {
    const methods = [];

    const user = {
       - totpEnabled: true,
        hasPasskey: true,
       - hasConnection: true,
       - hasLoggedInDevice: true,
       - backupCodes: ["123"]
    }

    if (user.totpEnabled) methods.push("totp");
    if (user.hasPasskey) methods.push("biometric");
    if (user.hasConnection) methods.push("connection");
    if (user.hasLoggedInDevice) methods.push("qr");
    if (user.backupCodes?.length) methods.push("backup");

    res.json({ methods });
});

import crypto from "crypto"; // DELETE LATER
// IMPORTANT NOTE; FOR ANY API OR AUTH CALLS, FIRST CALL VERIFY SESSION USING
// "req.session" TO STORE ITS INFO

router.get("/mfa/webauthn/options", (req, res) => {
    const challenge = crypto.randomBytes(32).toString("base64");

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.session = {}

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    req.session.webauthnChallenge = challenge;
        
    res.json({
        challenge: challenge,

        // Must match the frontend origin
        rpId: config.domains.main,

        userVerification: "required",
        timeout: 60000
    });
});

router.post("/mfa/webauthn/verify", (req, res) => {
    console.log("WebAuthn:", req.body);

    res.json({
        success: true
    });
});

router.post("/mfa/verify", (req, res) => {
    console.log(req.body);

    // VALIDATE SESSION IS ALREADY CALLED SO IT WOULD BE REQ.SESSION.ID;
    const sessionId = "92f791ceb230d3a7419383ab3a6cf154"

    // Update session
    const updatedUserSessionResult = db.accounts.query(
        `UPDATE sessions SET
            mfaStatus = ?
        WHERE sessionId = ?
        LIMIT 1`,
        ["LOADING", sessionId]
    ); // https://auth.openprofile.app/mfa/status (REQUIRE APISECRET TO ACCESS)
    // CALL THIS VIA THE MAIN SERVER WEBSOCKET. ON "LOADING", SET LOADING THING

    if (!updatedUserSessionResult.success) {
        throw new AdvancedError({
            code: 500,
            message: "An error occurred while updating session",
            details: updatedUserSessionResult.error
        })
    }

    // AFTER VERIFICATION; SET STATUS TO "COMPLETED" OR SMTH

    res.status(200).json({ ok : true });
});
*/