import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { formatNumber } from "kage-library/client";

import Metadata from "../../_common/components/Metadata.js";
import WorldMap from "../components/WorldMap.js";

export default function Analytics() {
    const { t, ready: isTranslationReady } = useTranslation();

    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.documentElement.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "";
            document.documentElement.style.overflow = "";
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

    if (!isTranslationReady) return null;
    
    return (
        <>
            <Metadata
                title="Analytics"
                allowIndex={false}
            />

            <div className="relative w-full max-h-[calc(100vh-2rem)] overflow-hidden m-4">
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none">
                    <span className="bg-accent text-lg font-medium px-4 py-2 rounded-lg">
                        Coming Soon
                    </span>
                </div>

                <div className="grid grid-cols-3 gap-4 w-full blur pointer-events-none select-none">
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
        </>
    );
}
