import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";

import { postInteraction } from "../scripts/postInteraction.js";
import { toast } from "../scripts/toast.js";
import { GetAssetType } from "../../../_common/types/asset.type.js";

export const useInteractions = () => {
    const { t, ready: isTranslationReady } = useTranslation();

    const handleDismissInteraction = async (
        data: GetAssetType,
        isDismissed: boolean,
        isDismissedInteractionLoading: boolean,
        setIsDismissed: Dispatch<SetStateAction<boolean>>,
        setIsDismissedInteractionLoading: (loading: boolean) => void
    ): Promise<boolean> => {
        if (!isTranslationReady || isDismissedInteractionLoading) return false;

        setIsDismissedInteractionLoading(true);

        try {
            const response = await postInteraction(data.id, "dismisses");

            if (response.ok) {
                setIsDismissed(!isDismissed);

                toast.show(
                    `${t("words.You")} ${t("words.dismissed")} ${data.displayName}`,
                    { type: isDismissed ? "info" : "success" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${t("words.dismiss")} ${data.displayName}`,
                    {
                        subtext: `${response.id || ""}${response.id ? ": " : ""}${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsDismissedInteractionLoading(false);
        }
    };

    const handleViewInteraction = async (
        data: GetAssetType,
        isViewInteractionLoading: boolean,
        lastViewDate: string,
        setIsViewed: Dispatch<SetStateAction<boolean>>,
        setIsViewInteractionLoading: (loading: boolean) => void,
        setLastViewDate: Dispatch<SetStateAction<string>>,
        setViewCount: Dispatch<SetStateAction<number>>
    ): Promise<boolean> => {
        if (!isTranslationReady || isViewInteractionLoading) return false;

        setIsViewInteractionLoading(true);

        try {
            const response = await postInteraction(data.id, "views");

            if (response.ok) {
                setIsViewed(true);

                let shouldIncrementCount = false;

                if (!lastViewDate) {
                    shouldIncrementCount = true;
                } else {
                    const lastInteraction = DateTime.fromISO(lastViewDate, { zone: "utc" }).toLocal();
                    const now = DateTime.local();

                    const diffInHours = now.diff(lastInteraction, "hours").hours;
                    const isLoggedUser = Boolean(window.session?.userId);

                    const requiredHours = isLoggedUser ? 1 : 24;

                    if (diffInHours >= requiredHours) {
                        shouldIncrementCount = true;
                    }
                }

                if (shouldIncrementCount) {
                    setViewCount(prev => prev + 1);
                    setLastViewDate(DateTime.now().toUTC().toISO());

                    return true;
                }

                return false;
            } else {
                return false;
            }
        } finally {
            setIsViewInteractionLoading(false);
        }
    };

    const handleFollowInteraction = async (
        data: GetAssetType,
        isFollowing: boolean,
        isFollowInteractionLoading: boolean,
        setIsFollowing: Dispatch<SetStateAction<boolean>>,
        setIsFollowInteractionLoading: (loading: boolean) => void,
        setFollowCount: Dispatch<SetStateAction<number>>
    ): Promise<boolean> => {
        if (!isTranslationReady || isFollowInteractionLoading) return false;

        setIsFollowInteractionLoading(true);

        try {
            const response = await postInteraction(data.id, "follows");

            const is422 = response.code === 422;

            if (response.ok) {
                setIsFollowing(!isFollowing);
                setFollowCount(prev => (isFollowing ? prev - 1 : prev + 1));

                toast.show(
                    `${t("words.You")} ${isFollowing ? t("words.unfollowed") : t("words.followed")} ${data.displayName}`,
                    { type: isFollowing ? "info" : "success" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${isFollowing ? t("words.unfollow") : t("words.follow")} ${data.displayName}`,
                    {
                        subtext: `${is422 ? "" : `${response.id || ""}${response.id ? ": " : ""}` }${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsFollowInteractionLoading(false);
        }
    };

    const handleLikeInteraction = async (
        data: GetAssetType,
        isLiked: boolean,
        isLikeInteractionLoading: boolean,
        setIsLiked: Dispatch<SetStateAction<boolean>>,
        setIsLikeInteractionLoading: (loading: boolean) => void,
        setLikeCount: Dispatch<SetStateAction<number>>
    ): Promise<boolean> => {
        if (!isTranslationReady || isLikeInteractionLoading) return false;

        setIsLikeInteractionLoading(true);

        try {
            const response = await postInteraction(data.id, "likes");

            const is422 = response.code === 422;

            if (response.ok) {
                setIsLiked(!isLiked);
                setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));

                toast.show(
                    `${t("words.You")} ${isLiked ? t("words.unliked") : t("words.liked")} ${data.displayName}`,
                    { type: isLiked ? "info" : "success" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${isLiked ? t("words.unlike") : t("words.like")} ${data.displayName}`,
                    {
                        subtext: `${is422 ? "" : `${response.id || ""}${response.id ? ": " : ""}` }${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsLikeInteractionLoading(false);
        }
    };

    const handleHideInteraction = async (
        data: GetAssetType,
        isHidden: boolean,
        isHideInteractionLoading: boolean,
        setIsHidden: Dispatch<SetStateAction<boolean>>,
        setIsHideInteractionLoading: (loading: boolean) => void
    ): Promise<boolean> => {
        if (!isTranslationReady || isHideInteractionLoading) return false;

        setIsHideInteractionLoading(true);

        try {
            const response = await postInteraction(data.id, "hides");

            if (response.ok) {
                setIsHidden(!isHidden);

                toast.show(
                    `${!isHidden 
                        ? `${t("components.toasts.notInterested")} ${data.displayName}`
                        : `${t("components.toasts.interested")} ${data.displayName} ${t("words.again")}`
                    }`,
                    { type: isHidden ? "success" : "info" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${isHidden ? t("words.hide") : t("words.unhide")} ${data.displayName}`,
                    {
                        subtext: `${response.id || ""}${response.id ? ": " : ""}${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsHideInteractionLoading(false);
        }
    };

    return {
        handleDismissInteraction,
        handleViewInteraction,
        handleFollowInteraction,
        handleLikeInteraction,
        handleHideInteraction
    };
};
