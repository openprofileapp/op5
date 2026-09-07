import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GetPublishedCharacterItemType } from "../../../_common/types/character.type.js";
import { toast } from "../../_common/scripts/toast.js";
import { formatDisplayNameToUrl } from "../scripts/formatDisplayNameToUrl.js";
import { postInteraction } from "../../_common/scripts/postInteraction.js";
import { formatNumber, parseDuration } from "kage-library/client";
import { apiBaseUrl, cdnBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { useInteractions } from "../../_common/hooks/useInteractions.hook.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { GetCollectionItemType } from "../../../_common/types/collection.type.js";
import { formatRemainingTime, getRemainingTimeIcon } from "../../_common/scripts/time.js";
import { ContextMenuBuilder } from "../../_common/components/ContextMenuBuilder.js";
import { GetNotificationMuteType, GetNotificationSubscriptionType } from "../../../_common/types/notification.type.js";

type Props = {
    data: GetPublishedCharacterItemType
    isPreview?: boolean;
    isPinnedVisible?: boolean,
    displayNotification?: boolean;
    isHomeScreen?: boolean
    dragHandleProps?: unknown;
};

let index = 1;

export default function CharacterCard({
    data: rawData,
    isPinnedVisible = false,
    isPreview = false,
    displayNotification = false,
    isHomeScreen = false,
    dragHandleProps,
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const {
        handleViewInteraction,
        handleLikeInteraction
    } = useInteractions();

    const { characterModal } = useModals();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    const [data, setData] = useState<GetPublishedCharacterItemType>(rawData);

    const [hasNotification] = useState<boolean>(displayNotification);
    const [hasSeenNotification, setHasSeenNotification] = useState<boolean>(false);

    const [isSensitive] = useState<boolean>(Boolean(data.isSensitive));
    const [isMature] = useState<boolean>(Boolean(data.isMature));
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const [isPinned, setIsPinned] = useState<boolean>(isPinnedVisible);
    const [isPinLoading, setIsPinLoading] = useState<boolean>(false);

    const [isDismissed, setIsDismissed] = useState<boolean>(Boolean(data.interactions?.dismisses?.hasInteracted));
    const [isDismissedInteractionLoading, setIsDismissedInteractionLoading] = useState<boolean>(false);

    const [isViewed, setIsViewed] = useState<boolean>(Boolean(data.interactions?.views?.hasInteracted));
    const [viewCount, setViewCount] = useState<number>(data.interactions?.views?.count || 0);
    const [isViewInteractionLoading, setIsViewInteractionLoading] = useState<boolean>(false);
    const [lastViewDate, setLastViewDate] = useState<string>(data.interactions?.views?.latestDate || "");

    const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(data.interactions?.follows?.hasInteracted));
    const [followCount, setFollowCount] = useState<number>(data.interactions?.follows?.count || 0);
    const [isFollowInteractionLoading, setIsFollowInteractionLoading] = useState<boolean>(false);

    const [isLiked, setIsLiked] = useState<boolean>(Boolean(data.interactions?.likes?.hasInteracted));
    const [likeCount, setLikeCount] = useState<number>(data.interactions?.likes?.count || 0);
    const [isLikeInteractionLoading, setIsLikeInteractionLoading] = useState<boolean>(false);

    const [isHidden, setIsHidden] = useState<boolean>(Boolean(data.interactions?.hides?.hasInteracted));
    const [isHideInteractionLoading, setIsHideInteractionLoading] = useState<boolean>(false);

    const contextMenuBuilder = ContextMenuBuilder(
        data,
        isContextMenuOpen,
        setIsContextMenuOpen,
        isDismissed,
        isDismissedInteractionLoading,
        setIsDismissed,
        setIsDismissedInteractionLoading,
        isFollowing,
        isFollowInteractionLoading,
        setIsFollowing,
        setIsFollowInteractionLoading,
        setFollowCount,
        isLiked,
        isLikeInteractionLoading,
        setIsLiked,
        setIsLikeInteractionLoading,
        setLikeCount,
        isHidden,
        isHideInteractionLoading,
        setIsHidden,
        setIsHideInteractionLoading
    );

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData((prevData) => {
            const currentData = prevData ?? rawData;
            if (!currentData) return currentData;

            return {
                ...currentData,
                interactions: {
                    ...currentData.interactions,
                    views: {
                        ...currentData.interactions?.views,
                        count: viewCount,
                        hasInteracted: isViewed,
                        latestDate: lastViewDate,
                    },
                    follows: {
                        ...currentData.interactions?.follows,
                        count: followCount,
                        hasInteracted: isFollowing,
                    },
                    likes: {
                        ...currentData.interactions?.likes,
                        count: likeCount,
                        hasInteracted: isLiked,
                    }
                },
            } as GetPublishedCharacterItemType;
        });
    }, [
        rawData,
        viewCount,
        isViewed,
        lastViewDate,
        followCount,
        isFollowing,
        likeCount,
        isLiked
    ]);

    if (
        !data.id ||
        !data.owner ||
        !data.owner.id ||
        !isTranslationReady ||
        !contextMenuBuilder ||
        isDismissed
    ) return null;

    index++

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
            className={`aura-effect character-card relative p-4 shadow-sm cursor-pointer z-${index} ${isHidden ? "opacity-35" : "" } `}
            style={auraStyle}
            onContextMenu={(e) => {
                e.preventDefault();
                setIsContextMenuOpen(true);

                const popover = document.getElementById(
                    `more-dropdown-${data.id}`
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
            {Boolean(isMature) && !isRevealed && (
                <div 
                    className="absolute inset-0 z-20 rounded-lg flex flex-col items-center justify-center glass cursor-pointer transition-all select-none"
                    onClick={(e) => {                        
                        e.stopPropagation();
                        setIsRevealed(true);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <span className="font-nerdfont text-7xl mb-3 leading-none flex items-center justify-center">
                        
                    </span>

                    <span className="text-sm font-semibold">
                        {t("components.cards.isMature")}
                    </span>

                    <span className="text-xs text-sub mt-1">
                        {t("components.cards.clickToReveal")}
                    </span>
                </div>
            )}

            {(Boolean(isSensitive) && Boolean(!isMature)) && !isRevealed && (
                <div 
                    className="absolute inset-0 z-10 rounded-lg flex flex-col items-center justify-center glass cursor-pointer transition-all select-none"
                    onClick={(e) => {                        
                        e.stopPropagation();
                        setIsRevealed(true);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <span className="font-nerdfont text-7xl mb-3 leading-none flex items-center justify-center">
                        󰈉
                    </span>

                    <span className="text-sm font-semibold">
                        {t("components.cards.isSensitive")}
                    </span>

                    <span className="text-xs text-sub mt-1">
                        {t("components.cards.clickToReveal")}
                    </span>
                </div>
            )}
            
            {(hasNotification && !hasSeenNotification) && (
                <div className="absolute top-[-5px] right-[-5px] bg-accent h-5 w-5 rounded-full z-11" />
            )}

            <div className="absolute top-[7px] left-[14px] z-2 flex items-center gap-4">
                {isPinned && (
                    dragHandleProps ? (
                        <div
                            {...dragHandleProps}
                        >
                            <span className="grid place-items-center font-nerdfont text-2xl">
                                󰇛
                            </span>
                        </div>
                    ) : (
                        <div
                            className="tooltip tooltip-top tooltip-accent"
                            data-tip={t("words.Pinned")}
                        >
                            <span className="grid place-items-center font-nerdfont text-2xl">
                                󰐃
                            </span>
                        </div>
                    )
                )}

                {(
                    window.session.userId !== data.owner.id) && 
                (
                    data.visibility === "friends" ||
                    data.visibility === "private"
                ) && (
                    <div className="tooltip tooltip-top tooltip-accent">
                        <div className="tooltip-content">
                            <div className="font-bold">{t("words.Limited")}</div>
                            <div className="text-xs">{t("components.cards.limited")}</div>
                        </div>
                        <span className="grid place-items-center font-nerdfont text-xl">
                            
                        </span>
                    </div>
                )}
            </div>

            {contextMenuBuilder.items([
                window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") 
                    && contextMenuBuilder.quickActions([
                        (props) => contextMenuBuilder.view(props),
                        (props) => contextMenuBuilder.read(props),
                        (props) => contextMenuBuilder.chat(props)
                    ]),
                isHomeScreen 
                    && contextMenuBuilder.dismiss(),
                window.session.userId 
                    && isHomeScreen 
                    && contextMenuBuilder.separator(),
                contextMenuBuilder.viewInStudio(),
                window.session.userId === data.owner.id
                    && contextMenuBuilder.separator(),
                !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") 
                    && contextMenuBuilder.view(),
                !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") 
                    && contextMenuBuilder.read(),
                !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") 
                    && contextMenuBuilder.chat(),
                !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") 
                    && !isHidden
                    && contextMenuBuilder.separator(),
                contextMenuBuilder.follow(),
                contextMenuBuilder.like(),
                contextMenuBuilder.collections(),
                !isHidden
                    && contextMenuBuilder.separator(),
                contextMenuBuilder.notifications(),
                contextMenuBuilder.mute(),
                isFollowing
                    && contextMenuBuilder.separator(),
                contextMenuBuilder.notInterested()
            ].filter((item) => Boolean(item)))}


































            

            

            
            




            {/*
                
                
                    REQUIRES: v3/report and v3/moderate 
                    REQUIRES: A moderate popup; hide buttons to appropriate permissions

                <li>
                    <button 
                        className="justify-between text-error"
                        onClick={() => {
                            closeContextMenu(data.id);

                            reportModal.open(data);
                        }}
                    >
                        Report
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                {
                    (
                        Boolean(window.session.user?.isDeveloper) ||
                        !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR")
                    ) && (
                    <hr />
                )}

                {!window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && (
                    <li>
                        <button 
                            className="justify-between"
                            onClick={() => {
                                closeContextMenu(data.id);

                                shareModal.open(data);
                            }}
                        >
                            Share
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                󰒗
                            </span>
                        </button>
                    </li>
                )}

                {Boolean(window.session.user?.isDeveloper) && (
                    <li>
                        <button 
                            className="justify-between"
                            onClick={() => {
                                
                                closeContextMenu(data.id);
                            }}
                        >
                            Copy ID
                            <span className="flex items-center justify-center w-4 h-6 text-3xl font-nerdfont leading-none shrink-0">
                                󰻾
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
            */}

            <div 
                onClick={async () => {
                    characterModal.open(data);

                    setHasSeenNotification(true);

                    await handleViewInteraction(
                        data,
                        isViewInteractionLoading,
                        lastViewDate,
                        setIsViewInteractionLoading,
                        setIsViewed,
                        setLastViewDate,
                        setViewCount
                    );
                }}
            >
                <div className="absolute inset-0 group">
                    <img
                        className="mask-graident absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover"
                        src={data.avatar ? `${cdnBaseUrl}${data.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt="avatar"
                    />

                    {data.animatedAvatar && (
                        <img
                            className="mask-graident absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover opacity-0 group-hover:opacity-100"
                            src={data.animatedAvatar}
                            alt="animated avatar"
                        />
                    )}
                </div>
                                
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold text-center w-full truncate leading-snug">
                                {data.displayName || data.slug || data.id}
                            </span>
                        </div>

                        {data.owner?.badges?.some(badge => badge.type === "VERIFIED") && (
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
                        )}

                        {(() => {
                            const unofficialBadge = data.badges.find(b => b.type === "UNOFFICIAL");
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
                                    to={`/user/${data.owner.username || data.owner.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {data.owner.displayName || data.owner.username || data.owner.id}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-6 my-2">{data.about || "This character does not have an about."}</div>            
                </div>
            </div>

            <div className="flex flex-row gap-8 justify-center w-full">
                <div className="absolute z-9 bottom-3 flex flex-row gap-8 justify-center text-sm w-full p-1 pointer-events-auto">
                    <div className="flex items-center justify-center">
                        <span className={`font-nerdfont text-base w-4 h-6 ${isViewInteractionLoading ? "loading" : ""} ${isViewed ? "text-accent" : ""}`}>󰈈</span>
                        <span className="text-xs ml-2">{formatNumber(viewCount).short}</span>
                    </div>
                    <div className="flex items-center justify-center">
                        <span 
                            className={`font-nerdfont text-base w-4 h-6 cursor-pointer pointer-events-auto inline-block ${isLikeInteractionLoading ? "loading" : ""} ${isLiked ? "text-accent" : ""}`}
                            onClick={async () => {
                                await handleLikeInteraction(
                                    data,
                                    isLiked,
                                    isLikeInteractionLoading,
                                    setIsLiked,
                                    setIsLikeInteractionLoading,
                                    setLikeCount
                                );
                            }}
                        >
                            
                        </span>
                        <span className="text-xs ml-2">{formatNumber(likeCount || 0).short}</span>
                    </div>
                </div>
            </div>
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
                                                `https://${window.config.domains.api}/v3/pins/${window.session.userId}/${data.id}`,
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
                                                `https://${window.config.domains.api}/v3/pins/${window.session.userId}/${data.id}`,
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

                        DEVELOPER NEEDED: Polish this and only show on profile page 
                <li>
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
                </li>


*/