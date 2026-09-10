import React from "react";

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

export const SpotifyEmbed: React.FC<{ url: string }> = ({ url }) => {
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

export default SpotifyEmbed;
