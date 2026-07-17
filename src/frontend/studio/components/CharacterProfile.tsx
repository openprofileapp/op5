import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Metadata from "../../_common/components/Metadata.js";
import Mention from "../../main/components/Mention.js";
import React from "react";

import colors from "tailwindcss/colors";

export default function CharacterProfile() {
    const { id } = useParams();
    const { t, ready } = useTranslation();

    const [activeCategory, setActiveCategory] = useState("about");
    const [activeTab, setActiveTab] = useState("about");
    const [year, setYear] = useState(0);
    const [series, setSeries] = useState(0);
    const [showHelp, setShowHelp] = useState(false);

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    useEffect(() => {
        if (isContextMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [isContextMenuOpen]);

    const closeContextMenu = useCallback(() => {
        setIsContextMenuOpen(false);
        document
            .getElementById(`character-more-dropdown`)
            ?.hidePopover();
    }, []);

    const getTextColor = (color: string) => {
        const [name, shade] = color.split("-");

        const value =
            colors[name as keyof typeof colors]?.[
                shade as keyof (typeof colors)[keyof typeof colors]
            ];

        if (!value || typeof value !== "string") {
            return "#1a1a1a";
        }

        const match = value.match(
            /oklch\(([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/
        );

        if (!match) {
            return "#1a1a1a";
        }

        const [, l] = match;

        const lightness = Number(l);

        const textColor =
            lightness > 60
                ? "#1a1a1a"
                : "#eaeaea";

        console.log({
            color,
            value,
            lightness,
            textColor,
        });

        return textColor;
    };

   useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`character-more-dropdown`);

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
    }, [id, closeContextMenu]);

    const checkCollectionMenuPosition = (
        e: React.MouseEvent<HTMLLIElement>
    ) => {
        const button = e.currentTarget.getBoundingClientRect();
        const submenuWidth = 208;
        const spaceRight = window.innerWidth - button.right;

        setIsContextMenuFlipped(spaceRight < submenuWidth);
    };

   const setTab = (tab: string) => {
        if (tab === "about") {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            window.location.hash = tab;
        }

        setActiveTab(tab);
    };

    useEffect(() => {
        const updateTab = () => {
            setActiveTab(window.location.hash.replace("#", ""));
        };

        window.addEventListener("hashchange", updateTab);

        updateTab();

        return () => {
            window.removeEventListener("hashchange", updateTab);
        };
    }, []);

    function getEmbedType(url: string) {
        try {
            const parsed = new URL(url);

            // YouTube
            if (
                parsed.hostname.includes("youtube.com") ||
                parsed.hostname.includes("youtu.be")
            ) {
                return "youtube";
            }

            // Spotify
            if (parsed.hostname.includes("spotify.com")) {
                return "spotify";
            }

            return null;
        } catch {
            return null;
        }
    }
{/* Turn these into components */}
    const YouTubeEmbed = ({ url }: { url: string }) => {
    let videoId = "";

    if (url.includes("youtu.be")) {
        videoId = url.split("/").pop()!;
    } else {
        const u = new URL(url);
        videoId = u.searchParams.get("v") || "";
    }

    if (!videoId) return null;

    return (
        <div className="aspect-video w-full my-4">
            <iframe
                className="w-full h-full rounded border border-base-300"
                src={`https://www.youtube.com/embed/${videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
        </div>
    );
};

const SpotifyEmbed = ({ url }: { url: string }) => {
    const embedUrl = url.replace(
        "open.spotify.com",
        "open.spotify.com/embed"
    );

    return (
        <div className="my-4">
            <iframe
                style={{ borderRadius: "12px" }}
                src={embedUrl}
                width="100%"
                height="152"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
        </div>
    );
};

 // Mark down accepts YouTube and Spotify links https://www.youtube.com/watch?v=6BgK6_8TMd4
    const aboutMarkdown = `
## Projects
I am the founder of OpenProfile and the producer of Dragonights at J9 Studios.


Check out my character: <@6773794953695671>
`.trim();

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
        <>
            <Metadata
                title="Development"
                allowIndex="false"
            />

            <div className="drawer lg:drawer-open">
                <input 
                    id="my-drawer-4" 
                    type="checkbox" 
                    checked={drawerOpen}
                    onChange={(e) => setDrawerOpen(e.target.checked)}
                    className="drawer-toggle" 
                />
                <div className="drawer-content border-l border-base-300">
                    <nav className="navbar w-full bg-base-100">
                        <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                            <span className="flex h-8 w-4 leading-none items-center justify-center">
                                <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                    
                                </span>
                            </span>
                        </label>
                        <div className="px-4 w-full text-center">
                            Example Character Here
                            <div className="text-sub text-xs">By Author</div>
                        </div>
                    </nav>
                    <nav className="w-full bg-base-100 border-b border-base-300">
                        <div className="mx-4">
                            <input
                                type="range"
                                min={1}
                                max={3}
                                step={1}
                                value={series}
                                onChange={(e) => setSeries(Number(e.target.value))}
                                className="range range-primary w-full h-2"
                            />

                            <div className="flex justify-between text-xs opacity-60">
                                <span>Original Film</span>
                                <span>Tv Series</span>
                                <span>Film Remake</span>
                            </div>

                            <div className="hidden mt-2 text-center text-sm font-medium">
                                {series}
                            </div>
                        </div>

                        <div className="mx-4 my-4">
                            <input
                                type="range"
                                min={2000}
                                max={2020}
                                step={1}
                                value={year}
                                onChange={(e) => setYear(Number(e.target.value))}
                                className="range range-primary w-full h-2"
                            />

                            <div className="flex justify-between text-xs opacity-60">
                                <span>2000</span>
                                <span>2005</span>
                                <span>2010</span>
                                <span>2015</span>
                                <span>2020</span>
                            </div>

                            <div className="hidden mt-2 text-center text-sm font-medium">
                                {year}
                            </div>
                        </div>
                        
                        <div className="px-4 w-full mt-6">
                            <div className="tabs tabs-lift flex-nowrap">
                                {activeCategory === "supernatural" && (
                                    <>
                                        {year > 2010 && (
                                            <button
                                                className={`tab flex-1 ${
                                                    activeTab === "fire-manipulaton"
                                                        ? "tab-active bg-base-200"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setTab("fire-manipulaton")
                                                }
                                            >
                                                Fire Manipulaton
                                            </button>
                                        )}
                                        
                                        {year > 2017 && (
                                            <button
                                                className={`tab flex-1 ${
                                                    activeTab === "force-manipulaton"
                                                        ? "tab-active bg-base-200"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setTab("force-manipulaton")
                                                }
                                            >
                                                Force Manipulaton
                                            </button>
                                        )}

                                        <button
                                            className="btn btn-accent text-2xl hidden"
                                        >
                                            +
                                        </button>
                                    </>
                                )}

                                {activeCategory === "relationships" && (
                                    <>
                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "about"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("about")
                                            }
                                        >
                                            Family
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "titles"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("titles")
                                            }
                                        >
                                            Friends
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collaborations"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("collaborations")
                                            }
                                        >
                                            Acquaintances
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                    <div className="flex justify-center p-4">
                        <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-232">
                            <div className="p-2 md:p-4">

                                {activeTab === "test" && (
                                    <div className="p-4 prose text-base-content text-base">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                p({ children }) {
                                                    return (
                                                        <p>
                                                            {React.Children.map(children, (child) => {
                                                                if (typeof child !== "string") return child;

                                                                const parts = child.split(/<@([A-Za-z0-9_-]+)>/g);

                                                                return parts.map((part, index) =>
                                                                    index % 2 === 1 ? (
                                                                        <Mention
                                                                            key={index}
                                                                            id={part}
                                                                            name="Cornelia"
                                                                            avatar="https://cdn.openprofile.app/uploads/profiles/6773794953695671/4k2jGxq2utoquol17wG9HZ54LgLTUfVc.png"
                                                                            aura={{
                                                                                isEnabled: true,
                                                                                primary: "#fce1969f"
                                                                            }}
                                                                            verified={true}
                                                                            inline={true}
                                                                        />
                                                                    ) : (
                                                                        part
                                                                    )
                                                                );
                                                            })}
                                                        </p>
                                                    );
                                                },
                                                                                                    
                                                a({ href, children }) {
                                                    if (!href) return null;

                                                    const type = getEmbedType(href);

                                                    if (type === "youtube") {
                                                        return <YouTubeEmbed url={href} />;
                                                    }

                                                    if (type === "spotify") {
                                                        return <SpotifyEmbed url={href} />;
                                                    }

                                                    // default link behavior
                                                    return (
                                                        <a href={href} target="_blank" rel="noreferrer">
                                                            {children}
                                                        </a>
                                                    );
                                                },
                                            }}
                                        >
                                            {aboutMarkdown}
                                        </ReactMarkdown>
                                    </div>
                                )}

                                {activeTab === "collaborations" && (
                                    <div className="p-4">
                                        
                                    </div>
                                )}

                                {activeTab === "titles" && (
                                    <div className="p-4 flex flex-wrap gap-4">
                                        
                                    </div>
                                )}

                                {activeTab === "fire-manipulaton" && (
                                    <div className="flex flex-col gap-1">





                                        
                                        {/* Turn this into an element and import per field; pass name and type and stuff */}
                                        <ul
                                            className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
                                            popover="manual"
                                            id={`character-more-dropdown`}
                                        >
                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Generate
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>
                                            </li>

                                            <li 
                                                className="relative group"
                                                onMouseEnter={checkCollectionMenuPosition}
                                            >
                                                <button className="flex items-center justify-between gap-4 w-full">
                                                    Format
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>

                                                <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                                                <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Bold
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Italic
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Underline
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Strikethrough
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 rounded-full leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </li>

                                            <li 
                                                className="relative group"
                                                onMouseEnter={checkCollectionMenuPosition}
                                            >
                                                <button className="flex items-center justify-between gap-4 w-full">
                                                    Highlight
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>

                                                <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                                                <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Yellow
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-yellow-400"
                                                                style={{ color: getTextColor("yellow-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Orange
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-orange-400"
                                                                style={{ color: getTextColor("orange-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Red
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-red-400"
                                                                style={{ color: getTextColor("red-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Pink
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-pink-400"
                                                                style={{ color: getTextColor("pink-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Purple
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-purple-400"
                                                                style={{ color: getTextColor("purple-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Blue
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-blue-400"
                                                                style={{ color: getTextColor("blue-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Green
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-green-400"
                                                                style={{ color: getTextColor("green-400") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <hr />
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            My Custom Purple
                                                            <span 
                                                                className="font-nerdfont text-lg flex h-6 w-12 rounded-full leading-none items-center justify-center bg-purple-800"
                                                                style={{ color: getTextColor("purple-800") }}
                                                            >
                                                                󰙒
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <hr />
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Add Custom Color
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </li>
                                            
                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Notes
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>
                                            </li>

                                            <hr />

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Cut
                                                    <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                                                        Ctrl+X
                                                    </span>
                                                </button>
                                            </li>

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Copy
                                                    <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                                                        Ctrl+C
                                                    </span>
                                                </button>
                                            </li>

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Paste
                                                    <span className="text-sm text-sub pr-5 flex h-6 w-4 leading-none items-center justify-center">
                                                        Ctrl+P
                                                    </span>
                                                </button>
                                            </li>
                                            
                                            <hr />

                                            <li 
                                                className="relative group"
                                                onMouseEnter={checkCollectionMenuPosition}
                                            >
                                                <button className="flex items-center justify-between gap-4 w-full">
                                                    Assign to
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>

                                                <span className={`absolute ${isContextMenuFlipped ? "right-full" : "left-full"} h-full opacity-0 cursor-default`}></span>

                                                <ul className={`absolute ${isContextMenuFlipped ? "right-[calc(100%+12px)]" : "left-[calc(100%-4px)]"} top-[-8px] dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible hidden group-hover:block`}>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            J9 Studios
                                                            <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                                                <img 
                                                                    className="rounded-full translate-x-[2px]"
                                                                    src="https://cdn.openprofile.app//uploads/users/5019646586243236/5019646586243236.png"
                                                                />
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            OpenProfile
                                                            <span className="font-nerdfont text-lg flex h-6 w-5 leading-none items-center justify-center">
                                                                <img 
                                                                    className="rounded-full translate-x-[2px]"
                                                                    src="https://cdn.openprofile.app/uploads/users/9534968913312158/9534968913312158.png"
                                                                />
                                                            </span>
                                                        </button>
                                                    </li>
                                                    <hr />
                                                    <li>
                                                        <button 
                                                            className="flex items-center justify-between gap-4"
                                                            onClick={() => {
                                                                // exampleTrigger();
                                                                // closeContextMenu(id);
                                                            }}
                                                        >
                                                            Invite User
                                                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                                
                                                            </span>
                                                        </button>
                                                    </li>
                                                </ul>
                                            </li>

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Edit Field
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>
                                            </li>

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Lock Field
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        
                                                    </span>
                                                </button>
                                            </li>

                                            <hr />

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Share
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        󰒗
                                                    </span>
                                                </button>
                                            </li>

                                            <li>
                                                <button 
                                                    className="flex items-center justify-between gap-4"
                                                    onClick={() => {
                                                        // exampleTrigger();
                                                        // closeContextMenu(id);
                                                    }}
                                                >
                                                    Copy ID
                                                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                                        󰅇
                                                    </span>
                                                </button>
                                            </li>
                                        </ul>

                                        <div className="flex gap-3">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm font-normal">
                                                    Full Name
                                                    
                                                    <span 
                                                        className="tooltip hidden"
                                                        data-tip="Assigned to AvatarKage"
                                                    >
                                                        <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                                            
                                                        </span>
                                                    </span>

                                                    <span 
                                                        className="tooltip hidden"
                                                        data-tip="Awaiting publisher review"
                                                    >
                                                        <span className="font-nerdfont text-xl text-info flex w-4 leading-none items-center justify-center">
                                                            󱍸
                                                        </span>
                                                    </span>

                                                    <span 
                                                        className="tooltip hidden"
                                                        data-tip="Changes approved by J9 Studios"
                                                    >
                                                        <span className="font-nerdfont text-lg text-success flex w-4 leading-none items-center justify-center">
                                                            
                                                        </span>
                                                    </span>

                                                    <span 
                                                        className="tooltip hidden"
                                                        data-tip="Changes rejected by J9 Studios (awaiting author revision)"
                                                    >
                                                        <span className="font-nerdfont text-lg text-error flex w-4 leading-none items-center justify-center">
                                                            
                                                        </span>
                                                    </span>

                                                    <span 
                                                        className="tooltip hidden"
                                                        data-tip="Locked"
                                                    >
                                                        <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                                            
                                                        </span>
                                                    </span>

                                                    <span 
                                                        className="tooltip"
                                                    >
                                                        <div className="flex flex-col gap-1 tooltip-content text-left">
                                                            <div className="font-bold text-center">Notes</div>
                                                            <div className="text-xs">AvatarKage (07/17/26): Don't forget to include the character's title</div>
                                                            <div className="text-xs">J9 Studios (07/17/26): The author should include their suffix</div>
                                                        </div>
                                                        <span className="font-nerdfont text-lg text-sub flex w-4 leading-none items-center justify-center">
                                                            
                                                        </span>
                                                    </span>
                                                </legend>

                                                <textarea
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-10 text-base overflow-hidden z-2"
                                                    placeholder="What is <CHARACTER>'s full name?"
                                                    rows={1}
                                                    spellCheck={false}
                                                    autoCorrect="off"
                                                    autoCapitalize="off"
                                                    onFocus={() => setShowHelp(true)}
                                                    onBlur={() => setShowHelp(false)}
                                                    onContextMenu={(e) => {
                                                        e.preventDefault();
                                                        setIsContextMenuOpen(true);

                                                        const popover = document.getElementById(
                                                            `character-more-dropdown`
                                                        ) as HTMLElement | null;

                                                        if (!popover) return;

                                                        popover.showPopover?.();

                                                        requestAnimationFrame(() => {
                                                            const rect = popover.getBoundingClientRect();

                                                            popover.style.left = `${Math.min(
                                                                e.clientX,
                                                                window.innerWidth - rect.width - 8
                                                            )}px`;

                                                            popover.style.top = `${Math.min(
                                                                e.clientY,
                                                                window.innerHeight - rect.height - 8
                                                            )}px`;
                                                        });
                                                    }}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />

                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-out ${
                                                        showHelp ? "max-h-200 opacity-100" : "max-h-0 opacity-0 mt-[-24px] z-1"
                                                    }`}
                                                >
                                                    <div className="bg-accent rounded px-3 py-2 text-sm">
                                                        <span className="font-nerdfont leading-none mr-2">󰋼</span>
                                                        Be sure to include undefined prefixes and suffixes if any.
                                                    </div>
                                                </div>
                                            </fieldset>
                                        </div>

















                                        <div className="flex gap-3">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    First Name
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s first name?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>

                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Middle Name
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s middle name?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>

                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Last Name
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s last name?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="flex gap-3">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Nickname
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s nickname?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="flex gap-3">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Alias
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s alias name?" 
                                                    rows={1}
                                                    value={
                                                        series === 2
                                                            ? year >= 2014
                                                            ? "Jerry Mathews. Retired the Maxwell alias in 2014."
                                                            : year >= 2008
                                                                ? "Maxwell"
                                                                : ""
                                                            : year >= 2014
                                                            ? "Jerry Jacobs. Retired the Maxwell alias in 2014."
                                                            : year >= 2008
                                                                ? "Maxwell"
                                                                : ""
                                                        }
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>
                                        </div>

                                        <div className="flex gap-3">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Alter Ego
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s alter ego?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                />
                                            </fieldset>
                                        </div>













                                        <div className="flex gap-3 hidden">
                                            <fieldset className="fieldset w-full">
                                                <legend className="fieldset-legend text-sm">
                                                    Alter Ego
                                                </legend>
                                                <textarea 
                                                    className="textarea resize-none bg-base-100 border border-base-300 w-full text-base min-h-10 h-10"
                                                    placeholder="What is <CHARACTER>'s alter ego?" 
                                                    rows={1}
                                                    onInput={(e) => {
                                                        e.currentTarget.style.height = "auto";
                                                        e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                                                    }}
                                                     value={{
                                                    2011: "Just discovered their ability",
                                                    2012: "Is beginner level",
                                                    2013: "Defeated an opponent using their abilities",
                                                    2014: "Trained almost daily to become an advanced wielder",
                                                    2015: "Mastered their ability"
                                                }[year] || ""}
                                                />
                                            </fieldset>
                                        </div>
                                    </div>
                                )}

                                {activeTab === "force-manipulaton" && (
                                    <div className="p-4">

                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">                        <div className="menu w-full">
                            <ul>
                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Name"
                                        onClick={() =>
                                            setActiveCategory("name")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Name
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Astral"
                                        onClick={() =>
                                            setActiveCategory("astral")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Astral
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Physical"
                                        onClick={() =>
                                            setActiveCategory("physical")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Physical
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Supernatural"
                                        onClick={() =>
                                            setActiveCategory("supernatural")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Supernatural
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Personality"
                                        onClick={() =>
                                            setActiveCategory("personality")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Personality
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Favorites"
                                        onClick={() =>
                                            setActiveCategory("favorites")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Favorites
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Interactions"
                                        onClick={() =>
                                            setActiveCategory("interactions")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Interactions
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Emotional"
                                        onClick={() =>
                                            setActiveCategory("emotional")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Emotional
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Relationships"
                                        onClick={() =>
                                            setActiveCategory("relationships")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Relationships
                                        </span>
                                    </button>
                                </li>

                                <button
                                    className="btn btn-accent text-2xl w-full mt-2"
                                >
                                    +
                                </button>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}