import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";

import { GetUserItemType } from "../../_common/types/user.type.js";
import { apiBaseUrl, authBaseUrl, cdnBaseUrl, mainBaseUrl, studioBaseUrl } from "../_common/scripts/domains.js";
import React from "react";
import LoginModal from "../_common/components/modals/LoginModal.js";
import MfaModal from "../_common/components/modals/MfaModal.js";

export default function Layout() {
    const { t, ready: isTranslationReady } = useTranslation();

    const contentDetailsRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    const closeContextMenu = useCallback(() => {
        setIsContextMenuOpen(false);
        document
            .getElementById(`account-dropdown`)
            ?.hidePopover();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`account-dropdown`);

            if (!menu) return;

            if (menu.contains(e.target as Node)) {
                return;
            }

            closeContextMenu();
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [closeContextMenu]);

    const checkCollectionMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsContextMenuFlipped(spaceRight < submenuWidth);
    };

    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        const fetchDelegatedAccounts = async () => {
            const delegatedIds = window.session?.delegatedAccounts || [];
            
            if (delegatedIds.length === 0) {
                return;
            }

            try {
                const baseUrl = `${apiBaseUrl}`;

                const requests = delegatedIds.map(async (userId) => {
                    const res = await fetch(`${baseUrl}/v3/users?id=${userId}`, {
                        credentials: "include"
                    });

                    if (!res.ok) return null;

                    const data = await res.json();

                    return data?.items?.[0] ?? null;
                });

                const results = await Promise.all(requests);

                setAccounts(results.filter(Boolean));

                setIsLoading(false);
            } catch (error) {
                console.error("Failed to fetch delegated accounts:", error);
            }
        };

        fetchDelegatedAccounts();
    }, []);


    useEffect(() => {
        const drawer = document.getElementById("my-drawer");

        if (!drawer) return;

        const handleDrawerChange = () => {
            if (!drawer.checked && contentDetailsRef.current) {
                contentDetailsRef.current.open = false;
            }
        };

        drawer.addEventListener("change", handleDrawerChange);

        return () => {
            drawer.removeEventListener("change", handleDrawerChange);
        };
    }, []);

    if (!isTranslationReady) return null;
    
    return (
        <>
            <LoginModal />
            <MfaModal />

            <div className="drawer lg:drawer-open">
                <input 
                    id="my-drawer" 
                    type="checkbox" 
                    checked={drawerOpen}
                    onChange={(e) => setDrawerOpen(e.target.checked)}
                    className="drawer-toggle" 
                />
                <div className="drawer-content border-l border-base-300">
                    <nav className="navbar w-full bg-base-100 border-b border-base-300 justify-between">
                        <div className="flex items-center">
                            <label 
                                htmlFor="my-drawer" 
                                aria-label="open sidebar" 
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span className="flex h-8 w-4 leading-none items-center justify-center">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </label>
                            <div className="px-2"><span className="font-light">studio</span>.<span className="font-black">OpenProfile</span> <span className="text-xs text-sub">({window.config.metadata.version.semver}-alpha)</span></div>
                        </div>

                        <div className={`mr-3 tooltip tooltip-bottom tooltip-accent ${isLoading ? "loading" : ""}`}>
                            {window.session.user ? (
                                <>
                                    <button 
                                        className="relative avatar cursor-pointer border border-3 border-premium rounded-full" 
                                        popoverTarget="account-dropdown" 
                                        style={{ anchorName: "--account-anchor" }}
                                    >
                                        <div className="ring-primary ring-offset-base-100 h-8 w-8 rounded-full">
                                            <img src={`${cdnBaseUrl}${window.session.user.avatar}`} />
                                        </div>
                                        {/* Add fanflairs here */}
                                    </button>
                                    <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 font-nerdfont text-base text-premium pointer-events-none">
                                        
                                    </div>
                                    <div className="tooltip-content text-center">
                                        <div className="font-bold text-xs uppercase mb-1">Premium</div>
                                        <div className="font-bold">@{window.session.user.usernames[0].username}</div>
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

                        {window.session.user && (
                            <ul
                                className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50 duration-0"
                                popover="manual"
                                id="account-dropdown"
                            >
                                <li>
                                    <Link 
                                        className="flex items-center justify-between gap-4" 
                                        to={`${mainBaseUrl}/user/${window.session.user.usernames?.find(u => u.isPrimary)?.username || window.session.user.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Go to Profile
                                        <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                    </Link>
                                </li>

                                <hr />

                                {/* Show language and theme switcher when not logged in, else display in settings popup or smth */}

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
                                                                        src={`${cdnBaseUrl}${account.avatar}`}
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

                                        {/* Do not show if more or equal to 8 delegations */}
                                        <li>
                                            <button 
                                                className="flex items-center justify-between gap-4"
                                                onClick={() => {
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
                                    </ul>
                                </li>

                                <li>
                                    <Link 
                                        className="flex items-center justify-between gap-4" 
                                        to={`/account/settings`}
                                    >
                                        Settings
                                        <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                    </Link>
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
                    </nav>
                    <div>
                        <Outlet />
                    </div>
                </div>
                
                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                        <div className="menu w-full grow justify-between">
                            <ul>
                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Dashboard"
                                        to={"/dashboard"}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰕮
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Dashboard
                                        </span>
                                    </Link>
                                </li>

                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Analytics"
                                        to={"/analytics"}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󱕍
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Analytics
                                        </span>
                                    </Link>
                                </li>

                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Content"
                                        to={"/content"}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰪷
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Content
                                        </span>
                                    </Link>
                                </li>

                                <hr />

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Projects"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Projects
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Collections"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰉓
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Collections
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Templates"
                                        to={"/templates"}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󱔗
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Templates
                                        </span>
                                    </Link>
                                </li>

                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Datasets"
                                        to={"/datasets"}
                                    >
                                        <span className="font-nerdfont text-2xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰆼
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Datasets
                                        </span>
                                    </Link>
                                </li>

                                <hr className="hidden"/>

                                <li className="hidden">
                                    <details
                                        ref={contentDetailsRef}
                                        className="no-arrow tooltip tooltip-accent tooltip-right"
                                        data-tip="Content"
                                        onClick={(e) => {
                                            const drawer = document.getElementById("my-drawer");

                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-ignore
                                            if (drawer && !drawer.checked) {
                                                e.preventDefault();
                                            }
                                        }}
                                    >
                                        <summary className="flex gap-4">
                                            <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                
                                            </span>
                                            <span className="is-drawer-close:hidden text-sm">
                                                Marketplace
                                            </span>
                                            <span className="ml-auto font-nerdfont details-arrow is-drawer-close:hidden">
                                                
                                            </span>
                                        </summary>
                                        
                                        <div className="details-content">
                                            <div>
                                                <ul>
                                                    <li>
                                                        <button 
                                                            className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip="Content"
                                                            onClick={async () => {
                                                                // ACTION HERE
                                                            }}
                                                        >
                                                            <span className="flex h-8 items-center justify-center is-drawer-close:hidden text-sm">
                                                                Add-ons
                                                            </span>
                                                        </button>
                                                    </li>

                                                    <li>
                                                        <button 
                                                            className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip="Content"
                                                            onClick={async () => {
                                                                // ACTION HERE
                                                            }}
                                                        >
                                                            <span className="flex h-8 items-center justify-center is-drawer-close:hidden text-sm">
                                                                Themes
                                                            </span>
                                                        </button>
                                                    </li>

                                                    <li>
                                                        <button 
                                                            className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip="Content"
                                                            onClick={async () => {
                                                                // ACTION HERE
                                                            }}
                                                        >
                                                            <span className="flex h-8 items-center justify-center is-drawer-close:hidden text-sm">
                                                                Templates
                                                            </span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </details>
                                </li>
                            </ul>

                            <ul>
                                <li>
                                    <Link 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Trash"
                                        to={"/trash"}
                                    >
                                        <span className="font-nerdfont text-2xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰆴
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Trash
                                        </span>
                                    </Link>
                                </li>
                                
                                <hr />

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Feedback"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Feedback
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Resources"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Resources
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Settings"
                                        disabled={true}
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Settings
                                        </span>
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}