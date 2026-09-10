/* eslint-disable @typescript-eslint/ban-ts-comment */

import React, { Dispatch, ReactNode, SetStateAction, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { parseDuration } from 'kage-library/client';

import { useInteractions } from '../hooks/useInteractions.hook.js';
import { useTranslation } from 'react-i18next';
import { GetAssetType } from '../../../_common/types/asset.type.js';
import { formatDisplayNameToUrl } from '../../main/scripts/formatDisplayNameToUrl.js';
import { apiBaseUrl, cdnBaseUrl, studioBaseUrl } from '../scripts/domains.js';
import { GetCollectionItemType } from '../../../_common/types/collection.type.js';
import { toast } from '../scripts/toast.js';
import { useModals } from '../hooks/ModalContext.hook.js';
import { GetNotificationMuteType, GetNotificationSubscriptionType } from '../../../_common/types/notification.type.js';
import { formatRemainingTime, getRemainingTimeIcon } from '../scripts/time.js';
import { GetPublishedCharacterItemType } from '../../../_common/types/character.type.js';

type Props = {
    isQuickAction?: boolean
}

export type ContextMenuBuilderOptions = {
    data: GetAssetType;
    isContextMenuOpen: boolean;
    setIsContextMenuOpen: Dispatch<SetStateAction<boolean>>;
    isDismissed?: boolean;
    isDismissedInteractionLoading?: boolean;
    setIsDismissed?: Dispatch<SetStateAction<boolean>>;
    setIsDismissedInteractionLoading?: (loading: boolean) => void;
    isPinned?: boolean;
    setIsPinned?: boolean;
    isPinLoading?: Dispatch<SetStateAction<boolean>>;
    setIsPinLoading?: (loading: boolean) => void;
    doesUnpinDismiss?: boolean;
    setRefetchPins?: Dispatch<SetStateAction<boolean>>;
    isFollowing?: boolean;
    isFollowInteractionLoading?: boolean;
    setIsFollowing?: Dispatch<SetStateAction<boolean>>;
    setIsFollowInteractionLoading?: (loading: boolean) => void;
    setFollowCount?: Dispatch<SetStateAction<number>>;
    isLiked?: boolean;
    isLikeInteractionLoading?: boolean;
    setIsLiked?: Dispatch<SetStateAction<boolean>>;
    setIsLikeInteractionLoading?: (loading: boolean) => void;
    setLikeCount?: Dispatch<SetStateAction<number>>;
    isHidden?: boolean;
    isHideInteractionLoading?: boolean;
    setIsHidden?: Dispatch<SetStateAction<boolean>>;
    setIsHideInteractionLoading?: (loading: boolean) => void;
    isRestricted?: boolean;
    isRestrictInteractionLoading?: boolean;
    setIsRestricted?: Dispatch<SetStateAction<boolean>>;
    setIsRestrictInteractionLoading?: (loading: boolean) => void;
    isBlocked?: boolean;
    isBlockInteractionLoading?: boolean;
    setIsBlocked?: Dispatch<SetStateAction<boolean>>;
    setIsBlockInteractionLoading?: (loading: boolean) => void;
};

export function ContextMenuBuilder({
    data: rawData,
    isContextMenuOpen,
    setIsContextMenuOpen,
    isDismissed,
    isDismissedInteractionLoading,
    setIsDismissed,
    setIsDismissedInteractionLoading,
    isPinned,
    setIsPinned,
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
    setIsHideInteractionLoading,
    isRestricted,
    isRestrictInteractionLoading,
    setIsRestricted,
    setIsRestrictInteractionLoading,
    isBlocked,
    isBlockInteractionLoading,
    setIsBlocked,
    setIsBlockInteractionLoading
}: ContextMenuBuilderOptions) {
    const { t, ready: isTranslationReady } = useTranslation();

    const {
        handleDismissInteraction,
        handleFollowInteraction,
        handleLikeInteraction,
        handleHideInteraction
    } = useInteractions();

    const { 
        notificationsModal,
        restrictModal,
        blockModal,
        reportModal,
        shareModal
    } = useModals();
    
    const [isSubMenuFlipped, setIsSubMenuFlipped] = useState<boolean>(false);

    const [data, setData] = useState<GetAssetType>(rawData);

    useEffect(() => {
        if (rawData) {
            setData(rawData);
        }
    }, [rawData]);

    const [initFetchCollections, setInitFetchCollections] = useState<boolean>(false);
    const [collections, setCollections] = useState<GetCollectionItemType[]>();
    const [isCollectionsLoading, setIsCollectionsLoading] = useState<boolean>(true);
    const [isInCollection, setIsInCollection] = useState<boolean>(false);

    const [notificationSubscriptions, setNotificationSubscriptions] = useState<GetNotificationSubscriptionType>();

    // @ts-ignore
    const [muteData, setMuteData] = useState<GetNotificationMuteType>(data?.notifications?.mute);

    const [isMuted, setIsMuted] = useState<boolean>(() => {
        // @ts-ignore
        if (!data?.notifications?.mute) return false;
        // @ts-ignore
        if (data.notifications.mute.isIndefinite) return true;
        // @ts-ignore
        return new Date(data.notifications.mute.date).getTime() + data.notifications.mute.duration > Date.now();
    });

    const [remainingMuteDurationText, setRemainingMuteDurationText] = useState<string>("");

    const closeContextMenu = useCallback((id?: string) => {
        if (!id) return;
        setIsContextMenuOpen(false);
        document
            .getElementById(`more-dropdown-${id}`)
            ?.hidePopover();
    }, [setIsContextMenuOpen]);

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
        if (!data?.id) return;

        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`more-dropdown-${data.id}`);

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
    }, [data?.id, closeContextMenu]);

    const checkSubMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsSubMenuFlipped(spaceRight < submenuWidth);
    };

    useEffect(() => {
        if (!initFetchCollections || !data?.id) return;

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
    }, [initFetchCollections, data?.id]);

    useEffect(() => {
        if (!data) return;

        setIsInCollection(
            ("isCharacterInAnyCollections" in data && Boolean(data.isCharacterInAnyCollections)) || 
            (collections?.some((c) => Boolean(c.isItemInCollection)) ?? false)
        );
    }, [collections, data]);

    useEffect(() => {
        if (!notificationSubscriptions) return;

        setData((prevData) => {
            const currentData = prevData ?? rawData;
            if (!currentData) return currentData;

            return {
                ...currentData,
                notifications: {
                    // @ts-ignore
                    ...currentData?.notifications,
                    subscriptions: {
                        // @ts-ignore
                        ...currentData?.notifications?.subscriptions,
                        ...notificationSubscriptions,
                    },
                },
            } as GetAssetType;
        });
    }, [rawData, notificationSubscriptions]);

    useEffect(() => {
        if (!isMuted || !muteData) {
            setRemainingMuteDurationText("");
            return;
        }

        if (muteData.isIndefinite) {
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

    const isOwner = Boolean(data) && (
        (data?.id === window.session.userId) || 
        ("owner" in data && data?.owner?.id === window.session.userId)
    );

    useEffect(() => {
        if (
            Boolean(setIsLiked) 
            && isOwner 
            && !isLiked
        ) {
            // @ts-ignore
            setIsLiked(true);
        }
    }, [
        isOwner,
        isLiked,
        setIsLiked
    ]);

    useEffect(() => {
        if (
            Boolean(setIsFollowing) 
            && isOwner 
            && !isFollowing
        ) {
            // @ts-ignore
            setIsFollowing(true);
        }
    }, [
        isOwner,
        isFollowing, 
        setIsFollowing,
    ]);

    const flexClassList = "flex items-center justify-center";
    const textClassList = `${flexClassList} w-4 h-6 text-lg font-nerdfont leading-none shrink-0`;
    const copyIdTextClassList = `${flexClassList} w-4 h-6 text-3xl font-nerdfont leading-none shrink-0`;
    const friendTextClassList = `${flexClassList} w-4 h-6 text-base font-nerdfont leading-none shrink-0`;
    const tooltipClassList =  "tooltip tooltip-top tooltip-accent";
    const quickActionClassList = `${flexClassList} flex-1 w-full h-full`;
    const subMenuClassList = `absolute ${isSubMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`;
    const subMenuMarginClassList = `absolute ${isSubMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`;
    const imageIconClassList = "rounded-full translate-x-[2px] w-5 h-5 aspect-square shrink-0 object-cover";

    if (!isTranslationReady || !data) return null;

    return {
        items: (children: ReactNode[]): ReactNode => (
            <>
                <div
                    className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent"
                    data-tip={t("words.More")}
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsContextMenuOpen(true);

                        const popover = document.getElementById(
                            `more-dropdown-${data.id}`
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
                    className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50 duration-0"
                    popover="manual"
                    id={`more-dropdown-${data.id}`}
                >
                    {children}
                </ul>
            </>
        ),

        quickActions: (children: Array<(props?: Props) => ReactNode>): ReactNode => (
            <>
                <div className="flex w-full h-11">
                    {children
                        .filter((renderChild) => typeof renderChild === "function")
                        .map((renderChild, index) => (
                            <React.Fragment key={index}>
                                {renderChild({ isQuickAction: true })}
                            </React.Fragment>
                        ))}
                </div>
                <hr />
            </>
        ),

        separator: (): ReactNode => (
            <hr />
        ),

        dismiss: (props: Props = {}): ReactNode => Boolean(setIsDismissed)
            && !isHidden 
            && window.session.userId 
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Dismiss")}
                onClick={async () => {
                    closeContextMenu(data.id)

                    await handleDismissInteraction(
                        data,
                        // @ts-ignore
                        isDismissed,
                        isDismissedInteractionLoading,
                        setIsDismissed,
                        setIsDismissedInteractionLoading
                    );
                }}
            >
                <button className={`justify-between ${props.isQuickAction && quickActionClassList}`}>
                    {!props.isQuickAction ? t("words.Dismiss") : ""}

                    <span className={`${isDismissedInteractionLoading ? "loading" : ""} ${textClassList}`}>
                        
                    </span>
                </button>
            </li>
        ),

        // DEVELOPER NEEDED: Also display on assets where the user has permission to view in studio
        viewInStudio: (props: Props = {}): ReactNode => 
            ("owner" in data && data.owner.id === window.session.userId) && 
        (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("components.menus.context.viewInStudio")}
                onClick={async () => {
                    closeContextMenu(data.id);
                }}
            >
                <a 
                    className={`justify-between ${props.isQuickAction && quickActionClassList}`}
                    href={`${studioBaseUrl}/character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {!props.isQuickAction ? t("components.menus.context.viewInStudio") : ""}

                    <span className={textClassList}>
                        
                    </span>
                </a>
            </li>
        ),

        edit: (props: Props = {}): ReactNode => window.session.userId === data.id && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.EditProfile")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    // editModal.open(data);
                    toast.show(
                        "DEVELOPER NEEDED: Add edit modal", 
                        { type: "warning" }
                    );
                }}
            >
                <button className={`
                        justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.EditProfile")) : ""}

                    <span className={textClassList}>
                        
                    </span>
                </button>
            </li>
        ),

        pin: (props: Props = {}): ReactNode => Boolean(setIsPinned)
            && !isHidden 
            && isOwner
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isPinned ? t("words.UnpinFromProfile") : t("words.PinToProfile")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    if (isPinLoading) return;

                    try {
                        // @ts-ignore
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

                            if (doesUnpinDismiss) {
                                // @ts-ignore
                                setIsDismissed(true);
                            }
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

                        // @ts-ignore
                        setIsPinned(!isPinned);

                        toast.show(
                            `${t("words.You")} ${isPinned ? t("words.unpinned") : t("words.pinned")} ${data.displayName}`,
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
                        // @ts-ignore
                        setIsPinLoading(false);
                        // @ts-ignore
                        setRefetchPins(true);
                    }    
                }}
            >
                <button className={`justify-between ${props.isQuickAction && quickActionClassList}`}>
                    {!props.isQuickAction ? isPinned ? t("words.UnpinFromProfile") : t("words.PinToProfile") : ""}

                    <span className={`${isPinLoading ? "loading" : ""} ${textClassList}`}>
                        {isPinned ? "󰐄" : "󰐃"}
                    </span>
                </button>
            </li>
        ),

        view: (props: Props = {}): ReactNode => !isBlocked && !isHidden && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.View")}
                onClick={async () => {
                    closeContextMenu(data.id);
                }}
            >
                <Link 
                    className={`justify-between ${props.isQuickAction && quickActionClassList}`}
                    to={`/${"owner" in data 
                        ? `character/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`
                        : `user/${data?.usernames?.find(u => u.isPrimary)?.username || data.id}`
                    }`}
                >
                    {!props.isQuickAction ? t("words.View") : ""}

                    <span className={textClassList}>
                        󰈈
                    </span>
                </Link>
            </li>
        ),

        read: (props: Props = {}): ReactNode => (!isHidden && 
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Read")}
                onClick={async () => {
                    closeContextMenu(data.id);
                }}
            >
                <Link 
                    className={`justify-between ${props.isQuickAction && quickActionClassList}`}
                    to={`/read/${data.id}-${formatDisplayNameToUrl(data.displayName || "")}`}
                >
                    {!props.isQuickAction ? t("words.Read") : ""}

                    <span className={textClassList}>
                        
                    </span>
                </Link>
            </li>
        ),

        chat: (props: Props = {}): ReactNode => !isHidden && (
            <li
                className={
                    props.isQuickAction 
                        ? `${quickActionClassList} ${tooltipClassList}` 
                        : `${!props.isQuickAction && `tooltip tooltip-accent tooltip-${isSubMenuFlipped ? "left" : "right"}`}`}
                data-tip={
                    props.isQuickAction
                        ? t("components.menus.context.chatComingSoon")
                        : t("words.ComingSoon")
                }
            >
                <button 
                    className={`justify-between ${props.isQuickAction && quickActionClassList}`}
                    disabled={true}
                >
                    {!props.isQuickAction ? t("words.Chat") : ""}

                    <span className={textClassList}>
                        󰍧
                    </span>
                </button>
            </li>
        ),

        message: (props: Props = {}): ReactNode => 
            !isOwner
            && !isHidden 
            && !isBlocked
            // @ts-ignore
            && ((data?.sendMessages === "followers" && data?.interactions?.follows?.hasInteracted) ||
            // @ts-ignore
            (data?.sendMessages === "friends" && data?.isFriends) ||
            // @ts-ignore
            (data?.sendMessages !== "followers" && data?.sendMessages !== "friends" && data?.sendMessages !== "private"))
        && (
            <li
                className={
                    props.isQuickAction 
                        ? `${quickActionClassList} ${tooltipClassList}` 
                        : `${!props.isQuickAction && `tooltip tooltip-accent tooltip-${isSubMenuFlipped ? "left" : "right"}`}`}
                data-tip={
                    props.isQuickAction
                        ? t("components.menus.context.messageComingSoon")
                        : t("words.ComingSoon")
                }
            >
                <button 
                    className={`justify-between ${props.isQuickAction && quickActionClassList}`}
                    disabled={true}
                >
                    {!props.isQuickAction ? t("words.Message") : ""}

                    <span className={textClassList}>
                        󰍡
                    </span>
                </button>
            </li>
        ),

        follow: (props: Props = {}): ReactNode => Boolean(setIsFollowing) 
            && (data.visibility !== "friends" && "isFriends" in data && !data.isFriends)
            && !isHidden 
            && window.session.userId 
            && !isOwner 
            && !isBlocked
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isFollowing ? t("words.Unfollow") : t("words.Follow")}
                onClick={async () => {
                    await handleFollowInteraction(
                        data,
                        // @ts-ignore
                        isFollowing,
                        isFollowInteractionLoading,
                        setIsFollowing,
                        setIsFollowInteractionLoading,
                        setFollowCount
                    );
                }}
            >
                <button className={`
                        ${isFollowing ? "text-accent" : "" } justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (isFollowing ? t("words.Unfollow") : t("words.Follow")) : ""}

                    <span className={`${isFollowInteractionLoading ? "loading" : ""} ${textClassList}`}>
                        {isFollowing ? "" : ""}
                    </span>
                </button>
            </li>
        ),

        // If blocked or ristricted, don't show certain buttons or if friends are disabled
        friend: (props: Props = {}): ReactNode => window.session.userId 
            && window.session.userId !== data.id 
            && !isHidden
            && !isBlocked
            && ("areFriendRequestsEnabled" in data && data.areFriendRequestsEnabled)
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.AddFriend")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    // friendModal.open(data);
                    // If friend, display modal to unfrend, else add a friend or cancel
                    toast.show(
                        "DEVELOPER NEEDED: Add friend modal", 
                        { type: "warning" }
                    );
                }}
            >
                <button className={`
                    justify-between
                    ${props.isQuickAction && quickActionClassList}
                `}>
                    {!props.isQuickAction ? (t("words.AddFriend")) : ""}

                    <span className={friendTextClassList}>
                        
                    </span>
                </button>
            </li>
        ),

        like: (props: Props = {}): ReactNode => Boolean(setIsLiked) 
            && !isHidden 
            && window.session.userId 
            && !isOwner 
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isLiked ? t("words.Unlike") : t("words.Like")}
                onClick={async () => {
                    await handleLikeInteraction(
                        data,
                        // @ts-ignore
                        isLiked,
                        isLikeInteractionLoading,
                        setIsLiked,
                        setIsLikeInteractionLoading,
                        setLikeCount
                    );
                }}
            >
                <button className={`
                        ${isLiked ? "text-accent" : "" } justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (isLiked ? t("words.Unlike") : t("words.Like")) : ""}

                    <span className={`${isLikeInteractionLoading ? "loading" : ""} ${textClassList}`}>
                        {isLiked ? "" : ""}
                    </span>
                </button>
            </li>
        ),

        collections: (props: Props = {}): ReactNode => !isHidden && window.session.userId && (
            <li
                className={`relative group ${props.isQuickAction ? "hidden" : ""}`}
                onMouseEnter={(e) => {
                    checkSubMenuPosition(e);

                    setInitFetchCollections(true);
                }}
            >
                <button className="justify-between">
                    {t("components.menus.context.addToCollection")}

                    <span className={textClassList}>
                        
                    </span>
                </button>

                <span className={subMenuMarginClassList}></span>

                <ul className={subMenuClassList}>
                    {!isCollectionsLoading ? (() => {
                        const favoritesCollection = collections?.find((c) => c.isFavorites);
                        const otherCollections = collections?.filter((c) => !c.isFavorites) || [];

                        const CollectionItem = ({ collection, index }: { collection: GetCollectionItemType; index: number }) => {
                            const [isInCollection, setIsInCollection] = useState(collection.isItemInCollection);

                            return (
                                <li 
                                    key={collection.id || index}
                                    className={isInCollection ? "rounded bg-gradient-to-r from-base-300/100 via-base-300/20 to-transparent" : ""}
                                >
                                    <button 
                                        className="flex w-full items-center justify-between"
                                        onClick={async () => {
                                            const response = await fetch(
                                                `${apiBaseUrl}/v3/collections/update/${collection.id}/${data.id}`, 
                                                { credentials: "include" }
                                            );

                                            const responseData = await response.json();

                                            if (response.ok) {
                                                const nextState = !isInCollection;

                                                setIsInCollection(nextState);

                                                // eslint-disable-next-line react-hooks/immutability
                                                collection.isItemInCollection = nextState;

                                                setCollections((prevCollections) => 
                                                    prevCollections?.map((c) => 
                                                        c.id === collection.id 
                                                            ? { ...c, isItemInCollection: nextState } 
                                                            : c
                                                    )
                                                );

                                                toast.show(
                                                    `${nextState ? t("words.Added") : t("words.Removed")} ${data.displayName || data.id} ${nextState ? t("words.to") : t("words.from")} ${collection.displayName}`, 
                                                    { icon: nextState ? "" : "", type: nextState ? "success" : "info" }
                                                );
                                            } else {
                                                toast.show(
                                                    `${t("words.FailedTo")} ${isInCollection ? t("words.remove") : t("words.add")} ${data.displayName || data.id} ${isInCollection ? t("words.from") : t("words.to")} ${collection.displayName}`, 
                                                    { 
                                                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                                        type: "error" 
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className={textClassList}>
                                                {isInCollection ? "󰐾" : "󰐽"}
                                            </span>
                                            {collection.displayName}
                                        </div>
                                        <img 
                                            className={imageIconClassList}
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
                            className={`tooltip tooltip-${isSubMenuFlipped ? "left" : "right"} tooltip-accent`}
                            data-tip={t("words.ComingSoon")}
                        >
                            <button 
                                className="justify-between"
                                disabled={true}
                            >
                                {t("components.menus.context.newCollection")}

                                <span className={textClassList}>
                                    󰌴
                                </span>
                            </button>
                        </li>
                    )}
                </ul>
            </li>
        ),

        notInterested: (props: Props = {}): ReactNode => Boolean(setIsHidden) 
            && window.session.userId
            && !isOwner 
            && !isFollowing 
            && !isLiked 
            && !isInCollection
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isHidden ? t("words.Interested") : t("words.NotInterested")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    await handleHideInteraction(
                        data,
                        // @ts-ignore
                        isHidden,
                        isHideInteractionLoading,
                        setIsHidden,
                        setIsHideInteractionLoading
                    );
                }}
            >
                <button className={`
                        ${!isHidden ? "text-accent" : "" } justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (isHidden ? t("words.Interested") : t("words.NotInterested")) : ""}

                    <span className={`${isHideInteractionLoading ? "loading" : ""} ${textClassList}`}>
                        {isHidden ? "󰈈" : "󰈉"}
                    </span>
                </button>
            </li>
        ),

        notifications: (props: Props = {}): ReactNode => isFollowing && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Notifications")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    notificationsModal.open(
                        data,
                        // @ts-ignore
                        setNotificationSubscriptions
                    );
                }}
            >
                <button className={`
                        justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.Notifications")) : ""}

                    <span className={textClassList}>
                        󰂚
                    </span>
                </button>
            </li>
        ),

        mute: (props: Props = {}): ReactNode => isFollowing && (
            !isMuted ? (
                <li
                    className={`relative group ${props.isQuickAction ? "hidden" : ""}`}
                    onMouseEnter={(e) => {
                        checkSubMenuPosition(e);
                    }}
                >
                    <button className="justify-between">
                        {t("words.Mute")}

                        <span className={textClassList}>
                            
                        </span>
                    </button>

                    <span className={subMenuMarginClassList}></span>

                    <ul className={subMenuClassList}>
                        {[
                            { label: t("time.hour1"), icon: "󱐿", duration: "1h", isIndefinite: false  },
                            { label: t("time.hour4"), icon: "󱑂", duration: "4h", isIndefinite: false  },
                            { label: t("time.hour8"), icon: "󱑆", duration: "8h", isIndefinite: false  },
                            { label: t("time.hour24"), icon: "󱑊", duration: "24h", isIndefinite: false  },
                            { label: t("words.Indefinitely"), icon: "󰂛", duration: "0s", isIndefinite: true }
                        ].map((item) => (
                            <React.Fragment key={item.label}>
                                {item.isIndefinite && (
                                    <hr />
                                )}
                                
                                <li>
                                    <button 
                                        className="justify-between"
                                        onClick={async () => {
                                            closeContextMenu(data.id);

                                            const newMute = {
                                                // @ts-ignore
                                                duration: parseDuration(item.duration),
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
                                                    `${t("words.Muted")} ${data.displayName || data.id} ${!item.isIndefinite ? `${t("words.for")} ${item.label.toLowerCase()}` : ""}`, 
                                                    { icon: "󰂚", type: "success" }
                                                );
                                            } else {
                                                toast.show(
                                                    `${t("words.FailedTo")} ${t("words.mute")} ${data.displayName || data.id}`, 
                                                    { 
                                                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                                        type: "error" 
                                                    }
                                                );
                                            }
                                        }}
                                    >
                                        {item.label}
                                        <span className={textClassList}>
                                            {item.icon}
                                        </span>
                                    </button>
                                </li>
                            </React.Fragment>
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
                                    `${t("words.Unmuted")} ${data.displayName || data.id}`, 
                                    { icon: "󰂚", type: "info" }
                                );
                            } else {
                                toast.show(
                                    `Failed to ${t("words.unmute")} ${data.displayName || data.id}`, 
                                    { 
                                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                        type: "error" 
                                    }
                                );
                            }

                            closeContextMenu(data.id);
                        }}
                    >
                        <div className={`
                            flex flex-col justify-center items-start leading-none 
                            ${!muteData?.isIndefinite ? "h-11" : ""}
                        `}>
                            {t("words.Unmute")}

                            {!muteData?.isIndefinite && (
                                <span className="text-sub text-xs mt-1">
                                    {remainingMuteDurationText}
                                </span>
                            )}
                        </div>
                        <span className={textClassList}>
                            {getRemainingTimeIcon(remainingMuteDurationText)}
                        </span>
                    </button>
                </li>
            )
        ),

        restrict: (props: Props = {}): ReactNode => Boolean(setIsRestricted) && Boolean(setIsBlocked) 
            && !("owner" in data) 
            && window.session.userId
            && !isBlocked
            && !isOwner
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isRestricted ? t("words.Unrestrict") : t("words.Restrict")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    restrictModal.open(data, {
                        isRestricted,
                        isRestrictInteractionLoading,
                        setIsRestricted,
                        setIsRestrictInteractionLoading,
                        isBlocked,
                        isBlockInteractionLoading,
                        setIsBlocked,
                        setIsBlockInteractionLoading,
                    });
                }}
            >
                <button className={`
                        justify-between text-accent
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (isRestricted ? t("words.Unrestrict") : t("words.Restrict")) : ""}

                    <span className={textClassList}>
                        {isRestricted ? "" : ""}
                    </span>
                </button>
            </li>
        ),

        block: (props: Props = {}): ReactNode => Boolean(setIsRestricted) && Boolean(setIsBlocked) &&
            !("owner" in data) &&
            window.session.userId
            && !isOwner
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={isBlocked ? t("words.Unblock") : t("words.Block")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    blockModal.open(data, {
                        isRestricted,
                        isRestrictInteractionLoading,
                        setIsRestricted,
                        setIsRestrictInteractionLoading,
                        isBlocked,
                        isBlockInteractionLoading,
                        setIsBlocked,
                        setIsBlockInteractionLoading,
                    });
                }}
            >
                <button className={`
                        justify-between text-accent
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (isBlocked ? t("words.Unblock") : t("words.Block")) : ""}

                    <span className={textClassList}>
                        {isBlocked ? "" : ""}
                    </span>
                </button>
            </li>
        ),

        report: (props: Props = {}): ReactNode => 
            window.session.userId
            && !isOwner
            && !window.session.permissions.array.includes("MODERATE_ACCOUNTS") 
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Report")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    reportModal.open(data);
                }}
            >
                <button className={`
                        justify-between text-accent
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.Report")) : ""}

                    <span className={textClassList}>
                        
                    </span>
                </button>
            </li>
        ),

        share: (props: Props = {}): ReactNode => !isHidden 
            && !isBlocked
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Share")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    shareModal.open(data as GetPublishedCharacterItemType);
                }}
            >
                <button className={`
                        justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.Share")) : ""}

                    <span className={textClassList}>
                        󰒗
                    </span>
                </button>
            </li>
        ),

        copyId: (props: Props = {}): ReactNode => window.session.user?.isDeveloper &&(
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.CopyId")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    try {
                        await navigator.clipboard.writeText(data.id);

                        toast.show(
                            t("components.toasts.copiedId"), 
                            { type: "success" }
                        );
                    } catch {
                        toast.show(
                            t("components.toasts.failedCopiedId"), 
                            { type: "error" }
                        );
                    }
                }}
            >
                <button className={`
                        justify-between
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.CopyId")) : ""}

                    <span className={copyIdTextClassList}>
                        󰻾
                    </span>
                </button>
            </li>
        ),

        moderate: (props: Props = {}): ReactNode => 
            !isOwner
            && window.session.permissions.array.includes("MODERATE_ACCOUNTS") 
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Moderate")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    // DEVELOPER NEEDED: Add moderation modal
                    // moderateModal.open(data);
                    toast.show(
                        "DEVELOPER NEEDED: Add moderation modal", 
                        { type: "warning" }
                    );
                }}
            >
                <button className={`
                        justify-between text-accent
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.Moderate")) : ""}

                    <span className={textClassList}>
                        
                    </span>
                </button>
            </li>
        ),

        manage: (props: Props = {}): ReactNode => 
            !isOwner
            && window.session.permissions.array.includes("MANAGE_ACCOUNTS") 
        && (
            <li
                className={props.isQuickAction ? `${quickActionClassList} ${tooltipClassList}` : ""}
                data-tip={t("words.Manage")}
                onClick={async () => {
                    closeContextMenu(data.id);

                    // DEVELOPER NEEDED: Add manage modal
                    // moderateModal.open(data);
                    toast.show(
                        "DEVELOPER NEEDED: Add manage modal", 
                        { type: "warning" }
                    );
                }}
            >
                <button className={`
                        justify-between text-accent
                        ${props.isQuickAction && quickActionClassList}
                    `}>
                    {!props.isQuickAction ? (t("words.Manage")) : ""}

                    <span className={textClassList}>
                        
                    </span>
                </button>
            </li>
        )
    };
}

/*
    DEVELOPER NEEDED: Polish this and only show on profile page 
    <li>
    <button 
    className="justify-between text-error"
    onClick={() => {

    closeContextMenu(data.id);
    }}
    // PER CHARACTER
                <Link className="justify-between " to={`/${user.username || user.id}`}>
                        Submit Fanart
                        <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                            
                        </span>
                    </Link>
                </li>
                <li>
                // PER USER
                    <Link className="justify-between " to={`/${user.username || user.id}`}>
                        Gift Premium
                        <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                            
                        </span>
                    </Link>
                </li>

    >
    Hide Collaboration
    <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
    󰈉
    </span>
    </button>
    </li>
*/
