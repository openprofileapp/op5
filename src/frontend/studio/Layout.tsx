import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet } from "react-router-dom";

import BannerContainer from "../_common/components/BannerContainer.js";
import LoginModal from "../_common/components/modals/LoginModal.js";
import MfaModal from "../_common/components/modals/MfaModal.js";
import NavbarUser from "../_common/components/NavbarUser.js";

export default function Layout() {
    const { t, ready: isTranslationReady } = useTranslation();

    const contentDetailsRef = useRef(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(!window.matchMedia("(max-width: 768px)").matches);

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
            <header className="sticky top-0 z-9999 w-full">
                <BannerContainer />
            </header>

            <LoginModal />
            <MfaModal />

            <div className="drawer lg:drawer-open">
                <input 
                    id="my-drawer" 
                    type="checkbox" 
                    checked={isDrawerOpen}
                    onChange={(e) => setIsDrawerOpen(e.target.checked)}
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

                        <div className="mr-3">
                            <NavbarUser />
                        </div>
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
                                        data-tip="Blocks"
                                        to={"/blocks"}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Blocks
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