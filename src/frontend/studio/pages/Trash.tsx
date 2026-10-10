import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { GetDraftCharacterItemType } from "../../../_common/types/characters/character.type.js";
import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { TypeableDropdownInput } from "../../_common/components/TypeableDropdownInput.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";
import CharacterCard from "../../_common/components/CharacterCard.js";
import { Pagination } from "../../main/components/Pagination.js";
import TemplateCard from "../../_common/components/TemplateCard.js";

type TabType = "characters" | "templates";

export default function Trash() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const sortBy = searchParams.get("sortBy") || "popularDesc";
    const currentPage = Math.max(
        1,
        parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const [activeTab, setActiveTab] = useState<TabType>("characters");

    const [characters, setCharacters] = useState<GetDraftCharacterItemType[]>([]);
    const [areCharactersLoading, setAreCharactersLoading] = useState(true);
    const [charactersPageCount, setCharactersPageCount] = useState(0);

    const [templates, setTemplates] = useState<GetTemplateItemType[]>([]);
    const [areTemplatesLoading, setAreTemplatesLoading] = useState(true);
    const [templatesPageCount, setTemplatesPageCount] = useState(0);

    const showCharactersTab =
        areCharactersLoading || characters.length > 0;

    const showTemplatesTab =
        areTemplatesLoading || templates.length > 0;

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
        if (!window.session.userId) {
            setCharacters([]);
            setCharactersPageCount(0);
            setAreCharactersLoading(false);
            return;
        }

        setAreCharactersLoading(true);

        try {
            const res = await fetch(
                `${apiBaseUrl}/v3/characters/drafts?owner=${window.session.userId}&q=${encodeURIComponent(query)}&sortBy=${sortBy}&page=${currentPage}&includeMedia=true&isTrash=true`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();

            setCharacters(json?.items || []);
            setCharactersPageCount(json?.pageCount ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setAreCharactersLoading(false);
        }
    }, [currentPage, query, sortBy]);

    const fetchTemplates = useCallback(async () => {
        if (!window.session.userId) {
            setTemplates([]);
            setTemplatesPageCount(0);
            setAreTemplatesLoading(false);
            return;
        }

        setAreTemplatesLoading(true);

        try {
            const res = await fetch(
                `${apiBaseUrl}/v3/templates/drafts?owner=${window.session.userId}&q=${encodeURIComponent(query)}&sortBy=${sortBy}&page=${currentPage}&includeMedia=true&isTrash=true`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();

            setTemplates(json?.items || []);
            setTemplatesPageCount(json?.pageCount ?? 0);
        } catch (err) {
            console.error(err);
        } finally {
            setAreTemplatesLoading(false);
        }
    }, [currentPage, query, sortBy]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchCharacters();
    }, [fetchCharacters]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchTemplates();
    }, [fetchTemplates]);

    useEffect(() => {
        if (areCharactersLoading || areTemplatesLoading) return;

        if (
            activeTab === "characters" &&
            characters.length === 0 &&
            templates.length > 0
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveTab("templates");
        } else if (
            activeTab === "templates" &&
            templates.length === 0 &&
            characters.length > 0
        ) {
            setActiveTab("characters");
        }
    }, [
        activeTab,
        characters,
        templates,
        areCharactersLoading,
        areTemplatesLoading,
    ]);

    if (!isTranslationReady) return null;

    const isEverythingEmpty =
        !areCharactersLoading &&
        !areTemplatesLoading &&
        characters.length === 0 &&
        templates.length === 0;

    return (
        <>
            <Metadata title="Trash" />

            <div className="w-full min-h-screen px-4 md:px-9 py-2">
                <div className="my-6 text-xl font-bold text-left">
                    Trash
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-2">
                    <fieldset className="fieldset flex-1">
                        <legend className="fieldset-legend">
                            {t("words.Search")}
                        </legend>

                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1">
                                
                            </span>

                            <input
                                type="search"
                                placeholder={t(
                                    "pages.userProfile.searchCharacters"
                                )}
                                value={query}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                            />

                            {query && (
                                <button
                                    type="button"
                                    className="w-4 h-4 font-nerdfont leading-none text-base cursor-pointer bg-base-100"
                                    onClick={() => handleSearchChange("")}
                                >
                                    
                                </button>
                            )}
                        </label>
                    </fieldset>

                    <fieldset className="fieldset md:w-64">
                        <legend className="fieldset-legend">
                            Filter
                        </legend>

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
                            onChange={(id) =>
                                handleSortChange(id as string)
                            }
                        />
                    </fieldset>
                </div>

                {isEverythingEmpty && (
                    <div className="text-center py-16 text-sub text-base">
                        {query.trim()
                            ? "No items found matching your search."
                            : "Your trash is empty."}
                    </div>
                )}

                {!isEverythingEmpty &&
                    (showCharactersTab || showTemplatesTab) && (
                        <div
                            role="tablist"
                            className="tabs tabs-border mb-6"
                        >
                            {showCharactersTab && (
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === "characters"}
                                    className={`tab ${
                                        activeTab === "characters"
                                            ? "tab-active"
                                            : ""
                                    }`}
                                    onClick={() => setActiveTab("characters")}
                                >
                                    Characters
                                </button>
                            )}

                            {showTemplatesTab && (
                                <button
                                    type="button"
                                    role="tab"
                                    aria-selected={activeTab === "templates"}
                                    className={`tab ${
                                        activeTab === "templates"
                                            ? "tab-active"
                                            : ""
                                    }`}
                                    onClick={() => setActiveTab("templates")}
                                >
                                    Templates
                                </button>
                            )}
                        </div>
                    )}

                {activeTab === "characters" && showCharactersTab && (
                    <>
                        {areCharactersLoading ? (
                            <div className="flex flex-wrap gap-4">
                                {Array.from({ length: 5 }).map(
                                    (_, index) => (
                                        <SkeletonCharacterCard
                                            key={index}
                                        />
                                    )
                                )}
                            </div>
                        ) : characters.length === 0 ? (
                            <div className="text-center py-12 text-sub text-base">
                                {query.trim()
                                    ? "No characters found matching your search."
                                    : "No characters in the trash."}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-4">
                                    {characters.map((character) => (
                                        <CharacterCard
                                            key={character.id}
                                            data={character}
                                            isTrash={true}
                                        />
                                    ))}
                                </div>

                                {currentPage === charactersPageCount && (
                                    <div className="text-center my-16 text-xl">
                                        {t("pages.userProfile.end")}
                                    </div>
                                )}

                                <Pagination
                                    pageCount={charactersPageCount}
                                    currentPage={currentPage}
                                    onPageChange={handlePageChange}
                                />
                            </>
                        )}
                    </>
                )}

                {activeTab === "templates" && showTemplatesTab && (
                    <>
                        {areTemplatesLoading ? (
                            <div className="flex flex-wrap gap-4">
                                {Array.from({ length: 5 }).map(
                                    (_, index) => (
                                        <SkeletonCharacterCard
                                            key={index}
                                        />
                                    )
                                )}
                            </div>
                        ) : templates.length === 0 ? (
                            <div className="text-center py-12 text-sub text-base">
                                {query.trim()
                                    ? "No templates found matching your search."
                                    : "No templates in the trash."}
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap gap-4">
                                    {templates.map((template) => (
                                        <TemplateCard
                                            key={template.id}
                                            data={template}
                                            isTrash={true}
                                        />
                                    ))}
                                </div>

                                {currentPage === templatesPageCount && (
                                    <div className="text-center my-16 text-xl">
                                        {t("pages.userProfile.end")}
                                    </div>
                                )}

                                <Pagination
                                    pageCount={templatesPageCount}
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
