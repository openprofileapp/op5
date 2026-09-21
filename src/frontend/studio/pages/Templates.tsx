import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { apiBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { Pagination } from "../../main/components/Pagination.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";
import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import TemplateCard from "../../_common/components/TemplateCard.js";

export default function Templates() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [pageCount, setPageCount] = useState(0);

    const [templates, setTemplates] = useState<GetTemplateItemType[]>([]);
    const [areTemplatesLoading, setAreTemplatesLoading] = useState(true);

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

    const fetchtemplates = useCallback(async () => {
        if (!window.session.userId) return;

        setAreTemplatesLoading(true);

        try {
            const res = await fetch(
                `${apiBaseUrl}/v3/templates?owner=${window.session.userId}&q=${encodeURIComponent(query)}&page=${currentPage}`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();
            setTemplates(json?.items || []);

            if (json?.pageCount !== undefined) {
                setPageCount(json.pageCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAreTemplatesLoading(false);
        }
    }, [currentPage, query]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchtemplates();
    }, [fetchtemplates]);

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata title="Your Templates" />

            <div className="w-full min-h-screen px-4 md:px-9 py-2">
                <div className="my-6 text-xl font-bold text-left flex-4">
                    Your Templates
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
                </div>

                {areTemplatesLoading ? (
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
                            {templates.map((character) => (
                                <TemplateCard
                                    key={character.id}
                                    data={character}
                                />
                            ))}
                        </div>

                        {templates.length === 0 && (
                            <div className="text-center py-12 text-sub text-base">
                                {t("pages.templates.notFound")}
                            </div>
                        )}

                        {templates.length > 0 && (
                            <>
                                {
                                    ((currentPage === pageCount) ||
                                    (currentPage === 1)) 
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