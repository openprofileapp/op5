import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

import { log } from "../scripts/main.js";

import Metadata from "../../_common/components/Metadata.js";
import isGateway from "../../_common/helpers/isGateway.js";

import { characterApiType } from "../../_common/types/characterApi.type.js";
import { GetPublishedCharacterType } from "../../../_common/types/character.type.js";
import { apiHost } from "../scripts/hosts.js";
import AssetCarousel from "../components/AssetCarousel.js";
import { Link } from "react-router-dom";

export default function Home() {
    const { t, ready: isTranslationReady } = useTranslation();

    const [index, setIndex] = useState(0);
    const [width, setWidth] = useState(0);
    const wordRef = useRef<HTMLSpanElement | null>(null);
    const [trendingCharacters, setTrendingCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [isLoadingTrendingCharacters, setIsLoadingTrendingCharacters] = useState(true);
    const [popularCharacters, setPopularCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [isLoadingPopularCharacters, setIsLoadingPopularCharacters] = useState(true);
    const [recentCharacters, setRecentCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [isLoadingRecentCharacters, setIsLoadingRecentCharacters] = useState(true);
    const [recentlyUpdatedCharacters, setRecentlyUpdatedCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [isLoadingRecentlyUpdatedCharacters, setIsLoadingRecentlyUpdatedCharacters] = useState(true);
    const [recommendedCharacters, setRecommendedCharacters] = useState<GetPublishedCharacterType[]>([]);
    const [isLoadingRecommendedCharacters, setIsLoadingRecommendedCharacters] = useState(true);

    const words = [
        "Characters",
        "Universes",
        "Stories",
        "Team"
    ];

    useEffect(() => {
        if (wordRef.current) {
            setWidth(wordRef.current.offsetWidth);
        }
    }, [index]);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3500);
        return () => clearInterval(timer);
    }, [words.length]);

    useEffect(() => {
        if (window.session.userId) return;

        const fetchTrendingCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiHost}/v2/characters/trending`, 
                    { credentials: "include" }
                );

                if (res.ok) {
                    const data: characterApiType = await res.json();

                    setTrendingCharacters(data.characters);
                } else {
                    setTrendingCharacters([]);
                }
            } catch (error) {
                log.network.error(error);
                setTrendingCharacters([]);
            } finally {
                setIsLoadingTrendingCharacters(false);
            }
        };

        fetchTrendingCharacters();
    }, []);

    useEffect(() => {
        if (window.session.userId) return;

        const fetchPopularCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiHost}/v2/characters/popular`, 
                    { credentials: "include" }
                );
                
                if (res.ok) {
                    const data: characterApiType = await res.json();

                    setPopularCharacters(data.characters);
                } else {
                    setPopularCharacters([]);
                }
            } catch (error) {
                log.network.error(error);
                setPopularCharacters([]);
            } finally {
                setIsLoadingPopularCharacters(false);
            }
        };

        fetchPopularCharacters();
    }, []);

    useEffect(() => {
        if (window.session.userId) return;

        const fetchRecentCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiHost}/v2/characters/recent`, 
                    { credentials: "include" }
                );
                
                if (res.ok) {
                    const data: characterApiType = await res.json();

                    setRecentCharacters(data.characters);
                } else {
                    setRecentCharacters([]);
                }
            } catch (error) {
                log.network.error(error);
                setRecentCharacters([]);
            } finally {
                setIsLoadingRecentCharacters(false);
            }
        };

        fetchRecentCharacters();
    }, []);


    useEffect(() => {
        if (!window.session.userId) return;

        const fetchRecentlyUpdatedCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiHost}/v2/characters/recent/following`, 
                    { credentials: "include" }
                );
                
                if (res.ok) {
                    const data: characterApiType = await res.json();

                    setRecentlyUpdatedCharacters(data.characters);
                } else {
                    setRecentlyUpdatedCharacters([]);
                }
            } catch (error) {
                log.network.error(error);
                setRecentlyUpdatedCharacters([]);
            } finally {
                setIsLoadingRecentlyUpdatedCharacters(false);
            }
        };

        fetchRecentlyUpdatedCharacters();
    }, []);

    useEffect(() => {
        if (!window.session.userId) return;

        const fetchRecommendedCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiHost}/v2/characters/recommended`, 
                    { credentials: "include" }
                );
                
                if (res.ok) {
                    const data: characterApiType = await res.json();

                    setRecommendedCharacters(data.characters);
                } else {
                    setRecommendedCharacters([]);
                }
            } catch (error) {
                log.network.error(error);
                setRecommendedCharacters([]);
            } finally {
                setIsLoadingRecommendedCharacters(false);
            }
        };

        fetchRecommendedCharacters();
    }, []);

    if (!isTranslationReady) return null;

    return (
        <>  
            <Metadata />
 
            {!window.session.user ? (
                <>
                    <div className="hero bg-base-200 h-140">
                        <div
                            className="absolute top-[64px] inset-0 bg-cover bg-center h-140"
                            style={{
                                backgroundImage: `url(https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/media/hero.png)`,
                                opacity: 0.1
                            }}
                        />

                        <div
                            className="absolute inset-0 pointer-events-none top-[64px] h-140"
                            style={{
                                background: `
                                    linear-gradient(
                                        to bottom,
                                        #080808 0%,
                                        transparent 25%,
                                        transparent 75%,
                                        var(--color-base-200) 100%
                                    )
                                `,
                            }}
                        />

                        <div className="hero-content text-center px-4 md:px-16">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold inline-flex items-center justify-center whitespace-nowrap">
                                    <span>Your</span>

                                    <span
                                        className="ml-3 inline-flex relative overflow-hidden align-bottom transition-[width] duration-500"
                                        style={{ width: width ? `${width}px` : "auto" }}
                                    >
                                        <AnimatePresence mode="popLayout" initial={false}>
                                            <motion.span
                                                key={words[index]}
                                                ref={wordRef}
                                                initial={{ y: "100%", opacity: 0 }}
                                                animate={{ y: "0%", opacity: 1 }}
                                                exit={{ y: "-100%", opacity: 0 }}
                                                transition={{ 
                                                    y: { type: "spring", stiffness: 220, damping: 26 },
                                                    opacity: { duration: 0.25 }
                                                }}
                                                className="inline-block whitespace-nowrap text-accent font-black"
                                            >
                                                {words[index]}
                                            </motion.span>
                                        </AnimatePresence>
                                    </span>

                                    <span>. All in one place.</span>
                                </h1>

                                <p className="py-6 mt-2 max-w-2xl mx-auto text-base md:text-lg">
                                    OpenProfile is a free collaborative platform to create and share original characters using advanced templates and a public database.
                                </p>

                                <p className="pb-6 uppercase text-xs text-sub font-bold">
                                    The most advanced character profile in the world - <span className="text-white font-bold underline decoration-primary decoration-4 underline-offset-4">created by writers for writers</span>
                                </p>

                                <div className="flex justify-center gap-4 mt-1">
                                    <button 
                                        className="btn btn-primary h-12 px-8 hover:-translate-y-0.5 transition-all duration-200" 
                                        onClick={() => (
                                            document.getElementById("login") as HTMLDialogElement | null
                                        )?.showModal()}
                                    >
                                        Get Started
                                    </button>

                                    <Link 
                                        className="btn btn-outline btn-primary h-12 px-8 hover:-translate-y-0.5 transition-all duration-200"
                                        to="/browse"
                                    >
                                        Browse Characters
                                    </Link>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    <AssetCarousel 
                        name={"Trending"} 
                        assetType={"character"} 
                        assets={trendingCharacters} 
                        viewAllLink="/trending"
                        isLoading={isLoadingTrendingCharacters} 
                    />

                    <AssetCarousel 
                        name={"Popular"} 
                        assetType={"character"} 
                        assets={popularCharacters} 
                        viewAllLink="/popular"
                        isLoading={isLoadingPopularCharacters} 
                    />

                    <AssetCarousel 
                        name={"New & Updated"} 
                        assetType={"character"} 
                        assets={recentCharacters} 
                        viewAllLink="/recent"
                        isLoading={isLoadingRecentCharacters} 
                    />
                </>
            ) : (
                <>
                    <AssetCarousel 
                        name={"Recently Updated"} 
                        assetType={"character"} 
                        assets={recentlyUpdatedCharacters} 
                        isLoading={isLoadingRecentlyUpdatedCharacters} 
                    />

                    <AssetCarousel 
                        name={"Recommended"} 
                        assetType={"character"} 
                        assets={recommendedCharacters} 
                        isLoading={isLoadingRecommendedCharacters} 
                    />
                </>
            )}
        </>
    );
}
