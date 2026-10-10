import { cdnBaseUrl } from "../../_common/scripts/domains.js";
import { Article } from "../../../_common/types/article.type.js";

export default async function fetchMarkdownFile(
    fileName: string
): Promise<Article | null> {
    const response = await fetch(`${cdnBaseUrl}/${fileName}.md`, {
        credentials: "include"
    });

    if (response.status === 404) return null;

    if (!response.ok) {
        throw new Error(`Failed to fetch file (${response.status})`);
    }

    const content = await response.text();

    const frontmatter = content.match(
        /^\uFEFF?\s*---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/,
    );

    const metadata: Record<string, string> = {};

    if (frontmatter) {
        for (const line of frontmatter[1].split(/\r?\n/)) {
            const match = line.match(/^(\w+)\s*:\s*(.+)$/);

            if (match) {
                metadata[match[1]] = match[2]
                    .trim()
                    .replace(/^["']|["']$/g, "");
            }
        }
    }

    return {
        title: metadata.title ?? "",
        updated: metadata.updated,
        content: content.replace(
            /^\uFEFF?\s*---\s*\r?\n[\s\S]*?\r?\n---\s*(?:\r?\n|$)/,
            "",
        ),
    } as Article;
}
