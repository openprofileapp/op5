import { randomBytes } from "crypto";
import path from "path";
import fs from "fs";

import { 
    I18nService
} from "kage-library";

import { config } from "../app.config.js";

const i18n = await I18nService.load(
    { 
        localesPath: "/public/locales", 
        locale: "en", 
        defaultLocale: config.metadata.locale 
    }
);

function replaceLine(file: string, key: string, value: string) {
    const regex = new RegExp(`^(${key}\\s*=\\s*).*$`, "m");
    return file.replace(regex, `$1${value}`);
}

const primary = config.theme.primary;
const accent = config.theme.accent;
const id = config.metadata.id;
const name = config.metadata.name;
const semver = config.metadata.version.semver;
const stage = config.metadata.version.stage;
const fullVersion = config.metadata.version.full;
const icon = config.metadata.assets.icon;
const owner = config.metadata.legal.owner;
const licenseText = config.metadata.legal.license.text;
const licenseCode = config.metadata.legal.license.code;
const mainDomain = config.domains.main;
const cdnDomain = config.domains.cdn;
const keywords = (i18n.t("metadata.keywords") || "")
  .split(",")
  .map(k => k.trim())
  .filter(Boolean);

if (!primary) throw new Error("app.config.js is missing theme.primary");
if (!accent) throw new Error("app.config.js is missing theme.accent");
if (!id) throw new Error("app.config.js is missing metadata.!id");
if (!name) throw new Error("app.config.js is missing metadata.name");
if (!semver) throw new Error("app.config.js is missing metadata.version.semver");
if (!stage) throw new Error("app.config.js is missing metadata.version.stage");
if (!fullVersion) throw new Error("app.config.js is missing metadata.version.full");
if (!icon) throw new Error("app.config.js is missing metadata.assets.icon");
if (!owner) throw new Error("app.config.js is missing metadata.legal.owner");
if (!licenseText) throw new Error("app.config.js is missing metadata.legal.license.text");
if (!licenseCode) throw new Error("app.config.js is missing metadata.legal.license.code");
if (!mainDomain) throw new Error("app.config.js is missing domains.main");
if (!cdnDomain) throw new Error("app.config.js is missing domains.cdn");

const formattedName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

/* 
————————————————————————————————————————————————————————————————
app.config.js
———————————————————————————————————————————————————————————————— 
*/

const configPath = path.join(config.folders.root, "app.config.ts");
let rawConfig = fs.readFileSync(configPath, "utf8");

rawConfig = rawConfig.replace(
    /const\s+build\s*=\s*".*?"/,
    `const build = "build-${randomBytes(4).toString("hex").slice(0, 7)}"`
);

rawConfig = rawConfig.replace(
    /const\s+buildDate\s*=\s*".*?"/,
    `const buildDate = "${new Date().toISOString()}"`
);

fs.writeFileSync(configPath, rawConfig, "utf8");

/* 
————————————————————————————————————————————————————————————————
package.json
———————————————————————————————————————————————————————————————— 
*/

const packagePath = path.join(config.folders.root, "package.json");
const packageJSON = JSON.parse(fs.readFileSync(packagePath, "utf8"));
const headerText = `This file is part of ${name}. ${licenseText}`;

packageJSON.name = formattedName
packageJSON.version = fullVersion;
packageJSON.description = i18n.t("metadata.description");
packageJSON.keywords = keywords;
packageJSON.author = owner;
packageJSON.license = licenseCode;
packageJSON.scripts.minify = `npx esbuild "dist/**/*.js" --format=esm --minify --banner:js="/* ${headerText} */" --outdir=dist --allow-overwrite`;

fs.writeFileSync(packagePath, JSON.stringify(packageJSON, null, 2), "utf8");

/* 
————————————————————————————————————————————————————————————————
packages/node/package.json
———————————————————————————————————————————————————————————————— 
*/

const nodePackagePath = path.join(config.folders.root, "packages", "node", "package.json");
const nodePackageJSON = JSON.parse(fs.readFileSync(nodePackagePath, "utf8"));

nodePackageJSON.name = formattedName
nodePackageJSON.version = fullVersion;
nodePackageJSON.description = i18n.t("metadata.description");
nodePackageJSON.keywords = keywords;
nodePackageJSON.author = owner;
nodePackageJSON.license = licenseCode;

fs.writeFileSync(nodePackagePath, JSON.stringify(nodePackageJSON, null, 2), "utf8");

/* 
————————————————————————————————————————————————————————————————
ecosystem.config.cjs
———————————————————————————————————————————————————————————————— 
*/

type MemoryMap = Record<string, { prod: string; dev: string }>;

