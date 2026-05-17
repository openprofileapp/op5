import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client"

type Project = {
    id: string;
    aura?: {
        isEnabled?: boolean;
        type?: string;
        primary?: string;
        secondary?: string;
    };
    avatar?: string;
    banner?: string;
    name?: string;
    slug?: string;
    status?: string;
    owner: {
        id: string;
        name?: string;
        username?: string;
        isVerified?: boolean;
    };
    about?: string;
    interactions?: {
        views?: {
            count?: number,
            interacted?: boolean
        },
        follows?: {
            count?: number,
            interacted?: boolean
        },
        profiles?: {
            count?: number,
            interacted?: boolean
        },
        fanflairs?: {
            count?: number,
            interacted?: boolean
        }
    },
    notification?: {
        isActive?: boolean,
        time?: string
    }
};

let index = 1;

export default function ProjectCard({
    id,
    aura,
    banner,
    name,
    slug,
    owner,
    status,
    about,
    interactions,
    notification
}: Project) {
    const { ready } = useTranslation();

    if (!ready) return null;

    index++

    const auraStyle = aura?.isEnabled
        ? 
            {
                ["--aura-type" as string]:
                    // eslint-disable-next-line no-constant-binary-expression
                    `aura-${aura?.type}-project` || "aura-flow-project",

                ["--aura-primary" as string]:
                    aura.primary || "var(--color-accent)",

                ["--aura-secondary" as string]:
                    aura.secondary || "var(--color-accent)",
            }
        : 
            {
                border: "1px solid #222222",
            }
        ;

    {/* Url for images are only cdn slugs, not the domain. Fix code below */}

    if (
        !id || 
        !owner || 
        !owner.id
    ) {
        return;
    }

    return (
        <div
            className={`project-card relative p-4 shadow-sm cursor-pointer z-${index}`}
            style={auraStyle}
        >
            {
                notification?.isActive ?
                    <div className="absolute top-[-5px] right-[-5px] z-3 tooltip tooltip-top tooltip-accent" 
                        data-tip={`Updated ${notification?.time}`}>
                        <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
                        <div className="relative rounded-full bg-accent w-5 h-5" />
                    </div>

                    : ""
            }

            <div className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent" data-tip="More">
                <button type="button" className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden"
                    popoverTarget={`project-more-dropdown-${index}`} style={{ anchorName: `--project-more-anchor-${index}` }}
                >
                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                        󰇘
                    </span>
                </button>
            </div>

            <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm cursor-default" 
                popover="auto" id={`project-more-dropdown-${index}`} style={{ positionAnchor: `--project-more-anchor-${index}` }}>
                <li>
                    <Link className="justify-between text-info" to={`/${slug || id}`}>
                        Edit Profile
                        <span className="font-nerdfont text-info text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-info" to={`/${slug || id}`}>
                        View Analytics
                        <span className="font-nerdfont text-info text-lg h-6 leading-none translate-y-[2px]">
                            󰺓
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        View
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰈈
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Read
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Follow
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-accent" to={`/${slug || id}`}>
                        Unlike
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Unfavorite
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Add to Collection
                        <span className="font-nerdfont text-base h-6 leading-none translate-y-[4px]">
                            
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between text-accent" to={`/${slug || id}`}>
                        Not Interested
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            󰈉
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-accent" to={`/${slug || id}`}>
                        Mute
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            󰂛
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-accent" to={`/${slug || id}`}>
                        Report
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Share
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰒗
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/${slug || id}`}>
                        Copy ID
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰅇
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between text-warning" to={`/${slug || id}`}>
                        Moderate
                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-warning" to={`/${slug || id}`}>
                        Manage
                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
            </ul>

            <Link to={`/${slug || id}`}>
                <img
                    className="absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover"
                    src={banner}
                    alt="banner"
                    style={{
                        maskImage: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,1) 70%,
                            rgba(0,0,0,0.92) 72%,
                            rgba(0,0,0,0.82) 74%,
                            rgba(0,0,0,0.72) 76%,
                            rgba(0,0,0,0.6) 78%,
                            rgba(0,0,0,0.5) 80%,
                            rgba(0,0,0,0.4) 82%,
                            rgba(0,0,0,0.3) 84%,
                            rgba(0,0,0,0.22) 86%,
                            rgba(0,0,0,0.16) 88%,
                            rgba(0,0,0,0.11) 90%,
                            rgba(0,0,0,0.07) 92%,
                            rgba(0,0,0,0.04) 94%,
                            rgba(0,0,0,0.02) 97%,
                            rgba(0,0,0,0) 100%
                        )`,
                        WebkitMaskImage: `linear-gradient(
                            to bottom,
                            rgba(0,0,0,1) 70%,
                            rgba(0,0,0,0.92) 72%,
                            rgba(0,0,0,0.82) 74%,
                            rgba(0,0,0,0.72) 76%,
                            rgba(0,0,0,0.6) 78%,
                            rgba(0,0,0,0.5) 80%,
                            rgba(0,0,0,0.4) 82%,
                            rgba(0,0,0,0.3) 84%,
                            rgba(0,0,0,0.22) 86%,
                            rgba(0,0,0,0.16) 88%,
                            rgba(0,0,0,0.11) 90%,
                            rgba(0,0,0,0.07) 92%,
                            rgba(0,0,0,0.04) 94%,
                            rgba(0,0,0,0.02) 97%,
                            rgba(0,0,0,0) 100%
                        )`,
                    }}
                />

                { status ? 
                    <div className="absolute glass bg-[#00000085] rounded p-3 max-w-[394px] z-1">
                        <div className="text-white text-xs line-clamp-3">
                            { status }
                        </div>
                    </div>
                    : ""
                }
            
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    {/*<div className="font-bold text-center truncate w-full">
                        {name || slug || id}
                    </div>*/}

                    <div className="flex items-center justify-center w-full">
                        <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                            <div className="flex min-w-0 items-center overflow-hidden">
                                <span className="font-bold text-center truncate w-full truncate leading-snug">
                                    {name || slug || id}
                                </span>
                            </div>

                            {owner?.isVerified ?
                                <div className="z-1 relative font-normal tooltip tooltip-top tooltip-accent">
                                    <a href={`https://${window.config.domains.support}/en-us/articles/verification`}>
                                        <svg className="text-accent" width="18" height="18" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" 
                                            fill="#ffffff"/>
                                        </svg>
                                    </a>
                                    <div className="tooltip-content">
                                        <div className="font-bold">Official Project</div>
                                        <div className="text-xs">This project is managed by its intellectual property owners or authorized individuals.</div>
                                    </div>
                                </div>

                                : ""
                            }
                        </div>
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-1 min-w-0 max-w-full">
                            <div className="flex min-w-0 items-center overflow-hidden">
                                <span className="truncate text-xs leading-snug">
                                    {formatNumber(interactions?.follows?.count || 0).short} Followers
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-6 my-2">{about || "This project does not have an about."}</div>            
                </div>

                <div className="flex flex-row gap-8 justify-center w-full">
                    <div className="absolute z-1 bottom-3 flex flex-row gap-8 justify-center text-sm w-full p-1">
                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont text-base ${interactions?.views?.interacted ? "text-accent" : ""}`}>󰈈</span>
                            <span className="text-xs ml-2">{formatNumber(interactions?.views?.count || 0).short} Views</span>
                        </div>

                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont  text-base ${interactions?.profiles?.interacted ? "text-accent" : ""}`}>󰘸</span>
                            <span className="text-xs ml-2">{formatNumber(interactions?.profiles?.count || 0).short} Profiles</span>
                        </div>

                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont  text-base ${interactions?.fanflairs?.interacted ? "text-accent" : ""}`}>󰵲</span>
                            <span className="text-xs ml-2">{formatNumber(interactions?.fanflairs?.count || 0).short} Fanflairs</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}