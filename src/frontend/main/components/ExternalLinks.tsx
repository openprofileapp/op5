import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { LinkType } from "../../../backend/_common/types/queries/link.type.js";

type Props = {
    links?: LinkType[];
};

export default function ExternalLinks({
    links = []
}: Props) {
    const { ready } = useTranslation();

    if (!ready) return null;

    if (links && links.length < 1) {
        return;
    }

    const linkOrder: Record<string, number> = {
        website: 1,
        youtube: 2,
        x: 3,
        bluesky: 3,
        facebook: 4,
        instagram: 5,
        tiktok: 6,
        twitch: 7,
        discord: 8,
        github: 9
    };

    const sortedLinks = [...links].sort(
        (a, b) => (linkOrder[a.name] ?? 999) - (linkOrder[b.name] ?? 999)
    );

    {/* Display a link for all links */}

    return (
        <div className="flex gap-2 h-7 px-2 text-xs font-normal bg-base-200 border border-base-300 rounded">
            {sortedLinks.map((l) => (
                <span className="relative grid place-items-center tooltip tooltip-top">
                    <div className="tooltip-content">
                        <div className="font-bold">
                            {(() => {
                                // VERIFY THE IDS ARE CORRECT
                                switch (l.name) {
                                    case "website":
                                        return "Website";
                                    case "youtube":
                                        return "YouTube";
                                    case "x":
                                        return "X";
                                    case "bluesky":
                                        return "BlueSky";
                                    case "facebook":
                                        return "Facebook";
                                    case "instagram":
                                        return "Instagram";
                                    case "tiktok":
                                        return "TikTok";
                                    case "twitch":
                                        return "Twitch";
                                    case "discord":
                                        return "Discord";
                                    case "github":
                                        return "GitHub";
                                    default:
                                        return l.name;
                                }
                            })()}
                        </div>
                        {l.previewText && (
                            <div className="text-xs">{l.previewText}</div>
                        )}
                    </div>

                    {(() => {
                        switch (l.name) {
                            case "website":
                                return <span className="text-lg font-nerdfont leading-none"></span>;
                            case "youtube":
                                return <span className="text-lg font-nerdfont leading-none text-[#FF0000]"></span>;
                            case "x":
                                return <span className="text-lg font-nerdfont leading-none"></span>;
                            case "bluesky":
                                return <svg className="w-4.5 h-4.5 fill-[#1185FE]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>;
                            case "facebook":
                                return <span className="text-lg font-nerdfont leading-none text-[#0866FF]"></span>;
                            case "instagram":
                                return <span className="text-lg font-nerdfont leading-none text-[#FF0069]">󰋾</span>;
                            case "tiktok":
                                return <svg className="w-4 h-4 fill-[#25f4ee] relative top-[-0.5px]" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>;
                            case "twitch":
                                return <span className="text-lg font-nerdfont leading-none text-[#9146FF]"></span>;
                            case "discord":
                                return <span className="text-lg font-nerdfont leading-none text-[#5865F2]"></span>;
                            case "github":
                                return <span className="text-lg font-nerdfont leading-none text-[#6e5494]">󰊤</span>;
                            default:
                                return <span className="text-lg font-nerdfont leading-none"></span>;
                        }
                    })()}
                </span>
            ))}
        </div>
    );
}