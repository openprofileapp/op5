import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Confetti from "react-confetti";

import { formatNumber } from "kage-library/client";

import isGateway from "../../_common/helpers/isGateway.js";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import Badges from "../components/Badges.js";
import ProjectCard from "../components/ProjectCard.js";
import ExternalLinks from "../components/ExternalLinks.js";

// DEFINE TYPE PROFILE SOMEWHERE GLOBALLY

export default function UserProfile() {
    const { id } = useParams();
    const { t, ready } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("projects");
    const [user, setUser] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    {/* MOVE THIS TO KAGE-LIBRARY/CLIENT */}
    const hexToRgba = (hex: string, alpha = 1) => {
        if (!hex) return "00000000";

        const clean = hex.replace("#", "");
        const r = parseInt(clean.substring(0, 2), 16);
        const g = parseInt(clean.substring(2, 4), 16);
        const b = parseInt(clean.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/users?id=${id}`);
                
                if (!res.ok) {
                    navigate("/404", { replace: true });
                    return;
                }
                    
                const data = await res.json();

                setUser(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    });

    const auraStyle = user.isAuraEnabled
        ? 
            {
                ["--aura-type" as string]:
                    // eslint-disable-next-line no-constant-binary-expression
                    `aura-${user.auraType}-aura-box` || "aura-flow-aura-box",

                ["--aura-primary" as string]:
                    user.auraPrimary || "var(--color-accent)",

                ["--aura-secondary" as string]:
                    user.auraSecondary || "var(--color-accent)",
            }
        : 
            {
                border: "1px solid #222222",
            }
        ;

    const customLinks = [
        {
            url: ".",
            name: "bluesky",
            previewText: "@avatarka.ge",
            visibility: "public",
            date: new Date().toISOString(),
        },
        {
            url: ".",
            name: "tiktok",
            previewText: "@avatarkage",
            visibility: "public",
            date: new Date().toISOString(),
        },
        {
            url: ".",
            name: "twitch",
            previewText: "@avatarkage",
            visibility: "public",
            date: new Date().toISOString(),
        }
    ];

    const allLinks = [...(user.links ?? []), ...customLinks];

    if (!ready || loading) return null;
    
    return (
        <>  
            <Metadata
                title={user.displayName}
                allowIndex="false"
            />

            {/* only show on bdays of profiles and characters */}
            {showConfetti && (
                <Confetti
                    numberOfPieces={250}
                    recycle={false}
                    onConfettiComplete={(confetti) => {
                        setShowConfetti(false);
                        confetti?.reset();
                    }}
                    style={{
                        zIndex: 4,
                        pointerEvents: "none",
                    }}
                />
            )}
                        
            <Navbar isBannerPage={true} />

            <div className={user.isAuraEnabled ? "bg-base-100" : "bg-base-200"}>
                <div style={{backgroundColor: user.isAuraEnabled ? hexToRgba(user.auraPrimary, 0.05) : "transparent"}}>
                    <div className="hero bg-base-200">
                        <div
                            className="absolute top-[64px] inset-0 bg-cover bg-center h-96"
                            style={{
                                backgroundImage: `url(https://cdn.openprofile.app${user.banner})`,
                            }}
                        />
                        
                        {Boolean(user.isAuraEnabled) && (
                            <div
                                className="absolute inset-0 pointer-events-none top-[64px] h-96"
                                style={{
                                    background: `
                                        linear-gradient(
                                            to bottom,
                                            transparent 0%,
                                            transparent 75%,
                                            var(--color-base-100)
                                        )
                                    `,
                                }}
                            />
                        )}

                        <div
                            className="absolute inset-0 pointer-events-none top-[64px] h-96"
                            style={{
                                background: `
                                    linear-gradient(
                                        to bottom,
                                        #080808 0%,
                                        transparent 25%,
                                        transparent 75%,
                                        ${user.isAuraEnabled ? hexToRgba(user.auraPrimary, 0.05) : "var(--color-base-200)"} 100%
                                    )
                                `,
                            }}
                        />
                    </div>

                    <div className="mx-8 mt-28 my-6 md:mx-64">
                        <div className="aura-box max-h-88 md:max-h-68 relative p-8 shadow-sm" style={auraStyle}>
                            <div className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent" data-tip="More">
                                <button type="button" className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden"
                                    popoverTarget={`user-more-dropdown`} style={{ anchorName: `--user-more-anchor` }}
                                >
                                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                                        󰇘
                                    </span>
                                </button>
                            </div>

                            <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm cursor-default" 
                                popover="auto" id={`user-more-dropdown`} style={{ positionAnchor: `--user-more-anchor` }}>
                                <li>
                                    <Link className="justify-between" to={`/${user.username || user.id}`}>
                                        View
                                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                            󰈈
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="justify-between" to={`/${user.username || user.id}`}>
                                        Read
                                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                            
                                        </span>
                                    </Link>
                                </li>
                                <hr></hr>
                                <li 
                                    onClick={() => {
                                        if (following || loadingFollow) return;

                                        setLoadingFollow(true);

                                        setTimeout(() => {
                                            setLoadingFollow(false);
                                            setFollowing(true);
                                        }, 500);
                                    }}
                                >
                                    <div className="justify-between">
                                        {!following ? `${user.visibility === "public" ? "Follow" : "Request Follow"}` : "Following"}
                                        <span className={`flex items-center justify-center h-6 w-4 text-lg font-nerdfont ${loadingFollow ? "loading" : ""}`}>
                                            {!following ? "" : ""}
                                        </span>
                                    </div>
                                </li>
                                <li>
                                    <Link className="justify-between" to={`/${user.username || user.id}`}>
                                        Add Friend
                                        <span className="flex items-center justify-center h-6 w-4 text-lg font-nerdfont">
                                            
                                        </span>
                                    </Link>
                                </li>
                                <hr></hr>
                                <li>
                                    <Link className="justify-between text-accent" to={`/${user.username || user.id}`}>
                                        Not Interested
                                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                            󰈉
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="justify-between text-accent" to={`/${user.username || user.id}`}>
                                        Mute
                                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                            󰂛
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="justify-between text-accent" to={`/${user.username || user.id}`}>
                                        Report
                                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                            
                                        </span>
                                    </Link>
                                </li>
                                <hr></hr>
                                <li>
                                    <Link className="justify-between" to={`/${user.username || user.id}`}>
                                        Share
                                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                            󰒗
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="justify-between" to={`/${user.username || user.id}`}>
                                        Copy ID
                                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                            󰅇
                                        </span>
                                    </Link>
                                </li>
                                <hr></hr>
                                <li>
                                    <Link className="justify-between text-warning" to={`/${user.username || user.id}`}>
                                        Moderate
                                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                                            
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link className="justify-between text-warning" to={`/${user.username || user.id}`}>
                                        Manage
                                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                                            
                                        </span>
                                    </Link>
                                </li>
                            </ul>

                            { user.fanflair ?
                                <img
                                    className="absolute z-1 top-[-72px] left-8 rounded-full h-32 w-32 object-cover"
                                    src={`https://cdn.openprofile.app/${user.avatar}`}
                                    alt="avatar"
                                /> : ""
                            }

                            { user.avatar ?
                                <img
                                    className="absolute z-1 top-[-72px] left-8 rounded-full h-32 w-32 object-cover"
                                    src={`https://cdn.openprofile.app/${user.avatar}`}
                                    alt="avatar"
                                /> : ""
                            }

                            <div 
                                className="absolute bg-success rounded-full h-8 w-8 top-6 left-30 border-6 border-base-100 z-2 tooltip tooltip-top"
                                data-tip="Online"
                            />

                            { user.status ? 
                                <div className="absolute glass bg-[#00000085] rounded p-2 left-48 max-w-[calc(100%-242px)] md:max-w-[512px] top-[-72px] z-1">
                                    <div className="text-white text-sm line-clamp-5 md:line-clamp-3">
                                        {user.status}
                                    </div>
                                </div>
                                : ""
                            }

                            <div className="relative top-8 flex flex-col w-full z-2">
                                <div className="flex justify-between gap-2 flex-wrap">
                                    <div className="flex items-center overflow-hidden">
                                        <span className="text-xl font-bold truncate leading-snug">
                                            {user.displayName || user.username || user.id} 
                                        </span>
                                    </div>
            
                                    {user.visibility !== "friends" && (
                                        <button
                                            className="flex gap-2 h-7 px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                            // TO UNFOLLOW; DISPLAY UNFOLLOW PROMPT (are you sure you want to unfollow)
                                            onClick={() => {
                                                if (following || loadingFollow) return;

                                                setLoadingFollow(true);

                                                setTimeout(() => {
                                                    setLoadingFollow(false);
                                                    setFollowing(true);
                                                }, 500);
                                            }}
                                        >
                                            <span className={`text-lg font-nerdfont w-4 ${loadingFollow ? "loading" : ""}`}>
                                                {!following ? `${user.visibility === "public" ? "" : ""}` : ""}
                                            </span>
                                            {!following ? `${user.visibility === "public" ? "Follow" : "Request Follow"}` : "Following"}
                                        </button>
                                    )}
            
                                    {user.visibility === "friends" && (
                                        <button
                                            className="flex gap-2 h-7 px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                            onClick={() => { closeCreateProjectModal() }}
                                        >
                                            <span className="text-base font-nerdfont w-4">
                                                
                                            </span>
                                            Request Friend
                                        </button>
                                    )}
            
                                    {/*<button
                                        className="flex gap-2 h-7 px-3 text-sm btn btn-success border-success uppercase"
                                        onClick={() => { closeCreateProjectModal() }}
                                    >
                                        <span className="text-base font-nerdfont w-4">
                                            
                                        </span>
                                        {visibility === "friends" ? "Request Friend" : "Friends"}
                                    </button>*/}
            
                                    { user.isExplicit ? 
                                        <button className="flex gap-2 h-7 px-3 text-sm btn btn-accent border-accent uppercase"
                                            onClick={() => { closeCreateProjectModal() }}>
                                            <span className="text-base">
                                                18+
                                            </span>
                                        </button>
                                        : ""
                                    }
            
                                    {/*{ visibility !== "public" ? 
                                        <button className="flex gap-2 h-7 px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                            onClick={() => { closeCreateProjectModal() }}>
                                            <span className="text-base font-nerdfont w-4">
                                                
                                            </span>
                                            Private
                                        </button>
                                        : ""
                                    }*/}
            
                                    <div className="ml-auto flex shrink-0">
                                        <Badges badges={user.badges} />
                                    </div>
                                </div>
            
                                <div className="flex mb-2 items-center overflow-hidden">
                                    <span className="truncate text-sm leading-snug">
                                        @{user.username}
                                    </span>
                                </div>
            
                                {/* On click, "show more", display a popup showing the full bio (max 512 characters)*/}
                                <div className="text-base line-clamp-3">
                                    {user.about}
                                </div>

                                <div className="relative mt-4 mb-8 flex flex-col gap-3 text-sm">
                                    <div className="flex items-center flex-wrap">
                                        <div className="flex items-center gap-8 flex-wrap">
                                            <ExternalLinks links={allLinks} />
                                        </div>

                                        <div className="flex items-center ml-auto">
                                            <div className="flex items-center gap-4 flex-wrap">
                                                <div className="flex items-center ml-auto">
                                                    <span className={`leading-none font-nerdfont text-base ${user.interactions?.fanflairs?.interacted ? "text-accent" : ""}`}>
                                                        󰃫
                                                    </span>
                                                    <span className="text-sm ml-2 whitespace-nowrap">
                                                        March 23, 2003
                                                    </span>
                                                </div>

                                                <div className="flex items-center ml-auto">
                                                    <span className={`leading-none font-nerdfont text-base ${user.interactions?.fanflairs?.interacted ? "text-accent" : ""}`}>
                                                        󰃭
                                                    </span>
                                                    <span className="text-sm ml-2 whitespace-nowrap">
                                                        April 2, 2024
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center flex-wrap">
                                        <div className="flex items-center gap-8 flex-wrap">
                                            <div className="flex items-center">
                                                <span className={`leading-none font-nerdfont text-base ${user.interactions?.views?.interacted ? "text-accent" : ""}`}>
                                                    
                                                </span>
                                                <span className="text-sm ml-2 whitespace-nowrap">
                                                    <span className="font-bold mr-1">
                                                        {formatNumber(user.interactions?.views?.count || 21).short}
                                                    </span> 
                                                    Followers
                                                </span>
                                                <span className="text-sm ml-4 whitespace-nowrap">
                                                    <span className="font-bold mr-1">
                                                        {formatNumber(user.interactions?.views?.count || 30).short}
                                                    </span> 
                                                    Following
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center ml-auto">
                                            <span className={`leading-none font-nerdfont text-base ${user.interactions?.views?.interacted ? "text-accent" : ""}`}>
                                                󰈈
                                            </span>
                                            <span className="text-sm ml-2 whitespace-nowrap">
                                                <span className="font-bold mr-1">
                                                    {formatNumber(user.interactions?.views?.count || 376).short}
                                                </span> 
                                                Views
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/*<div className="flex flex-1 flex-col w-full mt-4">
                            <label className="input w-full">
                                <span className="font-nerdfont text-base mr-1"></span>
                                <input type="search" required placeholder={`Seatch ${user.displayName}'s content...`} />
                            </label>
                        </div>*/}

                        <div className="flex flex-col w-full mt-4">
                            <div className="tabs tabs-lift w-full flex overflow-x-auto">
                                <button
                                    className={`tab flex-1 min-w-fit ${activeTab === "projects" ? "tab-active bg-transparent" : ""}`}
                                    onClick={() => setActiveTab("projects")}
                                >
                                    Projects (1)
                                </button>

                                <button
                                    className={`tab flex-1 min-w-fit ${activeTab === "profiles" ? "tab-active bg-transparent" : ""}`}
                                    onClick={() => setActiveTab("profiles")}
                                >
                                    Profiles (3)
                                </button>

                                <button
                                    className={`tab flex-1 min-w-fit ${activeTab === "collaborations" ? "tab-active bg-transparent" : ""}`}
                                    onClick={() => setActiveTab("collaborations")}
                                >
                                    Collaborations (5)
                                </button>

                                <button
                                    className={`tab flex-1 min-w-fit ${activeTab === "collections" ? "tab-active bg-transparent" : ""}`}
                                    onClick={() => setActiveTab("collections")}
                                >
                                    Collections (1)
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="px-4 md:px-14 rounded overflow-y-auto">
                        {activeTab === "projects" && 
                            <div className="flex flex-col justify-center">
                                <div className="flex flex-wrap gap-4">
                                    <ProjectCard
                                        id="1655391085225720"
                                        aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                        banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                        name="Dragonights"
                                        slug="dragonights"
                                        owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                        status="Follow to keep up with the J9 universe. Follow to keep up with the J9 unive."
                                        about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                        interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                                    />

                                    <ProjectCard
                                        id="1655391085225720"
                                        aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                        banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                        name="Dragonights"
                                        slug="dragonights"
                                        owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                        status="Follow to keep up with the J9 universe. Follow to keep up with the J9 unive."
                                        about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence. Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                        interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                                    />
                                </div>

                                <div className="flex items-center justify-center mt-8 mb-8">
                                    <div className="join border border-base-300 rounded">
                                        <button className="join-item btn font-nerdfont"></button>
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="1" />
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="2" />
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="3" />
                                        <input className="join-item btn btn-square bg-base-300 font-nerdfont" type="radio" name="options" aria-label="󰇘" disabled={true} />
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="98" />
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="99" />
                                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="100" />
                                        <button className="join-item btn font-nerdfont"></button>
                                    </div>
                                </div>
                            </div>
                        }
                        
                        {activeTab === "profiles" && <div>Profiles content...</div>}
                        {activeTab === "collaborations" && <div>Collaborations content...</div>}
                        {activeTab === "collections" && <div>Collections content...</div>}
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}