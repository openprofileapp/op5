import { useTranslation } from "react-i18next";
import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import Metadata from "../../_common/components/Metadata.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import { GetPublishedCharacterType } from "../../../_common/types/character.type.js";
import { apiHost } from "../../_common/scripts/hosts.js";

export default function Search() {
    const { ready: isTranslationReady } = useTranslation();

    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const [characters, setCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [searchTime, setSearchTime] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const isFetchingRef = useRef(false);

    useEffect(() => {
        let isMounted = true;
        isFetchingRef.current = true;

        const fetchInitialCharacters = async () => {
            const startTime = performance.now();

            try {
                const params = new URLSearchParams();
                if (query) params.set("q", query);
                params.set("page", "1");

                const url = `${apiHost}/v3/characters?${params.toString()}`;
                const res = await fetch(url, { credentials: "include" });
                const data = await res.json();

                if (!isMounted) return;

                const rawCharacters = data?.items;
                const newCharacters: GetPublishedCharacterType[] = Array.isArray(rawCharacters)
                    ? rawCharacters
                    : rawCharacters && typeof rawCharacters === "object"
                    ? Object.values(rawCharacters)
                    : [];

                setCharacters(newCharacters);
                setTotalCount(data?.count ?? 0);
                setCurrentPage(1);
                setHasMore(data?.pages ? 1 < data.pages : newCharacters.length > 0);
            } catch (err) {
                console.error("Failed to fetch characters:", err);

                if (isMounted) setCharacters([]);
            } finally {
                if (isMounted) {
                    const endTime = performance.now();
                    setSearchTime(Number(((endTime - startTime) / 1000).toFixed(2)));
                    setIsLoading(false);
                }

                isFetchingRef.current = false;
            }
        };

        fetchInitialCharacters();

        return () => {
            isMounted = false;
        };
    }, [query]);

    useEffect(() => {
        const handleScroll = async () => {
            if (isLoading || isLoadingMore || !hasMore || isFetchingRef.current) return;

            const scrollPosition = window.innerHeight + window.scrollY;
            const threshold = document.documentElement.offsetHeight - 300;

            if (scrollPosition >= threshold) {
                isFetchingRef.current = true;
                setIsLoadingMore(true);

                const nextPage = currentPage + 1;
                const startTime = performance.now();

                try {
                    const params = new URLSearchParams();
                    if (query) params.set("q", query);
                    params.set("page", nextPage.toString());

                    const url = `${apiHost}/v3/characters?${params.toString()}`;
                    const res = await fetch(url, { credentials: "include" });
                    const data = await res.json();

                    const rawCharacters = data?.characters;
                    const newCharacters: GetPublishedCharacterType[] = Array.isArray(rawCharacters)
                        ? rawCharacters
                        : rawCharacters && typeof rawCharacters === "object"
                        ? Object.values(rawCharacters)
                        : [];

                    setCharacters((prev) => [...prev, ...newCharacters]);
                    setCurrentPage(nextPage);
                    setHasMore(data?.pageCount ? nextPage < data.pageCount : newCharacters.length > 0);
                } catch (err) {
                    console.error("Failed to fetch more characters:", err);
                } finally {
                    const endTime = performance.now();
                    setSearchTime(Number(((endTime - startTime) / 1000).toFixed(2)));
                    setIsLoadingMore(false);
                    isFetchingRef.current = false;
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [isLoading, isLoadingMore, hasMore, currentPage, query]);

    if (!isTranslationReady) return null;

    return (
        <>  
            <Metadata
                title={query ? `Search: ${query}` : "Search"}
                allowIndex="false"
            />
            
            <div className="px-4 py-4 md:px-14">
                <div className="mt-4 text-xl font-bold">
                    {query ? `Searching for "${query}"` : "All Characters"}
                </div>

                <div className="mb-6 text-xs text-sub">
                    Found {totalCount} results in {searchTime}s
                </div>

                <div className="flex flex-wrap gap-4">
                    {isLoading ? (
                        Array.from({ length: 24 }).map((_, index) => (
                            <SkeletonCharacterCard key={index} />
                        ))
                    ) : characters.length > 0 ? (
                        characters.map((profile, index) => (
                            <CharacterCard key={profile.id || index} data={profile} />
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
                                <SkeletonCharacterCard key={index} />
                            ))}
                        </div>
                    ) : (
                        !hasMore && characters.length > 0 && (
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
