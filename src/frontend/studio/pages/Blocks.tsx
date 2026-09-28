import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import { apiBaseUrl, cdnBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { Pagination } from "../../main/components/Pagination.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";
import { BlockItemType } from "../../../_common/types/blocks/block.type.js";

export default function Blocks() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [pageCount, setPageCount] = useState(0);

    const [blocks, setBlocks] = useState<BlockItemType[]>([]);
    const [areBlocksLoading, setAreBlocksLoading] = useState(true);

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

    const fetchBlocks = useCallback(async () => {
        if (!window.session.userId) return;

        setAreBlocksLoading(true);

        try {
            // ADD DRAFT API AND SEPERATE TABLES
            const res = await fetch(
                `${apiBaseUrl}/v3/templates/blocks?q=${encodeURIComponent(query)}&page=${currentPage}`,
                { credentials: "include" }
            );

            if (!res.ok) return;

            const json = await res.json();
            setBlocks(json?.items || []);

            if (json?.pageCount !== undefined) {
                setPageCount(json.pageCount);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setAreBlocksLoading(false);
        }
    }, [currentPage, query]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchBlocks();
    }, [fetchBlocks]);

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata title="Your Blocks" />

            <div className="w-full min-h-screen px-4 md:px-9 py-2">
                <div className="my-6 text-xl font-bold text-left flex-4">
                    Your Blocks
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

                {areBlocksLoading ? (
                    <div className="flex flex-wrap gap-4">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <SkeletonCharacterCard
                                key={index}
                            />
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                            {blocks.map((item) => (
                                <button
                                    key={item.blockId}
                                    type="button"
                                    className="aspect-square w-full relative flex flex-col justify-between items-center p-4 bg-base-200 hover:bg-[#151515] border border-base-300 rounded cursor-pointer text-center group overflow-hidden"
                                >
                                    {item.source === "official" && (
                                        <div className="absolute top-1 left-1">
                                            <span className="flex gap-2 text-xs font-medium rounded-br items-center px-3 py-1.5">
                                                <span className="font-nerdfont leading-none text-sm">
                                                    󰏔
                                                </span>

                                                {formatNumber(item.uses || 0).short}
                                            </span>
                                        </div>
                                    )}

                                    <div className="flex flex-col items-center justify-center my-auto w-full">
                                        {item.icon && (
                                            <img
                                                className="h-18 w-18 object-contain"
                                                src={`${cdnBaseUrl}${item.icon}`}
                                                alt="icon"
                                            />
                                        )}

                                        <span className="text-base font-semibold mt-1">
                                            {item.label}
                                        </span>
                                        {item.description && (
                                            <span className="text-xs text-sub mt-1 line-clamp-4">
                                                {item.description}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {blocks.length === 0 && (
                            <div className="text-center py-12 text-sub text-base">
                                {t("pages.blocks.notFound")}
                            </div>
                        )}

                        {blocks.length > 0 && (
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
