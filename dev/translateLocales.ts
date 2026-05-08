/* eslint-disable */

import translate from "translate";
import path from "path";
import fs from "fs";

import { config } from "../app.config.js";

translate.engine = "google";

const translations = config.generation.translations as readonly string[];
const cache = new Map<string, string>();

type Lang = (typeof translations)[number];
type Path = string[];

export function parseLocale(lng: string): any {
    const filePath = path.join(
        config.folders.public, "locales", `${lng}.json`
    );

    if (!fs.existsSync(filePath)) return {};

    try {
        return JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
        return {};
    }
}

function clone(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map(clone);

    const res: any = {};
    for (const k in obj) res[k] = clone(obj[k]);
    return res;
}

function extract(obj: any, path: Path = [], out: any[] = []) {
    if (typeof obj !== "object" || obj === null) return out;

    if (Array.isArray(obj)) {
        obj.forEach((v, i) => extract(v, [...path, String(i)], out));
        return out;
    }

    for (const k in obj) {
        const v = obj[k];

        if (typeof v === "string") {
            const t = v.trim();
            if (!t) continue;

            out.push({ path: [...path, k], value: t });
        } else if (typeof v === "object" && v !== null) {
            extract(v, [...path, k], out);
        }
    }

    return out;
}

function set(obj: any, path: Path, value: string) {
    let cur = obj;

    for (let i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]] || typeof cur[path[i]] !== "object") {
            cur[path[i]] = {};
        }
        cur = cur[path[i]];
    }

    cur[path[path.length - 1]] = value;
}

function get(obj: any, path: Path) {
    let cur = obj;

    for (const p of path) {
        if (!cur || typeof cur !== "object") return undefined;
        cur = cur[p];
    }

    return cur;
}

async function translateAll(value: string, lang: Lang) {
    const key = `${lang}:${value.toLowerCase().trim()}`;

    if (cache.has(key)) return cache.get(key)!;

    try {
        const res = await translate(value, {
            to: lang.includes("-") ? lang.split("-")[0] : lang
        });

        cache.set(key, res);
        return res;
    } catch {
        return value;
    }
}

async function mapLimit<T>(
    items: T[],
    limit: number,
    fn: (item: T) => Promise<void>
) {
    const executing: Promise<void>[] = [];

    for (const item of items) {
        const p = fn(item);

        executing.push(p);

        if (executing.length >= limit) {
            await Promise.race(executing);
            executing.splice(
                0,
                executing.length - limit
            );
        }
    }

    await Promise.all(executing);
}

(async () => {
    const raw: any = parseLocale(config.metadata.locale);
    const baseStrings = extract(raw);

    await Promise.all(
        translations.map(async (lng) => {
            const filePath = path.join(config.folders.public, "locales", `${lng}.json`);

            const existing: any = fs.existsSync(filePath)
                ? JSON.parse(fs.readFileSync(filePath, "utf-8"))
                : {};

            const cloned = clone(raw);

            await mapLimit(baseStrings, 10, async (item) => {
                const existingValue = get(existing, item.path);

                if (existingValue && existingValue.trim() !== "") {
                    set(cloned, item.path, existingValue);
                    return;
                }

                const translated = await translateAll(item.value, lng);
                set(cloned, item.path, translated);
            });

            fs.mkdirSync(path.dirname(filePath), { recursive: true });

            fs.writeFileSync(
                filePath, JSON.stringify(cloned, null, 2), "utf-8"
            );

            console.log(`Saved ${lng}.json`);
        })
    );

    console.log("Completed translating locale files");
})();