function extractMemory(rawConfig: string): MemoryMap {
    const match = rawConfig.match(/memory:\s*{([\s\S]*?)}/);
    if (!match) return {};

    const block = match[1];
    const result: MemoryMap = {};

    for (const line of block.split(",")) {
        const m = line.match(
            /(\w+)\s*:\s*env\.IS_PRODUCTION\s*\?\s*["'](.*?)["']\s*:\s*["'](.*?)["']/
        );

        if (!m) continue;

        const [, key, prod, dev] = m;
        result[key] = { prod, dev };
    }

    return result;
}

function updateEcosystem(
    filePath: string,
    memoryValues: Record<string, string>
): void {
    let file = fs.readFileSync(filePath, "utf8");

    for (const [name, mem] of Object.entries(memoryValues)) {
        const regex = new RegExp(
            `(name:\\s*["']${name}["'][\\s\\S]*?max_memory_restart:\\s*["'])(.*?)(")`,
            "g"
        );

        file = file.replace(regex, `$1${mem}$3`);
    }

    fs.writeFileSync(filePath, file, "utf8");
}

const memoryMap = extractMemory(rawConfig);

const prodValues: Record<string, string> = {};
const devValues: Record<string, string> = {};

for (const [key, value] of Object.entries(memoryMap)) {
    prodValues[key] = value.prod;
    devValues[key] = value.dev;
}

const prodPath = path.join(process.cwd(), "ecosystem.config.cjs");
const devPath = path.join(process.cwd(), "dev.ecosystem.config.cjs");

updateEcosystem(prodPath, prodValues);
updateEcosystem(devPath, devValues);

/* 
————————————————————————————————————————————————————————————————
manifest.json
———————————————————————————————————————————————————————————————— 
*/

const manifestPath = path.join(config.folders.public, "manifest.json");
const manifestJSON = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

manifestJSON.name = name;
manifestJSON.short_name = name;
manifestJSON.background_color = primary;
manifestJSON.theme_color = accent;
manifestJSON.icons[0].src = `https://${cdnDomain}${icon}`;

fs.writeFileSync(manifestPath, JSON.stringify(manifestJSON, null, 2), "utf8");

/* 
————————————————————————————————————————————————————————————————
tauri.conf.json
———————————————————————————————————————————————————————————————— 
*/

const tauriConfigPath = path.join(config.folders.root, "src-tauri", "tauri.conf.json");
const tauriConfigJSON = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));

tauriConfigJSON.productName = formattedName;
tauriConfigJSON.version = fullVersion;
tauriConfigJSON.identifier = id;
tauriConfigJSON.app.windows[0].title = name;

fs.writeFileSync(tauriConfigPath, JSON.stringify(tauriConfigJSON, null, 2), "utf8");

/* 
————————————————————————————————————————————————————————————————
Cargo.toml
———————————————————————————————————————————————————————————————— 
*/

const cargoTomlPath = path.join(config.folders.root, "src-tauri", "Cargo.toml");
let cargoTomlContent = fs.readFileSync(cargoTomlPath, "utf8");

cargoTomlContent = cargoTomlContent.replace(
  /^name\s*=\s*".*"/m,
  `name = "${formattedName}"`
);

cargoTomlContent = cargoTomlContent.replace(
  /^version\s*=\s*".*"/m,
  `version = "${fullVersion}"`
);

cargoTomlContent = cargoTomlContent.replace(
  /^description\s*=\s*".*"/m,
  `description = "${i18n.t("metadata.description")}"`
);

cargoTomlContent = cargoTomlContent.replace(
  /^authors\s*=\s*\[.*\]/m,
  `authors = ["${owner}"]`
);

fs.writeFileSync(cargoTomlPath, cargoTomlContent, "utf8");

/* 
————————————————————————————————————————————————————————————————
inno.iss
———————————————————————————————————————————————————————————————— 
*/

const innoPath = path.join(config.folders.root, "inno.iss");
let innoContent = fs.readFileSync(innoPath, "utf8");

innoContent = replaceLine(innoContent, "AppId", id);
innoContent = replaceLine(innoContent, "AppName", name);
innoContent = replaceLine(innoContent, "AppVersion", semver);
innoContent = replaceLine(innoContent, "AppPublisher", owner);
innoContent = replaceLine(innoContent, "AppPublisherURL", `https://${mainDomain}`);
innoContent = replaceLine(innoContent, "AppCopyright", owner);

innoContent = replaceLine(innoContent, "DefaultGroupName", name);
innoContent = replaceLine(innoContent, "VersionInfoProductName", name);
innoContent = replaceLine(innoContent, "VersionInfoVersion", semver);
innoContent = replaceLine(innoContent, "VersionInfoTextVersion", fullVersion);
innoContent = replaceLine(innoContent, "VersionInfoProductVersion", semver);
innoContent = replaceLine(innoContent, "VersionInfoCompany", owner);
innoContent = replaceLine(innoContent, "VersionInfoDescription", i18n.t("metadata.description"));
innoContent = replaceLine(innoContent, "VersionInfoCopyright", owner);

innoContent = innoContent.replace(
    /^OutputBaseFilename=.*$/m,
    `OutputBaseFilename=${name.replace(" ", "_")}_${fullVersion}_Installer_Windows`
);

innoContent = innoContent.replace(
    /^SetupIconFile=.*$/m,
    `SetupIconFile=public${icon}`
);

innoContent = innoContent.replace(
    /Name:\s*"\{group\\\}.*?"/g,
    `Name: "{group\\}${name}"`
);

innoContent = innoContent.replace(
    /Name: "\{commondesktop\\\}.*?"/g,
    `Name: "{commondesktop\\}${name}"`
);

innoContent = innoContent.replace(
    /Filename: "\{app\\\}.*?\.exe"/g,
    `Filename: "{app}\\${formattedName}.exe"`
);

innoContent = innoContent.replace(
    /^Source: ".*?\.exe".*$/m,
    `Source: "src-tauri\\target\\x86_64-pc-windows-msvc\\release\\${formattedName}.exe"; DestDir: "{app}"; Flags: ignoreversion`
);

innoContent = innoContent.replace(
    /Filename:\s*"\{app\\?\}.*?\.exe"/g,
    `Filename: "{app}\\${formattedName}.exe"`
);

fs.writeFileSync(innoPath, innoContent, "utf8");