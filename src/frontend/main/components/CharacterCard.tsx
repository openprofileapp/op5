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
import { DurationType } from "kage-library";
import { formatRemainingTime, getRemainingTimeIcon } from "../../_common/scripts/time.js";

type Props = {
    data: GetPublishedCharacterItemType
    isPreview?: boolean;
    isPinnedVisible?: boolean,
    hasNotification?: boolean;
    isHomeScreen?: boolean
    dragHandleProps?: unknown;
};

let index = 1;

export default function CharacterCard({
    data: rawData,
    isPinnedVisible = false,
    isPreview = false,
    hasNotification = false,
    isHomeScreen = false,
    dragHandleProps,
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const {
        handleViewInteraction,
        handleFollowInteraction,
        handleLikeInteraction
    } = useInteractions();

    const {
        notificationsModal,
        reportModal,
        shareModal,
        characterModal
    } = useModals();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    const [data, setData] = useState<GetPublishedCharacterItemType>(rawData);

    const [isSensitive] = useState(data.isSensitive);
    const [isMature] = useState(data.isMature);
    const [isRevealed, setIsRevealed] = useState(false);

    const [isDismissed, setIsDismissed] = useState(data.interactions?.dismisses?.hasInteracted);
    const [isDismissedInteractionLoading, setIsDismissedInteractionLoading] = useState(false);

    const [isViewed, setIsViewed] = useState(data.interactions?.views?.hasInteracted);
    const [viewCount, setViewCount] = useState(data.interactions?.views?.count || 0);
    const [isViewInteractionLoading, setIsViewInteractionLoading] = useState(false);
    const [lastViewDate, setLastViewDate] = useState(data.interactions?.views?.latestDate);

    const [isFollowing, setIsFollowing] = useState(data.interactions?.follows?.hasInteracted);
    const [followCount, setFollowCount] = useState(data.interactions?.follows?.count || 0);
    const [isFollowInteractionLoading, setIsFollowInteractionLoading] = useState(false);

    const [isLiked, setIsLiked] = useState(data.interactions?.likes?.hasInteracted);
    const [likeCount, setLikeCount] = useState(data.interactions?.likes?.count || 0);
    const [isLikeInteractionLoading, setIsLikeInteractionLoading] = useState(false);

    const [initFetchCollections, setInitFetchCollections] = useState(false);
    const [collections, setCollections] = useState<GetCollectionItemType[] | null>(null);
    const [isCollectionsLoading, setIsCollectionsLoading] = useState(true);

    const [notificationSubscriptions, setNotificationSubscriptions] = useState(data.notifications?.subscriptions);

    const [muteData, setMuteData] = useState(data?.notifications?.mute);
    const [isMuted, setIsMuted] = useState<boolean>(() => {
        if (!data?.notifications?.mute) return false;
        if (data.notifications.mute.isIndefinite) return true;
        return new Date(data.notifications.mute.date).getTime() + data.notifications.mute.duration > Date.now();
    });

    const [remainingMuteDurationText, setRemainingMuteDurationText] = useState<string>("");





    
    

    




















       

    useEffect(() => {
        if (!isMuted || !muteData) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRemainingMuteDurationText("");
            return;
        }

        if (muteData.isIndefinite) {
            setRemainingMuteDurationText("Indefinitely");
            return;
        }

        const updateTimer = () => {
            const expiryTime = new Date(muteData.date).getTime() + muteData.duration;
            const remainingMs = expiryTime - Date.now();

            if (remainingMs <= 0) {
                setIsMuted(false);
                setRemainingMuteDurationText("");
            } else {
                setRemainingMuteDurationText(formatRemainingTime(remainingMs));
            }
        };

        updateTimer();

        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [muteData, isMuted]);


    const [isHidden, setIsHidden] = useState(data.interactions?.hides?.hasInteracted);
    const [isHideInteractionLoading, setIsHideInteractionLoading] = useState(false);

    const [isShared, setIsShared] = useState(data.interactions?.shares?.hasInteracted);
    const [shareCount, setShareCount] = useState(data.interactions?.shares?.count || 0);
    const [isShareLoading, setIsShareLoading] = useState(false);

    const [isPinned, setIsPinned] = useState(isPinnedVisible);
    const [isPinLoading, setIsPinLoading] = useState(false);


    useEffect(() => {
        if (!initFetchCollections) return;

        const fetchCollections = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/collections?owner=${window.session.userId}&checkItem=${data.id}`,
                    { credentials: "include" }
                );

                const c = await response.json();

                setCollections(c.items);
            } catch (err) {
                console.error(err);
            } finally {
                setIsCollectionsLoading(false);
            }
        };

        fetchCollections();
    }, [initFetchCollections, data.id]);

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
                    },
                    shares: {
                        ...currentData.interactions?.shares,
                        count: shareCount,
                        hasInteracted: isShared,
                    },
                },
                notifications: {
                    ...currentData.notifications,
                    subscriptions: {
                        ...currentData.notifications?.subscriptions,
                        ...notificationSubscriptions,
                    },
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
        isLiked,
        shareCount,
        isShared,
        notificationSubscriptions
    ]);

    const closeContextMenu = useCallback((id: string) => {
        setIsContextMenuOpen(false);
        document
            .getElementById(`character-more-dropdown-${id}`)
            ?.hidePopover();
    }, []);

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
        isDismissed
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
            className={`aura-effect character-card relative p-4 shadow-sm cursor-pointer z-${index} ${isHidden ? "opacity-35" : "" } `}
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
            {(Boolean(isMature) && Boolean(!isSensitive)) && !isRevealed && (
                <div 
                    className="hidden absolute inset-0 z-20 rounded-lg flex flex-col items-center justify-center glass cursor-pointer transition-all select-none"
                    onClick={(e) => {                        
                        e.stopPropagation();
                        setIsRevealed(true);
                    }}
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <span className="font-nerdfont text-6xl mb-2 leading-none flex items-center justify-center">
                        18+
                    </span>

                    <span className="text-sm font-semibold">
                        Mature Content
                    </span>

                    <span className="text-xs text-sub">
                        Click to view
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
                        Sensitive Content
                    </span>

                    <span className="text-xs text-sub">
                        Click to view
                    </span>
                </div>
            )}
            
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

                {window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && (
                    <>
                        {/* DEVELOPER NEEDED: Add the interaction here and when landing on the pages */}
                        <div className="flex w-full h-12">
                            <li
                                className="flex-1 flex items-center justify-center w-full h-full tooltip tooltip-top tooltip-accent"
                                data-tip="View"
                                onClick={() => {
                                    closeContextMenu(data.id);
                                }}
                            >
                                <Link 
                                    className="flex items-center justify-center w-full h-full" 
                                    to={`/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                                >
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        󰈈
                                    </span>
                                </Link>
                            </li>

                            <li
                                className="flex-1 flex items-center justify-center w-full h-full tooltip tooltip-top tooltip-accent"
                                data-tip="Read"
                                onClick={() => {
                                    closeContextMenu(data.id);
                                }}
                            >
                                <Link 
                                    className="flex items-center justify-center w-full h-full" 
                                    to={`/read/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                                >
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        
                                    </span>
                                </Link>
                            </li>

                            <li 
                                className="flex-1 flex items-center justify-center w-full h-full tooltip tooltip-top tooltip-accent"
                                data-tip="Chat (Coming Soon)"
                            >
                                <button className="flex items-center justify-center w-full h-full" disabled={true}>
                                    <span className="font-nerdfont text-xl flex h-6 w-4 leading-none items-center justify-center">
                                        󰍧
                                    </span>
                                </button>
                            </li>

                            <li 
                                className="flex-1 flex items-center justify-center w-full h-full tooltip tooltip-top tooltip-accent"
                                data-tip="Share"
                                onClick={() => {
                                    closeContextMenu(data.id);

                                    shareModal.open(data);
                                }}
                            >
                                <button className="flex items-center justify-center w-full h-full">
                                    <span className="font-nerdfont text-xl flex h-6 w-4 leading-none items-center justify-center">
                                        󰒗
                                    </span>
                                </button>
                            </li>
                        </div>

                        <hr />
                    </>
                )}

                {isHomeScreen && (
                    <>
                        <li 
                            onClick={async () => {
                                if (isDismissedInteractionLoading) return;

                                closeContextMenu(data.id);
                                setIsDismissedInteractionLoading(true);

                                const res = await postInteraction(data.id, "dismisses");

                                if (res.ok) {
                                    setIsDismissedInteractionLoading(false);
                                    setIsDismissed(true);
                                    setIsHidden(true);

                                    toast.show(
                                        `You dismissed ${data.displayName}`,
                                        { type: "success" }
                                    );
                                } else {
                                    setIsDismissedInteractionLoading(false);

                                    toast.show(
                                        `Failed to dismiss ${data.displayName}`,
                                        {
                                            subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
                                            type: "error" 
                                        }
                                    );
                                }
                            }}
                        >
                            <button className="justify-between">
                                Dismiss
                                <span 
                                    className={`${isDismissedInteractionLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
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
                                href={`${studioBaseUrl}/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
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

                {!window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && (
                    <>
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
                                    󰍧
                                </span>
                            </button>
                        </li>

                        <hr />
                    </>
                )}

                {/* Can't follow or like your own characters; auto display as liked or smth */}

                <li 
                    onClick={async () => {
                        await handleFollowInteraction({
                            // DEVELOPER NEEDED: Just pass data
                            id: data.id,
                            displayName: data.displayName,
                            isFollowing,
                            isFollowInteractionLoading,
                            setIsFollowInteractionLoading,
                            setIsFollowing,
                            setFollowCount
                        });
                    }}
                >
                    <button className={`${isFollowing ? "text-accent" : "" } justify-between`}>
                        {isFollowing ? "Unfollow" : "Follow"}
                        <span 
                            /* DEVELOPER NEEDED: Turn this into context-menu and context-menu-item classes */
                            className={`${isFollowInteractionLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                            {isFollowing ? "" : ""}
                        </span>
                    </button>
                </li>

                <li 
                    onClick={async () => {
                        await handleLikeInteraction({
                            // DEVELOPER NEEDED: Just pass data
                            id: data.id,
                            displayName: data.displayName,
                            isLiked,
                            isLikeInteractionLoading,
                            setIsLikeInteractionLoading,
                            setIsLiked,
                            setLikeCount
                        });
                    }}
                >
                    <button className={`${isLiked ? "text-accent" : "" } justify-between`}>
                        {isLiked ? "Unlike" : "Like"}
                        <span 
                            className={`${isLikeInteractionLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
                            {isLiked ? "" : ""}
                        </span>
                    </button>
                </li>

                {/* DEVELOPER NEEDED: on move enter, call the API to render the collections; have a loading in the meantime  */}
                <li 
                    className="relative group"
                    onMouseEnter={(e) => {
                        checkCollectionMenuPosition(e)
                        
                        setInitFetchCollections(true)
                    }}
                >
                    <button className="justify-between w-full">
                        Add to Collection
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>

                    <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                    <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                        {!isCollectionsLoading ? (() => {
                            const favoritesCollection = collections?.find((c) => c.isFavorites);
                            const otherCollections = collections?.filter((c) => !c.isFavorites) || [];

                            const CollectionItem = ({ collection, index }: { collection: GetCollectionItemType; index: number }) => {
                                const [isInCollection, setIsInCollection] = useState(collection.isItemInCollection);

                                return (
                                    <li key={collection.id || index}>
                                        <button 
                                            className="flex w-full items-center justify-between"
                                            onClick={async () => {
                                                const response = await fetch(
                                                    `${apiBaseUrl}/v3/collections/update/${collection.id}/${data.id}`, 
                                                    { credentials: "include" }
                                                );

                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                const responseData = await response.json() as any;

                                                if (response.ok) {
                                                    const nextState = !isInCollection;
                                                    setIsInCollection(nextState);
                                                    collection.isItemInCollection = nextState;

                                                    toast.show(
                                                        `${nextState ? "Added" : "Removed"} ${data.displayName || data.id} ${nextState ? "to" : "from"} ${collection.displayName}`, 
                                                        { icon: nextState ? "" : "", type: nextState ? "success" : "info" }
                                                    );
                                                } else {
                                                    toast.show(
                                                        `Failed to ${isInCollection ? "remove" : "add"} ${data.displayName || data.id} ${isInCollection ? "from" : "to"} ${collection.displayName}`, 
                                                        { 
                                                            subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                                            type: "error" 
                                                        }
                                                    );
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="font-nerdfont text-lg flex h-6 w-3 leading-none items-center justify-center">
                                                    {isInCollection ? "󰐾" : "󰐽"}
                                                </span>
                                                {collection.displayName}
                                            </div>
                                            <img 
                                                className="rounded-full translate-x-[2px] w-5 h-5 aspect-square shrink-0 object-cover"
                                                src={
                                                    collection.isFavorites 
                                                        ? `${cdnBaseUrl}${window.config.metadata.assets.favorites}`
                                                        : collection.avatar 
                                                            ? `${cdnBaseUrl}${collection.avatar}` 
                                                            : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`
                                                    }
                                                alt={collection.displayName}
                                            />
                                        </button>
                                    </li>
                                );
                            };

                            const renderCollectionItem = (collection: GetCollectionItemType, index: number) => (
                                <CollectionItem key={collection.id || index} collection={collection} index={index} />
                            );

                            return (
                                <>
                                    {favoritesCollection && renderCollectionItem(favoritesCollection, -1)}

                                    {favoritesCollection && (
                                        <hr />
                                    )}

                                    {otherCollections.map(renderCollectionItem)}

                                    {otherCollections.length > 0 && (
                                        <hr />
                                    )}
                                </>
                            );
                        })() : (
                            <div className="flex items-center justify-center">
                                <div className="loading h-8"/>
                            </div>
                        )}

                        {!isCollectionsLoading && (
                            <li
                                className={`tooltip tooltip-${isContextMenuFlipped ? "left" : "right"} tooltip-accent`}
                                data-tip="Coming Soon"
                            >
                                <button className="justify-between" disabled={true}>
                                    New Collection
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        󰌴
                                    </span>
                                </button>
                            </li>
                        )}
                    </ul>
                </li>

                <hr />

                {/* DEVELOPER NEEDED: If not added to any collections either */}
                {(!isFollowing && !isLiked) && (
                    <li 
                        onClick={async () => {
                            if (isHideInteractionLoading) return;

                            closeContextMenu(data.id);
                            setIsHideInteractionLoading(true);

                            const res = await postInteraction(data.id, "hides");

                            if (res.ok) {
                                setIsHideInteractionLoading(false);
                                setIsHidden(!isHidden);

                                toast.show(
                                    `You will no longer see ${data.displayName}`,
                                    { type: "info" }
                                );
                            } else {
                                setIsHideInteractionLoading(false);
                                
                                toast.show(
                                    `Failed to hide ${data.displayName}`,
                                    {
                                        subtext: `${res.id || ""}${res.id ? ": " : ""}${res.message}`,
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
                                className={`${isHideInteractionLoading ? "loading" : ""} flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0`}>
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






































                
                {/* 
                    DEVELOPER NEEDED: Make a report
                    REQUIRES: v3/report and v3/moderate 
                    REQUIRES: A moderate popup; hide buttons to appropriate permissions
                */}

                {isFollowing && (
                    <>
                        <li>
                            <button 
                                className="justify-between"
                                onClick={() => {
                                    closeContextMenu(data.id);

                                    notificationsModal.open(
                                        data,
                                        setNotificationSubscriptions
                                    );
                                }}
                            >
                                Notifications
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    󰂚
                                </span>
                            </button>
                        </li>

                        {!isMuted ? (
                            <li 
                                className="relative group"
                                onMouseEnter={checkCollectionMenuPosition}
                            >
                                <button className="justify-between w-full">
                                    Mute
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        
                                    </span>
                                </button>

                                <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                                <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                                    {[
                                        { label: "1 Hour", icon: "󱐿", duration: "1h", isIndefinite: false  },
                                        { label: "4 Hours", icon: "󱑂", duration: "4h", isIndefinite: false  },
                                        { label: "8 Hours", icon: "󱑆", duration: "8h", isIndefinite: false  },
                                        { label: "24 Hours", icon: "󱑊", duration: "24h", isIndefinite: false  },
                                        { label: "Indefinitely", icon: "󰂛", duration: "0s", isIndefinite: true }
                                    ].map((item) => (
                                        <>
                                            {item.isIndefinite && (
                                                <hr />
                                            )}
                                            
                                            <li key={item.label}>
                                                <button 
                                                    className="justify-between"
                                                    onClick={async () => {
                                                        closeContextMenu(data.id);

                                                        const newMute = {
                                                            duration: parseDuration(item.duration as DurationType),
                                                            isIndefinite: item.isIndefinite,
                                                            date: new Date().toISOString()
                                                        };

                                                        setMuteData(newMute);
                                                        setIsMuted(true);
                                                        
                                                        const response = await fetch(
                                                            `${apiBaseUrl}/v3/notifications/update/mute/${data.id}`, 
                                                            { 
                                                                credentials: "include", 
                                                                method: "POST", 
                                                                headers: { "Content-Type": "application/json" }, 
                                                                body: JSON.stringify(newMute)
                                                            }
                                                        );

                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                        const responseData = await response.json() as any;

                                                        if (response.ok) {
                                                            setIsMuted(true);

                                                            toast.show(
                                                                `Muted ${data.displayName || data.id} for ${item.label.toLowerCase()}`, 
                                                                { icon: "󰂚", type: "success" }
                                                            );
                                                        } else {
                                                            toast.show(
                                                                `Failed to mute ${data.displayName || data.id}`, 
                                                                { 
                                                                    subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                                                    type: "error" 
                                                                }
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {item.label}
                                                    <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                                        {item.icon}
                                                    </span>
                                                </button>
                                            </li>
                                        </>
                                    ))}
                                </ul>
                            </li>
                        ) : (
                            <li>
                                <button 
                                    className="justify-between"
                                    onClick={async () => {
                                        const response = await fetch(
                                            `${apiBaseUrl}/v3/notifications/update/mute/${data.id}`, 
                                            { 
                                                credentials: "include", 
                                                method: "POST", 
                                                headers: { "Content-Type": "application/json" }, 
                                                body: JSON.stringify({
                                                    duration: 0,
                                                    isIndefinite: false
                                                })
                                            }
                                        );

                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        const responseData = await response.json() as any;

                                        if (response.ok) {
                                            setIsMuted(false);

                                            toast.show(
                                                `Unmuted ${data.displayName || data.id}`, 
                                                { icon: "󰂚", type: "info" }
                                            );
                                        } else {
                                            toast.show(
                                                `Failed to unmute ${data.displayName || data.id}`, 
                                                { 
                                                    subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                                    type: "error" 
                                                }
                                            );
                                        }

                                        closeContextMenu(data.id);
                                    }}
                                >
                                    <div className="flex flex-col justify-center items-start leading-none h-11">
                                        Unmute
                                        <span className="text-sub text-xs mt-1">
                                            {remainingMuteDurationText}
                                        </span>
                                    </div>
                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                        {getRemainingTimeIcon(remainingMuteDurationText)}
                                    </span>
                                </button>
                            </li>
                        )}

                        <hr />
                    </>
                )}

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
            </ul>

            <Wrapper 
                onClick={async () => {
                    characterModal.open(data);

                    await handleViewInteraction({
                        // DEVELOPER NEEDED: Just pass data
                        id: data.id,
                        isViewInteractionLoading,
                        lastViewDate,
                        setIsViewInteractionLoading,
                        setIsViewed,
                        setLastViewDate,
                        setViewCount
                    });
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
            </Wrapper>

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
                                await handleLikeInteraction({
                                    // DEVELOPER NEEDED: Just pass data
                                    id: data.id,
                                    displayName: data.displayName,
                                    isLiked,
                                    isLikeInteractionLoading,
                                    setIsLikeInteractionLoading,
                                    setIsLiked,
                                    setLikeCount
                                });
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

*/