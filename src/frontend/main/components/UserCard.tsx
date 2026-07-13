import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client"
import Badges from "./Badges.js";

type Props = {
    isPreview?: boolean;
    id?: string;
    aura?: {
        isEnabled?: boolean;
        type?: string;
        primary?: string;
        secondary?: string;
    };
    avatar?: string;
    banner?: string;
    name?: string;
    username?: string;
    status?: string;
    badges?: string[];
    about?: string;
    isExplicit?: boolean;
    visibility?: string;
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

export default function UserCard({
    isPreview = false,
    id,
    aura,
    avatar,
    banner,
    name,
    username,
    status,
    badges,
    about,
    isExplicit,
    visibility,
    interactions,
    notification
}: Props) {
    const { ready } = useTranslation();

    if (!ready) return null;

    index++

    const Component = !isPreview ? Link : "div";

    const auraStyle = aura?.isEnabled
        ? 
            {
                ["--aura-type" as string]:
                    // eslint-disable-next-line no-constant-binary-expression
                    `aura-${aura?.type}-user` || "aura-flow-user",

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

    let formattedAbout;

    if (visibility === "public") {
        formattedAbout = about || "This user does not have an about me.";
    } else if (visibility === "followers") {
        formattedAbout = `Follow ${name} to view their about me.`;
    } else if (visibility === "friends") {
        formattedAbout = `Add ${name} as a friend to view their about me.`;
    }

    {/* Url for images are only cdn usernames, not the domain. Fix code below */}

    if (
        !id && !isPreview 
    ) {
        return;
    }

    return (
        <div
            className={`user-card relative p-4 shadow-sm ${!isPreview ? "cursor-pointer" : ""} z-${index}`}
            style={auraStyle}
        >
            {!isPreview && (
                <>
                    {notification?.isActive ?
                        <div className="absolute top-[-5px] right-[-5px] z-3 tooltip tooltip-top tooltip-accent" 
                            data-tip={`Updated ${notification?.time}`}>
                            <div className="absolute inset-0 rounded-full bg-accent animate-ping opacity-50" />
                            <div className="relative rounded-full bg-accent w-5 h-5" />
                        </div> : ""
                    }

                    <div className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent" data-tip="More">
                        <button type="button" className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden"
                            popoverTarget={`user-more-dropdown-${index}`} style={{ anchorName: `--user-more-anchor-${index}` }}
                        >
                            <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                                󰇘
                            </span>
                        </button>
                    </div>

                    <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm cursor-default" 
                        popover="auto" id={`user-more-dropdown-${index}`} style={{ positionAnchor: `--user-more-anchor-${index}` }}>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                View
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    󰈈
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                Read
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                        <hr></hr>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                Follow
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                Add Friend
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                        <hr></hr>
                        <li>
                            <Link className="justify-between text-accent" to={`/${username || id}`}>
                                Not Interested
                                <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                    󰈉
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between text-accent" to={`/${username || id}`}>
                                Mute
                                <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                    󰂛
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between text-accent" to={`/${username || id}`}>
                                Report
                                <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                        <hr></hr>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                Share
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    󰒗
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between" to={`/${username || id}`}>
                                Copy ID
                                <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                                    󰅇
                                </span>
                            </Link>
                        </li>
                        <hr></hr>
                        <li>
                            <Link className="justify-between text-warning" to={`/${username || id}`}>
                                Moderate
                                <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link className="justify-between text-warning" to={`/${username || id}`}>
                                Manage
                                <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                                    
                                </span>
                            </Link>
                        </li>
                    </ul>
                </>
            )}

            <Component to={`/${username || id}`}>
                { banner ?
                    <img
                        className="absolute z-1 top-0 left-0 rounded-t-lg h-[118px] w-full object-cover"
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
                    /> : ""
                }

                { avatar ?
                    <img
                        className="absolute z-1 top-4 left-4 rounded-full h-21 w-21 object-cover"
                        src={avatar}
                        alt="avatar"
                    /> : ""
                }

                <div 
                    className="absolute bg-success rounded-full h-6 w-6 top-19 left-19 border-4 border-base-100 z-2 tooltip tooltip-top"
                    data-tip="Online"
                />

                { status ? 
                    <div className="absolute glass bg-[#00000085] rounded p-2 left-30 max-w-[289px] z-1">
                        <div className="text-white text-xs line-clamp-3">
                            {status}
                        </div>
                    </div>
                    : ""
                }

                <div className="relative top-22 flex flex-col h-46 w-full z-2">
                    <div className="flex justify-between gap-2">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold truncate leading-snug">
                                {name || username || id} 
                            </span>
                        </div>

                        {/* Only show one; either follow or friends based on status | ADD TOOLTIPS

                            USER/ASSET VISIBILITY
                            - Public: Full visibility on search and direct link 

                            - Unlisted: Not visible on search, but full visibility using direct link 

                            - Followers: Not visible on search and limited info visibility on direct link, but can follow (without request) to view all.
                                         Followers only profiles and projects will never be discoverable via search and can only be found by following
                                         and exporing their account.

                            - Friends: Not visible on search and limited info visibility on direct link, 
                                       but can send a friend request using direct link to view all on acceptance.
                                       Friends only profiles and projects will never be discoverable via search and can only be found by remaining friends
                                       and exporing their account.

                            - Private: No visibility outside of owner and collaborators; returns a 404 page if no access

                            - Hidden: Indefinite private visibility due to moderator action


                            MIGHT NEED TO UPDATE API
                        
                        */}
                        {visibility !== "friends" && (
                            <button
                                className="flex gap-2 h-7 px-3 text-xs btn btn-base-200 border-base-300 uppercase"
                                onClick={() => { closeCreateProjectModal() }}
                            >
                                <span className="text-base font-nerdfont w-3">
                                    {visibility === "public" ? "" : ""}
                                </span>
                                {visibility === "public" ? "Follow" : "Request Follow"}
                            </button>
                        )}

                        {visibility === "friends" && (
                            <button
                                className="flex gap-2 h-7 px-3 text-xs btn btn-base-200 border-base-300 uppercase"
                                onClick={() => { closeCreateProjectModal() }}
                            >
                                <span className="text-sm font-nerdfont w-3">
                                    
                                </span>
                                Request Friend
                            </button>
                        )}

                        {/*<button
                            className="flex gap-2 h-7 px-3 text-xs btn btn-success border-success uppercase"
                            onClick={() => { closeCreateProjectModal() }}
                        >
                            <span className="text-sm font-nerdfont w-3">
                                
                            </span>
                            {visibility === "friends" ? "Request Friend" : "Friends"}
                        </button>*/}

                        { isExplicit ? 
                            <button className="flex gap-2 h-7 px-3 text-xs btn btn-accent border-accent uppercase"
                                onClick={() => { closeCreateProjectModal() }}>
                                <span className="text-sm">
                                    18+
                                </span>
                            </button>
                            : ""
                        }

                        {/*{ visibility !== "public" ? 
                            <button className="flex gap-2 h-7 px-3 text-xs btn btn-base-200 border-base-300 uppercase"
                                onClick={() => { closeCreateProjectModal() }}>
                                <span className="text-sm font-nerdfont w-3">
                                    
                                </span>
                                Private
                            </button>
                            : ""
                        }*/}

                        <div className="ml-auto flex shrink-0">
                            <Badges badges={badges} />
                        </div>
                    </div>

                    <div className="flex min-w-0 mt-1 items-center overflow-hidden">
                        <span className="truncate text-xs leading-snug">
                            @{username} • {formatNumber(interactions?.follows?.count || 0).short} Followers
                        </span>
                    </div>

                    <div className="text-xs line-clamp-3 my-2">
                        {formattedAbout}
                    </div>
                </div>
            </Component>
        </div>
    );
}