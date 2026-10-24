/* eslint-disable react-hooks/set-state-in-effect */

import React, { useRef } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

import LoginModal from "../../_common/components/modals/LoginModal.js";
import MfaModal from "../../_common/components/modals/MfaModal.js";
import CreateAssetModal from "../../_common/components/modals/CreateAssetModal.js";

import { cdnBaseUrl, mainBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { recommendedTags } from "../../_common/scripts/tags.js";
import NavbarUser from "../../_common/components/NavbarUser.js";

export default function Navbar() {
    const { ready: isTranslationReady } = useTranslation();
    const location = useLocation();
    const { pathname } = location;

    const [scrolled, setScrolled] = useState(false);

    const isBannerPage = pathname === "/";
    const hideBottomBorder = isBannerPage && !window.session?.userId && !scrolled;

    const isActive = (url: string): boolean => {
        const target = new URL(url, window.location.origin);

        if (target.origin !== window.location.origin) {
            return false;
        }

        const normalize = (path: string) =>
            path.replace(/\/+$/, "") || "/";

        const currentPath = normalize(pathname);
        const targetPath = normalize(target.pathname);

        return targetPath === "/"
            ? currentPath === "/"
            : currentPath === targetPath ||
              currentPath.startsWith(`${targetPath}/`);
    };

    useEffect(() => {
        if (!isBannerPage) {
            setScrolled(true);
            return;
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 16);
        };

        handleScroll();

        window.addEventListener("scroll", handleScroll, {
            passive: true
        });

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isBannerPage]);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const rawQuery = pathname === "/search"
        ? searchParams.get("q") || ""
        : "";

    const [query, setQuery] = useState(rawQuery);

    const previousPathRef = useRef<string | null>(null);
    const searchOriginRef = useRef<string | null>(null);
    const isSearchEditingRef = useRef(false);

    useEffect(() => {
        if (location.pathname !== "/search") {
            previousPathRef.current =
                location.pathname + location.search + location.hash;
        }
    }, [location.pathname, location.search, location.hash]);

    useEffect(() => {
        if (!isSearchEditingRef.current) {
            setQuery(rawQuery);
        }
    }, [rawQuery]);

    const handleSearchChange = (value: string) => {
        isSearchEditingRef.current = true;
        setQuery(value);

        if (value.trim() && pathname !== "/search") {
            const from =
                previousPathRef.current ||
                location.pathname + location.search + location.hash;

            searchOriginRef.current = from;

            navigate("/search", {
                state: { from }
            });
        }
    };

    useEffect(() => {
        if (!isSearchEditingRef.current) return;

        const trimmed = query.trim();

        if (trimmed && pathname !== "/search") return;

        const handler = window.setTimeout(() => {
            if (trimmed) {
                const currentUrlQuery = searchParams.get("q") || "";

                const params = new URLSearchParams();
                params.set("q", trimmed);

                if (trimmed !== currentUrlQuery) {
                    navigate(`/search?${params.toString()}`, {
                        replace: true,
                        state: {
                            from:
                                location.state?.from ||
                                searchOriginRef.current ||
                                previousPathRef.current ||
                                "/"
                        }
                    });
                }
            } else if (pathname === "/search") {
                const returnTo =
                    location.state?.from ||
                    searchOriginRef.current ||
                    previousPathRef.current ||
                    "/";

                searchOriginRef.current = null;

                navigate(returnTo, {
                    replace: true
                });
            }

            isSearchEditingRef.current = false;
        }, 300);

        return () => window.clearTimeout(handler);
    }, [
        query,
        pathname,
        searchParams,
        navigate,
        location.state
    ]);

    if (!isTranslationReady) return null;

    return (
        <>
            <LoginModal />
            <MfaModal />
            <CreateAssetModal />

            <div className={`
                    sticky top-0 z-99 hidden md:flex navbar items-center gap-4 px-16
                    ${
                        scrolled
                            ? "bg-base-100 shadow-sm"
                            : "bg-gradient-to-b from-base-100 via-base-100 to-base-100"
                    }
                    ${
                        hideBottomBorder
                            ? "border-b border-transparent"
                            : "border-b border-base-300"
                    }
                `}>
                <div className="flex flex-1 items-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img
                            alt="OpenProfile wordmark"
                            src={`${cdnBaseUrl}${window.config.metadata.assets.wordmark}`}
                        />
                    </Link>

                    {window.location.hostname.startsWith("nightly") ? (
                        <div className="badge bg-nightly border border-nightly border-1 tooltip tooltip-bottom ml-3 p-3.5 flex justify-center rounded-sm">
                            Nightly
                            <div className="tooltip-content">
                                <div className="font-bold">
                                    {`v${window.config.metadata.version.full}`}
                                </div>
                                <div className="text-xs">
                                    Released on {new Date(window.config.metadata.version.buildDate).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                            Beta
                            <div className="tooltip-content">
                                <div className="font-bold">
                                    {`v${window.config.metadata.version.semver}-${window.config.metadata.version.stage}`}
                                </div>
                                <div className="text-xs">
                                    Released on {new Date(window.config.metadata.version.buildDate).toLocaleDateString("en-US", {
                                        month: "2-digit",
                                        day: "2-digit",
                                        year: "numeric"
                                    })}
                                </div>
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
                                            <Link className="link-hover" to="/browse">
                                                Browse
                                            </Link>
                                        </summary>

                                        <ul className="bg-base-100 rounded-lg bg-alt border border-alt p-4 flex flex-col gap-4 w-50">
                                            {recommendedTags.map((item) => (
                                                <Link
                                                    key={item.tag}
                                                    className="link-hover"
                                                    to={`/browse/${item.tag}`}
                                                >
                                                    {item.name}
                                                </Link>
                                            ))}
                                        </ul>
                                    </details>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex flex-1 flex-col w-84"
                    >
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1">
                                
                            </span>

                            <input
                                type="search"
                                placeholder="Characters, franchises, topics..."
                                value={query}
                                onChange={(e) => {
                                    handleSearchChange(e.target.value);
                                }}
                            />

                            {query && (
                                <button
                                    type="button"
                                    className="w-4 h-4 font-nerdfont leading-none text-base cursor-pointer bg-base-100"
                                    onClick={() => {
                                        handleSearchChange("");
                                    }}
                                >
                                    
                                </button>
                            )}
                        </label>
                    </form>

                    {/* While typing, first navigate to /search, then add ?q= after 300ms. On clear, return to the previous page. */}

                    {window.session?.userId && (
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

                            {window.location.hostname.startsWith("nightly") && (
                                <button
                                    className="cursor-pointer tooltip tooltip-bottom tooltip-accent"
                                    data-tip="Report Bugs"
                                    data-guide="report"
                                    onClick={() => {
                                        const dialog = document.getElementById("report") as HTMLDialogElement | null;
                                        dialog?.showModal();
                                    }}
                                >
                                    <span className="font-nerdfont text-xl"></span>
                                </button>
                            )}

                            <button className="hidden cursor-pointer tooltip tooltip-bottom tooltip-accent">
                                <span className="font-nerdfont text-xl">󰍡</span>
                                <div className="tooltip-content">
                                    <div className="font-bold">Messages</div>
                                    <div className="text-xs">No new messages!</div>
                                </div>
                            </button>

                            <button className="cursor-pointer tooltip tooltip-bottom tooltip-accent">
                                <span className="font-nerdfont text-xl">󰂚</span>
                                <div className="tooltip-content">
                                    <div className="font-bold">Notifications</div>
                                    <div className="text-xs">No new notifications!</div>
                                </div>
                            </button>
                            {/* Maybe clicking the bell should display last 5-10 notifications with a see all link */}
                        </>
                    )}

                    <NavbarUser />
                </div>
            </div>

            <div className={`md:hidden sticky top-0 z-9999 navbar
                ${
                    scrolled
                        ? "bg-base-100 shadow-sm"
                        : "bg-gradient-to-b from-base-100 via-base-100 to-base-100"
                }
                ${
                    hideBottomBorder
                        ? "border-b border-transparent"
                        : "border-b border-base-300"
                }`}
            >
                <div className="navbar-start">
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="cursor-pointer ml-2">
                            <span className="font-nerdfont text-2xl">󰍜</span>
                        </div>
                        <ul tabIndex={-1} className="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 shadow p-4 flex flex-col gap-3 w-50">
                            <Link className="link-hover" to="/">Home</Link>
                            <Link className="link-hover" to="/search">Search</Link>
                            <hr></hr>
                            <Link className="link-hover" to="/account/dashboard">Dashboard</Link>
                            <Link className="link-hover" to="/account/library">My library</Link>
                            <Link className="link-hover" to="/account/partner">Partner Stats</Link>
                        </ul>
                    </div>
                </div>

                <div className="navbar-center">
                    <Link className="cursor-pointer w-42" to="/">
                        <img
                            alt="OpenProfile wordmark"
                            src={`${cdnBaseUrl}${window.config.metadata.assets.wordmark}`}
                        />
                    </Link>

                    <div className="badge badge-accent tooltip tooltip-bottom tooltip-accent ml-3 p-3.5 flex justify-center rounded-sm">
                        Beta
                        <div className="tooltip-content">
                            <div className="font-bold">
                                {`v${window.config.metadata.version.full}`}
                            </div>
                            <div className="text-xs">
                                Released on {new Date(window.config.metadata.version.buildDate).toLocaleDateString("en-US", {
                                    month: "2-digit",
                                    day: "2-digit",
                                    year: "numeric"
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="navbar-end">
                    <button
                        className="cursor-pointer mr-2"
                        onClick={() => navigate("/search")}
                    >
                        <span className="font-nerdfont text-xl"></span>
                    </button>
                </div>
            </div>

            <div className="dock md:hidden border-t border-base-300 z-999">
                <Link
                    to={`${mainBaseUrl}`}
                    className={isActive("/") ? "text-accent" : ""}
                >
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">Home</span>
                </Link>

                <Link
                    to={`${studioBaseUrl}/dashboard`}
                    className={isActive(`${studioBaseUrl}/dashboard`) ? "text-accent" : ""}
                >
                    <div className="text-xl font-nerdfont">󰕮</div>
                    <span className="dock-label">Dashboard</span>
                </Link>

                <button
                    className="bg-accent rounded-4xl"
                    onClick={() => {
                        if (!window.session?.userId) {
                            (document.getElementById("login") as HTMLDialogElement | null)?.showModal();
                            return;
                        }

                        (document.getElementById("create-asset") as HTMLDialogElement | null)?.showModal();
                    }}
                >
                    <div className="text-xl font-nerdfont"></div>
                    <span className="dock-label">Create</span>
                </button>

                <button>
                    <div className="text-xl font-nerdfont">󰂚</div>
                    <span className="dock-label">Notifications</span>
                </button>
            </div>
        </>
    );
}
