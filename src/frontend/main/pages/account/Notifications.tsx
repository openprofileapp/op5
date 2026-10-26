import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../../_common/components/Metadata.js";
import { useLocation, useSearchParams } from "react-router-dom";
import { Pagination } from "../../../_common/components/Pagination.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { apiBaseUrl } from "../../../_common/scripts/domains.js";
import { NotificationInboxType, NotificationNameType } from "../../../../_common/types/notification.type.js";
import createNotificationBody from "../../../../_common/helpers/createNotificationBody.js";
import Mention from "../../../_common/components/Mention.js";
import { WhatIsType } from "../../../../_common/types/whatIs.type.js";
import { formatShortRelative } from "../../../_common/scripts/time.js";

function getNotificationsIcon(type: NotificationNameType) {
    switch(type) {
        case "WEBPUSH_SUBSCRIBE":
            return "You subscribed to push notifications"
        case "NEW_LIKE":
            return (<span className="text-accent"></span>)
        case "NEW_FOLLOW":
            return (<span className="text-info"></span>)
        case "NEW_MESSAGE":
            return ""
        case "FRIEND_REQUEST_SENT":
            return ""
        case "FRIEND_REQUEST_ACCEPTED":
            return ""
        case "CHATS_MILESTONE":
            return (<span className="text-premium">󰔸</span>)
        case "READS_MILESTONE":
            return (<span className="text-premium">󰔸</span>)
        case "SHARES_MILESTONE":
            return (<span className="text-premium">󰔸</span>)
        case "VIEWS_MILESTONE":
            return (<span className="text-premium">󰔸</span>)
        case "ADD_TO_COLLECTION":
            return (<span className="text-sub">󰌴</span>)
        case "PUBLISHED_CHARACTER":
            return (<span className="text-info"></span>)
        case "UPDATED_CHARACTER":
            return (<span className="text-info"></span>)
        case "REPORT_CREATED":
            return (<span className="text-accent"></span>)
        case "LOGIN":
            return (<span className="text-warning"></span>)
        default:
            return "󰂚"
    }
}

export default function Notifications() {
    const { t, ready: isTranslationReady } = useTranslation();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const [notifications, setNotifications] = useState<NotificationInboxType[]>([]);
    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [sortBy, setSortBy] = useState(searchParams.get("sortBy"));
    const [nextOffset, setNextOffset] = useState<number | null>(null);
    const [count, setCount] = useState(0);
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
        setSortBy(newSortBy);
        handlePageChange(1);
        setNextOffset(null);
    };

    useEffect(() => {
        const controller = new AbortController();

        const fetchNotifications = async () => {
            setLoading(true);

            try {
                const offset = nextOffset !== null ? `&offset=${nextOffset}` : "";

                const res = await fetch(
                    `${apiBaseUrl}/v3/notifications/inbox?sortBy=${sortBy || ""}&page=${currentPage}${offset}`,
                    {
                        credentials: "include",
                        signal: controller.signal,
                    }
                );

                if (!res.ok) {
                    throw new Error(`Failed to fetch notifications: ${res.status}`);
                }

                const data = await res.json();

                if (controller.signal.aborted) return;

                setNotifications(data.items || []);
                setCount(data.pages || 0);

                if (data.nextOffset !== undefined) {
                    setNextOffset(data.nextOffset);
                }
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

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
    }, [location.pathname, currentPage, sortBy, nextOffset]);

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title="Notifications"
                allowIndex={false}
            />

            <div className="px-4 py-4 md:px-14">
                <div className="px-0 flex flex-row gap-3">
                    <div className="mt-4 mb-6 text-xl font-bold text-left flex-4">
                        Notifications
                    </div>

                    <div className="flex-1 mt-2 mr-5">
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
                                { id: "LOGIN", name: "Login Attempts" }
                            ]}

                            placeholder="Filter Results"
                            typeable={false}
                            onChange={(id) => handleSortChange(id as string)}
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-4">
                    <div className="w-full rounded-lg border border-base-300">
                        {loading ? (
                            Array.from({ length: 9 }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`
                                        flex min-h-16 items-center gap-3 border-b border-base-300
                                        p-3 last:border-b-0
                                        ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                                    `}
                                >
                                    <div className="h-8 w-8 shrink-0 skeleton brightness-250 rounded-full bg-base-300" />

                                    <div className="h-6 flex-1 skeleton brightness-250 rounded bg-base-300" />

                                    <div className="h-6 w-32 shrink-0 skeleton brightness-250 rounded bg-base-300" />
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="text-sub flex flex-col gap-8 items-center justify-center w-full h-128">
                                <div className="font-nerdfont leading-none text-6xl">
                                    
                                </div>

                                Nothing to see here...
                            </div>
                        ) : (
                            notifications.map((notification, index) => {
                                const isFirst = index === 0;
                                const isLast = index === notifications.length - 1;

                                const data = notification.data;

                                return (
                                    <div
                                        key={`${notification.type}-${notification.sentDate}-${index}`}
                                        className={`
                                            text-base w-full min-h-16 border-b border-base-300 last:border-b-0
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

                                        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-y-1 break-words [overflow-wrap:anywhere]">
                                            {createNotificationBody(notification.type)
                                                ?.split(/(\{SOURCE\}|\{TARGET\}|\{COUNT\}|\{COLLECTION\}|\{LOCATION\})/g)
                                                .map((part, index) => {
                                                    if (part === "{SOURCE}") {
                                                        return (
                                                            <>
                                                                {data.source?.id === window.session?.userId ? (
                                                                    "You"
                                                                ) : (
                                                                    <Mention
                                                                        key={index}
                                                                        data={data.source as WhatIsType}
                                                                        isNotification={true}
                                                                    />
                                                                )}
                                                            </>
                                                        );
                                                    }

                                                    if (part === "{TARGET}") {
                                                        return (
                                                            <>
                                                                {data.target?.id === window.session?.userId ? (
                                                                    <>
                                                                        {notification.type.toLowerCase().includes("milestone") ? (
                                                                            "Your user profile"
                                                                        ) : (
                                                                            "you"
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Mention
                                                                        key={index}
                                                                        data={data.target as WhatIsType}
                                                                        isNotification={true}
                                                                    />
                                                                )}
                                                            </>
                                                        );
                                                    }

                                                    if (part === "{COLLECTION}") {
                                                        return (
                                                            <Mention
                                                                key={index}
                                                                data={data.collection as WhatIsType}
                                                                isNotification={true}
                                                            />
                                                        );
                                                    }

                                                    if (part === "{COUNT}") {
                                                        return (
                                                            <span className="mx-1.5">
                                                                {data.count || 0}
                                                            </span>
                                                        );
                                                    }

                                                    if (part === "{LOCATION}") {
                                                        return (
                                                            <span className="mx-1.5">
                                                                {data.geoIp?.city}
                                                                {data.geoIp?.city ? ", " : ""}
                                                                {data.geoIp?.state}
                                                                {data.geoIp?.state ? ", " : ""}
                                                                {data.geoIp?.country}
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
                            })
                        )}
                    </div>
                </div>

                <Pagination
                    pageCount={count}
                    currentPage={currentPage}
                    onPageChange={(page) => handlePageChange(page)}
                />
            </div>
        </>
    );
}
