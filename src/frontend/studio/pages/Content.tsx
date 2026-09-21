import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GetDraftCharacterItemType } from "../../../_common/types/characters/character.type.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { Pagination } from "../../main/components/Pagination.js";
import CharacterCard from "../../_common/components/CharacterCard.js";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";

export default function Content() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const sortBy = searchParams.get("sortBy") || "popularDesc";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [pageCount, setPageCount] = useState(0);

    const [characters, setCharacters] = useState<GetDraftCharacterItemType[]>([]);
    const [areCharactersLoading, setAreCharactersLoading] = useState(true);

    const handleSearchChange = (newQuery: string) => {
        setSearchParams(
            (prev) => {
                if (newQuery) {
                    prev.set("q", newQuery);
                } else {
                    prev.delete("q");
                }
                prev.delete("page");
                return prev;
            },
            { replace: true }
        );
    };

    const handlePageChange = (page: number) => {
        setSearchParams(
            (prev) => {
                if (page === 1) {
                    prev.delete("page");
                } else {
                    prev.set("page", page.toString());
                }
                return prev;
            },
            { replace: true }
        );
    };

    const handleSortChange = (newSortBy: string) => {
        setSearchParams(
            (prev) => {
                prev.set("sortBy", newSortBy);
                prev.delete("page");
                return prev;
            },
            { replace: true }
        );
    };

    const fetchCharacters = useCallback(async () => {
        if (!window.session.userId) return;

        setAreCharactersLoading(true);

        try {
            const res = await fetch(
                `${apiBaseUrl}/v3/characters/drafts?owner=${window.session.userId}&q=${encodeURIComponent(query)}&sortBy=${sortBy}&page=${currentPage}&includeMedia=true`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();
            setCharacters(json?.items || []);

            if (json?.pageCount !== undefined) {
                setPageCount(json.pageCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAreCharactersLoading(false);
        }
    }, [currentPage, query, sortBy]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCharacters();
    }, [fetchCharacters]);

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata title="Your Characters" />

            <div className="w-full min-h-screen px-4 md:px-9 py-2">
                <div className="my-6 text-xl font-bold text-left flex-4">
                    Your Characters
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <fieldset className="fieldset flex-1">
                        <legend className="fieldset-legend">{t("words.Search")}</legend>
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1"></span>
                            <input
                                type="search"
                                placeholder={t("pages.userProfile.searchCharacters")}
                                value={query}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </label>
                    </fieldset>

                    <fieldset className="fieldset md:w-64">
                        <legend className="fieldset-legend">Filter</legend>
                        <TypeableDropdownInput
                            value={sortBy}
                            options={[
                                { id: "popularDesc", name: "Most Popular" },
                                { id: "popularAsc", name: "Least Popular" },
                                { id: "newest", name: "Newest First" },
                                { id: "oldest", name: "Oldest First" },
                                { id: "nameAsc", name: "Name (A-Z)" },
                                { id: "nameDesc", name: "Name (Z-A)" },
                            ]}
                            placeholder="Filter Results"
                            typeable={false}
                            onChange={(id) => handleSortChange(id as string)}
                        />
                    </fieldset>
                </div>

                {areCharactersLoading ? (
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonCharacterCard
                                key={index}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-4">
                            {characters.map((character) => (
                                <CharacterCard
                                    key={character.id}
                                    data={character}
                                    isStudio={true}
                                />
                            ))}
                        </div>

                        {characters.length === 0 && (
                            <div className="text-center py-12 text-sub text-base">
                                {t("pages.userProfile.noCharactersFound")}
                            </div>
                        )}

                        {characters.length > 0 && (
                            <>
                                {
                                    (currentPage === pageCount) ||
                                    (currentPage === 1) 
                                && (
                                    <div className="text-center my-16 text-xl">
                                        {t("pages.userProfile.end")}
                                    </div>
                                )}

                                <Pagination
                                    pageCount={pageCount}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
