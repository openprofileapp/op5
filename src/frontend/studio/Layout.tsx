import { useEffect, useRef, useState } from "react";
import { I18nextProvider, useTranslation } from "react-i18next";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";

import i18n from "../_common/i18n.js";

import ToastContainer from "../_common/components/ToastContainer.js";
import CaptchaPortal from "../_common/components/CaptchaPortal.js";
import AskAlice from "../_common/components/AskAlice.js";

import Dashboard from "./pages/Dashboard.js";
import Analytics from "./pages/Analytics.js";

import ComingSoon from "../_common/pages/ComingSoon.js";
import NotFound from "../_common/pages/NotFound.js";

export default function Layout() {
    const { t, ready } = useTranslation();

    const contentDetailsRef = useRef(null);
    const [drawerOpen, setDrawerOpen] = useState(true);

    useEffect(() => {
        const drawer = document.getElementById("my-drawer-4");

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

    if (!ready) return null;
    
    return (
        <HelmetProvider>
            <I18nextProvider i18n={i18n}>
                <BrowserRouter>
                    <ToastContainer />
                    <CaptchaPortal siteKey={window.config.integrations.hcaptcha} />
                    <AskAlice />
                    <div className="drawer lg:drawer-open">
                        <input 
                            id="my-drawer-4" 
                            type="checkbox" 
                            checked={drawerOpen}
                            onChange={(e) => setDrawerOpen(e.target.checked)}
                            className="drawer-toggle" 
                        />
                        <div className="drawer-content border-l border-base-300">
                            <nav className="navbar w-full bg-base-100 border-b border-base-300">
                                <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                    <span className="flex h-8 w-4 leading-none items-center justify-center">
                                        <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                            
                                        </span>
                                    </span>
                                </label>
                                <div className="px-4">studio.OpenProfile</div>
                            </nav>
                            <div className="p-4">
                                <Routes>
                                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/analytics" element={<Analytics />} />
                                    <Route path="/content" element={<ComingSoon />} />

                                    <Route path="/404" element={<NotFound />} />
                                    <Route path="*" element={<Navigate to="/404" replace />} />
                                </Routes>
                            </div>
                        </div>
                        
                        <div className="drawer-side is-drawer-close:overflow-visible">
                            <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
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
                                            <details
                                                ref={contentDetailsRef}
                                                className="no-arrow tooltip tooltip-accent tooltip-right"
                                                data-tip="Content"
                                                onClick={(e) => {
                                                    const drawer = document.getElementById("my-drawer-4");

                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    if (drawer && !drawer.checked) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <summary className="flex gap-4">
                                                    <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                        󰪷
                                                    </span>
                                                    <span className="is-drawer-close:hidden text-sm">
                                                        Content
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
                                                                        Characters
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
                                                                        Universes
                                                                    </span>
                                                                </button>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </details>
                                        </li>
                                        
                                        <hr />

                                        <li>
                                            <button 
                                                className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                data-tip="Projects"
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

                                        <hr />

                                        <li>
                                            <Link 
                                                className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                data-tip="Templates"
                                                to={"/analytics"}
                                            >
                                                <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                    󱔗
                                                </span>
                                                <span className="is-drawer-close:hidden text-sm">
                                                    Templates {/* prfile and roles */}
                                                </span>
                                            </Link>
                                        </li>

                                        <li className="hidden">
                                            <Link 
                                                className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                data-tip="Themes"
                                                to={"/analytics"}
                                            >
                                                <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                    
                                                </span>
                                                <span className="is-drawer-close:hidden text-sm">
                                                    Themes
                                                </span>
                                            </Link>
                                        </li>
                                    </ul>

                                    <ul>
                                        <hr />

                                        <li>
                                            <button 
                                                className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                data-tip="Feedback"
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
                </BrowserRouter>
            </I18nextProvider>
        </HelmetProvider>
    );
}