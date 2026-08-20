import React, { useState } from "react";

interface PaginationProps {
    totalCount: number;
    currentPage: number;
    onPageChange: (page: number) => void;
}

export function Pagination({ 
    totalCount, 
    currentPage, 
    onPageChange,
}: PaginationProps) {
    const [jumpPage, setJumpPage] = useState("");

    const numericCount = Number(totalCount) || 0;
    const totalPages = Math.ceil(numericCount / 30);

    if (totalPages <= 1) return null;

    function changePage(newPage: number | string) {
        const pageNum = Number(newPage);
        if (!isNaN(pageNum)) {
            const clampedPage = Math.max(1, Math.min(pageNum, totalPages));
            onPageChange(clampedPage);
            
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }

    function handleJumpSubmit() {
        if (!jumpPage.trim()) return;
        const target = jumpPage;
        setJumpPage("");
        changePage(target);
    }

    function getPageNumbers() {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                start = 2;
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
                end = totalPages - 1;
            }

            pages.push(1);

            if (start > 2) {
                pages.push("...");
            }

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (end < totalPages - 1) {
                pages.push("...");
            }

            pages.push(totalPages);
        }
        return pages;
    }

    return (
        <div className="flex items-center justify-center mt-8 mb-6">
            <div className="join border border-base-300 rounded">
                <button
                    className="join-item btn font-nerdfont"
                    onClick={() => changePage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    
                </button>

                {getPageNumbers().map((page, index) =>
                    page === "..." ? (
                        <input
                            key={`ellipsis-${index}`}
                            className={`join-item btn btn-square text-center p-0 focus:outline-none focus:bg-base-200 ${
                                !jumpPage.trim() ? "font-nerdfont" : ""
                            }`}
                            placeholder="󰇘"
                            value={jumpPage}
                            onChange={(e) => setJumpPage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handleJumpSubmit();
                                    e.currentTarget.blur();
                                }
                            }}
                        />
                    ) : (
                        <input
                            key={`page-${page}`}
                            className="join-item btn btn-square"
                            type="radio"
                            aria-label={String(page)}
                            checked={currentPage === page}
                            onChange={() => changePage(page)}
                        />
                    )
                )}

                <button
                    className="join-item btn font-nerdfont"
                    onClick={() => changePage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    
                </button>
            </div>
        </div>
    );
}
