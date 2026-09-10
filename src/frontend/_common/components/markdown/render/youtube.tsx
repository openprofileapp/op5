import React from "react";

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

export const YouTubeEmbed: React.FC<{ url: string }> = ({ url }) => {
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

export default YouTubeEmbed;
