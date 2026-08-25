import { Request } from "express";
import net from "node:net";

function normalizeIp(ip?: string | string[]) {
    if (!ip) return undefined;
    const value = Array.isArray(ip) ? ip[0] : ip;
    return value?.replace(/^::ffff:/, "").trim();
}

export default function validateIp(req: Request): string {
    const cfIP = normalizeIp(req.headers["cf-connecting-ip"]);
    const xff = normalizeIp(req.headers["x-forwarded-for"]);
    const expressIP = normalizeIp(req.ip);
    const socketIP = normalizeIp(req.socket?.remoteAddress);

    if (cfIP && net.isIP(cfIP)) return cfIP;

    if (xff) {
        const firstXff = xff.split(",")[0].trim();
        if (net.isIP(firstXff)) return firstXff;
    }

    if (expressIP && net.isIP(expressIP)) return expressIP;

    if (socketIP && net.isIP(socketIP)) return socketIP;

    return "";
}
