import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client";

import Metadata from "../../../_common/components/Metadata.js";
import { useLocation, useSearchParams } from "react-router-dom";
import { Pagination } from "../../../_common/components/Pagination.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl, supportBaseUrl } from "../../../_common/scripts/domains.js";
import { NotificationInboxType, NotificationNameType } from "../../../../_common/types/notification.type.js";
import createNotificationBody from "../../../../_common/helpers/createNotificationBody.js";
import Mention from "../../../_common/components/Mention.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";
import { formatShortRelative } from "../../../_common/scripts/time.js";

function getNotificationsIcon(type: NotificationNameType) {
    switch (type) {
        case "WEBPUSH_SUBSCRIBE":
            return "You subscribed to push notifications";
        case "NEW_LIKE":
            return (<span className="text-accent"></span>);
        case "NEW_FOLLOW":
            return (<span className="text-info"></span>);
        case "NEW_MESSAGE":
            return "";
        case "FRIEND_REQUEST_SENT":
            return "";
        case "FRIEND_REQUEST_ACCEPTED":
            return "";
        case "CHATS_MILESTONE":
            return (<span className="text-premium">󰔸</span>);
        case "READS_MILESTONE":
            return (<span className="text-premium">󰔸</span>);
        case "SHARES_MILESTONE":
            return (<span className="text-premium">󰔸</span>);
        case "VIEWS_MILESTONE":
            return (<span className="text-premium">󰔸</span>);
        case "ADD_TO_COLLECTION":
            return (<span className="text-sub">󰌴</span>);
        case "PUBLISHED_CHARACTER":
            return (<span className="text-info"></span>);
        case "UPDATED_CHARACTER":
            return (<span className="text-info"></span>);
        case "REPORT_CREATED":
            return (<span className="text-accent"></span>);
        case "LOGIN":
            return (<span className="text-warning"></span>);
        case "GIFTED_PREMIUM":
            return (<span className="text-premium"></span>);
        case "ASSIGNED_STAFF":
            return (<span className="text-info"></span>);
        case "EARNED_AWARD":
            return (<span className="text-premium"></span>);
        case "ACCOUNT_VERIFIED":
            return (
                <a
                    className="text-xl font-nerdfont leading-none text-sub"
                    href={`${supportBaseUrl}/${window?.session?.locale ?? "en"}/article/verification`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <svg className="text-accent" width={22} height={22} viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" 
                        fill=""/>
                    </svg>
                </a>
            );
        case "PARTNER_PROGRAM":
            return (
                <svg className="relative top-0.25" height={19} viewBox="0 0 18 16.144" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.83422 1.20936C7.65852 0.176292 6.21814 -0.19492 4.51307 0.0957236C2.34727 0.465145 0.938517 1.69844 0.286808 3.7956C-0.364901 5.89277 0.0940405 7.70586 1.66363 9.23487C1.66363 9.23487 8.37767 15.8845 8.37767 15.8845C8.55253 16.0575 8.76261 16.1441 9.00789 16.1441C9.24477 16.1481 9.47281 16.0542 9.63812 15.8845C9.63812 15.8845 11.254 14.2838 11.254 14.2838C11.254 14.2838 8.82259 11.8524 8.82259 11.8524C8.64772 11.6776 8.56029 11.4666 8.56029 11.2195C8.56029 10.9725 8.64772 10.7615 8.82259 10.5866C8.98808 10.4152 9.21729 10.3203 9.4555 10.3243C9.70257 10.3243 9.91354 10.4118 10.0884 10.5866C10.0884 10.5866 12.526 13.0243 12.526 13.0243L13.5018 12.0574C13.5018 12.0574 11.0606 9.61444 11.0606 9.61444C10.8889 9.44909 10.7936 9.21987 10.7974 8.98153C10.7974 8.73445 10.8848 8.52348 11.0597 8.34862C11.2252 8.17724 11.4544 8.08224 11.6926 8.08632C11.9397 8.08632 12.1507 8.17375 12.3255 8.34861C12.3255 8.34861 14.7739 10.797 14.7739 10.797L15.7497 9.83018C15.7497 9.83018 13.0739 7.15352 13.0739 7.15352C12.153 6.23265 11.2322 6.23265 10.3113 7.15352C10.3113 7.15352 9.4161 8.04872 9.4161 8.04872C8.83243 8.63239 8.24846 8.92423 7.66419 8.92423C7.08052 8.92423 6.49654 8.6321 5.91227 8.04783C5.91227 8.04783 5.42618 7.56173 5.42618 7.56173C4.58886 6.72441 4.5823 5.8871 5.40648 5.04979C5.40648 5.04979 8.83422 1.20936 8.83422 1.20936ZM16.9806 8.52787C18.0214 7.15523 18.2652 5.58265 17.712 3.81015C17.0597 1.72134 15.6554 0.490727 13.4992 0.118322C13.0814 0.0461086 12.6797 0.0135828 12.2942 0.0207446C12.2942 0.0207446 6.72693 6.26032 6.72693 6.26032L6.69202 6.29613C6.69202 6.29613 7.17811 6.78223 7.17811 6.78223C7.3118 6.91651 7.47383 6.98365 7.66421 6.98365C7.8471 6.9865 8.02303 6.9136 8.15031 6.78223C8.15031 6.78223 9.04551 5.88702 9.04551 5.88702C9.77659 5.15594 10.659 4.7904 11.6926 4.7904C12.7263 4.7904 13.6087 5.15594 14.3398 5.88702C14.3398 5.88702 16.9806 8.52787 16.9806 8.52787Z" fill="var(--color-accent)" transform="scale(1 1)" />
                </svg>
            );
        default:
            return "󰂚";
    }
}

export default function Notifications() {
    const { t, ready: isTranslationReady } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchQuery, setSearchQuery] = useState(query);

    const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [notifications, setNotifications] = useState<NotificationInboxType[]>([]);
    const [currentPage, setCurrentPage] = useState(
        parseInt(searchParams.get("page") || "1")
    );
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy"));
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [count, setCount] = useState(0);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const [, setTick] = useState(0);

    useEffect(() => {
        const interval = window.setInterval(() => {
            setTick((tick) => tick + 1);
        }, 1000);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        const pageParam = parseInt(searchParams.get("page") || "1");

        if (pageParam !== currentPage) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentPage(pageParam);
            setNextOffset(null);
        }
    }, [currentPage, searchParams]);

    const handlePageChange = (page: number) => {
        setLoading(true);
        setNotifications([]);
        setCount(0);
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
        setLoading(true);
        setNotifications([]);
        setCount(0);
        setSortBy(newSortBy);
        handlePageChange(1);
        setNextOffset(null);
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSearchQuery(query);
    }, [query]);

    useEffect(() => {
        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, []);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            const trimmedQuery = value.trim();

            setSearchParams(
                (previousParams) => {
                    const params = new URLSearchParams(previousParams);

                    if (trimmedQuery) {
                        params.set("q", trimmedQuery);
                    } else {
                        params.delete("q");
                    }

                    params.delete("page");

                    return params;
                },
                { replace: true },
            );

            setLoading(true);
            setNotifications([]);
            setCount(0);
            setCurrentPage(1);
            setNextOffset(null);
        }, 300);
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchNotifications = async () => {
            setLoading(true);

            try {
                const params = new URLSearchParams({
                    sortBy: sortBy || "",
                    page: currentPage.toString(),
                });

                if (query) {
                    params.set("q", query);
                }

                if (nextOffset !== null) {
                    params.set("offset", nextOffset.toString());
                }

                const res = await fetch(
                    `${apiBaseUrl}/v3/notifications/inbox?${params.toString()}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if (!res.ok) {
                    throw new Error(
                        `Failed to fetch notifications: ${res.status}`
                    );
                }

                const data = await res.json();

                if (controller.signal.aborted) return;

                setNotifications(data.items || []);
                setCount(data.pages || 0);
                setUnreadCount(data.unreadCount || 0);

                if (data.nextOffset !== undefined) {
                    setNextOffset(data.nextOffset);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") {
                    return;
                }

                console.error(err);

                if (!controller.signal.aborted) {
                    setNotifications([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        void fetchNotifications();

        return () => controller.abort();
    }, [location.pathname, currentPage, sortBy, nextOffset, query]);

    const unreadNotifications = notifications.filter(
        notification => !notification.isRead
    );

    const readNotifications = notifications.filter(
        notification => notification.isRead
    );

    const renderNotification = (
        notification: NotificationInboxType,
        index: number,
        groupLength: number
    ) => {
        const isFirst = index === 0;
        const isLast = index === groupLength - 1;

        const data = notification.data;

        return (
            <div
                key={`${notification.type}-${notification.sentDate}-${index}`}
                className={`
                    text-base w-full min-h-16
                    border-b border-base-300 last:border-b-0
                    p-3 transition-colors flex items-center gap-3
                    ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                    ${isFirst ? "rounded-t-lg" : ""}
                    ${isLast ? "rounded-b-lg" : ""}
                    ${!notification.isRead ? "font-medium" : ""}
                    ${!notification.isRead ? "border-l-8 border-l-accent" : "border-l-0"}
                `}
            >
                <span className="flex items-center justify-center text-2xl h-8 w-8 font-nerdfont leading-none">
                    {getNotificationsIcon(notification.type)}
                </span>

                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5 break-words [overflow-wrap:anywhere]">
                    {createNotificationBody(notification.type)
                        ?.split(/(\{SOURCE\}|\{TARGET\}|\{COUNT\}|\{COLLECTION\}|\{LOCATION\}|\{AWARD\})/g)
                        .map((part, partIndex) => {
                            if (part === "{SOURCE}") {
                                return (
                                    <span key={partIndex}>
                                        {data.source?.id === window.session?.userId ? (
                                            "You"
                                        ) : (
                                            <Mention
                                                data={data.source as WhatIsType}
                                                isNotification={true}
                                            />
                                        )}
                                    </span>
                                );
                            }

                            if (part === "{TARGET}") {
                                return (
                                    <span key={partIndex}>
                                        {data.target?.id === window.session?.userId ? (
                                            notification.type.toLowerCase().includes("milestone")
                                                ? "Your user profile"
                                                : "you"
                                        ) : (
                                            <Mention
                                                data={data.target as WhatIsType}
                                                isNotification={true}
                                            />
                                        )}
                                    </span>
                                );
                            }

                            if (part === "{COLLECTION}") {
                                return (
                                    <Mention
                                        key={partIndex}
                                        data={data.collection as WhatIsType}
                                        isNotification={true}
                                    />
                                );
                            }

                            if (part === "{COUNT}") {
                                let text = data.count || "0";

                                if (notification.type === "GIFTED_PREMIUM") {
                                    if (data.count === -1) {
                                        text = `lifetime`
                                    } else {
                                        text = `${data.count} month${data.count === 1 ? "" : "s"}`
                                    }
                                }

                                return (
                                    <span
                                        key={partIndex}
                                    >
                                        {text}
                                    </span>
                                );
                            }

                            if (part === "{LOCATION}") {
                                return (
                                    <span
                                        key={partIndex}
                                        className="mx-1.5"
                                    >
                                        {data.geoIp?.city}
                                        {data.geoIp?.city ? ", " : ""}
                                        {data.geoIp?.state}
                                        {data.geoIp?.state ? ", " : ""}
                                        {data.geoIp?.country}
                                    </span>
                                );
                            }

                            if (part === "{AWARD}") {
                                return (
                                    <span
                                        key={partIndex}
                                    >
                                        {data.award?.toLowerCase()}
                                    </span>
                                );
                            }

                            return part;
                        })}
                </div>

                <div className="shrink-0 whitespace-nowrap text-xs text-sub sm:text-sm">
                    {formatShortRelative(notification.sentDate)}
                </div>
            </div>
        );
    };

    const renderNotificationGroup = (
        items: NotificationInboxType[]
    ) => {
        if (items.length === 0) {
            return null;
        }

        return (
            <div className="w-full rounded-lg border border-base-300">
                {items.map((notification, index) =>
                    renderNotification(notification, index, items.length)
                )}
            </div>
        );
    };

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title="Notifications"
                allowIndex={false}
            />

            <div className="px-4 py-4 md:px-14">
                <div className="flex flex-col gap-3 px-0 mb-4 md:flex-row md:items-center md:mb-0">
                    <div className="mt-4 mb-2 text-left text-xl font-bold md:mb-6 md:flex-4">
                        Notifications

                        {unreadCount > 0 && (
                            <span className="ml-3 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-accent px-2 text-sm font-semibold text-white">
                                {formatNumber(unreadCount).string}
                            </span>
                        )}
                    </div>

                    <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap md:w-auto md:flex-4 md:flex-nowrap">
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                className="btn btn-accent l-2 w-full shrink-0 text-sm font-normal sm:w-auto"
                                onClick={() => {
                                    // CALL READ API HERE
                                }}
                            >
                                Mark all as read
                            </button>
                        )}

                        <div className="w-full min-w-0 flex-1">
                            <label className="input mb-0 flex w-full">
                                <span className="mr-1 font-nerdfont text-base">
                                    
                                </span>

                                <input
                                    type="search"
                                    className="w-full min-w-0"
                                    placeholder="User, character, collection..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                />

                                {searchQuery && (
                                    <button
                                        type="button"
                                        className="h-4 w-4 cursor-pointer bg-base-100 font-nerdfont text-base leading-none"
                                        onClick={() => handleSearchChange("")}
                                    >
                                        
                                    </button>
                                )}
                            </label>
                        </div>

                        <div className="w-full shrink-0 sm:w-auto">
                            <TypeableDropdownInput
                                value={sortBy || ""}
                                options={[
                                    { id: "", name: "All" },
                                    { id: "NEW_LIKE", name: "Likes" },
                                    { id: "NEW_FOLLOW", name: "Follows" },
                                    { id: "ADD_TO_COLLECTION", name: "Added to Collections" },
                                    { id: "VIEWS_MILESTONE", name: "View Milestones" },
                                    { id: "READS_MILESTONE", name: "Read Milestones" },
                                    { id: "SHARES_MILESTONE", name: "Share Milestones" },
                                    { id: "EARNED_AWARD", name: "Earned Awards" },
                                    { id: "GIFTED_PREMIUM", name: "Premium Subscription Gifts" },
                                    { id: "LOGIN", name: "Login Attempts" }
                                ]}
                                placeholder="Filter Results"
                                typeable={false}
                                onChange={(id) => handleSortChange(id as string)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {loading ? (
                        <div className="w-full overflow-hidden rounded-lg border border-base-300">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`
                                        flex min-h-16 items-center gap-3
                                        border-b border-base-300
                                        p-3 last:border-b-0
                                        ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                                    `}
                                >
                                    <div className="h-8 w-8 shrink-0 skeleton brightness-250 rounded-full bg-base-300" />

                                    <div className="h-6 flex-1 skeleton brightness-250 rounded bg-base-300" />

                                    <div className="h-6 w-32 shrink-0 skeleton brightness-250 rounded bg-base-300" />
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-sub flex flex-col gap-8 items-center justify-center w-full h-128 rounded-lg border border-base-300">
                            <div className="font-nerdfont leading-none text-6xl">
                                
                            </div>

                            Nothing to see here...
                        </div>
                    ) : (
                        <>
                            {renderNotificationGroup(unreadNotifications)}

                            {unreadNotifications.length > 0 &&
                                readNotifications.length > 0 && (
                                    <div className="flex items-center gap-4 py-2">
                                        <div className="h-px flex-1 bg-base-300" />

                                        <span className="text-xs font-semibold uppercase tracking-wider text-sub whitespace-nowrap">
                                            Older Notifications
                                        </span>

                                        <div className="h-px flex-1 bg-base-300" />
                                    </div>
                                )}

                            {renderNotificationGroup(readNotifications)}
                        </>
                    )}
                </div>

                <Pagination
                    pageCount={count}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </>
    );
}
