/* 
————————————————————————————————————————————————————————————————
This and ./env are the ONLY config files you should be edting. 
The rest are either importing this file or updated via the sync 
command. When the translate command is ran the metadata.locale 
file will be translated to all generation.translations.

DO NOT EDIT THE FOLLOWING FILES:
- ./package.json
- ./ecosystem.config.cjs
- ./dev.ecosystem.config.cjs
- ./eslint.config.js
- ./tsconfig.json
- ./vite.config.ts
- ./src/backend/vite.ts
- ./public/manifest.json
- ./src-tauri/Cargo.toml
- ./src-tauri/tauri.conf.json
- ./inno.iss

———————————————————————————————————————————————————————————————— 
QUICK CONFIG
———————————————————————————————————————————————————————————————— 
*/

// Disables Vite, unsafe SSL, and dev domains
const isProduction = false;

// Enable nightly mode
const isNightly = true;

// Version name is editable in ./src/assets/locales/*.json
const semver = "5.1.0"; // 5.major.minor.patch
const stage = isNightly ? "nightly" : "beta"; // prealpha | alpha | beta | rc | release | nightly
const build = "build-488a2af"; // DO NOT TOUCH, AUTO-GENERATED
const buildDate = "2026-09-03T12:03:16.849Z"; // DO NOT TOUCH, AUTO-GENERATED

/* 
————————————————————————————————————————————————————————————————
FULL CONFIG
———————————————————————————————————————————————————————————————— 
*/

import { fileURLToPath } from "url";
import path, { resolve } from "path";

const dir = path.dirname(fileURLToPath(import.meta.url));

