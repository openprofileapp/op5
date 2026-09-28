/* eslint-disable @typescript-eslint/ban-ts-comment */

import { urlToBase64 } from "./base64.js";
import { cdnBaseUrl } from "./domains.js";

// @ts-ignore
async function processPayload(obj: unknown) {
    if (Array.isArray(obj)) {
        return Promise.all(obj.map(processPayload));
    }

    if (obj !== null && typeof obj === "object") {
        const record = obj;

        // @ts-ignore
        if (Array.isArray(record.items) && "count" in record) {
            // @ts-ignore
            return Promise.all(record.items.map(processPayload));
        }

        const cleaned = {};

        for (const [key, value] of Object.entries(record)) {
            const imageExtensions = [".png", ".jpg", ".jpeg", ".webp"];

            if (
                typeof value === "string" &&
                value.startsWith("/uploads/") &&
                imageExtensions.some((ext) => value.toLowerCase().endsWith(ext))
            ) {
                if (typeof value === "string") {
                    // @ts-ignore
                    cleaned[key] = await urlToBase64(`${cdnBaseUrl}${value}`);
                }
            } else {
                // @ts-ignore
                cleaned[key] = await processPayload(value);
            }
        }
        return cleaned;
    }

    return obj;
}

export default async function downloadOp5(
    overview: unknown, 
    data: unknown[],
    type: "template" | "character",
    filename = "export"
) {
    const cleanExtension = filename.replace(/\.op5$/i, "");

    const sanitizedFilename = cleanExtension
        .toLowerCase()
        .trim()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9_-]/g, "");

    const finalFilename = `${sanitizedFilename || "export"}.op5`;

    const cleanedData = await processPayload(data);
    const cleanedOverview = await processPayload(overview);

    const payload = JSON.stringify({ 
        metadata: {
            type,
            appVersion: `${window.config.metadata.version.semver}-${window.config.metadata.version.stage}`,
            schemaVersion: 3,
            exportedFrom: "webapp",
            exportedBy: window.session?.userId,
            exportDate: new Date().toISOString()
        },
        overview: cleanedOverview,
        data: cleanedData
    }, null, 2);

    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = finalFilename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
