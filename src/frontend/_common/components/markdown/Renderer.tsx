import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

import ImageEmbed from "./render/Image.js";
import Mention from "../Mention.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import ZoomableMedia from "../ZoomableMedia.js";
import YouTubeEmbed from "./render/Youtube.js";
import SpotifyEmbed from "./render/Spotify.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";
import ExternalLink from "../ExternalLink.js";

const RenderMention: React.FC<{ id: string }> = ({ id }) => {
    const [data, setData] = useState<WhatIsType>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchMentionData() {
            try {
                const response = await fetch(`${apiBaseUrl}/v3/whatis/${id}`, { credentials: "include" });

                if (response.ok) {
                    const data = await response.json();
                    setData(data);
                }
            } catch (error) {
                console.error(`Failed to fetch mention for ID ${id}:`, error);
            } finally {
                setLoading(false);
            }
        }

        fetchMentionData();
    }, [id]);

    if (window.location.hostname.startsWith(window.config.domains.studio)) {
        return (
            <span className="text-sub font-mono text-xs border border-base-300 py-1 px-3 rounded-full">
                Mentions Not Supported In Studio
            </span>
        );
    }

    if (loading) {
        return (
            <span className="text-sub font-mono text-xs border border-base-300 py-1 px-3 rounded-full">
                Loading...
            </span>
        );
    }

    if (!data?.id) {
        return (
            <span className="text-sub font-mono text-xs border border-base-300 py-1 px-3 rounded-full">
                Id Not Found
            </span>
        );
    }

    return (
        <Mention
            data={data}
            inline={true}
        />
    );
};

export type EmbedType =
    | "youtube"
    | "spotify"
    | "image"
    | null;

function isImageUrl(url: string): boolean {
    if (!url) return false;

    try {
        const parsed = new URL(url);
        return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(parsed.pathname);
    } catch {
        return false;
    }
}

function getEmbedType(url: string): EmbedType {
    if (!url) return null;

    try {
        const parsed = new URL(url);

        if (isImageUrl(url)) return "image";

        if (
            parsed.hostname.includes("youtube.com") ||
            parsed.hostname.includes("youtu.be")
        ) {
            return "youtube";
        }

        if (parsed.hostname.includes("open.spotify.com")) {
            return "spotify";
        }

        return null;
    } catch {
        return null;
    }
}

function isColor(value: string): boolean {
    const color = value.trim();

    if (/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(color)) {
        return true;
    }

    if (
        /^rgba?\(\s*[\d.]+%?\s*,\s*[\d.]+%?\s*,\s*[\d.]+%?(?:\s*,\s*[\d.]+%?)?\s*\)$/i.test(
            color
        )
    ) {
        return true;
    }

    if (
        /^hsla?\(\s*[\d.]+(?:deg)?\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*[\d.]+%?)?\s*\)$/i.test(
            color
        )
    ) {
        return true;
    }

    return false;
}

const ColorValue: React.FC<{ value: string }> = ({ value }) => {
    return (
        <span className="inline-flex items-center gap-1.5 align-middle">
            <span
                className="inline-block h-4 w-4 shrink-0 rounded border border-base-content/20 shadow-sm"
                style={{
                    backgroundColor: value,
                }}
            />

            <code className="!rounded bg-base-200 px-1.5 py-0.5 font-mono text-sm">
                {value}
            </code>
        </span>
    );
};

