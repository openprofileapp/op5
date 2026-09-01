import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";

import { apiBaseUrl, cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";
import ZoomableMedia from "../../../_common/components/ZoomableMedia.js";
import { formatNumber } from "kage-library/client";

export interface CharacterModalRef {
    open: (id: string) => void;
    close: () => void;
}

const CharacterModal = forwardRef<CharacterModalRef>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [character, setCharacter] = useState<GetPublishedCharacterItemType>();
    const [loading, setLoading] = useState(true);

    const resetState = () => {
        setActiveId(null);
        setCharacter(undefined);
        setLoading(true);
    };

    useImperativeHandle(ref, () => ({
        open: (id: string) => {
            setActiveId(id);
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    useEffect(() => {
        if (!activeId) return;

        const fetchProfiles = async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v3/characters?id=${activeId}&includeMedia=true`, 
                    { credentials: "include" }
                );
                const data = await res.json();
                setCharacter(data.items[0]);
            } catch (err) {
                console.error(err);
            } finally {
                // setLoading(false);
            }
        };

        fetchProfiles();
    }, [activeId]);

    const handleClose = () => {
        dialogRef.current?.close();
    };

    const auraStyle: React.CSSProperties = character?.isAuraEnabled
        ? {
            ["--aura-type" as string]: `aura-${character?.auraType || "flow"}`,
            ["--aura-primary" as string]: character?.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: character?.auraSecondary || "var(--color-accent)",
        }
        : {
            border: "1px solid #222222",
        };

    function relativeDate(dateInput?: string | number | Date): string {
        if (!dateInput) return "N/A";

        let dt: DateTime;

        if (typeof dateInput === "number") {
            dt = DateTime.fromMillis(dateInput);
        } else if (typeof dateInput === "string") {
            dt = DateTime.fromISO(dateInput);
        } else {
            dt = DateTime.fromJSDate(dateInput);
        }

        dt = dt.toLocal();

        if (!dt.isValid) return "N/A";

        const now = DateTime.now();
        const diffHours = Math.abs(now.diff(dt, "hours").hours);

        if (diffHours < 48) {
            return dt.toRelative({ style: "short" }) ?? "Just now";
        }

        return dt.toFormat("LLLL d, yyyy");
    }

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal"
            onClose={resetState}
        >
            <div 
                className="modal-box aura-effect max-w-180 h-164 relative flex flex-col pt-[110px] md:pt-[140px]"
                style={auraStyle}
            >
                <form method="dialog">
                    <button 
                        type="button"
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-30"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>

                <ZoomableMedia
                    className={`${loading ? "skeleton" : ""} absolute z-1 top-0 left-0 md:rounded-t-lg h-[110px] md:h-[164px] w-full object-cover`}
                    src={loading? "" : character?.banner ? `${cdnBaseUrl}${character.banner}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                    alt={loading ? "" : "banner"}
                    style={{
                        maskImage: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,1) 70%,
                            rgba(0,0,0,0.92) 72%,
                            rgba(0,0,0,0.82) 74%,
                            rgba(0,0,0,0.72) 76%,
                            rgba(0,0,0,0.6) 78%,
                            rgba(0,0,0,0.5) 80%,
                            rgba(0,0,0,0.4) 82%,
                            rgba(0,0,0,0.3) 84%,
                            rgba(0,0,0,0.22) 86%,
                            rgba(0,0,0,0.16) 88%,
                            rgba(0,0,0,0.11) 90%,
                            rgba(0,0,0,0.07) 92%,
                            rgba(0,0,0,0.04) 94%,
                            rgba(0,0,0,0.02) 97%,
                            rgba(0,0,0,0) 100%
                        )`,
                        WebkitMaskImage: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,1) 70%,
                            rgba(0,0,0,0.92) 72%,
                            rgba(0,0,0,0.82) 74%,
                            rgba(0,0,0,0.72) 76%,
                            rgba(0,0,0,0.6) 78%,
                            rgba(0,0,0,0.5) 80%,
                            rgba(0,0,0,0.4) 82%,
                            rgba(0,0,0,0.3) 84%,
                            rgba(0,0,0,0.22) 86%,
                            rgba(0,0,0,0.16) 88%,
                            rgba(0,0,0,0.11) 90%,
                            rgba(0,0,0,0.07) 92%,
                            rgba(0,0,0,0.04) 94%,
                            rgba(0,0,0,0.02) 97%,
                            rgba(0,0,0,0) 100%
                        )`,
                    }}
                />

                <div className="absolute z-3 top-14 hidden md:block w-40 h-40 rounded-full overflow-hidden border-8 border-base-200 bg-base-100">
                    {loading ? (
                        <div className="skeleton w-full h-full rounded-full"></div>
                    ) : (
                        <ZoomableMedia
                            className="w-full h-full object-cover"
                            src={character?.avatar ? `${cdnBaseUrl}${character.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                            alt="avatar"
                        />
                    )}
                </div>

                <div className="relative pt-4 z-2 flex flex-col md:flex-row gap-6 w-full flex-1 min-h-0 overflow-hidden">
                    <div className="flex flex-col justify-between w-full md:flex-1 order-2 md:order-1 gap-4 border-t md:border-t-0 md:border-r border-base-300 pt-4 md:pt-18 md:pr-4 min-h-0 overflow-hidden">
                        <div className="flex flex-col gap-4 w-full overflow-y-auto scrollbar pr-1 flex-1 min-h-0 pb-2">
                            <div className="grid grid-cols-1 gap-2.5 text-xs">
                                <div className="flex flex-col">
                                    <span className="font-bold text-sub uppercase tracking-wider">
                                        {loading ? (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        ) : (
                                            "Created"
                                        )}
                                    </span>
                                    {loading ? (
                                        <div className="skeleton rounded-full h-4 w-36 mt-1"></div>
                                    ) : (
                                        relativeDate(character?.createdDate)
                                    )}
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-sub font-bold uppercase tracking-wider">
                                        {loading ? (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        ) : (
                                            "Last Updated"
                                        )}
                                    </span>
                                    {loading ? (
                                        <div className="skeleton rounded-full h-4 w-36 mt-1"></div>
                                    ) : (
                                        relativeDate(character?.updatedDate)
                                    )}
                                </div>
                            </div>

                            <div className="text-xs border-t border-base-300 pt-4">
                                
                                <div className="flex flex-col">
                                    <span className="font-bold text-sub uppercase tracking-wider">
                                        Owner
                                    </span>
                                    <Link 
                                        className="text-sm hover:underline w-fit"
                                        to={`/user/${character?.owner?.username || character?.owner?.id}`}
                                    >
                                        {character?.owner?.displayName || character?.owner?.username || character?.owner?.id}
                                    </Link>
                                </div>
                            </div>

                            <div className="border-t border-base-300 pt-4">
                                <span className="text-xs uppercase text-sub tracking-wider font-bold block">
                                    Collaborations coming soon
                                </span>
                            </div>
                        </div>

                        {(loading || character?.licenseId) && (
                            <div className="flex flex-col gap-1 text-xs border-t border-base-300 pt-2 shrink-0 max-h-[35%] overflow-y-auto scrollbar">
                                <span className="text-xs uppercase text-sub tracking-wider font-bold block">
                                    Legal Information
                                </span>
                                <span className="text-xs text-sub">
                                    {character?.licenseId}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col w-full md:flex-[2.7] order-1 md:order-2 flex-1 min-h-0 overflow-visible relative">
                        {loading ? (
                            <div className="skeleton z-30 my-2 rounded-full pb-2 flex items-center gap-2 w-64 h-8 overflow-visible shrink-0 relative"></div>
                        ) : (
                            <div className="z-30 pt-2 pb-2 flex items-center gap-2 w-full overflow-visible shrink-0 relative">
                                <h1 className="text-2xl font-bold truncate leading-snug min-w-0">
                                    {character?.displayName}
                                </h1>

                                {character?.owner?.badges?.some(badge => badge.type === "VERIFIED") && (
                                    <div className="z-30 mr-3 relative font-normal tooltip tooltip-bottom tooltip-accent shrink-0">
                                        <a 
                                            href={`https://${window.config.domains.support}/en-us/articles/verification`} 
                                            target="_blank"
                                            rel="noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <svg className="text-accent" width="22" height="22" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg">
                                                <path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/>
                                                <path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" fill="#ffffff"/>
                                            </svg>
                                        </a>
                                        <div className="tooltip-content z-30">
                                            <div className="font-bold">Official Profile</div>
                                            <div className="text-xs">This profile is managed by its intellectual property owners or authorized individuals.</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 overflow-y-auto scrollbar pr-2 pb-2 flex-1 min-h-0">
                            <div className="flex flex-col gap-1">
                                <span className="text-sm leading-relaxed">
                                    {character?.about}
                                </span>
                            </div>

                            {/* DEVELOPER NEEDED: Make it so that if the credit is an id, to fetch 
                            the user on the backend and replace credit with (display name, username, 
                            and id JSON) where it can be made into a clickable link */}
                            {(loading || (character?.media && character.media.length > 0)) && (
                                <div className="flex flex-col gap-2 mt-2">
                                    <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                        Media
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 pb-2">
                                        {character?.media?.slice()
                                            .sort((a, b) => Number(a.position) - Number(b.position))
                                            .map((item, index) => (
                                            <ZoomableMedia 
                                                key={index}
                                                src={item.url ? `${cdnBaseUrl}${item.url}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                                                className="w-full h-full aspect-square rounded object-cover"
                                                alt={item.description || "Media"}
                                                description={item.description}
                                                credit={item.credit}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(loading || (character?.tags && character.tags.length > 0)) && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                        Tags
                                    </span>

                                    <div className="flex flex-wrap gap-1.5">
                                        {character?.tags.map((tag) => (
                                            <Link
                                                to={`/browse/${encodeURIComponent(tag)}`}
                                                className="rounded-full bg-base-100 text-xs px-3 py-1 border border-base-300 hover:underline"
                                            >
                                                <span>#{tag}</span>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2 mt-2">
                                <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                    Statistics
                                </span>

                                <div className="flex flex-row gap-8 justify-start text-sm w-full">
                                    <div className="flex items-center">
                                        <span className={`font-nerdfont text-base ${character?.interactions?.views?.hasInteracted ? "text-accent" : ""}`}>
                                            󰈈
                                        </span>
                                        <span className="text-xs ml-2 font-medium">
                                            {formatNumber(character?.interactions?.views?.count || 0).short}
                                        </span>
                                    </div>

                                    <div className="flex items-center">
                                        <span className={`font-nerdfont text-base ${character?.interactions?.likes?.hasInteracted ? "text-accent" : ""}`}>
                                            
                                        </span>
                                        <span className="text-xs ml-2 font-medium">
                                            {formatNumber(character?.interactions?.likes?.count || 0).short}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-row w-full mt-2 pt-4 border-t border-base-200 z-10 shrink-0">
                    <button 
                        type="button"
                        className="btn btn-neutral flex-1"
                        onClick={handleClose}
                    >
                        Close
                    </button>

                    <button 
                        type="button" 
                        className="btn btn-accent flex-[3]"
                    >
                        Read
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

CharacterModal.displayName = "CharacterModal";
export default CharacterModal;
