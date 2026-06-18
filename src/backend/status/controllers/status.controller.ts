import type { Request, Response } from "express"
import path from "path"
import fs from "fs"

import { getReqUrl } from "kage-library";

import { config } from "../../../../app.config.js"
import { vite } from "../server.js"
import { log } from "../instances.js"

export const renderApp = async (req: Request, res: Response) => {
    const clientConfig = {
        useNerdFonts: config.useNerdFonts,
        theme: config.theme,
        metadata: config.metadata,
        domains: config.domains
    }

    /*// Do not ping the status server
    const api = await wc.ping(`https://${config.domains.api}`);
    const cdn = await wc.ping(`https://${config.domains.cdn}`);
    const main = await wc.ping(`https://${config.domains.main}`);

    res.json({ 
        api, 
        cdn, 
        main 
    });*/

    try {
        const htmlPath = path.join(
            config.folders.root, "src", "frontend", "status.html"
        )

        let html = fs.readFileSync(htmlPath, "utf-8")

        html = html.replace(
            "__CLIENT_CONFIG__", 
            JSON.stringify(clientConfig)
        )

        if (vite) {
            html = await vite.transformIndexHtml(getReqUrl(req), html)
        }

        res.status(200).set({ "Content-Type": "text/html" }).end(html)
    } catch (error: unknown) {
        log.client.error(error).save()
        res.status(500).end("Internal Server Error")
    }
}