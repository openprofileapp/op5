import React, { useState } from "react";

interface PaginationProps {
    pageCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ 
    pageCount, 
    currentPage, 
    onPageChange,
}: PaginationProps) {
    const [jumpInputs, setJumpInputs] = useState<{ [key: string]: string }>({});

    if (pageCount <= 1) return null;

    function changePage(newPage: number | string) {
        const pageNum = Number(newPage);
        if (!isNaN(pageNum)) {
            const clampedPage = Math.max(1, Math.min(pageNum, pageCount));
            onPageChange(clampedPage);
            if (typeof window !== "undefined") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        }
    }

    function handleJumpSubmit(key: string) {
        const val = jumpInputs[key];
        if (!val || !val.trim()) return;
        
        setJumpInputs((prev) => ({ ...prev, [key]: "" }));
        changePage(val);
    }

    function getPageNumbers() {
        const pages: (number | string)[] = [];

        if (pageCount <= 7) {
            for (let i = 1; i <= pageCount; i++) pages.push(i);
        } else {
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(pageCount - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= pageCount - 2) {
                start = pageCount - 3;
                end = pageCount - 1;
            }

            pages.push(1);

            if (start > 2) {
                pages.push("ellipsis-left");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < pageCount - 1) {
                pages.push("ellipsis-right");
            }

            pages.push(pageCount);
        }
        return pages;
    }

    return (
        <div className="flex items-center justify-center mt-8 mb-6">
            <div className="join border border-base-300 rounded">
                <button
                    type="button"
                    className="join-item btn font-nerdfont"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous Page"
                >
                    
                </button>

                {getPageNumbers().map((page) => {
                    if (typeof page === "string" && page.startsWith("ellipsis")) {
                        const val = jumpInputs[page] || "";
                        return (
                            <input
                                key={page}
                                className={`join-item btn btn-square text-center p-0 focus:outline-none focus:bg-base-200 ${
                                    !val.trim() ? "font-nerdfont" : ""
                                }`}
                                placeholder="󰇘"
                                value={val}
                                onChange={(e) =>
                                    setJumpInputs((prev) => ({
                                        ...prev,
                                        [page]: e.target.value,
                                    }))
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        handleJumpSubmit(page);
                                        e.currentTarget.blur();
                                    }
                                }}
                            />
                        );
                    }

                    const pageNum = Number(page);
                    const isActive = currentPage === pageNum;

                    return (
                        <button
                            key={`page-${pageNum}`}
                            type="button"
                            className={`join-item btn btn-square ${
                                isActive ? "btn-primary pointer-events-none" : ""
                            }`}
                            onClick={() => changePage(pageNum)}
                            aria-label={`Page ${pageNum}`}
                            aria-current={isActive ? "page" : undefined}
                        >
                            {pageNum}
                        </button>
                    );
                })}

                <button
                    type="button"
                    className="join-item btn font-nerdfont"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === pageCount}
                    aria-label="Next Page"
                >
                    
                </button>
            </div>
        </div>
    );
}
