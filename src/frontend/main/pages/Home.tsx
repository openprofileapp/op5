import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

import isGateway from "../../_common/helpers/isGateway.js";
import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import CharacterCard from "../components/CharacterCard.js";

const words = [
    "Characters", 
    "Universes", 
    "Stories",
    "Team"
];

// Make the text like "Recently Updated" a skeleton during loading
export default function Home() {
    const { t, ready } = useTranslation();
    const [index, setIndex] = useState(0);
    const [width, setWidth] = useState(0);
    const wordRef = useRef(null);

    const [recentFollowingCharacters, setRecentFollowingCharacters] = useState<unknown[]>([]);
    const [isLoadingRecentFollowingCharacters, setIsLoadingRecentFollowingCharacters] = useState(true);

    useEffect(() => {
        const fetchRecentFollowingCharacters = async () => {
            try {
                const res = await fetch(
                    `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/characters/recent/following?visibility=public`, 
                    { credentials: "include" }
                );
                
                const data = await res.json();

                setRecentFollowingCharacters(data.characters);
            } catch (err) {
                console.error(err);
                setRecentFollowingCharacters([]);
            } finally {
                setIsLoadingRecentFollowingCharacters(false);
            }
        };

        fetchRecentFollowingCharacters();
    }, []);

    const [recommendedCharacters, setRecommendedCharacters] = useState<unknown[]>([]);
    const [isLoadingRecommendedCharacters, setIsLoadingRecommendedCharacters] = useState(true);

    useEffect(() => {
        const fetchRecommendedCharacters = async () => {
            try {
                const res = await fetch(
                    `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/characters/recommended`, 
                    { credentials: "include" }
                );
                
                const data = await res.json();

                setRecommendedCharacters(data.characters);
            } catch (err) {
                console.error(err);
                setRecommendedCharacters([]);
            } finally {
                setIsLoadingRecommendedCharacters(false);
            }
        };

        fetchRecommendedCharacters();
    }, []);

    const [trendingCharacters, setTrendingCharacters] = useState<unknown[]>([]);
    const [isLoadingTrendingCharacters, setIsLoadingTrendingCharacters] = useState(true);

    useEffect(() => {
        const fetchTrendingCharacters = async () => {
            try {
                const res = await fetch(
                    `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/characters/trending?visibility=public`, 
                    { credentials: "include" }
                );
                
                const data = await res.json();

                setTrendingCharacters(data.characters);
            } catch (err) {
                console.error(err);
                setTrendingCharacters([]);
            } finally {
                setIsLoadingTrendingCharacters(false);
            }
        };

        fetchTrendingCharacters();
    }, []);

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
    }, []);

    if (!ready) return null;

    return (
        <>  
            <Metadata />
            
            <Navbar isBannerPage={window.session.user ? false : true} />

            {!window.session.user && (
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
                                        onClick={() => document.getElementById("login").showModal()}
                                    >
                                        Get Started
                                    </button>

                                    <button className="btn btn-outline btn-primary h-12 px-8 hover:-translate-y-0.5 transition-all duration-200">
                                        Browse Characters
                                    </button>
                                    
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 md:px-14">
                        <div className="mt-4 mb-6 text-xl font-bold">Trending</div>
                        
                        <div className="flex gap-4 overflow-x-auto mb-10">
                            <CharacterCard
                                id="0"
                                avatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/Screenshot_2026-05-17_110157.png`}
                                animatedAvatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/ezgif-3bddc376754c9ed9.gif`}
                                name="AvatarKage"
                                owner={{
                                    id: "0",
                                    name: "?",
                                    type: "user" // p.owner.type
                                }}
                                about="Testing how good GIFs would work."
                                interactions={{
                                    views: {
                                        count: 0,
                                        interacted: true
                                    },
                                    likes: {
                                        count: 0,
                                        interacted: false
                                    }
                                }}
                            />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                        </div>
                    </div>
                </>
            )}

            {window.session.user && (
                <div className="py-4">
                    {(isLoadingRecentFollowingCharacters || recentFollowingCharacters.length > 0) && (
                        <div className="px-4 md:px-14">
                            <div className="mt-4 mb-6 text-xl font-bold">Recently Updated</div>
                            
                            <div className="flex gap-4 overflow-x-auto mb-10">
                                {!isLoadingRecentFollowingCharacters && recentFollowingCharacters.map((d) => (
                                    <CharacterCard
                                        id={d.id}
                                        aura={{
                                            isEnabled: d.isAuraEnabled,
                                            type: d.auraType,
                                            primary: d.auraPrimary,
                                            secondary: d.auraSecondary
                                        }}
                                        avatar={d.avatar ? `https://cdn.openprofile.app${d.avatar}` : ""}
                                        displayName={d.displayName}
                                        slug={d.slug}
                                        owner={{
                                            id: d.owner.id,
                                            slug: d.owner.username,
                                            displayName: d.owner.displayName,
                                            isVerified: d.owner?.badges?.some(b => b.type === "verified"),
                                            type: "user" // p.owner.type
                                        }}
                                        about={d.about}
                                        interactions={{
                                            views: {
                                                count: 0,
                                                interacted: true
                                            },
                                            likes: {
                                                count: 0,
                                                interacted: false
                                            }
                                        }}
                                    />
                                ))}

                                {isLoadingRecentFollowingCharacters && (
                                    <>
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {(isLoadingRecommendedCharacters || recommendedCharacters.length > 0) && (
                        <div className="px-4 md:px-14">
                            <div className="mt-4 mb-6 text-xl font-bold">Recommended</div>
                            
                            <div className="flex gap-4 overflow-x-auto mb-10">
                                {!isLoadingRecommendedCharacters && recommendedCharacters.map((d) => (
                                    <CharacterCard
                                        id={d.id}
                                        aura={{
                                            isEnabled: d.isAuraEnabled,
                                            type: d.auraType,
                                            primary: d.auraPrimary,
                                            secondary: d.auraSecondary
                                        }}
                                        avatar={d.avatar ? `https://cdn.openprofile.app${d.avatar}` : ""}
                                        displayName={d.displayName}
                                        slug={d.slug}
                                        owner={{
                                            id: d.owner.id,
                                            slug: d.owner.username,
                                            displayName: d.owner.displayName,
                                            isVerified: d.owner?.badges?.some(b => b.type === "verified"),
                                            type: "user" // p.owner.type
                                        }}
                                        about={d.about}
                                        interactions={{
                                            views: {
                                                count: 0,
                                                interacted: true
                                            },
                                            likes: {
                                                count: 0,
                                                interacted: false
                                            }
                                        }}
                                    />
                                ))}

                                {isLoadingRecommendedCharacters && (
                                    <>
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {(isLoadingTrendingCharacters || trendingCharacters.length > 0) && (
                        <div className="px-4 md:px-14">
                            <div className="mt-4 mb-6 text-xl font-bold">Trending</div>
                            
                            <div className="flex gap-4 overflow-x-auto mb-10">
                                {!isLoadingTrendingCharacters && trendingCharacters.map((d) => (
                                    <CharacterCard
                                        id={d.id}
                                        aura={{
                                            isEnabled: d.isAuraEnabled,
                                            type: d.auraType,
                                            primary: d.auraPrimary,
                                            secondary: d.auraSecondary
                                        }}
                                        avatar={d.avatar ? `https://cdn.openprofile.app${d.avatar}` : ""}
                                        displayName={d.displayName}
                                        slug={d.slug}
                                        owner={{
                                            id: d.owner.id,
                                            slug: d.owner.username,
                                            displayName: d.owner.displayName,
                                            isVerified: d.owner?.badges?.some(b => b.type === "verified"),
                                            type: "user" // p.owner.type
                                        }}
                                        about={d.about}
                                        interactions={{
                                            views: {
                                                count: 0,
                                                interacted: true
                                            },
                                            likes: {
                                                count: 0,
                                                interacted: false
                                            }
                                        }}
                                    />
                                ))}

                                {isLoadingTrendingCharacters && (
                                    <>
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                        <SkeletonCharacterCard />
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="px-4 md:px-14">
                        <div className="mt-4 mb-6 text-xl font-bold">Because You Liked TAG_HERE</div>
                        
                        <div className="flex gap-4 overflow-x-auto mb-10">
                            <CharacterCard
                                id="0"
                                avatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/Screenshot_2026-05-17_110157.png`}
                                animatedAvatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/ezgif-3bddc376754c9ed9.gif`}
                                name="AvatarKage"
                                owner={{
                                    id: "0",
                                    name: "?",
                                    type: "user" // p.owner.type
                                }}
                                about="Testing how good GIFs would work."
                                interactions={{
                                    views: {
                                        count: 0,
                                        interacted: true
                                    },
                                    likes: {
                                        count: 0,
                                        interacted: false
                                    }
                                }}
                            />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
}