import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import CharacterCard from "../../_common/components/CharacterCard.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "../../_common/components/Pagination.js";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";

// DEFINE TYPE PROFILE SOMEWHERE GLOBALLY

export default function Browse() {
    const { tag } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [profiles, setProfiles] = useState<unknown[]>([]);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "recommended");
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const isOnPopularPage = location.pathname === "/popular";
    const isOnTrendingPage = location.pathname === "/trending";
    const isOnRecentPage = location.pathname === "/recent";
    const isOnBrowsePage = location.pathname === "/browse";
    const isOnTagPage = location.pathname.startsWith("/browse/");

    let endpoint: string = "";
    if (isOnPopularPage) {
        endpoint = "/popular";
    } else if (isOnTrendingPage) {
        endpoint = "/trending";
    } else if (isOnRecentPage) {
        endpoint = "/recent";
    } else if (isOnTagPage && tag) {
        endpoint = `/tag/${tag}`;
    }

    useEffect(() => {
        const pageParam = parseInt(searchParams.get("page") || "1");
        const sortParam = searchParams.get("sortBy") || "recommended";

        if (pageParam !== currentPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(pageParam);
            setNextOffset(null);
        }
        if (sortParam !== sortBy) {
            setSortBy(sortParam);
            setNextOffset(null);
        }
    }, [currentPage, searchParams, sortBy]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        setNextOffset(null);
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            if (page === 1) {
                params.delete("page");
            } else {
                params.set("page", page.toString());
            }
            return params;
        });
    };

    const handleSortChange = (newSortBy: string) => {
        setSortBy(newSortBy);
        setCurrentPage(1);
        setNextOffset(null);
        setSearchParams((prev) => {
            const params = new URLSearchParams(prev);
            params.set("sortBy", newSortBy);
            params.delete("page");
            return params;
        });
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);

        const fetchProfiles = async () => {
            try {
                const offset = nextOffset !== null ? `&offset=${nextOffset}` : "";
                const res = await fetch(
                    `${apiBaseUrl}/v3/characters${endpoint}?ref=browse&sortBy=${sortBy}&page=${currentPage}${offset}&includeMedia=true&includeChangelogs=true`, 
                    { credentials: "include" }
                );
                const data = await res.json();

                setProfiles(data.items || []);
                setCount(data.pages || 0);
                if (data.nextOffset !== undefined) {
                    setNextOffset(data.nextOffset);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [location.pathname, currentPage, tag, endpoint, sortBy, nextOffset]);

    if (!isTranslationReady) return null;
    
    return (
        <>  
            <Metadata
                title="Search"
                allowIndex={false}
            />

            <div className="px-4 py-4 md:px-14">
                <div className="px-0 flex flex-row gap-3">
                    <div className="mt-4 mb-6 text-xl font-bold text-left flex-4">
                        {isOnPopularPage ? "Popular (Top 30)" : ""}
                        {isOnRecentPage ? "New & Updated (Last 30 Days)" : ""}
                        {isOnTrendingPage ? "Trending (Top 30)" : ""}
                        {isOnBrowsePage ? `Browsing All` : ""}
                        {isOnTagPage ? `Browsing #${tag}` : ""}
                    </div>

                    {(isOnBrowsePage || isOnTagPage) && (
                        <div className="flex-1 mt-2 mr-5">
                            <TypeableDropdownInput
                                value={sortBy}
                                options={[
                                    { id: "recommended", name: "Recommended" },
                                    { id: "limited", name: "Limited" },
                                    { id: "verified", name: "Verified" },
                                    { id: "popularDesc", name: "Most Popular" },
                                    { id: "popularAsc", name: "Least Popular" },
                                    { id: "newest", name: "Newest First" },
                                    { id: "oldest", name: "Oldest First" },
                                    { id: "nameAsc", name: "Name (A-Z)" },
                                    { id: "nameDesc", name: "Name (Z-A)" }
                                ]}
                                placeholder="Filter Results"
                                typeable={false}
                                onChange={(id) => handleSortChange(id as string)}
                            />
                        </div>
                    )}
                </div>

                <Pagination 
                    pageCount={count} 
                    currentPage={currentPage}
                    onPageChange={(page) => handlePageChange(page)}
                />

                <div className="flex flex-wrap gap-4">

                    {loading && 
                        Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonCharacterCard key={index} />
                        ))
                    }

                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {!loading && profiles.map((d: any, index: number) => (
                        <CharacterCard
                            key={index}
                            data={d}
                        />
                    ))}
                </div>

                <Pagination 
                    pageCount={count} 
                    currentPage={currentPage}
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>
        </>
    );
}
