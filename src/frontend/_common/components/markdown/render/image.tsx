import React from "react";

import ZoomableMedia from "../../ZoomableMedia.js";

interface ImageEmbedProps {
    src: string;
    alt?: string;
    width?: string | number;
    height?: string | number;
}

export const ImageEmbed: React.FC<ImageEmbedProps> = ({
    src,
    alt = "",
    width,
    height,
}) => {
    if (!src) return null;

    let customWidth = width;
    let customHeight = height;

    if (!customWidth && src.includes("=")) {
        const match = src.match(/=(\d+)(x\d+)?$/);
        if (match) {
            customWidth = match[1];
            if (match[2]) customHeight = match[2].replace("x", "");
        }
    }

    const style: React.CSSProperties = {
        width: customWidth ? `${customWidth}px` : undefined,
        height: customHeight ? `${customHeight}px` : undefined,
        maxWidth: "100%",
    };

    const cleanSrc = src.split("=")[0].trim();

    return (
        <div style={style}>
            <ZoomableMedia
                className="rounded w-full h-full object-cover"
                src={cleanSrc}
                alt={alt}
                description={alt}
            />
        </div>
    );
};

export default ImageEmbed;
