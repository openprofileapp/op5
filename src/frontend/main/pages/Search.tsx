import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

import Metadata from "../../_common/components/Metadata.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import { GetPublishedCharacterItemType } from "../../../_common/types/character.type.js";
import { apiBaseUrl, cdnBaseUrl } from "../../_common/scripts/domains.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";
import UserCard from "../components/UserCard.js";
import CharacterModal, { CharacterModalRef } from "../components/modals/CharacterModal.js";
import ShareModal, { ShareModalRef } from "../components/modals/ShareModal.js";

type TabType = 
    | "characters"
    | "users"
;

interface FetchResult<T> {
    items: T[];
    count: number;
    pages: number;
}

async function fetchData<T>(
    endpoint: string,
    query: string,
    page: number
): Promise<FetchResult<T>> {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    params.set("page", page.toString());

    const res = await fetch(`${apiBaseUrl}/v3/${endpoint}?${params.toString()}`, {
        credentials: "include",
    });
    const data = await res.json();

    const rawItems = data?.items ?? data?.characters;
    const items: T[] = Array.isArray(rawItems)
        ? rawItems
        : rawItems && typeof rawItems === "object"
        ? Object.values(rawItems)
        : [];

    return {
        items,
        count: data?.count ?? 0,
        pages: data?.pages ?? data?.pageCount ?? 1,
    };
}