export const config = {
    isProduction,
    isNightly,

    // https://nerdfonts.com
    useNerdFonts: true,

    // Sends debug logs
    debug: {
        config: false,
        snowflake: false,

        // Save all logs to file
        logger: {
            main: false,
            studio: false,
            status: false,
            auth: false,
            api: false,
            cdn: false,
            support: false,
            discord_api: false,
            console: false
        }
    },

    // Global limits
    limits: {
        rateLimit: 240,
        softConnectedSessions: 500,
        hardConnectedSessions: 650,
        assetsPerPage: 30,
        uploadSize: 1 * 1024 * 1024, // 1 MB
        accessTokenExpireInMinutes: 15,
        setIdlePresenceInMinutes: 10
    },

    // Displays the maintenance landing
    maintenance: {
        isEnabled: false
        // reason is editable in ./src/assets/locales/*.json
    },

    theme: {
        primary: "#160202",
        accent: "#ce1616"
    },

    metadata: {
        id: "app.openprofile.op5",
        name: "OpenProfile",
        // tagline is editable in ./src/assets/locales/*.json
        // description is editable in ./src/assets/locales/*.json
        // keywords are editable in ./src/assets/locales/*.json
        theme: "system", // dark | light | system
        locale: "en",
        urls: {
            main: "https://openprofile.app",
            github: "https://github.com/openprofileapp",
            x: "https://x.com/openprofileapp",
            bluesky: "https://bsky.app/profile/openprofile.app",
            instagram: "https://instagram.com/openprofileapp",
            facebook: "https://facebook.com/openprofileapp",
            youtube: "https://youtube.com/@openprofile",
            tiktok: "https://tiktok.com/@openprofileapp",
            discord: {
                main: "https://discord.gg/w6aV9gkz8g",
                joinUpdateRoles: "https://discord.gg/pBrPZQTbsj"
            } 
        },

        version: {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            full: `${stage === "release" ? semver : [semver, stage, build].filter(Boolean).join("-")}`,
            semver,
            stage,
            build,
            buildDate
        },

        // Relative to the ./public folder
        assets: {
            logo: "/branding/logo.svg",
            icon: "/branding/icon.svg",
            banner: "/branding/banner.svg",
            wordmark: "/branding/wordmark.svg",
            noImage: "/media/no-image.png",
            favorites: "/media/favorites.png"
        },

        legal: {
            owner: "OpenProfile", // Include suffix for registered entity
            license: {
                text: "Copyright © 2017-2026 OpenProfile™. All rights reserved.", // https://choosealicense.com
                code: "OPPL", // https://choosealicense.com
            },
            trademarks: ["OpenProfile™"] // Include ™ or (TM) for trademarks, OR ® or (R) for registered trademarks
        },

        contact: {
            support: "support@openprofile.app",
            legal: "support@openprofile.app"
        }
    },

    // Identification sent to servers crawled
    crawler: {
        name: "OpenProfile",
        version: "1.0",
        website: "https://openprofile.app",
        contact: "admin@openprofile.app"
    },

    // The maximum memory before the server restarts (###M/G)
    memory: {
        proxy: isProduction ? "100M" : "1G",
        main: isProduction ? "350M" : "1G",
        status: isProduction ? "100M" : "1G",
        auth: isProduction ? "300M" : "1G",
        api: isProduction ? "300M" : "1G",
        cdn: isProduction ? "150M" : "1G",
        support: isProduction ? "350M" : "1G",
        discord_client: isProduction ? "150M" : "1G",
        discord_api: isProduction ? "150M" : "1G",
        console: isProduction ? "150M" : "1G"
    },

    // Port numbers on localhost (default: 1052* and 3955*)
    ports: {
        // proxy is fixed at 443
        // gateway is fixed at 444
        main: 10521,
        studio: 10522,
        status: 10523,
        auth: 10524,
        api: 10525,
        cdn: 10526,
        support: 10527,
        discord_api: 10528,
        console: 10529,
        ws: {
            main: 39551,
            studio: 39552,
            status: 39553,
            support: 39554,
            console: 39555
        }
    },

    // IP addresses assigned to each server
    ips: {
        gateway: !isNightly ? "127.0.0.0" : "127.0.0.0",
        main: !isNightly ? "127.0.0.0" : "127.0.0.0",
        studio: !isNightly ? "127.0.0.0" : "127.0.0.0",
        status: !isNightly ? "127.0.0.0" : "127.0.0.0",
        auth: !isNightly ? "127.0.0.0" : "127.0.0.0",
        api: !isNightly ? "127.0.0.0" : "127.0.0.0",
        cdn: !isNightly ? "127.0.0.0" : "127.0.0.0",
        support: !isNightly ? "127.0.0.0" : "127.0.0.0",
        nightly: !isNightly ? "127.0.0.0" : "127.0.0.0",
        discord_api: !isNightly ? "127.0.0.0" : "127.0.0.0",
        console: !isNightly ? "127.0.0.0" : "127.0.0.0"
    },

    // Domains assigned to each server
    domains: {
        gateway: !isNightly ? "gateway.prod.openprofile.app" : "gateway.dev.openprofile.app",
        main: !isNightly ? "prod.openprofile.app" : "dev.openprofile.app",
        studio: !isNightly ? "studio.prod.openprofile.app" : "studio.dev.openprofile.app",
        status: !isNightly ? "status.prod.openprofile.app" : "status.dev.openprofile.app",
        auth: !isNightly ? "auth.prod.openprofile.app" : "auth.dev.openprofile.app",
        api: !isNightly ? "api.prod.openprofile.app" : "api.dev.openprofile.app",
        cdn: !isNightly ? "cdn.prod.openprofile.app" : "cdn.dev.openprofile.app",
        support: !isNightly ? "support.prod.openprofile.app" : "support.dev.openprofile.app",
        nightly: !isNightly ? "nightly.prod.openprofile.app" : "nightly.dev.openprofile.app",
        shortlink: !isNightly ? "prod.op5.to" : "dev.op5.to",
        // DEVELOPER NEEDED: Discord api should only run on stable, not nightly
        discord_api: !isNightly ? "discord-api.prod.openprofile.app" : "discord-api.dev.openprofile.app",
        console: !isNightly ? "console.prod.openprofile.app" : "console.dev.openprofile.app",
    },

    // Third-party applications
    integrations: {
        webPush: "BK3b8F41-0Gc1HBJS4JgNrSsziMhwY6T78ys5h0RmEVJYc7-4Q3KIscdUOhlvb_3Y9kzjBx-6QFGUgUle7FBGcI",
        hcaptcha: "7fb2b75a-fdb6-4fe8-a4e4-6000ef8e7464",
        adsence: "ca-pub-5934702627096796",
        brandfetch: "1idIC6Sv51YBcf8zmpU",
        oauth2: {
            google: "173110862947-3jrkouleg7m08eu8qe5rqr2sp355bdn2.apps.googleusercontent.com",
            microsoft: "03fe61da-efa0-454b-afad-773fafd71239",
            apple: "",
            x: "eUQweG5FWjdDMFV2NUhTTUFwSDE6MTpjaQ",
            facebook: "835575549270309",
            reddit: "",
            discord: "895502984363003946",
            github: "Ov23liCcfxitn4zDGE7c"
        },
        discord: {
            presence: {
                assistant: {
                    status: "dnd", // online | idle | dnd | invisible
                    activity: {
                        type: "Playing", // Playing | Streaming | Listening | Watching | Competing
                        text: [
                            "Viewing a user profile",
                            "Reading a character profile",
                            "Editing a character profile",
                            "Working on a character template",
                            "Inserting dataset entries",
                            "Editing a block"
                        ],
                    }
                },
                status: "online", // online | idle | dnd | invisible
                activity: {
                    type: "Playing", // Playing | Streaming | Listening | Watching | Competing
                    text: `v${semver}-${stage}${isNightly ? `-${build}` : ""}`,
                }
            },
            modules: {
                utilities: true
            },
            guild: {
                id: "854387025837817917"
            },
            channels: {
                commands: "907182663775948841",
                commandsDev: "1514196888138678392",
                logs: "1207075758082629692"
            }
        }
    },

    // Dynamic generation (snowflake, etc.)
    generation: {
        machine: 0, // (valid: 0-1023)
        epoch: "2026-01-01T00:00:00.000Z",
        seed: "",
        translations: [
            // Do not include metadata.locale from ./app.client.config.ts
            // Supports standard and/or localized
            // e.g., es and/or es-MX
            "zh", // Chinese
            "es", // Spanish
            "hi", // Hindi
            "ar", // Arabic
            "ru", // Russian
            "id", // Indonesian
            "ja" // Japanese
        ]
    },

    folders: {
        root: resolve(dir),
        logs: resolve(dir, "logs"),
        data: resolve(dir, "data"),
        backups: resolve(dir, "backups"),
        sql: {
            auth: resolve(dir, "src", "backend", "auth", "databases", "sql"),
            api: resolve(dir, "src", "backend", "api", "databases", "sql")
        },
        public: resolve(dir, "public"),
        commands: resolve(dir, "src", "integrations", "discord", "commands")
    }
} as const;

export type Config = typeof config;
