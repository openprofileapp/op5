import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { apiBaseUrl } from "../../_common/scripts/domains.js";
import Metadata from "../../_common/components/Metadata.js";
import { Pagination } from "../../main/components/Pagination.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { DatasetItemType } from "../../../_common/types/template/dataset.type.js";
import { DropdownOptionsType } from "../../../_common/types/dropdown.type.js";
import { toast } from "../../_common/scripts/toast.js";

interface FlatRowItem {
    id: string;
    name: string;
    category?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export function flattenDatasetData(data: DropdownOptionsType): FlatRowItem[] {
    if (Array.isArray(data)) {
        return data.flatMap((item, idx) => {
            if (typeof item === "string" || typeof item === "number") {
                return { id: `item_${idx}_${item}`, name: String(item) };
            }
            if ("id" in item && "name" in item) {
                return {
                    id: String(item.id),
                    name: item.name,
                    category: item.category,
                };
            }
            return Object.entries(item).map(([k, v]) => ({ id: k, name: String(v) }));
        });
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Object.entries(data).flatMap(([categoryOrKey, val]) => {
        if (Array.isArray(val)) {
            return val.map((subItem, idx) => {
                if (typeof subItem === "string" || typeof subItem === "number") {
                    return { id: `item_${idx}_${subItem}`, name: String(subItem), category: categoryOrKey };
                }
                return {
                    id: String(subItem.id),
                    name: subItem.name,
                    category: subItem.category || categoryOrKey,
                };
            });
        }
        return { id: categoryOrKey, name: String(val) };
    });
}

export default function Datasets() {
    const { t, ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();
    const { dataEditorModal } = useModals();

    const query = searchParams.get("q") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [searchQuery, setSearchQuery] = useState(query);

    const [data, setData] = useState<DatasetItemType[]>([]);
    const [areDatasetsLoading, setAreDatasetsLoading] = useState(true);
    const [refetch, setRefetch] = useState(false);

    const [pageCount, setPageCount] = useState(0);

    const isInitialMount = useRef(true);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchQuery(query);
    }, [query]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== query) {
                setSearchParams(
                    (prev) => {
                        if (searchQuery) {
                            prev.set("q", searchQuery);
                        } else {
                            prev.delete("q");
                        }
                        prev.delete("page");
                        return prev;
                    },
                    { replace: true }
                );
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, query, setSearchParams]);

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

    useEffect(() => {
        const fetchDatasets = async () => {
            if (!window.session?.userId) return;

            if (isInitialMount.current || refetch) {
                setAreDatasetsLoading(true);
            }

            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates/datasets?q=${encodeURIComponent(query)}&page=${currentPage}`,
                    { credentials: "include" }
                );

                const responseData = await response.json();

                if (response.ok) {
                    setData(responseData.items || []);

                    setPageCount(responseData.pageCount || 1);
                } else {
                    toast.show(
                        `Failed to fetch datasets`, 
                        { 
                            subtext: `${responseData?.id || ""}${responseData?.id ? ": " : ""}${responseData?.message}`,
                            type: "error" 
                        }
                    );
                }
            } catch (err) {
                console.error("Failed to fetch datasets:", err);
            } finally {
                setAreDatasetsLoading(false);
                setRefetch(false);
                isInitialMount.current = false;
            }
        };

        fetchDatasets();
    }, [currentPage, query, refetch]);

    const handleDownloadJson = (e: React.MouseEvent, dataset: DatasetItemType) => {
        e.stopPropagation();

        const parsedData = typeof dataset.data === "string" 
            ? JSON.parse(dataset.data) 
            : dataset.data;

        const jsonString = JSON.stringify(parsedData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const downloadAnchor = document.createElement("a");
        downloadAnchor.href = url;
        downloadAnchor.download = `${dataset.label?.toLowerCase() || dataset.id}.json`;
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();

        downloadAnchor.remove();
        URL.revokeObjectURL(url);
    };

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata title="Your Datasets" />

            <div className="w-full px-4 md:px-9 py-2">
                <div className="my-6 text-xl font-bold text-left flex-4">
                    Your Datasets
                </div>

                <div className="flex flex-col md:flex-row gap-3 mb-6">
                    <fieldset className="fieldset flex-1">
                        <legend className="fieldset-legend">{t("words.Search")}</legend>
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1"></span>
                            <input
                                type="search"
                                placeholder={t("pages.datasets.searchDatasets")}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </label>
                    </fieldset>
                </div>

                {areDatasetsLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-38">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <div
                                key={index}
                                className="p-4 border rounded bg-base-100 h-38 border-base-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-2 gap-2">
                                        <div className="skeleton h-6 w-1/2 rounded"></div>
                                        <div className="skeleton h-6 w-6 rounded shrink-0"></div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="skeleton h-3.5 w-full rounded"></div>
                                        <div className="skeleton h-3.5 w-3/4 rounded"></div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-2 border-t border-base-300 flex justify-between items-center">
                                    <div className="skeleton h-3 w-20 rounded"></div>
                                    <div className="skeleton h-3 w-12 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={async () => {
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    const updatedDataset = await dataEditorModal.open();
                                    if (updatedDataset) {
                                        setRefetch(true);
                                    }
                                }}
                                className="cursor-pointer border-2 w-full h-38 border-dashed border-base-300 rounded flex items-center justify-center py-2 transition-colors text-sm opacity-70 hover:opacity-100"
                            >
                                <span className="font-nerdfont text-xl">
                                    
                                </span>
                            </button>

                            {data.map((d) => (
                                <div
                                    key={d.id}
                                    onClick={async () => {
                                        const updatedDataset = await dataEditorModal.open(d);
                                        if (updatedDataset) {
                                            setRefetch(true);
                                        }
                                    }}
                                    className="p-4 border rounded bg-base-100 h-38 border-base-300 flex flex-col justify-between cursor-pointer"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2 gap-2">
                                            <div className="flex gap-2 items-center truncate">
                                                <span className="font-bold text-lg truncate">{d.label || d.id}</span>
                                                {d.source === "official" && (
                                                    <span className="font-bold text-xs text-sub bg-base-200 border border-base-300 rounded px-2 py-1">
                                                        <span className="font-nerdfont leading-none mr-1"></span>
                                                        PUBLIC
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                className="h-7 w-7 rounded tooltip tooltip-accent"
                                                data-tip="Download"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownloadJson(e, d);
                                                }}
                                            >
                                                <span className="font-nerdfont text-lg cursor-pointer">
                                                    
                                                </span>
                                            </button>
                                        </div>
                                        {d.description && (
                                            <p className="text-sm text-sub line-clamp-2">{d.description}</p>
                                        )}
                                    </div>

                                    <div className="mt-4 pt-2 border-t border-base-300 text-xs text-sub flex justify-between items-center">
                                        <span>Used in {d.uses} fields</span>
                                        <span>
                                            {flattenDatasetData(
                                                typeof d.data === "string" ? JSON.parse(d.data) : d.data
                                            ).length} items
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {data.length === 0 && (
                            <div className="text-center py-12 text-sub text-base">
                                {t("pages.datasets.notFound")}
                            </div>
                        )}

                        {data.length > 0 && (
                            <>
                                {(currentPage === pageCount || currentPage === 1) && (
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
