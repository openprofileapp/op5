import fs from "node:fs/promises";
import path from "node:path";

import { ArticleMetadata, ArticleItem, Article } from "../../../_common/types/article.type.js";

const articlesDir = path.resolve("public/articles");

function formatTitle(value: string) {
    return value
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseKeywords(value: string): string[] {
    const trimmed = value.trim();

    if (!trimmed) {
        return [];
    }

    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        return trimmed
            .slice(1, -1)
            .split(",")
            .map((keyword) =>
                keyword.trim().replace(/^["']|["']$/g, ""),
            )
            .filter(Boolean);
    }

    return trimmed
        .split(",")
        .map((keyword) =>
            keyword.trim().replace(/^["']|["']$/g, ""),
        )
        .filter(Boolean);
}

function getMetadata(content: string): ArticleMetadata {
    const match = content.match(
        /^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/,
    );

    if (!match) {
        return {};
    }

    const metadata: ArticleMetadata = {};

    const lines = match[1].split(/\r?\n/);

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const arrayMatch = line.match(/^keywords\s*:\s*$/);

        if (arrayMatch) {
            const keywords: string[] = [];

            while (i + 1 < lines.length) {
                const itemMatch = lines[i + 1].match(
                    /^\s+-\s+(.+?)\s*$/,
                );

                if (!itemMatch) {
                    break;
                }

                keywords.push(
                    itemMatch[1]
                        .trim()
                        .replace(/^["']|["']$/g, ""),
                );

                i++;
            }

            metadata.keywords = keywords;
            continue;
        }

        const lineMatch = line.match(/^(\w+)\s*:\s*(.*)$/);

        if (!lineMatch) {
            continue;
        }

        const [, key, rawValue] = lineMatch;
        const value = rawValue
            .trim()
            .replace(/^["']|["']$/g, "");

        if (key === "keywords") {
            metadata.keywords = parseKeywords(rawValue);
            continue;
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        metadata[key as keyof ArticleMetadata] = value;
    }

    return metadata;
}

function removeMetadata(content: string) {
    return content.replace(
        /^\uFEFF?\s*---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/,
        "",
    );
}

async function walkArticles(directory: string): Promise<string[]> {
    const entries = await fs.readdir(directory, {
        withFileTypes: true,
    });

    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            files.push(...await walkArticles(fullPath));
            continue;
        }

        if (
            entry.isFile() &&
            entry.name.toLowerCase().endsWith(".md")
        ) {
            files.push(fullPath);
        }
    }

    return files;
}

function getSafeArticlePath(slug: string) {
    const root = path.resolve(articlesDir);
    const filePath = path.resolve(root, `${slug}.md`);

    if (
        filePath !== root &&
        !filePath.startsWith(root + path.sep)
    ) {
        throw new Error("Invalid article path");
    }

    return filePath;
}

function getArticleSlug(filePath: string) {
    return path
        .relative(articlesDir, filePath)
        .replace(/\\/g, "/")
        .replace(/\.md$/i, "");
}

function createArticleItem(
    filePath: string,
    content: string,
): ArticleItem {
    const slug = getArticleSlug(filePath);

    const relativePath = slug;
    const parts = relativePath.split("/");

    const filename = parts.pop() ?? "";

    const group = parts.length > 0
        ? parts.join("/")
        : undefined;

    const metadata = getMetadata(content);

    return {
        slug,
        title: metadata.title ?? formatTitle(filename),
        group: group ? formatTitle(group) : undefined,
        author: metadata.author,
        date: metadata.date,
        updated: metadata.updated,
        keywords: metadata.keywords,
    };
}

export async function getArticleIndex(): Promise<ArticleItem[]> {
    const files = await walkArticles(articlesDir);

    const articles = await Promise.all(
        files.map(async (filePath) => {
            const content = await fs.readFile(
                filePath,
                "utf8",
            );

            return createArticleItem(filePath, content);
        }),
    );

    return articles.sort((a, b) => {
        if (a.group !== b.group) {
            if (!a.group) return -1;
            if (!b.group) return 1;

            return a.group.localeCompare(b.group);
        }

        if (a.group?.toLowerCase() === "change logs") {
            return compareVersions(b.title, a.title);
        }

        return a.title.localeCompare(b.title);
    });
}

export async function getArticle(
    slug: string,
): Promise<Article | null> {
    const filePath = getSafeArticlePath(slug);

    try {
        const rawContent = await fs.readFile(
            filePath,
            "utf8",
        );

        const item = createArticleItem(
            filePath,
            rawContent,
        );

        return {
            ...item,
            content: removeMetadata(rawContent),
        };
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return null;
        }

        throw error;
    }
}

function parseVersion(value: string) {
    const match = value.match(
        /^v?(\d+)\.(\d+)\.(\d+)$/i,
    );

    if (!match) {
        return null;
    }

    return {
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3]),
    };
}

function compareVersions(a: string, b: string) {
    const versionA = parseVersion(a);
    const versionB = parseVersion(b);

    if (!versionA && !versionB) {
        return a.localeCompare(b);
    }

    if (!versionA) return 1;
    if (!versionB) return -1;

    return (
        versionA.major - versionB.major ||
        versionA.minor - versionB.minor ||
        versionA.patch - versionB.patch
    );
}

export async function getLatestChangelog(): Promise<ArticleMetadata | null> {
    const changelogDirectory = path.join(
        articlesDir,
        "change-logs",
    );

    let entries;

    try {
        entries = await fs.readdir(changelogDirectory, {
            withFileTypes: true,
        });
    } catch (error) {
        if (
            error &&
            typeof error === "object" &&
            "code" in error &&
            error.code === "ENOENT"
        ) {
            return null;
        }

        throw error;
    }

    const changelogs = entries
        .filter(
            (entry) =>
                entry.isFile() &&
                entry.name.toLowerCase().endsWith(".md"),
        )
        .sort((a, b) =>
            b.name.localeCompare(a.name, undefined, {
                numeric: true,
                sensitivity: "base",
            }),
        );

    const latest = changelogs[0];

    if (!latest) {
        return null;
    }

    const filePath = path.join(changelogDirectory, latest.name);
    const content = await fs.readFile(filePath, "utf8");

    return getMetadata(content);
}
