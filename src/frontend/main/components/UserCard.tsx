import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client";

import { GetUserItemType } from "../../../_common/types/user.type.js";
import { useInteractions } from "../../_common/hooks/useInteractions.hook.js";
import { ContextMenuBuilder } from "../../_common/components/ContextMenuBuilder.js";
import { cdnBaseUrl } from "../../_common/scripts/domains.js";
import Badges from "../../_common/components/Badges.js";
import Presense from "../../_common/components/Presense.js";

type Props = {
    data: GetUserItemType
    isPreview?: boolean;
};

export default function UserCard({
    data: rawData,
    isPreview = false
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const {
        handleFollowInteraction
    } = useInteractions();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    const [data, setData] = useState<GetUserItemType>(rawData);

    const [isSensitive] = useState<boolean>(Boolean(data.isSensitive));
    const [isMature] = useState<boolean>(Boolean(data.isMature));
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const [isFollowing, setIsFollowing] = useState<boolean>(Boolean(data.interactions?.follows?.hasInteracted));
    const [followCount, setFollowCount] = useState<number>(data.interactions?.follows?.count || 0);
    const [isFollowInteractionLoading, setIsFollowInteractionLoading] = useState<boolean>(false);

    const [isHidden, setIsHidden] = useState<boolean>(Boolean(data.interactions?.hides?.hasInteracted));
    const [isHideInteractionLoading, setIsHideInteractionLoading] = useState<boolean>(false);

    const contextMenuBuilder = ContextMenuBuilder({
        data,
        isContextMenuOpen,
        setIsContextMenuOpen,
        isFollowing,
        isFollowInteractionLoading,
        setIsFollowing,
        setIsFollowInteractionLoading,
        setFollowCount,
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
                    follows: {
                        ...currentData.interactions?.follows,
                        count: followCount,
                        hasInteracted: isFollowing,
                    }
                },
            } as GetUserItemType;
        });
    }, [followCount, isFollowing, rawData]);

    if (
        !data.id ||
        !isTranslationReady ||
        !contextMenuBuilder
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
    
    const primaryUsername = data.usernames.find(u => u.isPrimary)?.username;
    const followerCount = data.interactions?.follows?.count || 0;

    const bannerClassList = "mask-graident absolute z-1 top-0 left-0 rounded-t-lg h-[118px] w-full object-cover";

    const Wrapper = !isPreview ? Link : "div";

    return (
        <div
            className={`aura-effect user-card relative p-4 shadow-sm cursor-pointer transition-all duration-100 ${isHidden ? "grayscale opacity-50" : "grayscale-0"}`}
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
            
            {/*{!isPreview && 
                // DEVELOPER NEEDED: Context menu here
            }*/}

            <Wrapper to={`/user/${primaryUsername || data.id}`}>
                <div className="absolute inset-0 group">
                    <img
                        className={bannerClassList}
                        src={data.banner ? `${cdnBaseUrl}${data.banner}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt={t("words.banner")}
                    />
                </div>

                <div className="absolute top-4 left-4 z-2">
                    <img
                        className="rounded-full h-21 w-21 object-cover"
                        src={data.avatar ? `${cdnBaseUrl}${data.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt={t("words.avatar")}
                    />

                    {data.animatedAvatar && (
                        <img
                            className="rounded-full h-21 w-21 object-cover opacity-0 group-hover:opacity-100"
                            src={data.animatedAvatar}
                            alt={t("words.avatar")}
                        />
                    )}

                    {data.presence && (
                        <Presense
                            data={data} 
                        />
                    )}
                </div>

                { data.status && ( 
                    <>
                        <div className="absolute glass bg-[#00000085] rounded-full h-3 w-3 top-6.5 left-27 z-1" />
                        <div className="absolute glass bg-[#00000085] rounded-full h-2 w-2 top-9 left-25 z-1" />

                        <div className="absolute glass bg-[#00000085] rounded-lg p-2 left-30.5 max-w-[289px] z-1">
                            <div className="text-white text-xs line-clamp-3">
                                {data.status}
                            </div>
                        </div>
                    </>
                )}

                <div className="relative top-22 flex flex-col h-46 w-full z-2">
                    <div className="flex justify-between gap-2">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold truncate leading-snug">
                                {data.displayName || primaryUsername || data.id}
                            </span>
                        </div>

                        {
                            window.session.userId !== data.id &&
                            (data.visibility !== "friends" && data.createdDate)
                        && (
                            <button
                                className="flex gap-2 h-7 px-3 text-xs btn btn-base-200 border-base-300 uppercase"
                                onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();

                                    await handleFollowInteraction(
                                        data,
                                        isFollowing,
                                        isFollowInteractionLoading,
                                        setIsFollowing,
                                        setIsFollowInteractionLoading,
                                        setFollowCount
                                    )
                                }}
                            >
                                <span className={`${isFollowInteractionLoading ? "loading" : ""} text-base font-nerdfont w-3`}>
                                    {isFollowing ? "" : ""}
                                </span>
                                {isFollowing ? t("words.Unfollow") : t("words.Follow")}
                            </button>
                        )}

                        <div 
                            className="ml-auto flex shrink-0"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                        >
                            <Badges 
                                data={data}
                                assetType={"USER"}
                                hasBackground={true}
                            />
                        </div>
                    </div>

                    <div className="flex min-w-0 mt-1 items-center overflow-hidden">
                        <span className="truncate text-xs leading-snug">
                            @{primaryUsername} • {formatNumber(followerCount).short} Follower{followerCount !== 1 && "s"}
                        </span>
                    </div>

                    <div className="text-xs line-clamp-3 my-2">
                        {(() => {
                            if (data.visibility === "public") {
                                return data.about || t("defaults.noUserAbout");
                            }
                            
                            if (data.visibility === "friends" && !data.about) {
                                return `${t("words.Add")} ${data.displayName || primaryUsername || data.id} ${t("defaults.noFriendView")}`;
                            }

                            return null;
                        })()}
                    </div>
                </div>
            </Wrapper>
        </div>
    );
}
