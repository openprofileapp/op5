import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Mention from "../../main/components/Mention.js";
import { cdnBaseUrl } from "../scripts/domains.js";
import ZoomableMedia from "./ZoomableMedia.js";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export type EmbedType = 
    | "youtube" 
    | "spotify" 
    | "image"
    | null
;

function isImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(parsed.pathname);
    } catch {
        return false;
    }
}

function getEmbedType(url: string): EmbedType {
    try {
        const parsed = new URL(url);

        if (isImageUrl(url)) {
            return "image";
        }

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

function extractYouTubeId(url: string): string | null {
    try {
        const u = new URL(url);

        if (u.hostname.includes("youtu.be")) {
            return u.pathname.slice(1).split("?")[0] || null;
        }

        if (u.pathname.startsWith("/shorts/")) {
            return u.pathname.split("/")[2] || null;
        }

        return u.searchParams.get("v") || null;
    } catch {
        return null;
    }
}

function getSpotifyEmbedUrl(url: string): string | null {
    try {
        const u = new URL(url);
        if (!u.hostname.includes("spotify.com")) return null;

        if (u.pathname.startsWith("/embed/")) {
            return u.toString();
        }

        return `https://open.spotify.com/embed${u.pathname}${u.search}`;
    } catch {
        return null;
    }
}

const YouTubeEmbed: React.FC<{ url: string }> = ({ url }) => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    return (
        <div className="aspect-video w-full my-4">
            <iframe
                className="w-full h-full rounded border border-base-300"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

const SpotifyEmbed: React.FC<{ url: string }> = ({ url }) => {
    const embedUrl = getSpotifyEmbedUrl(url);
    if (!embedUrl) return null;

    return (
        <div className="my-4">
            <iframe
                style={{ borderRadius: "12px" }}
                src={embedUrl}
                width="100%"
                height="152"
                title="Spotify audio player"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
            />
        </div>
    );
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className = "",
}) => {
    return (
        <div className={`markdown-content ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    img({ src, alt }) {
                        if (!src) return null;
                        return <ZoomableMedia src={src} alt={alt || ""} className="my-4 rounded" />;
                    },

                    p({ children }) {
                        return (
                            <p>
                                {React.Children.map(children, (child) => {
                                    if (typeof child !== "string") return child;

                                    const parts = child.split(/<@([A-Za-z0-9_-]+)>/g);

                                    return parts.map((part, index) =>
                                        index % 2 === 1 ? (
                                            // DEVELOPER NEEDED: Clear this and rely on data
                                            <Mention
                                                key={`${part}-${index}`}
                                                id={part}
                                                name="Cornelia"
                                                avatar={`${cdnBaseUrl}/uploads/profiles/6773794953695671/4k2jGxq2utoquol17wG9HZ54LgLTUfVc.png`}
                                                aura={{
                                                    isEnabled: true,
                                                    primary: "#fce1969f",
                                                }}
                                                verified={true}
                                                inline={true}
                                            />
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
                            return <ZoomableMedia src={href} alt={typeof children === "string" ? children : "Image"} className="my-4 rounded" />;
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
                {content}
            </ReactMarkdown>
        </div>
    );
};
