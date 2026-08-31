import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { banner, Banner, BannerType } from "../scripts/banner.js";

export default function BannerContainer() {
    const [banners, setBanners] = useState<Banner[]>([]);

    const bannerClasses: Record<BannerType, string> = {
        info: "bg-info text-info-content border-info",
        success: "bg-success text-success-content border-success",
        warning: "bg-warning text-warning-content border-warning",
        error: "bg-error text-error-content border-error",
    };

    useEffect(() => {
        const unsubscribe = banner.subscribe((updatedBanners) => {
            setBanners(updatedBanners);
        });
        return () => unsubscribe();
    }, []);

    const hasBanners = banners.length > 0;

    return (
        <AnimatePresence>
            {hasBanners && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "64px", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="relative w-full z-[10000] overflow-hidden"
                >
                    {banners.map((b, index) => {
                        const isTop = index === banners.length - 1;
                        const depth = banners.length - 1 - index;

                        return (
                            <div
                                key={b.id}
                                style={{
                                    opacity: depth > 1 ? 0 : 1 - depth * 0.25,
                                    transform: `translateY(${depth * 2}px) scale(${1 - depth * 0.02})`,
                                    zIndex: index,
                                }}
                                className={`
                                    absolute inset-0 w-full h-full border-b text-xs md:text-sm font-medium
                                    grid grid-cols-[1fr_auto_1fr] items-center px-4 shadow-md
                                    ${bannerClasses[b.type]}
                                    ${!isTop ? "pointer-events-none" : "pointer-events-auto"}
                                `}
                            >
                                <div />

                                <div className="flex items-center justify-center gap-3 text-center">
                                    <div className="flex flex-col text-center">
                                        <span className="font-medium text-sm text-white leading-snug">
                                            {b.message}
                                        </span>
                                        {b.subtext && (
                                            <span className="text-xs opacity-80 leading-snug mt-0.5">
                                                {b.subtext}
                                            </span>
                                        )}
                                    </div>

                                    {b.button && isTop && (
                                        <button
                                            onClick={b.button.onClick}
                                            className="btn btn-outline border-white text-white hover:bg-transparent hover:border-white px-6 h-9"
                                        >
                                            {b.button.label}
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    {b.dismissible && isTop && (
                                        <button
                                            className="flex items-center justify-center w-4 text-xl mr-1 font-nerdfont leading-none shrink-0 cursor-pointer"
                                            onClick={() => {
                                                b.closeAction?.onClick();
                                                banner.hide(b.id);
                                            }}
                                        >
                                            
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
