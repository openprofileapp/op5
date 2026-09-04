import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { Link } from "react-router-dom";
import { DateTime } from "luxon";

import { cdnBaseUrl } from "../../scripts/domains.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";
import ZoomableMedia from "../ZoomableMedia.js";
import { formatNumber } from "kage-library/client";

export interface CharacterModalRef {
    open: (data: GetPublishedCharacterItemType) => void;
    close: () => void;
}

const CharacterModal = forwardRef<CharacterModalRef>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetPublishedCharacterItemType>();
    const [loading, setLoading] = useState(true);

    const resetState = () => {
        setData(undefined);
        setLoading(true);
    };

    useImperativeHandle(ref, () => ({
        open: (data: GetPublishedCharacterItemType) => {
            setData(data);
            setLoading(false);

            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();

            resetState();
        }
    }));

    const handleClose = () => {
        dialogRef.current?.close();

        resetState();
    };

    if (!isTranslationReady || !data) return null;

    const auraStyle: React.CSSProperties = data.isAuraEnabled
        ? {
            ["--aura-type" as string]: `aura-${data.auraType || "flow"}`,
            ["--aura-primary" as string]: data.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: data.auraSecondary || "var(--color-accent)",
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

                {loading ? (
                    <div className="mask-graident skeleton absolute z-1 top-0 left-0 md:rounded-t-lg h-[110px] md:h-[164px] w-full object-cover"/>
                ) : (
                    (() => {
                        const Component = data.banner ? ZoomableMedia : "img";
                        
                        return (
                            <Component
                                className="mask-graident absolute z-1 top-0 left-0 md:rounded-t-lg h-[110px] md:h-[164px] w-full object-cover"
                                src={loading? "" : data.banner ? `${cdnBaseUrl}${data.banner}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                                alt={loading ? "" : "banner"}
                            />
                        );
                    })()
                )}

                <div className="absolute z-3 top-14 hidden md:block w-40 h-40 rounded-full overflow-hidden border-8 border-base-200 bg-base-100">
                    {loading ? (
                        <div className="skeleton w-full h-full rounded-full"></div>
                    ) : (
                        (() => {
                            const Component = data.avatar ? ZoomableMedia : "img";
                            
                            return (
                                <Component
                                    className="w-full h-full object-cover"
                                    src={data.avatar ? `${cdnBaseUrl}${data.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                                    alt="avatar"
                                />
                            );
                        })()
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
                                        relativeDate(data.createdDate)
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
                                        relativeDate(data.updatedDate)
                                    )}
                                </div>
                            </div>

                            <div className="text-xs border-t border-base-300 pt-4">
                                
                                <div className="flex flex-col">
                                    <span className="text-sub font-bold uppercase tracking-wider">
                                        {loading ? (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        ) : (
                                            "Owner"
                                        )}
                                    </span>
                                    {loading ? (
                                        <div className="skeleton rounded-full h-4 w-36 mt-1"></div>
                                    ) : (
                                        <Link 
                                            className="text-sm hover:underline w-fit"
                                            to={`/user/${data.owner?.username || data.owner?.id}`}
                                            onClick={handleClose}
                                        >
                                            {data.owner?.displayName || data.owner?.username || data.owner?.id}
                                        </Link>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-base-300 pt-4">
                                <div className="flex flex-col">
                                    <span className="text-sub font-bold uppercase tracking-wider">
                                        {loading && (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        )}
                                    </span>
                                    {loading && (
                                        <div className="skeleton rounded-full h-4 w-36 mt-1"></div>
                                    )}
                                </div>

                                {!loading && (
                                    <span className="text-xs uppercase text-sub tracking-wider font-bold block">
                                        Collaborations coming soon
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 text-xs border-t border-base-300 pt-2 shrink-0 max-h-[35%] overflow-y-auto scrollbar">
                            <span className="text-xs uppercase text-sub tracking-wider font-bold block">
                                {loading ? (
                                    <div className="skeleton rounded-full h-4 w-24"></div>
                                ) : (
                                    "Legal Information"
                                )}
                            </span>
                            {loading ? (
                                <div className="skeleton rounded-full h-4 w-36 mt-1"></div>
                            ) : (
                                <span className="text-xs text-sub">
                                    {data.license || "All Rights Reserved"}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col w-full md:flex-[2.7] order-1 md:order-2 flex-1 min-h-0 overflow-visible relative">
                        {loading ? (
                            <div className="skeleton z-30 my-1 mt-3 mb-2 rounded-full pb-2 flex items-center gap-2 w-64 h-7 overflow-visible shrink-0 relative"></div>
                        ) : (
                            <div className="z-30 pt-2 pb-2 flex items-center gap-2 w-full overflow-visible shrink-0 relative">
                                <h1 className="text-2xl font-bold truncate leading-snug min-w-0">
                                    {data.displayName}
                                </h1>

                                {data.owner?.badges?.some(badge => badge.type === "VERIFIED") && (
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
                            {loading ? (
                                <div className="flex flex-col gap-1">
                                    <div className="skeleton rounded-full h-4 w-[95%]"></div>
                                    <div className="skeleton rounded-full h-4 w-[85%]"></div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm leading-relaxed">
                                        {data.about}
                                    </span>
                                </div>
                            )}
      
                            {/* DEVELOPER NEEDED: Make it so that if the credit is an id, to fetch 
                            the user on the backend and replace credit with (display name, username, 
                            and id JSON) where it can be made into a clickable link */}
                            {(loading || (data.media && data.media.length > 0)) && (
                                <div className="flex flex-col gap-2 mt-2">
                                    <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                        {loading ? (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        ) : (
                                            "Media"
                                        )}
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-2 pb-2">
                                        {loading ? (
                                            <>
                                                <div className="skeleton rounded h-36 w-full"/>
                                                <div className="skeleton rounded h-36 w-full"/>
                                                <div className="skeleton rounded h-36 w-full"/>
                                            </>
                                        ) : (
                                            data.media
                                                ?.slice()
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
                                                ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {(loading || (data.tags && data.tags.length > 0)) && (
                                <div className="flex flex-col gap-2 mt-1">
                                    <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                        {loading ? (
                                            <div className="skeleton rounded-full h-4 w-24"></div>
                                        ) : (
                                            "Tags"
                                        )}
                                    </span>

                                    <div className="flex flex-wrap gap-1.5">
                                        {loading ? (
                                            <>
                                                <div className="skeleton rounded-full h-6 w-28"/>
                                                <div className="skeleton rounded-full h-6 w-36"/>
                                                <div className="skeleton rounded-full h-6 w-24"/>
                                            </>
                                        ) : (
                                            data.tags.map((tag) => (
                                                <Link
                                                    className="rounded-full bg-base-100 text-xs px-3 py-1 border border-base-300 hover:underline"
                                                    to={`/browse/${encodeURIComponent(tag)}`}
                                                    onClick={handleClose}
                                                >
                                                    <span>#{tag}</span>
                                                </Link>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {!loading && (
                                <div className="flex flex-col gap-2 mt-2">
                                    <span className="text-xs font-bold text-sub uppercase tracking-wider">
                                        Statistics
                                    </span>

                                    <div className="flex flex-row flex-wrap gap-x-8 gap-y-2 justify-start text-sm w-full">
                                        <div className="flex items-center">
                                            <span 
                                                className={`font-nerdfont text-base ${data.interactions?.views?.hasInteracted ? "text-accent" : ""}`}
                                            >
                                                󰈈
                                            </span>
                                            <span className="text-xs ml-2 font-medium">
                                                {formatNumber(data.interactions?.views?.count || 0).short}
                                                {" "}
                                                {data.interactions?.views?.count === 1 ? "View" : "Views"}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`font-nerdfont text-base ${data.interactions?.reads?.hasInteracted ? "text-accent" : ""}`}>
                                                
                                            </span>
                                            <span className="text-xs ml-2 font-medium">
                                                {formatNumber(data.interactions?.reads?.count || 0).short}
                                                {" "}
                                                {data.interactions?.reads?.count === 1 ? "Read" : "Reads"}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`font-nerdfont text-base ${data.interactions?.follows?.hasInteracted ? "text-accent" : ""}`}>
                                                
                                            </span>
                                            <span className="text-xs ml-2 font-medium">
                                                {formatNumber(data.interactions?.follows?.count || 0).short}
                                                {" "}
                                                {data.interactions?.follows?.count === 1 ? "Follower" : "Followers"}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <span className={`font-nerdfont text-base ${data.interactions?.likes?.hasInteracted ? "text-accent" : ""}`}>
                                                
                                            </span>
                                            <span className="text-xs ml-2 font-medium">
                                                {formatNumber(data.interactions?.likes?.count || 0).short}
                                                {" "}
                                                {data.interactions?.likes?.count === 1 ? "Like" : "Likes"}
                                            </span>
                                        </div>

                                        <div className="hidden flex items-center">
                                            <span className={`font-nerdfont text-base ${data.interactions?.shares?.hasInteracted ? "text-accent" : ""}`}>
                                                󰒗
                                            </span>
                                            <span className="text-xs ml-2 font-medium">
                                                {formatNumber(data.interactions?.shares?.count || 0).short}
                                                {" "}
                                                {data.interactions?.shares?.count === 1 ? "Share" : "Shares"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(!loading && window.session.user?.isDeveloper) && (
                                <div className="flex text-xs flex-col mt-1">
                                    <span className="text-sub font-bold uppercase tracking-wider">
                                        Developer View
                                    </span>
                                    <div className="mt-1">
                                        <span>Algorithm Score:</span> {data.algorithmScore.toFixed(0)}
                                    </div>
                                </div>
                            )}
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
                        className="btn btn-accent flex-3"
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
