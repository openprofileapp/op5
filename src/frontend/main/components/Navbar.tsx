/* eslint-disable react-hooks/set-state-in-effect */

import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCallback, useEffect, useState } from "react";

import isGateway from "../../_common/helpers/isGateway.js";

import CreateProjectModal from "./modals/CreateProjectModal.js";
import LoginModal from "./modals/LoginModal.js";
import MfaModal from "./modals/MfaModal.js";
import ReportModal from "./modals/ReportModal.js";
import { toast } from "../../_common/scripts/toast.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";
import CreateAssetModal from "./modals/CreateAssetModal.js";
import React from "react";

type Props = {
    isBannerPage?: boolean;
};

{/* DEVELOPER NEEDED: Only enable banner page on certain URLs or conditions */}
export default function Navbar({ isBannerPage = false }: Props) {
    const config = window.config;

    const { t, ready: isTranslationReady } = useTranslation();

    const [scrolled, setScrolled] = useState(false);
    const [user, setUser] = useState<GetUserItemType | null>();
    const [isLoading, setIsLoading] = useState(true);
    
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    // MAKE THESE AS IMPORTABLE MAYBE?
    function exampleTrigger() {
        toast.show("Example triggered!")
    }

    function formatDisplayNameToUrl(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9._]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

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
                const baseUrl = `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}`;

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
            } catch (error) {
                console.error("Failed to fetch delegated accounts:", error);
            }
        };

        fetchDelegatedAccounts();
    }, []);

    useEffect(() => {
        const loadUserSession = async () => {
            try {
                if (!window.session.userId) {
                    setUser(null);
                    return;
                }

                const res = await fetch(
                    `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v3/users?id=${window.session.userId}`,
                    { credentials: "include" }
                );

                if (!res.ok) {
                    setUser(null);
                    return;
                }

                const data = await res.json();

                setUser(data.items[0]);
            } catch (error) {
                toast.show(`Failed to fetch session: ${error}`, { type: "error" })
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserSession();
    }, []);
        
    useEffect(() => {
        if (!isBannerPage) {
            setScrolled(true);
            return;
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 16);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll);

        // DELETE LATER; ONLY CALL WHEN NEEDED
        // document.getElementById("mfa")?.showModal();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isBannerPage]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    
    const [query, setQuery] = useState(initialQuery);

    useEffect(() => {
        setQuery(searchParams.get('q') || '');
    }, [searchParams]);

    useEffect(() => {
        const handler = setTimeout(() => {
            const trimmed = query.trim();
            
            if (trimmed) {
                navigate(`/search?q=${encodeURIComponent(trimmed)}`);
            } else if (query === '' && window.location.pathname === '/search') {
                navigate('/');
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [query, navigate]);

    if (!isTranslationReady) return null;

    return (
        <>
            <LoginModal />
            <MfaModal />
            <CreateAssetModal />
            <CreateProjectModal />
            <ReportModal />

            <div className={`
                    sticky top-0 z-9999 hidden md:flex navbar items-center gap-4 px-16
                    ${
                        scrolled
                            ? "bg-base-100 shadow-sm border-b border-base-300"
                            : "bg-gradient-to-b from-base-100 via-base-100 to-base-100 border-b border-base-100"
                    }
                `}>
                <div className="flex flex-1 items-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img alt="OpenProfile wordmark"
                            src={`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}${config.metadata.assets.wordmark}`} 
                        />
                    </Link>

                    {window.location.hostname.startsWith('nightly') ? (
                        <div className="badge bg-nightly border border-nightly border-1 tooltip tooltip-bottom ml-3 p-3.5 flex justify-center rounded-sm">
                            Nightly
                            <div className="tooltip-content">
                                <div className="font-bold">{`v${config.metadata.version.full}`}</div>
                                <div className="text-xs">Released on {new Date(config.metadata.version.buildDate).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric'
                                })}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                            Beta
                            <div className="tooltip-content">
                                <div className="font-bold">{`v${config.metadata.version.semver}-${config.metadata.version.stage}`}</div>
                                <div className="text-xs">Released on {new Date(config.metadata.version.buildDate).toLocaleDateString('en-US', {
                                    month: '2-digit',
                                    day: '2-digit',
                                    year: 'numeric'
                                })}</div>
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-5 ml-10 text-sm">
                        <Link className="link-hover" to="/">Home</Link>
                        <Link className="link-hover" to="/trending">Trending</Link>
                        <Link className="link-hover" to="/popular">Popular</Link>
                        <Link className="link-hover" to="/recent">New & Updated</Link>

                        <div className="flex-none">
                            <ul className="menu menu-horizontal p-0">
                                <li
                                    className="hover:bg-transparent"
                                    onMouseEnter={(e) =>
                                        e.currentTarget.querySelector("details")?.setAttribute("open", "")
                                    }
                                    onMouseLeave={(e) =>
                                        e.currentTarget.querySelector("details")?.removeAttribute("open")
                                    }
                                >
                                <details>
                                    <summary className="hover:bg-transparent active:bg-transparent focus:bg-transparent pl-0">
                                        <Link className="link-hover" to="/browse">Browse</Link>
                                    </summary>

                                    <ul className="bg-base-100 rounded-lg bg-alt border border-alt p-4 flex flex-col gap-4 w-50">
                                        <Link className="link-hover" to="/browse/action">Action</Link>
                                        <Link className="link-hover" to="/browse/adventure">Adventure</Link>
                                        <Link className="link-hover" to="/browse/comedy">Comedy</Link>
                                        <Link className="link-hover" to="/browse/crime">Crime</Link>
                                        <Link className="link-hover" to="/browse/fantasy">Fantasy</Link>
                                        <Link className="link-hover" to="/browse/historical">Historical</Link>
                                        <Link className="link-hover" to="/browse/horror">Horror</Link>
                                        <Link className="link-hover" to="/browse/mystery">Mystery</Link>
                                        <Link className="link-hover" to="/browse/romance">Romance</Link>
                                        <Link className="link-hover" to="/browse/sci-fi">Sci-Fi</Link>
                                        <Link className="link-hover" to="/browse/sport">Sport</Link>
                                        <Link className="link-hover" to="/browse/war">War</Link>
                                    </ul>
                                </details>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-1 flex-col w-84">
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1"></span>
                            <input 
                                type="search" 
                                placeholder="Characters, franchises, topics..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </label>
                    </div>
                    {/* While typing, auto forward to search and display results, on clear, return home */}

                    {window.session.userId && (
                        <>
                            <button 
                                className="cursor-pointer tooltip tooltip-bottom tooltip-accent" 
                                data-tip="Create"
                                data-guide="create"
                                onClick={() => {
                                    const dialog = document.getElementById("create-asset") as HTMLDialogElement | null;
                                    dialog?.showModal();
                                }}
                                >
                                <span className="font-nerdfont text-xl"></span>
                            </button>

                            <button 
                                className="cursor-pointer tooltip tooltip-bottom tooltip-accent" 
                                data-tip="Report"
                                data-guide="report"
                                onClick={() => {
                                    const dialog = document.getElementById("report") as HTMLDialogElement | null;
                                    dialog?.showModal();
                                }}
                            >
                                <span className="font-nerdfont text-xl"></span>
                            </button>

                            <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent">
                                <span className="font-nerdfont text-xl">󰂚</span>
                                <div className="tooltip-content">
                                    <div className="font-bold">Notifications</div>
                                    <div className="text-xs">No new notifications!</div>
                                </div>
                            </button>
                            { /* Maybe clicking the bell should display last 5-10 notifications with a see all link */}
                        </>
                    )}

                    <div className={`tooltip tooltip-bottom tooltip-accent ${isLoading ? "loading" : ""}`}>
                        {user ? (
                            <>
                                <button 
                                    className="relative avatar cursor-pointer border border-3 border-premium rounded-full" 
                                    popoverTarget="account-dropdown" 
                                    style={{ anchorName: "--account-anchor" }}
                                >
                                    <div className="ring-primary ring-offset-base-100 h-8 w-8 rounded-full">
                                        <img src={`https://${config.domains.cdn}${user.avatar}`} />
                                    </div>
                                </button>
                                <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 font-nerdfont text-base text-premium pointer-events-none">
                                    
                                </div>
                                <div className="tooltip-content text-center">
                                    <div className="font-bold text-xs uppercase mb-1">Premium</div>
                                    <div className="font-bold">@{user.usernames[0].username}</div>
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
                </div>
        
                { /* <Link to="/premium">
                    <div className="badge text-black border-0 tooltip tooltip-bottom tooltip-info p-3.5 flex justify-center rounded-m bg-premium">
                        <span className="font-nerdfont text-base mr-1"></span>
                        Lifetime Premium
                        <div className="tooltip-content">
                            <div className="font-bold">You've got life-time premium!</div>
                            <div className="text-xs">Thanks for registering early</div>
                        </div>
                    </div>
                </Link>*/}

                { /* Maybe this can be a menu-hoz like for links */}
                {user && (
                    <ul
                        className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
                        popover="manual"
                        id="account-dropdown"
                    >
                        <li>
                            <Link 
                                className="flex items-center justify-between gap-4" 
                                to={`/${user.usernames[0].username}`}
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
                                href={`https://${isGateway() ? window.location.host : window.config.domains.studio}${isGateway() ? "/studio" : ""}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    closeContextMenu();
                                }}
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
                            >
                                Your Library
                                <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                    󰪷
                                </span>
                            </Link>
                        </li>

                        <li>
                            <Link 
                                className="flex items-center justify-between gap-4" 
                                to={`/account/partners`}
                            >
                                Partner Stats
                                <span className="font-nerdfont text-lg flex w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </Link>
                        </li>

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
                                {(() => {
                                    const currentUserId = window.session?.userId;
                                    
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
                                                            const authDomain = isGateway() ? window.location.host : window.config.domains.auth;
                                                            const authPath = isGateway() ? "/auth" : "";
                                                            const currentPage = encodeURIComponent(window.location.href);

                                                            window.location.href = `https://${authDomain}${authPath}/switch/${account.id}?redirect=${currentPage}`;
                                                        }}
                                                    >
                                                        @{username}
                                                        <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                                            <img 
                                                                className="rounded-full translate-x-[2px]"
                                                                src={`https://${config.domains.cdn}${account.avatar || ""}`}
                                                                alt={username}
                                                            />
                                                        </span>
                                                    </button>
                                                </li>
                                                {isCurrent && <hr />}
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
                                    exampleTrigger();
                                    closeContextMenu();
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
            </div>

            <div className={`md:hidden sticky top-0 z-9999 navbar

                ${
                    scrolled
                        ? "bg-base-100 shadow-sm border-b border-base-300"
                        : "bg-gradient-to-b from-base-100 via-base-100 to-base-100 border-b border-base-100"
                }`}
            >
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="cursor-pointer ml-2">
                            <span className="font-nerdfont text-2xl">󰍜</span>
                        </div>
                        <ul tabIndex={-1} className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow p-4 flex flex-col gap-3 w-50">
                            <Link className="link-hover" to="/">Home</Link>
                            <Link className="link-hover" to="/search">Search</Link>
                            <hr></hr>
                            <Link className="link-hover" to="/account/dashboard">Dashboard</Link>
                            <Link className="link-hover" to="/account/library">My library</Link>
                            <Link className="link-hover" to="/account/partners">Partner Stats</Link>
                        </ul>
                    </div>
                </div>
                <div className="navbar-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img alt="OpenProfile wordmark"
                            src={`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}${config.metadata.assets.wordmark}`} 
                        />
                    </Link>
                    <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                        Beta
                        <div className="tooltip-content">
                            <div className="font-bold">{`v${config.metadata.version.full}`}</div>
                            <div className="text-xs">Released on ??/??/2026</div>
                        </div>
                    </div>
                </div>
                <div className="navbar-end">
                    <button className="cursor-pointer mr-2">
                            <span className="font-nerdfont text-xl"></span>
                    </button>
                </div>
            </div>

            <div className="dock md:hidden border-t border-base-300 z-999">
                <button className="dock-active">
                    <div className="text-xl font-nerdfont text-white"></div>
                    <span className="dock-label text-white">Home</span>
                </button>

                <button>
                    <div className="text-xl font-nerdfont">󰕮</div>
                    <span className="dock-label">Dashboard</span>
                </button>

                <button className="bg-accent rounded-4xl" onClick={()=>document.getElementById("create-asset").showModal()}>
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">Create</span>
                </button>
                
                <button>
                    <div className="text-xl font-nerdfont">󰂚</div>
                    <span className="dock-label">Notifications</span>
                </button>
                
                <button>
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">My Profile</span>
                </button>
            </div>

            {/* DELETE THIS */}
            <dialog id="create-asset" className="modal">
                <div className="modal-box">
                    <form method="dialog">
                        <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                    </form>
                    <h3 className="font-bold text-2xl text-center">Create New Asset</h3>
                    <p className="py-4 text-sm text-center">What would you like to create?</p>

                    <div className="pt-4 flex gap-4 flex-col relative">
                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center">
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Collection (coming soon)</div>
                                <div className="text-sm">Personal list of various characters</div>
                            </div>
                        </div>

                        <div className="btn py-10 bg-accent text-white gap-6 items-center"
                            onClick={() => {
                                document.getElementById("create-asset")?.close();
                                document.getElementById("create-project")?.showModal();
                            }}
                        >
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Project</div>
                                <div className="text-sm">Official list and identity of characters</div>
                            </div>
                        </div>


                        <div className="btn btn-disabled py-10 bg-accent text-white gap-6 items-center"
                            onClick={() => {
                                // document.getElementById("create-asset")?.close();
                                // document.getElementById("create-project")?.showModal();
                            }}
                        >
                            <div className="ml-1 w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                󰈙
                            </div>
                            <div className="text-left w-full">
                                <div className="text-lg font-bold">Character</div>
                                <div className="text-sm">Individual character identity</div>
                            </div>
                        </div>
                    </div>     
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* create should only have avatar, banner, name, slug, and about; no tabs */}            
        </>
    );
}