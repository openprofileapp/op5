import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { formatNumber } from "kage-library/client";

import isGateway from "../../_common/helpers/isGateway.js";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import ProjectCard from "../components/ProjectCard.js";
import Badges from "../components/Badges.js";
import { toast } from "../scripts/toast.js";
import RestrictModal from "../components/modals/RestrictModal.js";
import BlockModal from "../components/modals/BlockModal.js";
import MuteModal from "../components/modals/MuteModal.js";
import ExternalLinks from "../components/ExternalLinks.js";
import CharacterCard from "../components/CharacterCard.js";
import Mention from "../components/Mention.js";
import React from "react";
import TitleCard from "../components/TitleCard.js";
import AskAlice from "../components/AskAlice.js";

export default function NotFound() {
    const { id } = useParams();
    const { t, ready } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("about");
    const [user, setUser] = useState<unknown[]>([]);
    const [profiles, setProfiles] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);
    const [following, setFollowing] = useState(false);
    const [blocked, setBlocked] = useState(false);
    const [loadingFollow, setLoadingFollow] = useState(false);
    const [loadingBlock, setLoadingBlock] = useState(false);
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
                const res = await fetch(
                    `https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/users?id=${id}`
                );

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

        if (id) fetchUsers();
    }, [id, navigate]);

    useEffect(() => {
        if (!user?.id) return;
        
        const fetchProfiles = async () => {
            try {
                const res = await fetch(`https://${isGateway() ? window.location.host : window.config.domains.api}${isGateway() ? "/api" : ""}/v2/profiles?owner=${user.id}`);
                const data = await res.json();
                setProfiles(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, [user]);

   const setTab = (tab: string) => {
        if (tab === "about" || tab === "pinned") {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            window.location.hash = tab;
        }

        setActiveTab(tab);
    };

    useEffect(() => {
        const updateTab = () => {
            setActiveTab(window.location.hash.replace("#", "") || "pinned");
        };

        window.addEventListener("hashchange", updateTab);

        updateTab();

        return () => {
            window.removeEventListener("hashchange", updateTab);
        };
    }, []);

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

    const customBadges = [
        {
            type: "trusted"
        }
    ];

    user.presence = "dnd";

    const allBadges = [...(user.badges ?? []), ...customBadges];

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

    const isStaff = user.badges?.some(badge => badge.type === "staff") ?? false;

    if (!ready || loading) return null;

    return (
        <>
            <Metadata
                title="Template"
                allowIndex="false"
            />

            <MuteModal userId={user.id} displayName={user.displayName || user.username || user.id} isStaff={isStaff} />
            <RestrictModal userId={user.id} displayName={user.displayName || user.username || user.id} isStaff={isStaff} />
            <BlockModal userId={user.id} displayName={user.displayName || user.username || user.id} isStaff={isStaff} />

            <Navbar isBannerPage={true} />

            <AskAlice/>

            <div className={user.isAuraEnabled ? "bg-base-200" : "bg-base-200"}>
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
                                            var(--color-base-200)
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
                    
                    <div className="px-0 py-8 md:px-25 md:py-20">
                        <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4">
                            <div className="flex flex-col gap-4">
                                <div className="aura-box p-6 h-fit" style={auraStyle}>
                                    <div className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent" data-tip="More">
                                        <button type="button" className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden"
                                            popoverTarget={`user-more-dropdown`} style={{ anchorName: `--user-more-anchor` }}
                                        >
                                            <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                                                󰇘
                                            </span>
                                        </button>
                                    </div>

                                    {/* Move menu to its own component and use vars to prevent dupped code */}
                                    <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm cursor-default" 
                                        popover="auto" id={`user-more-dropdown`} style={{ positionAnchor: `--user-more-anchor` }}>
                                        <li>
                                            <Link className="justify-between text-info" to={`/${user.username || user.id}`}>
                                                Edit Profile
                                                <span className="flex items-center justify-center w-4 h-6 text-info text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <Link className="justify-between" to={`/${user.username || user.id}`}>
                                                View
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    󰈈
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
                                                    toast.show(`You followed ${user.displayName}`, { icon: "", type: "success" });
                                                }, 500);
                                            }}
                                        >
                                            <div className="justify-between">
                                                {!following ? `${user.visibility === "public" ? "Follow" : "Request Follow"}` : "Following"}
                                                <span className={`flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0 ${loadingFollow ? "loading" : ""}`}>
                                                    {!following ? "" : ""}
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <Link className="justify-between" to={`/${user.username || user.id}`}>
                                                Message
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <li>
                                            <div 
                                                className="justify-between"
                                                onClick={() => {
                                                    // Immediatly, then update loading state so if its reopened it will display the state
                                                    document.getElementById("user-more-dropdown")?.hidePopover();

                                                    // Toast on API success
                                                    toast.show(`You sent a friend request to ${user.displayName}`, { icon: "", type: "success" });
                                                }}
                                            >
                                                Add Friend
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </div>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <Link className="justify-between " to={`/${user.username || user.id}`}>
                                                Submit Fanart
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="justify-between " to={`/${user.username || user.id}`}>
                                                Gift Premium
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <div 
                                                className="justify-between text-error"
                                                onClick={() => {
                                                    // Immediatly, then update loading state so if its reopened it will display the state
                                                    document.getElementById("user-more-dropdown")?.hidePopover();

                                                    // Toast on API success
                                                    toast.show(`We will show less of ${user.displayName} to you`, { icon: "󰈉", type: "error" });
                                                }}
                                            >
                                                Not Interested
                                                <span className="flex items-center justify-center w-4 h-6 text-error text-lg font-nerdfont leading-none shrink-0">
                                                    󰈉
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <div 
                                                className="justify-between text-error"
                                                onClick={() => {
                                                    document.getElementById("mute")?.showModal();
                                                }}
                                            >
                                                Mute {/* Maybe "Manage Mute" if already and interaction */}
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    󰂛
                                                </span>
                                            </div>
                                        </li>
                                        <li>
                                            <div 
                                                className="justify-between text-error"
                                                onClick={() => {
                                                    document.getElementById("restrict")?.showModal();
                                                }}
                                            >
                                                Restrict
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </div>
                                        </li>

                                        <li>
                                            <div 
                                                className="justify-between text-error"
                                                onClick={() => {
                                                    document.getElementById("block")?.showModal();
                                                }}
                                            >
                                                Block
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </div>
                                        </li>

                                        {/*<li 
                                            onClick={() => {
                                                if (blocked || loadingBlock) return;

                                                setLoadingBlock(true);

                                                setTimeout(() => {
                                                    setLoadingBlock(false);
                                                    setBlocked(true);
                                                    toast.show(`You blocked ${user.displayName}`, { icon: "", type: "error" });
                                                }, 500);
                                            }}
                                        >
                                            <div className="justify-between text-error">
                                                {!blocked ? `${user.visibility === "public" ? "Block" : "Request Follow"}` : "Unblock"}
                                                <span className={`flex items-center justify-center w-4 h-6 "text-lg font-nerdfont leading-none shrink-0 ${loadingBlock ? "loading" : ""}`}>
                                                    {!blocked ? "" : ""}
                                                </span>
                                            </div>
                                        </li>*/}
                                        <li>
                                            <Link className="justify-between text-error" to={`/${user.username || user.id}`}>
                                                Report
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <Link className="justify-between" to={`/${user.username || user.id}`}>
                                                Share
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    󰒗
                                                </span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="justify-between" to={`/${user.username || user.id}`}>
                                                Copy ID
                                                <span className="flex items-center justify-center w-4 h-6 text-3xl font-nerdfont leading-none shrink-0">
                                                    󰻾
                                                </span>
                                            </Link>
                                        </li>
                                        <hr></hr>
                                        <li>
                                            <Link className="justify-between text-warning" to={`/${user.username || user.id}`}>
                                                Moderate
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                        <li>
                                            <Link className="justify-between text-warning" to={`/${user.username || user.id}`}>
                                                Manage
                                                <span className="flex items-center justify-center w-4 h-6 text-lg font-nerdfont leading-none shrink-0">
                                                    
                                                </span>
                                            </Link>
                                        </li>
                                    </ul>

                                    <div className="relative flex flex-col items-center py-2 z-2">
                                        { user.username === "avatarkage" && ( // user.fanflair
                                            <div
                                                className="absolute z-1 top-[-6px] tooltip tooltip-bottom md:tooltip-right cursor-pointer"
                                            >
                                                <div className="tooltip-content tooltip-display">
                                                    <div className="flex justify-center w-full">
                                                        <img
                                                            className="h-32 w-32 object-contain"
                                                            src={`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/uploads/942ba7b3-f359-4b06-8189-2223950b246c.png`}
                                                            alt="avatar"
                                                        />
                                                    </div>
                                                    <div className="font-bold mt-2">Cyeletal Crystals</div>
                                                    <div className="text-xs">From Dragonights by J9 Studios. Follow the project to use this fanflair.</div>
                                                </div>
                                                <img
                                                    className="h-38 w-38 object-contain"
                                                    src={`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/uploads/942ba7b3-f359-4b06-8189-2223950b246c.png`}
                                                    alt="avatar"
                                                />
                                            </div>
                                        )}

                                        {/* Make presense a component or avatar a component (better) */}
                                        {/* If no avatar, use a default one using a ghost value (color) */}
                                        <div className="relative">
                                            <img
                                                className="rounded-full h-32 w-32 object-cover"
                                                src={`https://cdn.openprofile.app/${user.avatar}`}
                                                alt="avatar"
                                            />

                                            {user.presence === "online" && (
                                                <div 
                                                    className="absolute bg-success rounded-full h-8 w-8 bottom-0 right-0 border-6 border-base-100 tooltip tooltip-top z-2"
                                                    data-tip="Online"
                                                />
                                            )}

                                            {user.presence === "idle" && (
                                                <div 
                                                    className="absolute bg-base-100 rounded-full h-8 w-8 bottom-0 right-0 border-6 border-base-100 tooltip tooltip-top z-2"
                                                    data-tip="Idle"
                                                >
                                                    <svg className="relative top-0.25 left-0.25" width="19" height="19" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M14.0845 1.32397C14.0845 0.967041 14.2159 0.657227 14.4789 0.394287C14.7418 0.131348 15.0516 0 15.4084 0C15.5775 0 15.7277 0.0280762 15.8592 0.0844727C18.2817 0.967041 20.2441 2.46021 21.7465 4.56348C23.2488 6.66675 24 9.03296 24 11.6619C24 15.0798 22.7982 17.9907 20.3944 20.3943C17.9906 22.7981 15.0798 24 11.662 24C9.0329 24 6.65729 23.2488 4.53522 21.7466C2.41315 20.2441 0.920166 18.2817 0.0563354 15.8591C0.0187988 15.7654 0 15.615 0 15.4084C0 15.0518 0.13147 14.7417 0.394348 14.479C0.657288 14.2161 0.967163 14.0845 1.32397 14.0845C1.49298 14.0845 1.64319 14.1128 1.77466 14.1689C2.90143 14.5635 4 14.7605 5.07043 14.7605C7.73712 14.7605 10.0094 13.8215 11.8873 11.9436C13.7653 10.0657 14.7136 7.77466 14.7324 5.07031C14.7324 3.9436 14.5446 2.84497 14.169 1.77466C14.1127 1.62451 14.0845 1.47412 14.0845 1.32397L14.0845 1.32397Z" fill="var(--color-premium)" fill-rule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}

                                            {user.presence === "dnd" && (
                                                <div 
                                                    className="absolute bg-accent rounded-full h-8 w-8 bottom-0 right-0 border-6 border-base-100 tooltip tooltip-top z-2 flex items-center justify-center"
                                                    data-tip="Do Not Disturb"
                                                >
                                                    <div className="text-lg font-nerdfont leading-none text-base-100">󱘹</div>
                                                </div>
                                            )}

                                            {user.presence === "offline" && (
                                                <div className="absolute bg-[#666666] rounded-full h-8 w-8 bottom-0 right-0 border-6 border-base-100 tooltip tooltip-top z-2">
                                                    <div className="tooltip-content">
                                                        <div className="font-bold">Last Active</div>
                                                        <div className="text-xs">56 seconds ago</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center w-full mt-5">
                                            <h1 className="truncate text-xl font-bold text-center">
                                                {user.displayName || user.username || user.id}
                                            </h1>
                                            <Badges badges={allBadges} hasBackground={false} />
                                        </div>

                                        <div className="flex items-center justify-center gap-2 w-full">
                                            <div className="truncate text-sm text-center text-sub">
                                                @{user.username}{user.pronouns ? ` • ${user.pronouns}` : ""}
                                            </div>
                                        </div>

                                        <div className="flex justify-between gap-2 flex-wrap w-full mt-4">
                                            {/*<button
                                                className="flex gap-2 h-8 w-full px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                                onClick={() => { closeCreateProjectModal() }}
                                            >
                                                <span className="text-base font-nerdfont w-4">
                                                    󰈈
                                                </span>
                                                View Profile
                                            </button>*/}

                                            {user.username === "avatarkage" && (
                                                <button
                                                    className="flex gap-2 w-full h-8 px-3 text-sm btn btn-base-200 border-base-300"
                                                    onClick={() => { toast.show("NAME: Ready to publish the new character?", { icon: "" }) }}
                                                >
                                                    <span className="text-base font-nerdfont w-4">
                                                        
                                                    </span>
                                                    Edit Profile
                                                </button>
                                            )}

                                            {user.username !== "avatarkage" && user.visibility !== "friends" && (
                                                <button
                                                    className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300"
                                                    // TO UNFOLLOW; DISPLAY UNFOLLOW PROMPT (are you sure you want to unfollow)
                                                    onClick={() => {
                                                        if (following || loadingFollow) return;
        
                                                        setLoadingFollow(true);
        
                                                        setTimeout(() => {
                                                            setLoadingFollow(false);
                                                            setFollowing(true);
                                                            toast.show(`You followed ${user.displayName}`, { icon: "", type: "success" });
                                                        }, 500);
                                                    }}
                                                >
                                                    <span className={`text-lg font-nerdfont w-4 ${loadingFollow ? "loading" : ""}`}>
                                                        {!following ? `${user.visibility === "public" ? "" : ""}` : ""}
                                                    </span>
                                                    {!following ? `${user.visibility === "public" ? "Follow" : "Request Follow"}` : "Following"}
                                                </button>
                                            )}

                                            {user.username !== "avatarkage" && (
                                                <button
                                                    className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300"
                                                    onClick={() => { closeCreateProjectModal() }}
                                                >
                                                    <span className="text-base font-nerdfont w-4">
                                                        
                                                    </span>
                                                    Message
                                                </button>
                                            )}

                                            {/*<button
                                                className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300"
                                                onClick={() => { closeCreateProjectModal() }}
                                            >
                                                <span className="text-base font-nerdfont w-4">
                                                    
                                                </span>
                                            </button>*/}
                    
                                            {user.visibility === "friends" && (
                                                <button
                                                    className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                                    onClick={() => { closeCreateProjectModal() }}
                                                >
                                                    <span className="text-base font-nerdfont w-4">
                                                        
                                                    </span>
                                                    Request Friend
                                                </button>
                                            )}
                    
                                            {/*<button
                                                className="flex gap-2 h-8 px-3 text-sm btn btn-success border-success uppercase"
                                                onClick={() => { closeCreateProjectModal() }}
                                            >
                                                <span className="text-base font-nerdfont w-4">
                                                    
                                                </span>
                                                {visibility === "friends" ? "Request Friend" : "Friends"}
                                            </button>*/}
                    
                                            { user.isExplicit ? 
                                                <button className="flex gap-2 h-8 px-3 text-sm btn btn-accent border-accent uppercase"
                                                    onClick={() => { closeCreateProjectModal() }}>
                                                    <span className="text-base">
                                                        18+
                                                    </span>
                                                </button>
                                                : ""
                                            }
                    
                                            {/*{ visibility !== "public" ? 
                                                <button className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300 uppercase"
                                                    onClick={() => { closeCreateProjectModal() }}>
                                                    <span className="text-base font-nerdfont w-4">
                                                        
                                                    </span>
                                                    Private
                                                </button>
                                                : ""
                                            }*/}
                                        </div>

                                        {user.about && (
                                            <p className="text-sm w-full mt-4">
                                                {user.about}
                                            </p>
                                        )}

                                        <div className="flex flex-col gap-4 w-full mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-nerdfont leading-none text-base">󰃭</div>
                                                <div className="text-sm">April 2, 2024</div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="font-nerdfont leading-none text-base">󰃫</div>
                                                <div className="text-sm">March 23, 2003</div>
                                            </div>

                                            
                                            <div className="flex items-center gap-2">
                                                <div className="font-nerdfont leading-none text-base"></div>
                                                <div className="text-sm">United States</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 flex-wrap hidden">
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

                                <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                    <div className="w-full text-center text-lg font-bold mb-6">External Links</div>
                                    <ExternalLinks links={allLinks} hasBackground={false} />
                                </div>

                                <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                    <div className="w-full text-center text-lg font-bold mb-6">Awards</div>
                                    <div className="grid grid-cols-3 gap-4 w-full text-center">
                                        <div 
                                            className="aspect-square rounded border border-base-300 tooltip"
                                        >
                                            <div className="tooltip-content">
                                                <div className="font-bold">Precursor</div>
                                                <div className="text-xs">Earned by being within the first 500 registrations. You are #1.</div>
                                            </div>
                                            <img 
                                                src="https://i.postimg.cc/Xv4wrmND/Path.png"
                                                alt="Precursor"
                                                className="w-full h-full object-contain p-3"
                                            />
                                        </div>
                                        <div 
                                            className="aspect-square rounded border border-base-300 tooltip"
                                            data-tip="pinned"
                                        >
                                            <img 
                                                src="https://i.postimg.cc/j5WBLZXR/Patsh.png"
                                                alt="pinned"
                                                className="w-full h-full object-contain p-3"
                                            />
                                        </div>
                                        <div 
                                            className="aspect-square rounded border border-base-300 tooltip"
                                            data-tip="Entomologist"
                                        >
                                            <img 
                                                src="https://i.postimg.cc/QCtmHPms/Padth.png"
                                                alt="Entomologist"
                                                className="w-full h-full object-contain p-3"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                    <div className="w-full text-center text-lg font-bold mb-6">Statistics</div>
                                    <div className="grid grid-cols-3 gap-4 w-full text-center">
                                        <div>
                                            <div className="font-bold">{formatNumber(383).short}</div>
                                            <div className="text-xs text-sub">Views</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">{formatNumber(21).short}</div>
                                            <div className="text-xs text-sub">Followers</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">{formatNumber(30).short}</div>
                                            <div className="text-xs text-sub">Following</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">{formatNumber(8).short}</div>
                                            <div className="text-xs text-sub">Likes</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">{formatNumber(1).short}</div>
                                            <div className="text-xs text-sub">Favorites</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative flex flex-col items-center bg-base-100 border border-base-300 p-6 base-200 rounded-lg h-fit">
                                    <div className=" w-full mb-6">
                                        <div className="w-full text-center text-lg font-bold">Advertisement</div>
                                        <div className="text-center mt-1 text-xs text-sub">Subscribe to Premium to remove this.</div>
                                    </div>
                                    <img className="rounded-lg border border-base-300 w-48 md:w-full" src={`https://${window.config.domains.gateway}/cdn/uploads/ad.jpg`} />
                                    <div className="text-center mt-6 text-xs text-sub">Provided by AvatarKage</div>
                                </div>
                            </div>

                            <div className="bg-base-100 overflow-hidden border border-base-300 rounded-lg z-1">
                                <div className="bg-base-200 border-base-300">
                                    <div className="tabs tabs-lift flex-nowrap">

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "pinned"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("pinned")
                                            }
                                        >
                                            Pinned
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "about"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("about")
                                            }
                                        >
                                            About
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "universes"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("universes")
                                            }
                                        >
                                            Universes
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "profiles"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("profiles")
                                            }
                                        >
                                            Profiles
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collections"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("collections")
                                            }
                                        >
                                            Collections
                                        </button>



                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "titles"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("titles")
                                            }
                                        >
                                            Titles
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collaborations"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("collaborations")
                                            }
                                        >
                                            Collaborations
                                        </button>

                                    </div>
                                </div>

                                {/* TAB CONTENT */}

                                <div className="p-2 md:p-4">

                                    {activeTab === "about" && (
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

                                    {activeTab === "pinned" && (
                                        <div className="p-4 flex flex-wrap gap-4">

                                            <ProjectCard
                                                id="1655391085225720"
                                                aura={{
                                                    isEnabled: true,
                                                    type: "flow",
                                                    primary: "#76d1ff",
                                                    secondary: "#76d1ff",
                                                }}
                                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                                name="Dragonights"
                                                slug="dragonights"
                                                owner={{
                                                    id: "5019646586243236",
                                                    username: "j9studios",
                                                    name: "J9 Studios",
                                                    isVerified: true,
                                                    type: "publisher",
                                                }}
                                                status="Follow to keep up with the J9 universe."
                                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series."
                                                interactions={{
                                                    views: {
                                                        count: 481,
                                                        interacted: true,
                                                    },
                                                    follows: {
                                                        count: 6,
                                                        interacted: true,
                                                    },
                                                    profiles: {
                                                        count: 52,
                                                        interacted: true,
                                                    },
                                                    fanflairs: {
                                                        count: 5,
                                                    },
                                                }}
                                            />

                                            {!loading &&
                                                profiles.profiles?.map((d) => (
                                                    <CharacterCard
                                                        key={d.id}
                                                        id={d.id}
                                                        aura={{
                                                            isEnabled: d.isAuraEnabled,
                                                            type: d.auraType,
                                                            primary: d.auraPrimary,
                                                            secondary: d.auraSecondary
                                                        }}
                                                        avatar={
                                                            d.avatar
                                                                ? `https://cdn.openprofile.app${d.avatar}`
                                                                : ""
                                                        }
                                                        name={d.displayName}
                                                        slug={d.slug}
                                                        owner={{
                                                            id: profiles.owner.id,
                                                            slug: profiles.owner.username,
                                                            name: profiles.owner.displayName,
                                                            isVerified: profiles.owner.badges?.some(
                                                                (b) => b.type === "verified"
                                                            ),
                                                            type: profiles.owner.type
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
                                        </div>
                                    )}

                                    {activeTab === "universes" && (
                                        <div className="p-4 flex flex-wrap gap-4">

                                            <ProjectCard
                                                id="1655391085225720"
                                                aura={{
                                                    isEnabled: true,
                                                    type: "flow",
                                                    primary: "#76d1ff",
                                                    secondary: "#76d1ff",
                                                }}
                                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                                name="Dragonights"
                                                slug="dragonights"
                                                owner={{
                                                    id: "5019646586243236",
                                                    username: "j9studios",
                                                    name: "J9 Studios",
                                                    isVerified: true,
                                                    type: "publisher",
                                                }}
                                                status="Follow to keep up with the J9 universe."
                                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series."
                                                interactions={{
                                                    views: {
                                                        count: 481,
                                                        interacted: true,
                                                    },
                                                    follows: {
                                                        count: 6,
                                                        interacted: true,
                                                    },
                                                    profiles: {
                                                        count: 52,
                                                        interacted: true,
                                                    },
                                                    fanflairs: {
                                                        count: 5,
                                                    },
                                                }}
                                            />
                                        </div>
                                    )}

                                    {activeTab === "profiles" && (
                                        <>
                                            <div className="px-0 md:px-4 flex flex-row gap-3">
                                                <fieldset className="fieldset flex-4">
                                                    <legend className="fieldset-legend">Search</legend>
                                                    <label className="input mb-4 w-full">
                                                        <span className="font-nerdfont text-base mr-1"></span>
                                                        <input type="search" placeholder="Name, franchises, topics..." />
                                                    </label>
                                                </fieldset>

                                                <fieldset className="fieldset flex-1">
                                                    <legend className="fieldset-legend">Filter</legend>
                                                    <select defaultValue="Pick a browser" className="select w-full">
                                                        <option value="updated">Recently Updated</option>
                                                        <option value="newest">Newest First</option>
                                                        <option value="oldest">Oldest First</option>
                                                        <option value="popular-desc">Most Popular</option>
                                                        <option value="popular-asc">Least Popular</option>
                                                        <option value="name-asc">Name (A–Z)</option>
                                                        <option value="name-desc">Name (Z–A)</option>
                                                    </select>
                                                </fieldset>
                                            </div>
                                            
                                            <div className="px-0 md:px-4 flex flex-wrap gap-4">
                                                {!loading &&
                                                    profiles.profiles?.map((d) => (
                                                        <CharacterCard
                                                            key={d.id}
                                                            id={d.id}
                                                            aura={{
                                                                isEnabled: d.isAuraEnabled,
                                                                type: d.auraType,
                                                                primary: d.auraPrimary,
                                                                secondary: d.auraSecondary
                                                            }}
                                                            avatar={
                                                                d.avatar
                                                                    ? `https://cdn.openprofile.app${d.avatar}`
                                                                    : ""
                                                            }
                                                            name={d.displayName}
                                                            slug={d.slug}
                                                            owner={{
                                                                id: profiles.owner.id,
                                                                slug: profiles.owner.username,
                                                                name: profiles.owner.displayName,
                                                                isVerified: profiles.owner.badges?.some(
                                                                    (b) => b.type === "verified"
                                                                ),
                                                                type: profiles.owner.type
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
                                            </div>

                                            <div className="px-0 md:px-4 text-center mt-24 text-xl">You've reached the end!</div>
                                            <div className="px-0 md:px-4 text-center mb-24 mt-2 text-sm text-sub">Follow {user.displayName} to never miss a new publication.</div>

                                            <div className="px-0 md:px-4 flex items-center justify-center mt-8 mb-6">
                                                <div className="join border border-base-300 rounded">
                                                    <button className="join-item btn font-nerdfont"></button>
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="1" />
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="2" />
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="3" />
                                                    <input className="join-item btn btn-square font-nerdfont" type="radio" name="options" aria-label="󰇘" disabled={true} />
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="98" />
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="99" />
                                                    <input className="join-item btn btn-square" type="radio" name="options" aria-label="100" />
                                                    <button className="join-item btn font-nerdfont"></button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    
                                    {activeTab === "collaborations" && (
                                        <div className="p-4">
                                            <br/>
                                            <div className="text-2xl font-bold">Universes</div>
                                            <br/><hr/><br/>
                                            <div className="text-2xl font-bold">Profiles</div>
                                            <br/><hr/><br/>
                                            <div className="text-2xl font-bold">Collections</div>
                                        </div>
                                    )}

                                    {activeTab === "titles" && (
                                        <div className="p-4 flex flex-wrap gap-4">
                                            <TitleCard
                                                key="0"
                                                id="0"
                                                avatar="https://play.google.com/books/publisher/content/images/frontcover/5JlREQAAQBAJ?fife=w480-h690"
                                            />
                                        </div>
                                    )}

                                    {activeTab === "collections" && (
                                        <div className="p-4">
                                            Collections content...
                                        </div>
                                    )}

                                    {activeTab === "downloadables" && (
                                        <div className="p-4">
                                            Downloadables content...
                                        </div>
                                    )}

                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}