import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import ProjectCard from "../components/ProjectCard.js";
import UserCard from "../components/UserCard.js";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Pagination } from "../components/Pagination.js";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";

// DEFINE TYPE PROFILE SOMEWHERE GLOBALLY

export default function SearchProfiles() {
    const { tag } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [users, setUsers] = useState<unknown[]>([]);
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
            setCurrentPage(pageParam);
            setNextOffset(null);
        }
        if (sortParam !== sortBy) {
            setSortBy(sortParam);
            setNextOffset(null);
        }
    }, [searchParams]);

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

    // If current page change, update the browser url query

    /*useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v3/users`,
                    { credentials: "include" }
                );
                const data = await res.json();

                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);*/

    useEffect(() => {
        setLoading(true);

        const fetchProfiles = async () => {
            try {
                const offset = nextOffset !== null ? `&offset=${nextOffset}` : "";
                const res = await fetch(
                    `${apiBaseUrl}/v3/characters${endpoint}?ref=browse&sortBy=${sortBy}&page=${currentPage}${offset}`, 
                    { credentials: "include" }
                );
                const data = await res.json();

                console.log(data);

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
    }, [location.pathname, currentPage, tag, endpoint, sortBy]);

    if (!isTranslationReady) return null;
    
    return (
        <>  
            <Metadata
                title="Search"
                allowIndex="false"
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
                        <div className="flex-1 mt-2">
                            <TypeableDropdownInput
                                value={sortBy}
                                options={[
                                    { id: "recommended", name: "Recommended" },
                                    { id: "exclusive", name: "Exclusive" },
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

                <div className="top-14 left-1/2 -translate-x-1/2 absolute flex justify-center">
                    <Pagination 
                        pageCount={count} 
                        currentPage={currentPage}
                        onPageChange={(page) => handlePageChange(page)}
                    />
                </div>

                <div className="flex flex-wrap gap-4">

                    {loading && 
                        Array.from({ length: 6 }).map((_, index) => (
                            <SkeletonCharacterCard key={index} />
                        ))
                    }

                    {!loading && false && (
                        <>
                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                name="Dragonights"
                                slug="dragonights"
                                owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                status="Follow to keep up with the J9 universe. Follow to keep up with the J9 universe."
                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#7b22fd", secondary: "#e6d044" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/pq_bookert@2xww.jpg"
                                name="Portal Quest"
                                slug="portalquestproject.com"
                                owner={{ id: "5019646586243236", username: "1052", name: "1052 Productions", isVerified: false, type: "publisher" }}
                                status="One of the oldest Minecraft animated films"
                                about="Ermythia, a beautiful world where alien relics hold incredible powers and where legendary heroes once known as the Overseers protected the land from rising dangers alongside the Ender Knights. However, this is a different era, an era where wicked forces have stolen the relics from the tombs of the fallen heroes and are now threatening the remaining peace."
                                interactions={{ views: { count: 124, interacted: true }, follows: { count: 4, interacted: false }, profiles: { count: 12, interacted: false } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#4c6369", secondary: "#151b2f" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/card_preview.png"
                                name="Urban Legends"
                                slug="legends-of-urban"
                                owner={{ id: "5019646586243236", username: "avatarkage", name: "AvatarKage", isVerified: true, type: "author" }}
                                status="On hold since 2023"
                                about="A work-in-progress video game revolving the world of martial arts."
                                interactions={{ views: { count: 16, interacted: true }, follows: { count: 1, interacted: false }, profiles: { count: 1, interacted: true } }}
                            />
                        </>
                    )}

                    {/* Fix the inputs; eg: name -> displayName */}

                    {!loading && false && users.map((d: any) => (
                        <UserCard
                            id={d.id}
                            aura={{
                                isEnabled: d.isAuraEnabled,
                                type: d.auraType,
                                primary: d.auraPrimary,
                                secondary: d.auraSecondary
                            }}
                            avatar={d.avatar ? `https://cdn.openprofile.app${d.avatar}` : ""}
                            banner={d.banner ? `https://cdn.openprofile.app${d.banner}` : ""}
                            displayName={d.displayName}
                            username={d.username}
                            status={d.status}
                            badges={d.badges}
                            about={d.about}
                            isMature={d.isMature}
                            visibility={d.visibility}
                            interactions={{
                                views: {
                                    count: 0,
                                    interacted: true
                                },
                                likes: {
                                    count: 0,
                                    interacted: false
                                }
                            }}
                        />
                    ))}
                    
                    {!loading && profiles.map((d: any, index: number) => (
                        <CharacterCard
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
