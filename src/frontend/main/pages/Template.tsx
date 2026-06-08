import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import ProjectCard from "../components/ProjectCard.js";
import Badges from "../components/Badges.js";

export default function NotFound() {
    const { id } = useParams();
    const { t, ready } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("about");
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
                const res = await fetch(
                    `https://${window.config.domains.api}/v2/users?id=${id}`
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

    const aboutMarkdown = `
## My latest track
https://www.youtube.com/watch?v=6BgK6_8TMd4
`.trim();

    if (!ready || loading) return null;

    return (
        <>
            <Metadata
                title="Template"
                allowIndex="false"
            />

            <Navbar isBannerPage={true} />

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
                    
                    <div className="px-4 py-8 md:px-28 md:py-12">
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

                                    <div className="relative flex flex-col items-center z-2">
                                        { user.fanflair ?
                                            <img
                                                className="z-1 rounded-full h-32 w-32 object-cover"
                                                src={`https://cdn.openprofile.app/${user.avatar}`}
                                                alt="avatar"
                                            /> : ""
                                        }

                                        <div className="relative">
                                            <img
                                                className="rounded-full h-32 w-32 object-cover"
                                                src={`https://cdn.openprofile.app/${user.avatar}`}
                                                alt="avatar"
                                            />

                                            <div 
                                                className="absolute bg-success rounded-full h-8 w-8 bottom-0 right-0 border-6 border-base-100 tooltip tooltip-top"
                                                data-tip="Online"
                                            />
                                        </div>

                                        <div className="flex items-center justify-center w-full mt-2">
                                            <h1 className="truncate text-xl font-bold text-center">
                                                {user.displayName || user.username || user.id}
                                            </h1>
                                            <Badges badges={user.badges} hasBackground={false} />
                                        </div>

                                        <div className="truncate text-sm w-full text-center text-sub">
                                            @{user.username}
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
                                                    onClick={() => { closeCreateProjectModal() }}
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

                                        <div className="flex items-center w-full mt-4">
                                            <div className="flex items-center gap-2">
                                                <div className="font-nerdfont leading-none text-base">󰃫</div>
                                                <div className="text-sm">March 23, 2003</div>
                                            </div>

                                            <div className="ml-auto flex items-center gap-2">
                                                <div className="font-nerdfont leading-none text-base">󰃭</div>
                                                <div className="text-sm">April 2, 2024</div>
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

                                <div className="aura-box p-6 h-fit" style={auraStyle}>
                                    <div className="w-full text-center text-lg font-bold pb-6">External Links</div>
                                </div>

                                <div className="aura-box p-6 h-fit" style={auraStyle}>
                                    <div className="w-full text-center text-lg font-bold pb-6">Awards</div>
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
                                            data-tip="Featured"
                                        >
                                            <img 
                                                src="https://i.postimg.cc/j5WBLZXR/Patsh.png"
                                                alt="Featured"
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

                                <div className="aura-box p-6 h-fit" style={auraStyle}>
                                    <div className="w-full text-center text-lg font-bold pb-6">Statistics</div>
                                    <div className="grid grid-cols-3 gap-4 w-full text-center">
                                        <div>
                                            <div className="font-bold">383</div>
                                            <div className="text-xs text-sub">Views</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">21</div>
                                            <div className="text-xs text-sub">Followers</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">30</div>
                                            <div className="text-xs text-sub">Following</div>
                                        </div>

                                        <div>
                                            <div className="font-bold">8</div>
                                            <div className="text-xs text-sub">Likes</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-base-100 border border-base-300 p-6 base-200 rounded h-fit">
                                    <div className="w-full text-center text-lg font-bold pb-6">Advertisement</div>
                                    Google ad here; get premium to remove from your profile
                                </div>
                            </div>

                            <div className="bg-base-100 overflow-hidden border border-base-300 rounded-lg z-1">
                                <div className="bg-base-200 border-base-300">
                                    <div className="tabs tabs-lift flex-nowrap">

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "about"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("about")
                                            }
                                        >
                                            About
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "featured"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("featured")
                                            }
                                        >
                                            Featured
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "projects"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("projects")
                                            }
                                        >
                                            Projects
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "profiles"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("profiles")
                                            }
                                        >
                                            Profiles
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collaborations"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("collaborations")
                                            }
                                        >
                                            Collaborations
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collections"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("collections")
                                            }
                                        >
                                            Collections
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "downloadables"
                                                    ? "tab-active"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setActiveTab("downloadables")
                                            }
                                        >
                                            Downloadables
                                        </button>

                                    </div>
                                </div>

                                {/* TAB CONTENT */}

                                <div className="p-4">

                                    {activeTab === "about" && (
                                        <div className="p-4 prose text-base-content text-base">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
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

                                    {activeTab === "featured" && (
                                        <div className="flex flex-wrap gap-4">

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

                                    {activeTab === "projects" && (
                                        <div>
                                            Projects content...
                                        </div>
                                    )}

                                    {activeTab === "profiles" && (
                                        <div>
                                            Profiles content...
                                        </div>
                                    )}

                                    {activeTab === "collaborations" && (
                                        <div>
                                            Collaborations content...
                                        </div>
                                    )}

                                    {activeTab === "collections" && (
                                        <div>
                                            Collections content...
                                        </div>
                                    )}

                                    {activeTab === "downloadables" && (
                                        <div>
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