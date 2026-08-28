import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GetPublishedCharacterType } from "../../../_common/types/character.type.js";
import { toast } from "../../_common/scripts/toast.js";
import { formatDisplayNameToUrl } from "../scripts/formatDisplayNameToUrl.js";
import { postInteraction } from "../scripts/postInteraction.js";
import { formatNumber } from "kage-library/client";
import { studioHost } from "../scripts/hosts.js";

type Props = {
    data: GetPublishedCharacterType;
    isPreview?: boolean;
    hasNotification?: boolean;
    isHomeScreen?: boolean
    dragHandleProps?: unknown;
};

let index = 1;

export default function CharacterCard({
    data,
    isPreview = false,
    hasNotification = false,
    isHomeScreen = false,
    dragHandleProps
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    const [isChatted, setIsChatted] = useState(data.interactions?.chats?.hasInteracted);
    const [chatCount, setChatCount] = useState(data.interactions?.chats?.count || 0);
    const [isChatLoading, setIsChatLoading] = useState(false);

    const [isDismissed, setIsDismissed] = useState(data.interactions?.dismisses?.hasInteracted);
    const [isDismissLoading, setIsDismissLoading] = useState(false);

    const [isFollowing, setIsFollowing] = useState(data.interactions?.follows?.hasInteracted);
    const [followCount, setFollowCount] = useState(data.interactions?.follows?.count || 0);
    const [isFollowLoading, setIsFollowLoading] = useState(false);

    const [isHidden, setIsHidden] = useState(data.interactions?.hides?.hasInteracted);
    const [isHideLoading, setIsHideLoading] = useState(false);

    const [isLiked, setIsLiked] = useState(data.interactions?.likes?.hasInteracted);
    const [likeCount, setLikeCount] = useState(data.interactions?.likes?.count || 0);
    const [isLikeLoading, setIsLikeLoading] = useState(false);

    const [isMuted, setIsMuted] = useState(data.interactions?.mutes?.hasInteracted);
    const [muteCount, setMuteCount] = useState(data.interactions?.mutes?.count || 0);
    const [isMuteLoading, setIsMuteLoading] = useState(false);

    const [isShared, setIsShared] = useState(data.interactions?.shares?.hasInteracted);
    const [shareCount, setShareCount] = useState(data.interactions?.shares?.count || 0);
    const [isShareLoading, setIsShareLoading] = useState(false);

    const [isViewed, setIsViewed] = useState(data.interactions?.views?.hasInteracted);
    const [viewCount, setViewCount] = useState(data.interactions?.views?.count || 0);
    const [isViewLoading, setIsViewLoading] = useState(false);

    // DEVELOPER NEEDED: Add library states here

    const [isPinned, setIsPinned] = useState(data.isPinned);
    const [isPinLoading, setIsPinLoading] = useState(false);

    const closeContextMenu = useCallback((id: string) => {
        setIsContextMenuOpen(false);
        document
            .getElementById(`character-more-dropdown-${data.id}`)
            ?.hidePopover();
    }, [data.id]);

    useEffect(() => {
        if (isContextMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isContextMenuOpen]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`character-more-dropdown-${data.id}`);

            if (!menu) return;

            if (menu.contains(e.target as Node)) {
                return;
            }

            closeContextMenu(data.id);
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [data.id, closeContextMenu]);

    const checkCollectionMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsContextMenuFlipped(spaceRight < submenuWidth);
    };

    if (
        !data.id ||
        !data.owner ||
        !data.owner.id ||
        !isTranslationReady || 
        isHidden
    ) return null;

    index++

    {/* DEVELOPER NEEDED: Clicking should open a modal, not a full page */}
    const Wrapper = isPreview ? "div" : Link;
   
    const auraStyle: React.CSSProperties = data.isAuraEnabled
        ? {
            ["--aura-type" as string]: `aura-${data.auraType || "flow"}`,
            ["--aura-primary" as string]: data.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: data.auraSecondary || "var(--color-accent)",
        }
        : {
            border: "1px solid #222222",
        };

    return (
        <div
            className={`aura-effect character-card relative p-4 shadow-sm cursor-pointer z-${index}`}
            style={auraStyle}
            onContextMenu={(e) => {
                e.preventDefault();
                setIsContextMenuOpen(true);

                const popover = document.getElementById(
                    `character-more-dropdown-${data.id}`
                ) as HTMLElement | null;

                if (!popover) return;

                popover.showPopover?.();

                requestAnimationFrame(() => {
                    const rect = popover.getBoundingClientRect();

                    popover.style.left = `${Math.min(
                        e.clientX,
                        window.innerWidth - rect.width - 8
                    )}px`;

                    popover.style.top = `${Math.min(
                        e.clientY,
                        window.innerHeight - rect.height - 8
                    )}px`;
                });
            }}
        >
            { hasNotification ?
                <div className="absolute top-[-5px] right-[-5px] z-3">
                    <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
                    <div className="relative rounded-full bg-accent w-5 h-5" />
                </div> 
                : ""
            }

            {isPinned && (
                dragHandleProps ? (
                    <div
                        {...dragHandleProps}
                    >
                        <div className="absolute top-[12px] left-[12px] z-2">
                            <button className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden cursor-grab">
                                <span className="leading-none text-2xl font-nerdfont translate-y-[-2px]">
                                    󰇛
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="absolute top-[12px] left-[12px] z-2 tooltip tooltip-top tooltip-accent"
                        data-tip="Pinned"
                    >
                        <button className="relative flex items-start justify-center w-5 h-5 overflow-hidden">
                            <span className="leading-none text-2xl font-nerdfont translate-y-[-2px]">
                                󰐃
                            </span>
                        </button>
                    </div>
                )
            )}

            <div
                className="absolute top-[12px] left-[12px] z-2 tooltip tooltip-top tooltip-accent"
                data-tip="Exclusive"
            >
                <button className="relative flex items-start justify-center w-5 h-5 overflow-hidden">
                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px]">
                        {data.visibility !== "public" ? "" : ""}
                    </span>
                </button>
            </div>

            <div
                className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent"
                data-tip="More"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsContextMenuOpen(true);

                    const popover = document.getElementById(
                        `character-more-dropdown-${data.id}`
                    );

                    if (!popover) return;

                    const rect = e.currentTarget.getBoundingClientRect();

                    popover.style.left = `${rect.left}px`;
                    popover.style.top = `${rect.bottom}px`;

                    if (popover.matches(":popover-open")) {
                        popover.hidePopover?.();
                    } else {
                        popover.showPopover?.();
                    }
                }}
            >
                <button className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden">
                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                        󰇘
                    </span>
                </button>
            </div>

            <ul
                className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
                popover="manual"
                id={`character-more-dropdown-${data.id}`}
            >
                {isHomeScreen && (
                    <>
                        <li 
                            onClick={async () => {
                                if (isDismissLoading) return;

                                closeContextMenu(data.id);
                                setIsDismissLoading(true);

                                const res = await postInteraction(data.id, "dismisses");

                                if (res.ok) {
                                    setIsDismissLoading(false);
                                    setIsDismissed(true);
                                    setIsHidden(true);

                                    toast.show(
                                        `You dismissed ${data.displayName}`,
                                        { icon: "", type: "success" }
                                    );
                                } else {
                                    setIsDismissLoading(false);

                                    toast.show(
                                        `Failed to dismiss ${data.displayName}`,
                                        {
                                            subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
                                            icon: "", 
                                            type: "error" 
                                        }
                                    );
                                }
                            }}
                        >
                            <button className="justify-between">
                                Dismiss
                                <span 
                                    className={`${isDismissLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                                    
                                </span>
                            </button>
                        </li>

                        <hr />
                    </>
                )}

                {data.owner.id === window.session.userId && (
                    <>
                        {/* DEVELOPER NEEDED: Also display on characters where the user has permission to open in studio (eg: write) */}
                        <li
                            onClick={() => {
                                closeContextMenu(data.id);
                            }}
                        >
                            <a
                                className="justify-between"
                                href={`${studioHost}/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View in Studio
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </a>
                        </li>

                        {/* DEVELOPER NEEDED: Pins go here only when on user or universe profile */}

                        <hr />
                    </>
                )}

                {/* DEVELOPER NEEDED: Add the interaction when landing on the pages, not here */}
                <li
                    onClick={() => {
                        closeContextMenu(data.id);
                    }}
                >
                    <Link 
                        className="justify-between" 
                        to={`/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                    >
                        View
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰈈
                        </span>
                    </Link>
                </li>

                <li
                    onClick={() => {
                        closeContextMenu(data.id);
                    }}
                >
                    <Link 
                        className="justify-between" 
                        to={`/read/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                    >
                        Read
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </Link>
                </li>

                {/* DEVELOPER NEEDED: On click, open a chat with the character */}
                <li 
                    className={`tooltip tooltip-${isContextMenuFlipped ? "left" : "right"} tooltip-accent`}
                    data-tip="Coming Soon"
                    onClick={() => {
                        // closeContextMenu(data.id);

                        // Open chat here and save to user message history
                    }}
                >
                    <button className="justify-between" disabled={true}>
                        Chat
                        <span className="font-nerdfont text-xl flex h-6 w-4 leading-none items-center justify-center">
                            󰭹
                        </span>
                    </button>
                </li>

                <hr />

                <li 
                    onClick={async () => {
                        if (isFollowLoading) return;

                        setIsFollowLoading(true);

                        const res = await postInteraction(data.id, "follows");

                        if (res.ok) {
                            setIsFollowLoading(false);
                            setIsFollowing(!isFollowing);

                            toast.show(
                                `You ${isFollowing ? "unfollowed" : "followed"} ${data.displayName}`,
                                { icon: "", type: isFollowing ? "info" : "success" }
                            );
                        } else {
                            setIsFollowLoading(false);
                            
                            toast.show(
                                `Failed to ${isFollowing ? "unfollow" : "follow"} ${data.displayName}`,
                                {
                                    subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
                                    icon: "", 
                                    type: "error" 
                                }
                            );
                        }
                    }}
                >
                    <button className={`${isFollowing ? "text-accent" : "" } justify-between`}>
                        {isFollowing ? "Unfollow" : "Follow"}
                        <span 
                            className={`${isFollowLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                            {isFollowing ? "" : ""}
                        </span>
                    </button>
                </li>

                <li 
                    onClick={async () => {
                        if (isLikeLoading) return;

                        setIsLikeLoading(true);

                        const res = await postInteraction(data.id, "likes");

                        if (res.ok) {
                            setIsLikeLoading(false);
                            setIsLiked(!isLiked);
                            setLikeCount(prev => isLiked ? prev - 1 : prev + 1);

                            toast.show(
                                `You ${isLiked ? "unliked" : "liked"} ${data.displayName}`,
                                { icon: "", type: isLiked ? "info" : "success" }
                            );
                        } else {
                            setIsLikeLoading(false);
                            
                            toast.show(
                                `Failed to ${isLiked ? "unlike" : "like"} ${data.displayName}`,
                                {
                                    subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
                                    icon: "", 
                                    type: "error" 
                                }
                            );
                        }
                    }}
                >
                    <button className={`${isLiked ? "text-accent" : "" } justify-between`}>
                        {isLiked ? "Unlike" : "Like"}
                        <span 
                            className={`${isLikeLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                            {isLiked ? "" : ""}
                        </span>
                    </button>
                </li>

                {/* DEVELOPER NEEDED: Add collections then polish this  */}
                <li 
                    className="relative group"
                    onMouseEnter={checkCollectionMenuPosition}
                >
                    <button className="justify-between w-full">
                        Add to Collection
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>

                    <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                    <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                        <li>
                            <button 
                                className="justify-between"
                                onClick={() => {
                                    
                                    closeContextMenu(data.id);
                                }}
                            >
                                Favorites
                                <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                    
                                </span>
                            </button>
                        </li>

                        <hr />

                        <li>
                            <button 
                                className="justify-between"
                                onClick={() => {
                                    
                                    closeContextMenu(data.id);
                                }}
                            >
                                Superheroes
                                <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                    <img 
                                        className="rounded-full translate-x-[2px]"
                                        src="https://cdn.openprofile.app/uploads/users/5019646586243236/5019646586243236.png"
                                    />
                                </span>
                            </button>
                        </li>

                        <li>
                            <button 
                                className="justify-between"
                                onClick={() => {
                                    
                                    closeContextMenu(data.id);
                                }}
                            >
                                Featured by OpenProfile
                                <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                    <img 
                                        className="rounded-full translate-x-[2px]"
                                        src="https://cdn.openprofile.app/uploads/users/9534968913312158/9534968913312158.png"
                                    />
                                </span>
                            </button>
                        </li>

                        <hr />

                        <li>
                            <button 
                                className="justify-between"
                                onClick={() => {
                                    
                                    closeContextMenu(data.id);
                                }}
                            >
                                New Collection
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    󰌴
                                </span>
                            </button>
                        </li>
                    </ul>
                </li>

                <hr />

                {/* DEVELOPER NEEDED: If not added to any collections either */}
                {(!isFollowing && !isLiked) && (
                    <li 
                        onClick={async () => {
                            if (isHideLoading) return;

                            closeContextMenu(data.id);
                            setIsHideLoading(true);

                            const res = await postInteraction(data.id, "hides");

                            if (res.ok) {
                                setIsHideLoading(false);
                                setIsHidden(!isHidden);

                                toast.show(
                                    `You will no longer see ${data.displayName}`,
                                    { icon: "", type: "info" }
                                );
                            } else {
                                setIsHideLoading(false);
                                
                                toast.show(
                                    `Failed to hide ${data.displayName}`,
                                    {
                                        subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
                                        icon: "", 
                                        type: "error" 
                                    }
                                );
                            }
                        }}
                    >
                        {/* DEVELOPER NEEDED: If not interested, display interested cause of the accounts/hidden */}
                        <button className="justify-between text-accent">
                            Not Interested
                            <span 
                                className={`${isHideLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                                󰈉
                            </span>
                        </button>
                    </li>
                )}

                {/* DEVELOPER NEEDED: Polish this and only show on profile page */}
                {/*<li>
                    <button 
                        className="justify-between text-error"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Hide Collaboration
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰈉
                        </span>
                    </button>
                </li>*/}






































                


                <li>
                    <button 
                        className="justify-between text-error"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Mute
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰂛
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="justify-between text-error"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Report
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
                <hr />
                <li>
                    <button 
                        className="justify-between"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Share
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰒗
                        </span>
                    </button>
                </li>
                {Boolean(window.session.user?.isDeveloper) && (
                    <li>
                        <button 
                            className="justify-between"
                            onClick={() => {
                                
                                closeContextMenu(data.id);
                            }}
                        >
                            Copy ID
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                󰅇
                            </span>
                        </button>
                    </li>
                )}
                <hr />
                <li>
                    <button 
                        className="justify-between text-warning"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Moderate
                        <span className="font-nerdfont text-warning text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="justify-between text-warning"
                        onClick={() => {
                            
                            closeContextMenu(data.id);
                        }}
                    >
                        Manage
                        <span className="font-nerdfont text-warning text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
            </ul>

            <Wrapper to={`/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}>
                <div className="absolute inset-0 group">
                    <img
                        className="absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover"
                        src={`https://${window.config.domains.cdn}${data.avatar}`}
                        alt="avatar"
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

                    { data.animatedAvatar ?
                        <img
                            className="absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover opacity-0 group-hover:opacity-100"
                            src={data.animatedAvatar}
                            alt="animated avatar"
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
                        /> : ""
                    }
                </div>
                                
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold text-center w-full truncate leading-snug">
                                {data.displayName || data.slug || data.id}
                            </span>
                        </div>

                        {data.owner?.isVerified ?
                            <div className="z-1 relative font-normal tooltip tooltip-top tooltip-accent">
                                <a href={`https://${window.config.domains.support}/en-us/articles/verification`} target="_blank"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <svg className="text-accent" width="18" height="18" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" 
                                        fill="#ffffff"/>
                                    </svg>
                                </a>
                                <div className="tooltip-content">
                                    <div className="font-bold">Official Profile</div>
                                    <div className="text-xs">This profile is managed by its intellectual property owners or authorized individuals.</div>
                                </div>
                            </div>

                            : ""
                        }

                        {(() => {
                            const unofficialBadge = data.badges.find(b => b.type === "unofficial");
                            if (!unofficialBadge) return null;

                            return (
                                <div className="z-1 relative font-normal tooltip tooltip-top tooltip-secondary">
                                    <a 
                                        href={`https://${window.config.domains.support}/en-us/articles/unofficial`} 
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                    >
                                        <div className="font-nerdfont leading-none cursor-pointer text-sub text-lg">
                                            
                                        </div>
                                    </a>
                                    <div className="tooltip-content">
                                        <div className="font-bold">Unofficial Profile</div>
                                        <div className="text-xs">
                                            This profile is fan-managed under fair use or informal permission, and may contain inaccurate information. All trademarks, characters, and media belong to <strong>{unofficialBadge.comment}</strong>.
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-1.5 min-w-0 max-w-full">
                            <div className="flex min-w-0 items-center overflow-hidden">
                                <Link 
                                    className="truncate text-xs leading-snug hover:underline" 
                                    to={`/${data.owner.username || data.owner.id}`}
                                >
                                    {data.owner?.displayName || data.owner.username || data.owner.id}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-6 my-2">{data.about || "This character does not have an about."}</div>            
                </div>

                <div className="flex flex-row gap-8 justify-center w-full">
                    <div className="absolute z-1 bottom-3 flex flex-row gap-8 justify-center text-sm w-full p-1">
                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont text-base w-4 h-6 ${data.interactions?.views?.hasInteracted ? "text-accent" : ""}`}>󰈈</span>
                            <span className="text-xs ml-2">{formatNumber(data.interactions?.views?.count || 0).short}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont text-base w-4 h-6 ${isLikeLoading ? "loading" : ""} ${isLiked ? "text-accent" : ""}`}></span>
                            <span className="text-xs ml-2">{formatNumber(likeCount || 0).short}</span>
                        </div>
                    </div>
                </div>
            </Wrapper>
        </div>
    );
}

    
// DEVELOPER NEEDED: Make an API response type
// DEVELOPER NEEDED: Add a popup like block/limit when clicking not interested so it says how it will affect your account

/*
 <li>
                            <button 
                                className="justify-between"
                                disabled={isPinLoading}
                                onClick={async () => {
                                    try {
                                        if (isPinLoading) return;
                                        // MAKE THE SESSION USER ID PART RELEVANT TO THE CURRENT URL?

                                        // ONLY PIN TO PROFILE IF THE PROFILE/PROJECT

                                        setIsPinLoading(true);
                                        let response;

                                        if (isPinned) {
                                            response = await fetch(
                                                `https://${window.config.domains.api}/v2/pins/${window.session.userId}/${data.id}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    credentials: "include"
                                                }
                                            );

                                            setIsHidden(true);
                                        } else {
                                            response = await fetch(
                                                `https://${window.config.domains.api}/v2/pins/${window.session.userId}/${data.id}`,
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    credentials: "include",
                                                    body: JSON.stringify({
                                                        position: 1,
                                                    }),
                                                }
                                            );
                                        }

                                        if (!response.ok) {
                                            throw new Error("Failed to pin asset");
                                        }

                                        setIsPinned(!isPinned);

                                        toast.show(
                                            `You ${isPinned ? "unpinned" : "pinned"} ${data.displayName}`,
                                            {
                                                icon: isPinned ? "󰐄" : "󰐃",
                                                type: isPinned ? "info" : "success",
                                            }
                                        );
                                    } catch (error) {
                                        console.error(error);

                                        toast.show("Failed to pin asset", {
                                            type: "error",
                                        });
                                    } finally {
                                        setIsPinLoading(false);
                                    }
                        
                                    // closeContextMenu(data.id);
                                }}
                            >
                                <span
                                    className={`${isPinned ? "text-error" : "text-base-content"}`}
                                >
                                    {isPinned ? "Unpin from Profile" : "Pin to Profile"}
                                </span>
                                <span className={`${isPinLoading ? "loading" : ""} font-nerdfont ${isPinned ? "text-error" : "text-base-content"} text-lg flex h-6 w-4 leading-none items-center justify-center`}>
                                    {isPinLoading ? "" : isPinned ? "󰐄" : "󰐃"}
                                </span>
                            </button>
                        </li>

*/