/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";

import LoginModal from "../../_common/components/modals/LoginModal.js";
import { toast } from "../../_common/scripts/toast.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";

import { apiBaseUrl, authBaseUrl, cdnBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { ThemesType, applyTheme, themes } from "../../_common/scripts/themes.js";
import ThemeOption from "../../_common/components/ThemeOption.js";
import { cookie } from "../../_common/scripts/cookies.js";

export default function NavbarUser() {
    const { pathname } = useLocation();

    const [user, setUser] = useState<GetUserItemType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    const [accounts, setAccounts] = useState<GetUserItemType[]>([]);
    const [isAccountsLoading, setIsAccountsLoading] = useState(true);

    const accountDropdownRef = useRef<HTMLUListElement>(null);

    const [currentTheme, setCurrentTheme] = useState<ThemesType>(() => {
        const savedTheme = cookie.get("theme");
        return themes.find(theme => theme.id === savedTheme)
            ?? themes.find(theme => theme.id === "dark")!;
    });

    const closeContextMenu = useCallback(() => {
        setIsContextMenuOpen(false);

        const menu = accountDropdownRef.current;

        if (menu?.matches(":popover-open")) {
            menu.hidePopover();
        }
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = accountDropdownRef.current;

            if (!menu || !menu.matches(":popover-open")) return;

            const button = document.querySelector(
                '[popovertarget="account-dropdown"]'
            );

            if (
                menu.contains(e.target as Node) ||
                button?.contains(e.target as Node)
            ) {
                return;
            }

            closeContextMenu();
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeContextMenu]);

    useEffect(() => {
        closeContextMenu();
    }, [pathname, closeContextMenu]);

    const checkCollectionMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsContextMenuFlipped(spaceRight < submenuWidth);
    };

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const fetchDelegatedAccounts = async () => {
            const delegatedIds = window.session?.delegatedAccounts || [];
            const currentUserId = window.session?.userId;

            setIsAccountsLoading(true);

            if (!currentUserId) {
                setAccounts([]);
                setIsAccountsLoading(false);
                return;
            }

            const uniqueIds = [
                ...new Set([currentUserId, ...delegatedIds])
            ];

            try {
                const baseUrl = `${apiBaseUrl}`;

                const requests = uniqueIds.map(async (userId) => {
                    try {
                        const res = await fetch(
                            `${baseUrl}/v3/users?id=${encodeURIComponent(userId)}`,
                            {
                                credentials: "include",
                                signal: controller.signal
                            }
                        );

                        if (!res.ok) return null;

                        const data = await res.json();

                        return (data?.items?.[0] ?? null) as GetUserItemType | null;
                    } catch (error) {
                        if (!controller.signal.aborted) {
                            console.error(
                                `Failed to fetch delegated account ${userId}:`,
                                error
                            );
                        }

                        return null;
                    }
                });

                const results = await Promise.all(requests);

                if (!mounted) return;

                setAccounts(
                    results.filter(
                        (account): account is GetUserItemType =>
                            account !== null
                    )
                );
            } catch (error) {
                if (!mounted) return;

                console.error("Failed to fetch delegated accounts:", error);
                setAccounts([]);
            } finally {
                if (mounted) {
                    setIsAccountsLoading(false);
                }
            }
        };

        fetchDelegatedAccounts();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        let mounted = true;

        const loadUserSession = async () => {
            setIsLoading(true);

            try {
                if (!window.session?.userId) {
                    if (mounted) setUser(null);
                    return;
                }

                const res = await fetch(
                    `${apiBaseUrl}/v3/users?id=${encodeURIComponent(window.session.userId)}`,
                    {
                        credentials: "include",
                        signal: controller.signal
                    }
                );

                if (!res.ok) {
                    if (mounted) setUser(null);
                    return;
                }

                const data = await res.json();

                if (mounted) {
                    setUser(data?.items?.[0] ?? null);
                }
            } catch (error) {
                if (!controller.signal.aborted && mounted) {
                    toast.show(`Failed to fetch session: ${error}`, {
                        type: "error"
                    });

                    setUser(null);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        loadUserSession();

        return () => {
            mounted = false;
            controller.abort();
        };
    }, []);

    const monthName = new Intl.DateTimeFormat("en-US", {
        month: "long",
    }).format(new Date()).toLowerCase();

    const hasPremium =
        window.session?.permissions?.array?.includes("PREMIUM_ACCESS") ?? false;

    const isFreeThisMonth = (theme: (typeof themes)[number]) =>
        // @ts-ignore
        theme?.freeMonth?.toLowerCase() === monthName;

    const freeThemes = themes.filter(
        // @ts-ignore
        theme => !theme?.premiumOnly
    );

    const freeThisMonthThemes = themes.filter(
        // @ts-ignore
        theme => theme?.premiumOnly && isFreeThisMonth(theme)
    );

    const premiumThemes = themes.filter(
        // @ts-ignore
        theme => theme?.premiumOnly && !isFreeThisMonth(theme)
    );

    return (
        <>
            <LoginModal />

            <div className="tooltip tooltip-bottom tooltip-accent">
                {isLoading ? (
                    <div className="skeleton h-9 w-9 rounded-full" />
                ) : user ? (
                    <>
                        <button
                            className={`relative avatar cursor-pointer border border-3 ${
                                hasPremium ? "border-premium" : "border-base-300"
                            } rounded-full`}
                            popoverTarget="account-dropdown"
                            style={{ anchorName: "--account-anchor" } as React.CSSProperties}
                        >
                            <div className="ring-primary ring-offset-base-100 h-8 w-8 rounded-full">
                                <img
                                    src={`${cdnBaseUrl}${user.avatar ?? window.config.metadata.assets.noImage}`}
                                />
                            </div>
                            {/* Add fanflairs here */}
                        </button>

                        {hasPremium && (
                            <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 font-nerdfont text-base text-premium pointer-events-none">
                                
                            </div>
                        )}

                        <div className="tooltip-content text-center">
                            {hasPremium && (
                                <div className="font-bold text-xs uppercase mb-1">
                                    Premium
                                </div>
                            )}
                            <div className="font-bold">
                                @{user.usernames?.[0]?.username ?? "Unknown"}
                            </div>
                        </div>
                    </>
                ) : (
                    <button
                        className="cursor-pointer tooltip tooltip-bottom tooltip-accent"
                        data-tip="Login"
                        data-guide="login"
                        onClick={() => {
                            const dialog = document.getElementById("login") as HTMLDialogElement | null;
                            dialog?.showModal();
                        }}
                    >
                        <span className="font-nerdfont text-[22px]">󰗼</span>
                    </button>
                )}
            </div>

            {user && (
                <ul
                    ref={accountDropdownRef}
                    className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50 duration-0"
                    popover="auto"
                    id="account-dropdown"
                    onToggle={(e) => {
                        setIsContextMenuOpen(e.currentTarget.matches(":popover-open"));
                    }}
                >
                    <li>
                        <Link
                            className="flex items-center justify-between gap-4"
                            to={`/user/${user.usernames?.find(u => u.isPrimary)?.username || user.id}`}
                            onClick={closeContextMenu}
                        >
                            View Profile
                            <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                󰈈
                            </span>
                        </Link>
                    </li>

                    <hr />

                    <li>
                        <a
                            className="flex items-center justify-between gap-4"
                            href={`${studioBaseUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={closeContextMenu}
                        >
                            <span>Go to Studio</span>
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </a>
                    </li>

                    <li>
                        <Link
                            className="flex items-center justify-between gap-4"
                            to={`/account/library`}
                            onClick={closeContextMenu}
                        >
                            Your Library
                            <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                󰪷
                            </span>
                        </Link>
                    </li>

                    {window.session.permissions.array.includes("PARTNER_ACCESS") && (
                        <li>
                            <Link
                                className="flex items-center justify-between gap-4"
                                to={`/account/partner`}
                                onClick={closeContextMenu}
                            >
                                Partner Stats
                                <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </Link>
                        </li>
                    )}

                    <hr />

                    <li
                        className="relative group"
                        onMouseEnter={checkCollectionMenuPosition}
                    >
                        <button className="flex items-center justify-between gap-4 w-full">
                            <span>Switch Account</span>
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </button>

                        <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                        <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                            {isAccountsLoading ? (
                                <li className="p-4">
                                    <div className="flex items-center justify-center">
                                        <span className="loading loading-spinner loading-sm"></span>
                                    </div>
                                </li>
                            ) : (
                                <>
                                    {(() => {
                                        const currentUserId = window.session?.userId;
                                        const hasMultipleAccounts = accounts.length > 1;

                                        const sortedAccounts = [...accounts].sort((a, b) => {
                                            if (a.id === currentUserId) return -1;
                                            if (b.id === currentUserId) return 1;

                                            const nameA = a.usernames?.[0]?.username || "";
                                            const nameB = b.usernames?.[0]?.username || "";

                                            return nameA.localeCompare(nameB, undefined, { sensitivity: "base" });
                                        });

                                        return sortedAccounts.map((account) => {
                                            const isCurrent = account.id === currentUserId;
                                            const username = account.usernames?.[0]?.username || "unknown";

                                            return (
                                                <React.Fragment key={account.id}>
                                                    <li>
                                                        <button
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                const currentPage = encodeURIComponent(window.location.href);

                                                                window.location.href = `${authBaseUrl}/switch/${account.id}?redirect=${currentPage}`;
                                                            }}
                                                        >
                                                            @{username}
                                                            <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                                                <img
                                                                    className="rounded-full translate-x-[2px]"
                                                                    src={`${cdnBaseUrl}${account.avatar || ""}`}
                                                                    alt={username}
                                                                />
                                                            </span>
                                                        </button>
                                                    </li>
                                                    {isCurrent && hasMultipleAccounts && <hr />}
                                                </React.Fragment>
                                            );
                                        });
                                    })()}

                                    <hr />

                                    {accounts.length < 8 && (
                                        <li>
                                            <button
                                                className="flex items-center justify-between gap-4"
                                                onClick={() => {
                                                    closeContextMenu();

                                                    const dialog = document.getElementById("login") as HTMLDialogElement | null;
                                                    dialog?.showModal();
                                                }}
                                            >
                                                Add Account
                                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                    
                                                </span>
                                            </button>
                                        </li>
                                    )}
                                </>
                            )}
                        </ul>
                    </li>

                    <li>
                        <Link
                            className="flex items-center justify-between gap-4"
                            to={`/account/settings`}
                            onClick={closeContextMenu}
                        >
                            Settings
                            <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                
                            </span>
                        </Link>
                    </li>

                    <hr />

                    <li
                        className="relative group"
                        onMouseEnter={checkCollectionMenuPosition}
                    >
                        <button className="flex items-center justify-between gap-4 w-full">
                            <span>Theme</span>

                            <span className="flex items-center gap-2">
                                <span className="text-xs text-sub">
                                    {themes.find(theme => theme.id === currentTheme.id)?.name}
                                </span>

                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </span>
                        </button>

                        <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                        <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] max-h-80 overflow-y-auto dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default hidden group-hover:block`}>
                            {freeThemes.map(theme => (
                                <li key={theme.id} className="px-1">
                                    <ThemeOption
                                        theme={theme}
                                        selected={currentTheme.id === theme.id}
                                        onSelect={async () => {
                                            await applyTheme(theme.id);
                                            setCurrentTheme(theme);
                                        }}
                                    />
                                </li>
                            ))}

                            {freeThisMonthThemes.length !== 0 && (
                                <div className="divider text-xs my-3">
                                    <span className="flex gap-2">
                                        Seasonal
                                    </span>
                                </div>
                            )}

                            {freeThisMonthThemes.map(theme => (
                                <li key={theme.id} className="px-1">
                                    <ThemeOption
                                        theme={theme}
                                        selected={currentTheme.id === theme.id}
                                        onSelect={async () => {
                                            await applyTheme(theme.id);
                                            setCurrentTheme(theme);
                                        }}
                                    />
                                </li>
                            ))}

                            <div className="divider text-xs my-3">
                                <span
                                    className="flex gap-2 tooltip"
                                    data-tip="Premium Feature"
                                >
                                    Premium
                                    <span className="font-nerdfont leading-none text-sm text-premium"></span>
                                </span>
                            </div>

                            {premiumThemes.map(theme => (
                                <li key={theme.id} className="px-1">
                                    <ThemeOption
                                        theme={theme}
                                        selected={currentTheme.id === theme.id}
                                        disabled={!hasPremium}
                                        onSelect={async () => {
                                            await applyTheme(theme.id);
                                            setCurrentTheme(theme);
                                        }}
                                    />
                                </li>
                            ))}
                        </ul>
                    </li>

                    <hr />

                    <li>
                        <button
                            className="flex items-center justify-between gap-4"
                            onClick={() => {
                                const currentPage = encodeURIComponent(window.location.href);

                                window.location.href = `${authBaseUrl}/logout?redirect=${currentPage}`;
                            }}
                        >
                            <span>Logout</span>
                            <span className="font-nerdfont text-[22px] flex h-6 w-4 leading-none items-center justify-center">
                                󰗽
                            </span>
                        </button>
                    </li>
                </ul>
            )}
        </>
    );
}
