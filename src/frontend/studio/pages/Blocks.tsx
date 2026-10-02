/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import { apiBaseUrl, cdnBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { Pagination } from "../../main/components/Pagination.js";
import SkeletonCharacterCard from "../../_common/components/SkeletonCharacterCard.js";
import { BlockItemType } from "../../../_common/types/blocks/block.type.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { NewBlockType } from "../components/modals/NewBlockModal.js";
import { toast } from "../../_common/scripts/toast.js";
import AssetContextMenu from "../components/AssetContextMenu.js";

export default function Blocks() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const { newBlockModal } = useModals();

    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1", 10);

    const [pageCount, setPageCount] = useState(0);

    const [blocks, setBlocks] = useState<BlockItemType[]>([]);
    const [areBlocksLoading, setAreBlocksLoading] = useState(true);

    const [hiddenBlocks, setHiddenBlocks] = useState<BlockItemType[]>([]);

    const hideBlock = (blockId: string) => {
        // @ts-ignore
        setHiddenBlocks((prev) => [...prev, blockId]);
    };

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
                `${apiBaseUrl}/v3/blocks/drafts?q=${encodeURIComponent(query)}&page=${currentPage}`,
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

    const handleAddBlock = async (
        incoming: NewBlockType
    ): Promise<boolean> => {
        let json;

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/blocks/insert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        // @ts-ignore
                        type: incoming?.type,
                        icon: incoming?.icon,
                        label: incoming?.label,
                        description: incoming?.description,
                        // @ts-ignore
                        tags: incoming?.tags
                    }),
                }
            );

            json = await response.json();

            if (!response.ok) {
                toast.show(
                    "Failed to create block",
                    {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    }
                );

                return false;
            }
        } catch (error) {
            console.error("Failed to create block:", error);

            toast.show(
                "Failed to create block",
                {
                    subtext: String(error),
                    type: "error",
                }
            );

            return false;
        }

        navigate(`/block/${json.id}`);

        return true;
    };

    const handleUpdateBlock = async (
        blockId: string,
        incoming: NewBlockType
    ): Promise<boolean> => {
        let json;

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/blocks/${blockId}/update`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        data: {
                            ...incoming,
                            displayName: incoming.label,
                            about: incoming.description,
                            // @ts-ignore
                            categoryType: incoming.categoryType,
                        },
                    }),
                }
            );

            json = await response.json();

            if (!response.ok) {
                toast.show("Failed to save block", {
                    subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                    type: "error",
                });

                return false;
            }

            // @ts-ignore
            setBlocks((prev) =>
                prev.map((block) =>
                    block.blockId === blockId
                        ? {
                            ...block,
                            ...incoming,
                            displayName: incoming.label,
                            about: incoming.description,
                        }
                        : block
                )
            );

            return true;
        } catch (error) {
            console.error("Failed to save block:", error);

            toast.show("Failed to save block", {
                subtext: String(error),
                type: "error",
            });

            return false;
        }
    };

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
                            <button
                                type="button"
                                onClick={() => {
                                    // @ts-ignore
                                    newBlockModal.open({
                                        onAddBlock: handleAddBlock,
                                        skipSelect: true
                                    });
                                }}
                                className="cursor-pointer border-2 aspect-square min-h-[160px] border-dashed border-base-300 rounded flex items-center justify-center py-3 transition-colors text-sm opacity-70 hover:opacity-100"
                            >
                                <span className="font-nerdfont text-3xl">
                                    
                                </span>
                            </button>

                            {blocks
                                // @ts-ignore
                                .filter((data) => !hiddenBlocks.includes(data?.blockId))
                                .map((data) => {
                                const handleContextMenu = (e: React.MouseEvent) => {
                                    e.preventDefault();

                                    const popover = document.getElementById(
                                        `block-${data.blockId}`
                                    ) as HTMLElement | null;

                                    if (!popover) return;

                                    popover.showPopover();

                                    requestAnimationFrame(() => {
                                        const rect = popover.getBoundingClientRect();

                                        popover.style.left = `${Math.min(
                                            e.clientX,
                                            window.innerWidth - rect.width - 8
                                        )}px`;

                                        popover.style.top = `${Math.min(
                                            e.clientY,
                                            window.innerHeight - rect.height - 8
                                        )}px`;
                                    });
                                };

                                return (
                                    <>
                                         <AssetContextMenu
                                            data={data}
                                            onChange={handleUpdateBlock}
                                            onDelete={() => hideBlock(data.blockId)}
                                        />

                                        <Link
                                            key={data.blockId}
                                            to={`/block/${data.blockId}`}
                                            type="button"
                                            className="aspect-square w-full relative flex flex-col justify-between items-center p-4 bg-base-200 hover:bg-[#151515] border border-base-300 rounded cursor-pointer text-center group overflow-hidden"
                                            id={`block-${data.blockId}`}
                                            onContextMenu={handleContextMenu}
                                        >
                                            {data.source === "official" && (
                                                <div className="absolute top-1 left-1">
                                                    <span className="flex gap-2 text-xs font-medium rounded-br items-center px-3 py-1.5">
                                                        <span className="font-nerdfont leading-none text-sm">
                                                            󰏔
                                                        </span>

                                                        {formatNumber(data.uses || 0).short}
                                                    </span>
                                                </div>
                                            )}

                                            <div className="flex flex-col items-center justify-center my-auto w-full">
                                                {data.icon && (
                                                    <img
                                                        className="h-16 w-16 object-contain rounded"
                                                        src={
                                                            data.icon?.startsWith("data:") ||
                                                            data.icon?.startsWith("http")
                                                                ? data.icon
                                                                : `${cdnBaseUrl}${data.icon}`
                                                        }
                                                        alt="icon"
                                                    />
                                                )}

                                                <span className="text-base font-semibold mt-3">
                                                    {data.displayName || data.blockId}
                                                </span>
                                                {data.about && (
                                                    <span className="text-xs text-sub mt-1 line-clamp-4">
                                                        {data.about}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>
                                    </>
                                )
                            })}
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
