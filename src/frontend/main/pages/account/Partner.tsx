import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";

import Metadata from "../../../_common/components/Metadata.js";
import {
    cdnBaseUrl,
    apiBaseUrl,
    mainBaseUrl
} from "../../../_common/scripts/domains.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";
import { InviteType } from "../../../../_common/types/invite.type.js";
import { toast } from "../../../_common/scripts/toast.js";
import { Pagination } from "../../../_common/components/Pagination.js";
import { formatShortRelative } from "../../../_common/scripts/time.js";

type PartnerUser = WhatIsType & {
    date?: string;
    createdDate?: string;
    code?: string;
    subscriptionType?: string;
};

type PartnerInvite = InviteType & {
    uses?: number;
    premiumUsers?: number;
    usersLast30Days?: string;
};

export default function Partner() {
    const { ready: isTranslationReady } = useTranslation();
    const [searchParams, setSearchParams] = useSearchParams();

    const initialPage = Math.max(
        1,
        Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const [isLoading, setIsLoading] = useState(true);
    const [isCopied, setIsCopied] = useState(false);

    const [currentPage, setCurrentPage] = useState(initialPage);
    const [totalPages, setTotalPages] = useState(1);

    const [users, setUsers] = useState<PartnerUser[]>([]);
    const [invites, setInvites] = useState<PartnerInvite[]>([]);

    const inviteCode = invites[0]?.code ?? "";

    // eslint-disable-next-line react-hooks/purity
    const [currentTime, setCurrentTime] = useState(Date.now());

    const registrations = invites.reduce(
        (total, invite) => total + Number(invite.uses ?? 0),
        0
    );

    const registrationsLast30Days = invites.reduce(
        (total, invite) => total + Number(invite.usersLast30Days ?? 0),
        0
    );

    const premiumUsers = invites.reduce(
        (total, invite) => total + Number(invite.premiumUsers ?? 0),
        0
    );

    const premiumPercentage =
        registrations > 0
            ? Math.min(
                  100,
                  Math.round((premiumUsers / registrations) * 100)
              )
            : 0;

    // DEVELOPER NEEDED: Replace value with auth API that retuns the earnings
    const earnings = 0;

    useEffect(() => {
        const interval = window.setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => {
            window.clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const pageParam = Math.max(
            1,
            Number.parseInt(searchParams.get("page") || "1", 10) || 1
        );

        if (pageParam !== currentPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(pageParam);
        }
    }, [searchParams, currentPage]);

    const handlePageChange = (page: number) => {
        const nextPage = Math.max(1, page);

        setCurrentPage(nextPage);

        setSearchParams(previous => {
            const params = new URLSearchParams(previous);

            if (nextPage === 1) {
                params.delete("page");
            } else {
                params.set("page", nextPage.toString());
            }

            return params;
        });
    };

    useEffect(() => {
        let isMounted = true;
        let controller: AbortController | null = null;

        const fetchPartnerData = async (showLoading = false) => {
            if (document.hidden) return;

            controller?.abort();
            controller = new AbortController();

            if (showLoading) {
                setIsLoading(true);
            }

            try {
                const params = new URLSearchParams({
                    includeUsers: "true",
                    page: currentPage.toString()
                });

                const res = await fetch(
                    `${apiBaseUrl}/v3/invites/owner/${window.session?.userId}?${params.toString()}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || "Failed to load partner data");
                }

                if (!isMounted) return;

                setInvites(data.invites ?? []);
                setUsers(data.users ?? []);

                setTotalPages(
                    Math.max(
                        1,
                        Number(
                            data.totalPages ??
                                (data.nextOffset != null
                                    ? currentPage + 1
                                    : currentPage)
                        )
                    )
                );
            } catch (error) {
                if (
                    error instanceof Error &&
                    error.name === "AbortError"
                ) {
                    return;
                }

                console.error("Failed to fetch partner data:", error);

                if (showLoading && isMounted) {
                    toast.show("Failed to load partner data", {
                        type: "error"
                    });
                }
            } finally {
                if (isMounted && showLoading) {
                    setIsLoading(false);
                }
            }
        };

        fetchPartnerData(true);

        const interval = window.setInterval(() => {
            fetchPartnerData();
        }, 30000); // 30 seconds

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchPartnerData();
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            isMounted = false;
            controller?.abort();

            window.clearInterval(interval);

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [currentPage]);

    const copyToClipboard = async (text: string) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);

            setIsCopied(true);

            toast.show("Invite link copied to clipboard", {
                type: "success"
            });

            window.setTimeout(() => {
                setIsCopied(false);
            }, 2000);
        } catch {
            toast.show("Failed to copy invite link", {
                type: "error"
            });
        }
    };

    const premiumBadge = (premium: string) => {
        if (!premium) {
            return <span className="text-sub">Not Subscribed</span>;
        }

        return (
            <span className="badge bg-premium text-[#1a1a1a]">
                {premium}
            </span>
        );
    };

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata 
                title="Partner Stats" 
                allowIndex={false} 
            />

            <div className="mt-14 md:mt-0 flex flex-col md:flex-row min-h-[calc(100vh-64px)]">
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-164 h-128 grid grid-cols-3 grid-rows-3 place-items-center text-center text-sm">
                        <div className="col-start-2 row-start-1 text-2xl whitespace-nowrap">
                            <span className="font-bold mr-3">
                                {inviteCode || "-"}
                            </span>

                            <span
                                className="tooltip tooltip-top tooltip-accent"
                                data-tip={
                                    isCopied
                                        ? "Copied!"
                                        : "Copy invite link"
                                }
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        copyToClipboard(
                                            `${mainBaseUrl}?invite=${inviteCode}`
                                        )
                                    }
                                    disabled={!inviteCode}
                                    className="cursor-pointer font-nerdfont disabled:opacity-50 w-4"
                                    aria-label="Copy invite link"
                                >
                                    {isCopied ? "" : "󰆏"}
                                </button>
                            </span>
                        </div>

                        <div className="col-start-1 row-start-2 font-bold flex flex-col gap-4">
                            <span className="text-base">
                                Registrations
                            </span>

                            <span className="text-2xl">
                                {registrations}
                            </span>

                            <span className="font-normal text-sub text-xs">
                                Last 30 Days: {registrationsLast30Days}
                            </span>
                        </div>

                        <div className="col-start-2 row-start-2 text-lg font-bold">
                            <div
                                className="absolute radial-progress text-[#272727] bg-alt"
                                style={
                                    {
                                        "--value": 100
                                    } as React.CSSProperties
                                }
                                aria-valuenow={100}
                                role="progressbar"
                            />

                            <div
                                className="radial-progress text-premium text-base"
                                style={
                                    {
                                        "--value": premiumPercentage
                                    } as React.CSSProperties
                                }
                                aria-valuenow={premiumPercentage}
                                role="progressbar"
                            >
                                {premiumPercentage}%
                            </div>
                        </div>

                        <div className="col-start-3 row-start-2 font-bold flex flex-col gap-4">
                            <span className="text-base">
                                Subscribed Users
                            </span>

                            <span className="text-2xl">
                                {premiumUsers}
                            </span>

                            <span className="font-normal text-sub text-xs">
                                Estimated Monthly: ${(premiumUsers * 0.25).toFixed(2)}
                            </span>
                        </div>

                        <div className="col-start-2 row-start-3 font-bold flex flex-col gap-4">
                            <span className="text-base">
                                Earnings
                            </span>

                            <span className="font-bold text-2xl">
                                ${earnings.toFixed(2)}
                            </span>

                            <span className="font-normal text-sub text-xs">
                                Lifetime: ${earnings.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-5 items-end justify-center h-full m-4 md:m-14">
                    <div className="font-bold text-lg w-full text-center mt-8 md:mt-0">
                        Registrations
                    </div>

                    {isLoading ? (
                        <div className="bg-alt flex items-center justify-center w-full h-132 md:w-148 rounded-lg border border-alt">
                            <span className="loading loading-spinner loading-lg" />
                            <span className="ml-3">Loading...</span>
                        </div>
                    ) : (
                        <div className="bg-alt overflow-auto w-full h-132 md:w-148 rounded-lg border border-alt">
                            <table className="table rounded-none">
                                <thead className="guide sticky top-0 z-10">
                                    <tr>
                                        <th className="text-left px-4">
                                            User
                                        </th>

                                        <th className="text-right px-2">
                                            Premium
                                        </th>

                                        <th className="text-right px-6">
                                            Date
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {users.map((user, index) => (
                                        <tr
                                            key={`${user.code ?? ""}-${user.id}`}
                                            className={`
                                                cursor-pointer transition-colors duration-150
                                                ${
                                                    index % 2 === 0
                                                        ? "bg-base-200 hover:bg-[#191919]"
                                                        : "bg-[#151515] hover:bg-[#181818]"
                                                }
                                            `}
                                        >
                                            <td className="px-4">
                                                <Link
                                                    to={`${mainBaseUrl}/user/${user.primaryUsername}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="avatar">
                                                            <div className="mask mask-circle h-12 w-12">
                                                                <img
                                                                    src={`${cdnBaseUrl}${user.avatar || window.config.metadata.assets.noImage}`}
                                                                    alt={`${user.displayName}'s avatar`}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div>
                                                            <div className="text-base font-bold hover:underline">
                                                                {user.displayName}
                                                            </div>

                                                            <span className="text-sm">
                                                                @{user.primaryUsername}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </td>

                                            <td className="text-right px-2 whitespace-nowrap">
                                                {premiumBadge(
                                                    user.subscriptionType as string
                                                )}
                                            </td>

                                            <td
                                                className="text-right px-6 whitespace-nowrap"
                                                data-current-time={currentTime}
                                            >
                                                {formatShortRelative(user.date ?? user.createdDate) ?? "—"}
                                            </td>
                                        </tr>
                                    ))}

                                    {users.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="text-center py-10 text-base-content/70"
                                            >
                                                Invite someone for them to appear here
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {users.length > 0 && totalPages > 1 && (
                                    <tfoot>
                                        <tr>
                                            <td
                                                colSpan={3}
                                                className="w-full px-0 py-4"
                                            >
                                                <div className="flex w-full justify-center">
                                                    <Pagination
                                                        pageCount={totalPages}
                                                        currentPage={currentPage}
                                                        onPageChange={handlePageChange}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
