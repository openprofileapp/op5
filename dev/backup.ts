import fg from "fast-glob";
import fs from "fs-extra";
import path from "path";

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outDir = path.join("dev", "backups", timestamp);

const ignore = [
    "**/node_modules/**",
    "**/dist/**",
    "**/release/**",
    "**/logs/**",
    "**/dev/backups/**",
    "**/backups/**",
    "**/target/**",
    "package-lock.json"
];

await fs.ensureDir(outDir);

const files = await fg(["**/*"], {
    dot: true,
    onlyFiles: true,
    ignore
});

for (const file of files) {
    const src = path.join(process.cwd(), file);
    const dest = path.join(outDir, file);
    await fs.copy(src, dest);
}

console.log("Backup created at:", outDir);