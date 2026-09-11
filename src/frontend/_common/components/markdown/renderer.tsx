import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

import ImageEmbed from "./render/image.js";
import Mention from "../../../main/components/Mention.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import ZoomableMedia from "../ZoomableMedia.js";
import YouTubeEmbed from "./render/youtube.js";
import SpotifyEmbed from "./render/spotify.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";

const RenderMention: React.FC<{ id: string }> = ({ id }) => {
    const [data, setData] = useState<WhatIsType>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchMentionData() {
            try {
                const response = await fetch(`${apiBaseUrl}/v3/whatis/${id}`, {
                    credentials: "include",
                });

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

    if (loading) {
        return <span className="opacity-65 font-mono text-xs">@...</span>;
    }

    if (!data?.id) {
        return <span className="opacity-65 font-mono text-xs">Invalid Mention</span>;
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
    | null
;

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

        if (parsed.hostname.includes("spotify.com")) {
            return "spotify";
        }

        return null;
    } catch {
        return null;
    }
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

    const processedContent = trimmedContent.replace(/__(.*?)__/g, "<u>$1</u>");

    return (
        <div className={`markdown-content text-base-content max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                    h1({ children }) {
                        return <h1 className="text-4xl font-extrabold mt-8 mb-3">
                            {children}
                        </h1>;
                    },

                    h2({ children }) {
                        return <h2 className="text-2xl font-bold mt-7 mb-2.5">
                            {children}
                        </h2>;
                    },

                    h3({ children }) {
                        return <h3 className="text-xl font-bold mt-6 mb-2">
                            {children}
                        </h3>;
                    },

                    h4({ children }) {
                        return <h4 className="text-base font-semibold mt-5 mb-1.5">
                            {children}
                        </h4>;
                    },

                    h5({ children }) {
                        return <h5 className="text-xs font-bold text-base-content/90 mt-4 mb-1">
                            {children}
                        </h5>;
                    },
                    
                    h6({ children }) {
                        return <h6 className="text-[10px] text-sub font-semibold mt-3 mb-0.5">
                            {children}
                        </h6>;
                    },
                    
                    u({ children }) {
                        return <u>{children}</u>;
                    },

                    table({ children }) {
                        return (
                            <div className="overflow-x-auto border border-base-300 rounded m-0 p-0">
                                <table className="table-auto w-full text-left border-collapse my-0">
                                    {children}
                                </table>
                            </div>
                        );
                    },

                    thead({ children }) {
                        return <thead className="bg-base-200 border-b border-base-300">{children}</thead>;
                    },

                    th({ children }) {
                        return <th className="p-2 border-r last:border-r-0 border-base-300 font-semibold">{children}</th>;
                    },

                    tr({ children }) {
                        return <tr className="even:bg-base-200/65">{children}</tr>;
                    },

                    td({ children }) {
                        return <td className="p-2 border-t border-r last:border-r-0 border-base-300">{children}</td>;
                    },

                    code({ children, className: codeClassName }) {
                        return (
                            <code className={`!rounded px-1.5 py-0.5 font-mono text-sm ${codeClassName || ""}`}>
                                {children}
                            </code>
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
                            <p className="first:mt-0 last:mb-0">
                                {React.Children.map(children, (child) => {
                                    if (typeof child !== "string") return child;

                                    const parts = child.split(/<@([A-Za-z0-9_-]+)>/g);

                                    return parts.map((part, index) =>
                                        index % 2 === 1 ? (
                                            <RenderMention key={`${part}-${index}`} id={part} />
                                        ) : (
                                            part
                                        )
                                    );
                                })}
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
                                    alt={typeof children === "string" ? children : "Image"}
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

                        return (
                            <a href={href} target="_blank" rel="noreferrer">
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
