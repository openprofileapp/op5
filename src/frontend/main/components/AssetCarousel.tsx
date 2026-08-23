import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import { Link } from "react-router-dom";
import { GetPublishedCharacterType } from "../../../_common/types/character.type.js";

type Props = {
    name: string;
    assetType: "character" | "universe";
    assets: GetPublishedCharacterType[];
    viewAllLink?: string;
    isLoading?: boolean;
};

export default function AssetCarousel({
    name,
    assetType,
    assets,
    viewAllLink,
    isLoading = false
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(true);

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;

        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

        setShowLeftArrow(scrollLeft > 5);
        setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5);
    };

    const scrollByPercent = (direction: "left" | "right") => {
        if (!scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const distance = container.clientWidth * 0.9;

        container.scrollBy({
            left: direction === "right" ? distance : -distance,
            behavior: "smooth"
        });
    };

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });

        resizeObserver.observe(container);

        handleScroll();
        container.addEventListener("scroll", handleScroll);

        return () => {
            resizeObserver.disconnect();
            container.removeEventListener("scroll", handleScroll);
        };
        
    }, [isLoading, assets]);

    if (!isTranslationReady) return null;

    return (
        <>  
            {(isLoading || assets.length > 0) && (
                <div className="px-4 md:px-14">
                    
                    {isLoading ? (
                        <div className="skeleton h-7 mt-8 mb-6 w-42"></div>
                    ) : (
                        <div className="flex items-end h-7 mt-8 mb-6">
                            <h2 className="text-xl font-bold">{name}</h2>
                            {viewAllLink && (
                                <Link 
                                    className="ml-2 text-sm font-medium text-accent hover:underline cursor-pointer"
                                    to = {viewAllLink}
                                >
                                    View all
                                </Link>
                            )}
                        </div>
                    )}
                    
                    <div ref = {scrollContainerRef} className="relative flex gap-4 overflow-x-auto mb-10 scrollbar-none">
                        <div 
                            onClick = {() => {
                                if (showLeftArrow) {
                                    scrollByPercent("left");
                                }
                            }}
                            className = {`sticky left-0 z-10 w-0 -ml-4 h-auto self-stretch flex-shrink-0 transition-opacity duration-200 ${
                                showLeftArrow ? "opacity-100 pointer-events-auto cursor-pointer" : "opacity-0 pointer-events-none cursor-default"
                            }`}
                        >
                            <div className="absolute left-0 top-0 bottom-0 w-16 flex items-center justify-start bg-gradient-to-r from-base-100 via-base-100/60 to-transparent">
                                <button
                                    type="button"
                                    className="ml-4 text-xl"
                                    aria-label="Scroll left"
                                    tabIndex = {showLeftArrow ? 0 : -1}
                                >
                                    <div className="font-nerdfont leading-none cursor-pointer">
                                        
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* DEVELOPER NEEDED: Replace CDN url with gateway check and config values */}
                        {!isLoading && assets.map((d) => (
                            <div key = {d.id} className="flex-shrink-0">
                                {assetType === "character" && (
                                    <CharacterCard
                                        data={d}
                                        isHomeScreen={true}
                                    />
                                )}
                            </div>
                        ))}

                        {assetType === "character" && isLoading && (
                            <>
                                <SkeletonCharacterCard />
                                <SkeletonCharacterCard />
                                <SkeletonCharacterCard />
                                <SkeletonCharacterCard />
                                <SkeletonCharacterCard />
                                <SkeletonCharacterCard />
                            </>
                        )}

                        <div 
                            onClick = {() => {
                                if (showRightArrow) {
                                    scrollByPercent("right");
                                }
                            }}
                            className = {`sticky right-0 z-10 w-0 -mr-4 h-auto self-stretch flex-shrink-0 transition-opacity duration-200 ${
                                showRightArrow ? "opacity-100 pointer-events-auto cursor-pointer" : "opacity-0 pointer-events-none cursor-default"
                            }`}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-20 flex items-center justify-end bg-gradient-to-l from-base-100 via-base-100/60 to-transparent">
                                <button
                                    type="button"
                                    className="mr-4 text-xl"
                                    aria-label="Scroll right"
                                    tabIndex = {showRightArrow ? 0 : -1}
                                >
                                    <div className="font-nerdfont leading-none cursor-pointer">
                                        
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
