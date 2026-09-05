import { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";
import { DateTime } from "luxon";

import { postInteraction } from "../scripts/postInteraction.js";
import { toast } from "../scripts/toast.js";

export type ViewInteractionProps = {
    id: string;
    isViewInteractionLoading: boolean;
    lastViewDate: string;
    setIsViewInteractionLoading: (loading: boolean) => void;
    setIsViewed: Dispatch<SetStateAction<boolean>>;
    setLastViewDate: Dispatch<SetStateAction<string>>;
    setViewCount: Dispatch<SetStateAction<number>>;
}

export type FollowInteractionProps = {
    id: string;
    displayName: string;
    isFollowing: boolean;
    isFollowInteractionLoading: boolean;
    setIsFollowInteractionLoading: (loading: boolean) => void;
    setIsFollowing: Dispatch<SetStateAction<boolean>>;
    setFollowCount: Dispatch<SetStateAction<number>>;
}

export type LikeInteractionProps = {
    id: string;
    displayName: string;
    isLiked: boolean;
    isLikeInteractionLoading: boolean;
    setIsLikeInteractionLoading: (loading: boolean) => void;
    setIsLiked: Dispatch<SetStateAction<boolean>>;
    setLikeCount: Dispatch<SetStateAction<number>>;
}

export const useInteractions = () => {
    const { t, ready: isTranslationReady } = useTranslation();

    const handleViewInteraction = async ({
        id,
        isViewInteractionLoading,
        lastViewDate,
        setIsViewInteractionLoading,
        setIsViewed,
        setLastViewDate,
        setViewCount
    }: ViewInteractionProps): Promise<boolean> => {
        if (!isTranslationReady || isViewInteractionLoading) return false;

        setIsViewInteractionLoading(true);

        try {
            const response = await postInteraction(id, "views");

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

    const handleLikeInteraction = async ({
        id,
        displayName,
        isLiked,
        isLikeInteractionLoading,
        setIsLikeInteractionLoading,
        setIsLiked,
        setLikeCount
    }: LikeInteractionProps): Promise<boolean> => {
        if (!isTranslationReady || isLikeInteractionLoading) return false;

        setIsLikeInteractionLoading(true);

        try {
            const response = await postInteraction(id, "likes");

            if (response.ok) {
                setIsLiked(!isLiked);
                setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));

                toast.show(
                    `${t("words.You")} ${isLiked ? t("words.unliked") : t("words.liked")} ${displayName}`,
                    { type: isLiked ? "info" : "success" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${isLiked ? t("words.unlike") : t("words.like")} ${displayName}`,
                    {
                        subtext: `${response.id || ""}${response.id ? ": " : ""}${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsLikeInteractionLoading(false);
        }
    };

    const handleFollowInteraction = async ({
        id,
        displayName,
        isFollowing,
        isFollowInteractionLoading,
        setIsFollowInteractionLoading,
        setIsFollowing,
        setFollowCount
    }: FollowInteractionProps): Promise<boolean> => {
        if (!isTranslationReady || isFollowInteractionLoading) return false;

        setIsFollowInteractionLoading(true);

        try {
            const response = await postInteraction(id, "follows");

            if (response.ok) {
                setIsFollowing(!isFollowing);
                setFollowCount(prev => (isFollowing ? prev - 1 : prev + 1));

                toast.show(
                    `${t("words.You")} ${isFollowing ? t("words.unfollowed") : t("words.followed")} ${displayName}`,
                    { type: isFollowing ? "info" : "success" }
                );

                return true;
            } else {
                toast.show(
                    `${t("words.FailedTo")} ${isFollowing ? t("words.unfollow") : t("words.follow")} ${displayName}`,
                    {
                        subtext: `${response.id || ""}${response.id ? ": " : ""}${response.message}`,
                        type: "error",
                    }
                );
                
                return false;
            }
        } finally {
            setIsFollowInteractionLoading(false);
        }
    };

    return {
        handleViewInteraction,
        handleFollowInteraction,
        handleLikeInteraction
    };
};
