/* eslint-disable @typescript-eslint/ban-ts-comment */

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client";

import { GetPublishedCharacterItemType } from "../../../_common/types/characters/character.type.js";
import { cdnBaseUrl, mainBaseUrl } from "../scripts/domains.js";
import { useInteractions } from "../hooks/useInteractions.hook.js";
import { useModals } from "../hooks/ModalContext.hook.js";
import { ContextMenuBuilder } from "./ContextMenuBuilder.js";
import Badges from "./Badges.js";

type Props = {
    data: GetPublishedCharacterItemType;
    isPreview?: boolean;
    isPinVisible?: boolean;
    doesUnpinDismiss?: boolean;
    setRefetchPins?: Dispatch<SetStateAction<boolean>>;
    displayNotification?: boolean;
    isHomeScreen?: boolean;
    isUserProfile?: boolean;
    isStudio?: boolean;
    isTrash?: boolean;
    dragHandleProps?: unknown;
};

export default function CharacterCard({
    data: rawData,
    isPinVisible = false,
    doesUnpinDismiss = false,
    setRefetchPins,
    isPreview = false,
    displayNotification = false,
    isHomeScreen = false,
    isUserProfile = false,
    isStudio = false,
    isTrash = false,
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
    const [isConfidentialRevealed, setIsConfidentialRevealed] = useState<boolean>(false);

    const [isPinned, setIsPinned] = useState<boolean>(isPinVisible);
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

    const contextMenuBuilder = ContextMenuBuilder({
        data,
        isContextMenuOpen,
        setIsContextMenuOpen,
        isDismissed,
        isDismissedInteractionLoading,
        setIsDismissed,
        setIsDismissedInteractionLoading,
        isPinned,
        //@ts-ignore
        setIsPinned,
        //@ts-ignore
        isPinLoading,
        setIsPinLoading,
        doesUnpinDismiss,
        setRefetchPins,
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
    });

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

    const auraStyle: React.CSSProperties = data.isAuraEnabled
        ? {
            ["--aura-type" as string]: `aura-${data.auraType || "flow"}`,
            ["--aura-primary" as string]: data.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: data.auraSecondary || "var(--color-accent)",
        }
        : {
            border: "1px solid #222222",
        };

    const avatarClassList = "mask-graident absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover";

    return (
        <div
            className={`aura-effect character-card relative p-4 shadow-sm ${("isConfidential" in data && data.isConfidential) && !isConfidentialRevealed ? "" : "cursor-pointer"} transition-all duration-100 ${isHidden ? "grayscale opacity-50" : "grayscale-0"}`}
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
            {Boolean("isConfidential" in data && data.isConfidential) && !isConfidentialRevealed && (
                <div
                    className="absolute inset-0 z-20 rounded-lg overflow-hidden flex flex-col items-center justify-center select-none bg-[#101114]/90 backdrop-blur-2xl"
                    onContextMenu={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                >
                    <div
                        className="absolute inset-0 opacity-30 pointer-events-none border border-2 rounded-lg"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.92' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
                            backgroundSize: "150px 150px"
                        }}
                    />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <span className="font-nerdfont text-6xl mb-4 leading-none text-white/90">
                            󰷈
                        </span>

                        <span className="text-lg font-semibold px-4 uppercase">
                            Confidential
                        </span>

                        <span className="text-xs my-4 max-w-xs border-t border-b border-error bg-error/20 p-2 leading-relaxed">
                            Confidential material protected by non-disclosure obligations. Unauthorized access, disclosure, copying, distribution, or recording is prohibited where restricted by applicable agreements or law.
                        </span>

                        <span 
                            className="text-xs mt-1 px-4 py-1 cursor-pointer border rounded-full border-white/50"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsConfidentialRevealed(true);
                            }}
                        >
                            <span className="font-nerdfont text-sm mr-2">
                                
                            </span>

                            {t("components.cards.clickToReveal")}
                        </span>
                    </div>
                </div>
            )}

            {Boolean(isMature) && !isRevealed && (
                <div 
                    className="absolute inset-0 z-11 rounded-lg flex flex-col items-center justify-center glass cursor-pointer transition-all select-none"
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

                    <span className="text-sm font-semibold px-4">
                        {t("components.cards.isMature")}
                    </span>

                    <span className="text-xs text-sub mt-1 px-4">
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

                    <span className="text-sm font-semibold px-4">
                        {t("components.cards.isSensitive")}
                    </span>

                    <span className="text-xs text-sub mt-1 px-4">
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

            {(!isPreview && !isTrash) && 
                contextMenuBuilder.items([
                    window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                        contextMenuBuilder.quickActions([
                            (props) => contextMenuBuilder.view(props),
                            (props) => contextMenuBuilder.read(props),
                            (props) => contextMenuBuilder.chat(props),
                            (props) => contextMenuBuilder.share(props)
                        ]),
                    isHomeScreen && 
                        contextMenuBuilder.dismiss(),
                    isStudio && 
                        contextMenuBuilder.editCharacter(),
                    window.session.userId && (isHomeScreen || isStudio) &&
                        contextMenuBuilder.separator(),
                    !isStudio && contextMenuBuilder.viewInStudio(),
                    !isStudio && window.session.userId === data.owner?.id && 
                        contextMenuBuilder.separator(),
                    isUserProfile && 
                        contextMenuBuilder.pin(),
                    window.session.userId === data.owner?.id && 
                        isUserProfile && 
                        contextMenuBuilder.separator(),
                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                        contextMenuBuilder.view(),
                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                        contextMenuBuilder.read(),
                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                        contextMenuBuilder.chat(),
                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && window.session.userId && !isHidden && 
                        contextMenuBuilder.separator(),
                    contextMenuBuilder.follow(),
                    contextMenuBuilder.like(),
                    contextMenuBuilder.collections(),
                    window.session.userId && !isHidden && 
                        contextMenuBuilder.separator(),
                    contextMenuBuilder.notifications(),
                    contextMenuBuilder.mute(),
                    isFollowing && window.session.userId !== data.owner?.id && 
                        contextMenuBuilder.separator(),
                    contextMenuBuilder.notInterested(),
                    isHidden && 
                        contextMenuBuilder.separator(),
                    contextMenuBuilder.report(),
                    contextMenuBuilder.moderate(),
                    contextMenuBuilder.manage(),
                    isStudio && contextMenuBuilder.separator(),
                    isStudio && contextMenuBuilder.trash(),
                    (Boolean(window.session.user?.isDeveloper) || !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR")) && 
                        contextMenuBuilder.separator(),
                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                        contextMenuBuilder.share(),
                    contextMenuBuilder.copyId()
                ].filter(Boolean))
            }

            {(!isPreview && isTrash) && 
                contextMenuBuilder.items([
                    contextMenuBuilder.restore(),
                    contextMenuBuilder.separator(),
                    contextMenuBuilder.delete(),
                    Boolean(window.session.user?.isDeveloper) && 
                        contextMenuBuilder.separator(),
                    contextMenuBuilder.copyId()
                ].filter(Boolean))
            }

            <div 
                onClick={async () => {
                    if (isPreview) return;

                    characterModal.open(data);
                    
                    if (isStudio) return;

                    setHasSeenNotification(true);

                    await handleViewInteraction(
                        data,
                        isViewInteractionLoading,
                        lastViewDate,
                        setIsViewed,
                        setIsViewInteractionLoading,
                        setLastViewDate,
                        setViewCount
                    );
                }}
            >
                <div className="absolute inset-0 group">
                    <img
                        className={avatarClassList}
                        src={data.avatar ? `${cdnBaseUrl}${data.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt={t("words.avatar")}
                    />

                    {data.animatedAvatar && (
                        <img
                            className={`${avatarClassList} opacity-0 group-hover:opacity-100`}
                            src={data.animatedAvatar}
                            alt={t("words.avatar")}
                        />
                    )}
                </div>
                                
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold text-center w-full truncate leading-snug">
                                {data.displayName || data.id}
                            </span>
                        </div>

                        <Badges 
                            data={data}
                            assetType={"CHARACTER"}
                        />
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-1.5 min-w-0 max-w-full">
                            <div className="flex min-w-0 items-center overflow-hidden">
                                <Link 
                                    className="truncate text-xs leading-snug hover:underline" 
                                    to={`${mainBaseUrl}/user/${data.owner.username || data.owner.id}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    {data.owner.displayName || data.owner.username || data.owner.id}
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-6 my-2">{data.about || t("defaults.noCharacterAbout")}</div>            
                </div>
            </div>

            <div className="flex flex-row gap-8 justify-center w-full">
                <div className="absolute z-9 bottom-3 flex flex-row gap-8 justify-center text-sm w-full p-1 pointer-events-auto">
                    <div className="flex items-center justify-center">
                        <span className={`font-nerdfont text-base w-4 h-6 ${isViewInteractionLoading ? "loading" : ""} ${isViewed ? "text-accent" : ""}`}>
                            󰈈
                        </span>

                        <span className="text-xs ml-2">
                            {formatNumber(viewCount).short}
                        </span>
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

                        <span className="text-xs ml-2">
                            {formatNumber(likeCount || 0).short}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