function renderTextWithColors(text: string): React.ReactNode {
    const colorPattern =
        /(#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})\b|rgba?\([^)]*\)|hsla?\([^)]*\)|\b(?:black|silver|gray|grey|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|cyan|orange|pink|brown|transparent)\b)/gi;

    const parts = text.split(colorPattern);

    return parts.map((part, index) => {
        if (isColor(part)) {
            return (
                <ColorValue
                    key={`${part}-${index}`}
                    value={part}
                />
            );
        }

        return part;
    });
}

function renderMarkdownText(text: string): React.ReactNode {
    const mentionParts = text.split(/<@([A-Za-z0-9_-]+)>/g);

    return mentionParts.map((part, index) => {
        if (index % 2 === 1) {
            return (
                <RenderMention
                    key={`${part}-${index}`}
                    id={part}
                />
            );
        }

        return renderTextWithColors(part);
    });
}

function renderMarkdownChildren(
    children: React.ReactNode
): React.ReactNode {
    return React.Children.map(children, (child) => {
        if (typeof child === "string") {
            return renderMarkdownText(child);
        }

        return child;
    });
}

export interface MarkdownRendererProps {
    content?: string;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content = "",
    className = "",
}) => {
    const trimmedContent = content?.trim();

    if (!trimmedContent) {
        return null;
    }

    const processedContent = trimmedContent.replace(
        /__(.*?)__/g,
        "<u>$1</u>"
    );

    return (
        <div
            className={`markdown-content space-y-4 text-base-content max-w-none ${className}`}
        >
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1({ children }) {
                        return (
                            <h1 className="text-4xl font-extrabold mt-8 mb-3">
                                {children}
                            </h1>
                        );
                    },

                    h2({ children }) {
                        return (
                            <h2 className="text-2xl font-bold mt-7 mb-2.5">
                                {children}
                            </h2>
                        );
                    },

                    h3({ children }) {
                        return (
                            <h3 className="text-xl font-bold mt-6 mb-2">
                                {children}
                            </h3>
                        );
                    },

                    h4({ children }) {
                        return (
                            <h4 className="text-base font-semibold mt-5 mb-1.5">
                                {children}
                            </h4>
                        );
                    },

                    h5({ children }) {
                        return (
                            <h5 className="text-xs font-bold text-base-content/90 mt-4 mb-1">
                                {children}
                            </h5>
                        );
                    },

                    h6({ children }) {
                        return (
                            <h6 className="text-[10px] text-sub font-semibold mt-3 mb-0.5">
                                {children}
                            </h6>
                        );
                    },

                    u({ children }) {
                        return <u>{children}</u>;
                    },

                    ul({ children }) {
                        return (
                            <ul className="list-disc pl-6 space-y-1">
                                {children}
                            </ul>
                        );
                    },

                    ol({ children }) {
                        return (
                            <ol className="list-decimal pl-6 space-y-1">
                                {children}
                            </ol>
                        );
                    },

                    li({ children }) {
                        return (
                            <li className="pl-1">
                                {renderMarkdownChildren(children)}
                            </li>
                        );
                    },

                    hr() {
                        return <div className="my-8 border-t border-base-300" />;
                    },

                    blockquote({ children }) {
                        return (
                            <blockquote className="border-l-4 border-base-300 pl-4 my-4 text-sub rounded">
                                {renderMarkdownChildren(children)}
                            </blockquote>
                        );
                    },

                    table({ children }) {
                        return (
                            <div className="overflow-x-auto border border-base-300 rounded p-0">
                                <table className="table-auto w-full text-left border-collapse my-0">
                                    {children}
                                </table>
                            </div>
                        );
                    },

                    thead({ children }) {
                        return (
                            <thead className="bg-base-200 border-b border-base-300">
                                {children}
                            </thead>
                        );
                    },

                    th({ children }) {
                        return (
                            <th className="p-2 border-r last:border-r-0 border-base-300 font-semibold">
                                {children}
                            </th>
                        );
                    },

                    tr({ children }) {
                        return (
                            <tr className="even:bg-base-200/65">
                                {children}
                            </tr>
                        );
                    },

                    td({ children }) {
                        return (
                            <td className="p-2 border-t border-r last:border-r-0 border-base-300">
                                {children}
                            </td>
                        );
                    },

                    code({ children, className: codeClassName }) {
                        const value = String(children).trim();

                        if (isColor(value)) {
                            return <ColorValue value={value} />;
                        }

                        return (
                            <code
                                className={`rounded px-1.5 py-0.5 font-mono text-sm bg-base-200 ${
                                    codeClassName || ""
                                }`}
                            >
                                {children}
                            </code>
                        );
                    },

                    pre({ children }) {
                        return (
                            <pre className="rounded border border-base-300 bg-base-200 p-4 whitespace-pre-wrap break-words">
                                {children}
                            </pre>
                        );
                    },

                    img({ src, alt, width, height }) {
                        if (!src) return null;

                        return (
                            <ImageEmbed
                                src={src}
                                alt={alt}
                                width={width}
                                height={height}
                            />
                        );
                    },

                    p({ children }) {
                        if (!children) return null;

                        return (
                            <p className="mb-4 first:mt-0 last:mb-0">
                                {renderMarkdownChildren(children)}
                            </p>
                        );
                    },

                    a({ href, children }) {
                        if (!href) return null;

                        const type = getEmbedType(href);

                        if (type === "image") {
                            return (
                                <ZoomableMedia
                                    src={href}
                                    alt={
                                        typeof children === "string"
                                            ? children
                                            : "Image"
                                    }
                                    className="rounded"
                                />
                            );
                        }

                        if (type === "youtube") {
                            return <YouTubeEmbed url={href} />;
                        }

                        if (type === "spotify") {
                            return <SpotifyEmbed url={href} />;
                        }

                        const isPlainUrl =
                            typeof children === "string" &&
                            children.trim() === href.trim();

                        if (isPlainUrl) {
                            return (
                                <ExternalLink
                                    url={href}
                                    renderAsEmbed={true}
                                />
                            );
                        }

                        return (
                            <a
                                className="underline"
                                href={href}
                                target="_blank"
                                rel="noreferrer"
                            >
                                {children}
                            </a>
                        );
                    },
                }}
            >
                {processedContent}
            </ReactMarkdown>
        </div>
    );
};

export default MarkdownRenderer;
