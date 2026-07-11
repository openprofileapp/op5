import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client"

type Props = {
    id: string;
    avatar?: string;
    animatedAvatar?: string;
    name?: string;
    slug?: string;
};

let index = 1;

export default function titleCard({
    id,
    avatar,
    animatedAvatar,
    name,
    slug,
}: Props) {
    const { ready } = useTranslation();

    if (!ready) return null;

    index++

    {/* Url for images are only cdn slugs, not the domain. Fix code below */}

    if (
        !id
    ) {
        return;
    }

    return (
        <div
            className={`title-card relative p-4 shadow-sm cursor-pointer z-${index}`}
        >
            <div className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent" data-tip="More">
                <button type="button" className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden"
                    popoverTarget={`title-more-dropdown-${index}`} style={{ anchorName: `--title-more-anchor-${index}` }}
                >
                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                        󰇘
                    </span>
                </button>
            </div>

            <ul className="dropdown menu w-52 rounded-box bg-base-100 shadow-sm cursor-default" 
                popover="auto" id={`title-more-dropdown-${index}`} style={{ positionAnchor: `--title-more-anchor-${index}` }}>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        View
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰈈
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between text-accent" to={`/title/dragonights-skorpion-rising`}>
                        Unlike
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        Unfavorite
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        Add to Collection
                        <span className="font-nerdfont text-base h-6 leading-none translate-y-[4px]">
                            
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        Claim
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󱪙
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between text-accent" to={`/title/dragonights-skorpion-rising`}>
                        Not Interested
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            󰈉
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-accent" to={`/title/dragonights-skorpion-rising`}>
                        Report
                        <span className="font-nerdfont text-accent text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        Share
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰒗
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between" to={`/title/dragonights-skorpion-rising`}>
                        Copy ID
                        <span className="font-nerdfont text-lg h-6 leading-none translate-y-[2px]">
                            󰅇
                        </span>
                    </Link>
                </li>
                <hr></hr>
                <li>
                    <Link className="justify-between text-warning" to={`/title/dragonights-skorpion-rising`}>
                        Moderate
                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
                <li>
                    <Link className="justify-between text-warning" to={`/title/dragonights-skorpion-rising`}>
                        Manage
                        <span className="font-nerdfont text-warning text-lg h-6 leading-none translate-y-[2px]">
                            
                        </span>
                    </Link>
                </li>
            </ul>

            <Link to={`${id.type === "user" ? "/user" : ""}/${id?.slug || id.id}/profile/${slug || id}`}>
                <div className="absolute inset-0 group">
                    <img
                        className={`absolute z-1 top-0 left-0 rounded-t-lg h-full w-full object-cover transition-opacity duration-300 ${animatedAvatar ? "group-hover:opacity-0" : ""}`}
                        src={avatar}
                        alt="avatar"
                    />

                    { animatedAvatar ?
                        <img
                            className="absolute z-1 top-0 left-0 rounded-t-lg h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            src={animatedAvatar}
                            alt="animated avatar"
                        /> : ""
                    }
                </div>
            </Link>
        </div>
    );
}