export default function Search() {
    const { ready: isTranslationReady } = useTranslation();

    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [activeTab, setActiveTab] = useState<TabType>("characters");

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [characters, setCharacters] = useState<GetPublishedCharacterItemType[]>([]);
    const [users, setUsers] = useState<GetUserItemType[]>([]);

    const [characterCount, setCharacterCount] = useState<number>(0);
    const [userCount, setUserCount] = useState<number>(0);

    const [characterPage, setCharacterPage] = useState<number>(1);
    const [userPage, setUserPage] = useState<number>(1);

    const [hasMoreCharacters, setHasMoreCharacters] = useState<boolean>(true);
    const [hasMoreUsers, setHasMoreUsers] = useState<boolean>(true);

    const [searchTime, setSearchTime] = useState<number>(0);

    const isFetchingRef = useRef(false);
    const characterModalRef = useRef<CharacterModalRef>(null);
    const ShareModalRef = useRef<ShareModalRef>(null);

    const handleOpenModal = (id: string) => {
        characterModalRef.current?.open(id);
    };

    const handleShareModal = (id: string) => {
        ShareModalRef.current?.open(id);
    };

    useEffect(() => {
        let isMounted = true;
        isFetchingRef.current = true;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsLoading(true);
        setCharacters([]);
        setUsers([]);

        const fetchInitialData = async () => {
            const startTime = performance.now();

            try {
                const [characterData, userData] = await Promise.all([
                    fetchData<GetPublishedCharacterItemType>("characters", query, 1),
                    fetchData<GetUserItemType>("users", query, 1),
                ]);

                if (!isMounted) return;

                const cCount = characterData.count;
                const uCount = userData.count;

                setCharacters(characterData.items);
                setCharacterCount(cCount);
                setCharacterPage(1);
                setHasMoreCharacters(1 < characterData.pages);

                setUsers(userData.items);
                setUserCount(uCount);
                setUserPage(1);
                setHasMoreUsers(1 < userData.pages);

                if (cCount === 0 && uCount > 0) {
                    setActiveTab("users");
                } else {
                    setActiveTab("characters");
                }
            } catch (err) {
                console.error("Failed to fetch search results:", err);
                if (isMounted) {
                    setCharacters([]);
                    setCharacterCount(0);
                    setUsers([]);
                    setUserCount(0);
                }
            } finally {
                if (isMounted) {
                    const endTime = performance.now();
                    setSearchTime(Number(((endTime - startTime) / 1000).toFixed(2)));
                    setIsLoading(false);
                }
                isFetchingRef.current = false;
            }
        };

        fetchInitialData();

        return () => {
            isMounted = false;
        };
    }, [query]);

    const loadMore = useCallback(async () => {
        const isCharacters = activeTab === "characters";
        const currentHasMore = isCharacters ? hasMoreCharacters : hasMoreUsers;

        if (isLoading || isLoadingMore || !currentHasMore || isFetchingRef.current) return;

        isFetchingRef.current = true;
        setIsLoadingMore(true);

        const nextPage = (isCharacters ? characterPage : userPage) + 1;
        const startTime = performance.now();

        try {
            if (isCharacters) {
                const data = await fetchData<GetPublishedCharacterItemType>("characters", query, nextPage);
                setCharacters((prev) => [...prev, ...data.items]);
                setCharacterPage(nextPage);
                setHasMoreCharacters(nextPage < data.pages);
            } else {
                const data = await fetchData<GetUserItemType>("users", query, nextPage);
                setUsers((prev) => [...prev, ...data.items]);
                setUserPage(nextPage);
                setHasMoreUsers(nextPage < data.pages);
            }
        } catch (err) {
            console.error(`Failed to fetch more ${activeTab}:`, err);
        } finally {
            const endTime = performance.now();
            setSearchTime(Number(((endTime - startTime) / 1000).toFixed(2)));
            setIsLoadingMore(false);
            isFetchingRef.current = false;
        }
    }, [
        isLoading,
        isLoadingMore,
        activeTab,
        hasMoreCharacters,
        hasMoreUsers,
        characterPage,
        userPage,
        query,
    ]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.offsetHeight - 300;

            if (scrollPosition >= threshold) {
                loadMore();
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [loadMore]);

    if (!isTranslationReady) return null;

    const totalCombinedCount = characterCount + userCount;

    return (
        <>
            <Metadata
                title={query ? `Searching "${query}"` : "Search"}
                allowIndex="false"
            />

            <CharacterModal ref={characterModalRef} />
            <ShareModal ref={ShareModalRef} />

            <div className="px-4 py-4 md:px-14">
                <div className="mt-4 text-xl font-bold">
                    {query ? `Searching "${query}"` : "Search"}
                </div>

                <div className="mb-2 text-xs text-sub">
                    Found {totalCombinedCount} results in {searchTime}s
                </div>

                {!isLoading && totalCombinedCount > 0 && (
                    <div className="relative tabs tabs-border mb-4 right-3">
                        {characterCount > 0 && (
                            <input
                                type="radio"
                                name="search_tabs"
                                className="tab"
                                aria-label={`Characters (${characterCount})`}
                                checked={activeTab === "characters"}
                                onChange={() => setActiveTab("characters")}
                            />
                        )}

                        {userCount > 0 && (
                            <input
                                type="radio"
                                name="search_tabs"
                                className="tab"
                                aria-label={`Users (${userCount})`}
                                checked={activeTab === "users"}
                                onChange={() => setActiveTab("users")}
                            />
                        )}
                    </div>
                )}

                <div className="mb-4">
                    <hr />
                </div>

                <div className="flex flex-wrap gap-4">
                    {isLoading ? (
                        Array.from({ length: 24 }).map((_, index) => (
                            <SkeletonCharacterCard key={`skeleton-initial-${index}`} />
                        ))
                    ) : activeTab === "characters" && characterCount > 0 ? (
                        characters.map((d) => (
                            <CharacterCard 
                                key={d.id}
                                {...d}
                                isPreview={true}
                                hasNotification={false}
                                onOpenModal={handleOpenModal}
                                onShareModal={handleShareModal}
                            />
                        ))
                    ) : activeTab === "users" && userCount > 0 ? (
                        users.map((d) => (
                            <UserCard
                                key={d.id}
                                id={d.id}
                                aura={{
                                    isEnabled: d.isAuraEnabled,
                                    type: d.auraType,
                                    primary: d.auraPrimary,
                                    secondary: d.auraSecondary,
                                }}
                                avatar={d.avatar ? `${cdnBaseUrl}${d.avatar}` : ""}
                                banner={d.banner ? `${cdnBaseUrl}${d.banner}` : ""}
                                displayName={d.displayName}
                                username={d.usernames?.[0]?.username}
                                status={d.status}
                                badges={d.badges}
                                about={d.about}
                                isExplicit={d.isExplicit}
                                visibility={d.visibility}
                            />
                        ))
                    ) : (
                        <div className="flex w-full flex-col items-center justify-center py-16 text-center">
                            <p className="text-lg font-medium">
                                No results found {query && `for "${query}"`}
                            </p>
                            <p className="mt-1 text-sm text-sub">
                                Be the first to bring this character to life!
                            </p>
                            <button className="mt-6 rounded btn btn-accent px-6 py-2 text-sm font-medium">
                                {/* DEVELOPER NEEDED: Make this functional */}
                                Create Character
                            </button>
                        </div>
                    )}
                </div>

                <div className="my-12 text-center">
                    {isLoadingMore ? (
                        <div className="flex flex-wrap gap-4 justify-center">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <SkeletonCharacterCard key={`skeleton-more-${index}`} />
                            ))}
                        </div>
                    ) : (
                        ((activeTab === "characters" && !hasMoreCharacters && characters.length > 0) ||
                            (activeTab === "users" && !hasMoreUsers && users.length > 0)) && (
                            <div className="px-0 md:px-4 text-xl">
                                You've reached the end!
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
