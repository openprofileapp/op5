import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import Metadata from "../../_common/components/Metadata.js";
import WorldMap from "../components/WorldMap.js";

export default function Home() {
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

    const dummyData = {
        reads: {
            US: 100,
            CA: 50,
            GB: 80,
        },
        views: {
            US: 1000,
            CA: 500,
            GB: 800,
        },
    };

    if (!ready) return null;
    
    return (
        <>  
            <Metadata />

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
                        <div className="grid grid-cols-3 gap-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                <div className="w-full text-lg font-bold mb-6">Views</div>
                                <div>
                                    <div className="font-bold text-2xl">{formatNumber(383).short}</div>
                                    <div className="text-xs text-sub">+10% in the past 30 days</div>
                                </div>
                            </div>

                            <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                <div className="w-full text-lg font-bold mb-6">Reads</div>
                                <div>
                                    <div className="font-bold text-2xl">{formatNumber(56).short}</div>
                                    <div className="text-xs text-sub">-7% in the past 30 days</div>
                                </div>
                            </div>

                            <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                <div className="w-full text-lg font-bold mb-6">Followers</div>
                                <div>
                                    <div className="font-bold text-2xl">{formatNumber(2).short}</div>
                                    <div className="text-xs text-sub">+100% in the past 30 days</div>
                                </div>
                            </div>
                            
                            <div className="bg-base-100 border border-base-300 col-span-2 h-120 p-6 base-200 rounded-lg overflow-hidden">
                                <WorldMap data={dummyData} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                    <div className="flex min-h-full flex-col items-start bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                        <div className="menu w-full grow justify-between">
                            <ul>
                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Dashboard"
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󰕮
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Dashboard
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Analytics"
                                        onClick={async () => {
                                            // ACTION HERE
                                        }}
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            󱕍
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Analytics
                                        </span>
                                    </button>
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
        </>
    );
}