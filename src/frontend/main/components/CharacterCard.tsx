import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatNumber } from "kage-library/client"
import { toast } from "../../_common/scripts/toast.js";
import { useCallback, useEffect, useState } from "react";

type Props = {
    isPreview?: boolean;
    id: string;
    aura?: {
        isEnabled: boolean;
        type?: string;
        primary?: string;
        secondary?: string;
    };
    avatar?: string;
    animatedAvatar?: string;
    displayName?: string;
    slug?: string;
    owner: {
        id: string;
        displayName?: string;
        slug?: string;
        isVerified?: boolean;
        type: string;
    };
    about?: string;
    interactions?: {
        views?: {
            count?: number,
            interacted?: boolean
        },
        likes?: {
            count?: number,
            interacted?: boolean
        }
    },
    notification?: {
        isActive?: boolean,
        time?: string
    },
    isPinnedPass?: boolean
};

let index = 1;

export default function CharacterCard({
    isPreview = false,
    id,
    aura,
    avatar,
    animatedAvatar,
    displayName,
    slug,
    owner,
    about,
    interactions,
    notification,
    isPinnedPass = false,
    dragHandleProps
}: Props) {
    const { ready } = useTranslation();

    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isContextMenuFlipped, setIsContextMenuFlipped] = useState(false);

    const [isPinned, setIsPinned] = useState(isPinnedPass);
    const [isPinLoading, setIsPinLoading] = useState(false);




    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowLoading, setIsFollowLoading] = useState(false);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const [hidden, setHidden] = useState(false);







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

    // Move some of these to common
    const closeContextMenu = useCallback((id: string) => {
        setIsContextMenuOpen(false);
        document
            .getElementById(`character-more-dropdown-${id}`)
            ?.hidePopover();
    }, []);
    
   useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`character-more-dropdown-${id}`);

            if (!menu) return;

            if (menu.contains(e.target as Node)) {
                return;
            }

            closeContextMenu(id);
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

    function formatDisplayNameToUrl(name: string): string {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9._]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    function exampleTrigger() {
        toast.show("Example triggered!")
    }

    if (!ready || hidden) return null;

    index++

    const Component = !isPreview ? Link : "div";

    const auraStyle = aura?.isEnabled
        ? 
            {
                ["--aura-type" as string]:
                    // eslint-disable-next-line no-constant-binary-expression
                    `aura-${aura?.type}-character` || "aura-flow-character",

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

    if (
        !id || 
        !owner || 
        !owner.id
    ) {
        return;
    }

    return (
        <div
            className={`character-card relative p-4 shadow-sm cursor-pointer z-${index}`}
            style={auraStyle}
            onContextMenu={(e) => {
                e.preventDefault();
                setIsContextMenuOpen(true);

                const popover = document.getElementById(
                    `character-more-dropdown-${id}`
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

            {isPinned && (
                dragHandleProps ? (
                    <div
                        {...dragHandleProps}
                    >
                        <div className="absolute top-[12px] left-[12px] z-2">
                            <button className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden cursor-grab">
                                <span className="leading-none text-2xl font-nerdfont translate-y-[-2px]">
                                    󰇛
                                </span>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="absolute top-[12px] left-[12px] z-2 tooltip tooltip-top tooltip-accent"
                        data-tip="Pinned"
                    >
                        <button className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden">
                            <span className="leading-none text-2xl font-nerdfont translate-y-[-2px]">
                                󰐃
                            </span>
                        </button>
                    </div>
                )
            )}

            <div
                className="absolute top-[12px] right-[12px] z-2 tooltip tooltip-top tooltip-accent"
                data-tip="More"
                onClick={(e) => {
                    e.stopPropagation();
                    setIsContextMenuOpen(true);

                    const popover = document.getElementById(
                        `character-more-dropdown-${id}`
                    );

                    if (!popover) return;

                    const rect = e.currentTarget.getBoundingClientRect();

                    popover.style.left = `${rect.left}px`;
                    popover.style.top = `${rect.bottom}px`;

                    if (popover.matches(":popover-open")) {
                        popover.hidePopover?.();
                    } else {
                        popover.showPopover?.();
                    }
                }}
            >
                <button className="relative flex items-start justify-center w-5 h-5 rounded-full overflow-hidden">
                    <span className="leading-none text-2xl font-nerdfont translate-y-[-2px] cursor-pointer">
                        󰇘
                    </span>
                </button>
            </div>

            <ul
                className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
                popover="manual"
                id={`character-more-dropdown-${id}`}
            >
                {owner.id === window.session.userId && (
                    <>
                        <li>
                            <a
                                className="flex items-center justify-between gap-4"
                                href={`https://studio.${window.config.domains.main}/character/${id}/${formatDisplayNameToUrl(displayName || "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    closeContextMenu(id);
                                }}
                            >
                                View in Studio
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    
                                </span>
                            </a>
                        </li>

                        <li>
                            <button 
                                className="flex items-center justify-between gap-4"
                                disabled={isPinLoading}
                                onClick={async () => {
                                    try {
                                        if (isPinLoading) return;
                                        // MAKE THE SESSION USER ID PART RELEVANT TO THE CURRENT URL?

                                        setIsPinLoading(true);
                                        let response;

                                        if (isPinned) {
                                            response = await fetch(
                                                `https://${window.config.domains.api}/v2/pins/${window.session.userId}/${id}`,
                                                {
                                                    method: "DELETE",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    credentials: "include"
                                                }
                                            );

                                            setHidden(true);
                                        } else {
                                            response = await fetch(
                                                `https://${window.config.domains.api}/v2/pins/${window.session.userId}/${id}`,
                                                {
                                                    method: "POST",
                                                    headers: {
                                                        "Content-Type": "application/json",
                                                    },
                                                    credentials: "include",
                                                    body: JSON.stringify({
                                                        position: 1,
                                                    }),
                                                }
                                            );
                                        }

                                        if (!response.ok) {
                                            throw new Error("Failed to pin asset");
                                        }

                                        setIsPinned(!isPinned);

                                        toast.show(
                                            `You ${isPinned ? "unpinned" : "pinned"} ${displayName}`,
                                            {
                                                icon: isPinned ? "󰐄" : "󰐃",
                                                type: isPinned ? "info" : "success",
                                            }
                                        );
                                    } catch (error) {
                                        console.error(error);

                                        toast.show("Failed to pin asset", {
                                            type: "error",
                                        });
                                    } finally {
                                        setIsPinLoading(false);
                                    }
                        
                                    // closeContextMenu(id);
                                }}
                            >
                                <span
                                    className={`${isPinned ? "text-error" : "text-base-content"}`}
                                >
                                    {isPinned ? "Unpin from Profile" : "Pin to Profile"}
                                </span>
                                <span className={`${isPinLoading ? "loading" : ""} font-nerdfont ${isPinned ? "text-error" : "text-base-content"} text-lg flex h-6 w-4 leading-none items-center justify-center`}>
                                    {isPinLoading ? "" : isPinned ? "󰐄" : "󰐃"}
                                </span>
                            </button>
                        </li>

                        <hr />
                    </>
                )}

                <li>
                    <Link 
                        className="flex items-center justify-between gap-4" 
                        to={`/character/${id}/${formatDisplayNameToUrl(displayName || "")}`}
                    >
                        View
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰈈
                        </span>
                    </Link>
                </li>

                <li>
                    <Link 
                        className="flex items-center justify-between gap-4" 
                        to={`/character/${id}/${formatDisplayNameToUrl(displayName || "")}/read`}
                    >
                        Read
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </Link>
                </li>

                <hr />

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Follow
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Like
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Favorite
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>

                <li 
                    className="relative group"
                    onMouseEnter={checkCollectionMenuPosition}
                >
                    <button className="flex items-center justify-between gap-4 w-full">
                        Add to Collection
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
                                    exampleTrigger();
                                    closeContextMenu(id);
                                }}
                            >
                                Superheroes
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
                                    exampleTrigger();
                                    closeContextMenu(id);
                                }}
                            >
                                Featured by OpenProfile
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
                                    exampleTrigger();
                                    closeContextMenu(id);
                                }}
                            >
                                New Collection
                                <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                    󰌴
                                </span>
                            </button>
                        </li>
                    </ul>
                </li>
                <hr />
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-error"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Not Interested
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰈉
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-error"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Hide Collaboration
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰈉
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-error"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Mute
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰂛
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-error"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Report
                        <span className="font-nerdfont text-error text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
                <hr />
                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
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
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Copy ID
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            󰅇
                        </span>
                    </button>
                </li>
                <hr />
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-warning"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Moderate
                        <span className="font-nerdfont text-warning text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-warning"
                        onClick={() => {
                            exampleTrigger();
                            closeContextMenu(id);
                        }}
                    >
                        Manage
                        <span className="font-nerdfont text-warning text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
            </ul>

            <Component to={`/character/${id}${slug ? `/${slug}` : ""}`}>
                <div className="absolute inset-0 group">
                    <img
                        className={`absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover transition-opacity duration-300 ${animatedAvatar ? "group-hover:opacity-0" : ""}`}
                        src={avatar}
                        alt="avatar"
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

                    { animatedAvatar ?
                        <img
                            className="absolute z-1 top-0 left-0 rounded-t-lg h-[221px] w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                            src={animatedAvatar}
                            alt="animated avatar"
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
                </div>
                                
                <div className="relative top-45 flex flex-col h-46 w-full z-2">
                    <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-2 min-w-0 max-w-full">
                        <div className="flex min-w-0 items-center overflow-hidden">
                            <span className="font-bold text-center w-full truncate leading-snug">
                                {displayName || slug || id}
                            </span>
                        </div>

                        {owner?.isVerified ?
                            <div className="z-1 relative font-normal tooltip tooltip-top tooltip-accent">
                                <a href={`https://${window.config.domains.support}/en-us/articles/verification`} target="_blank"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    <svg className="text-accent" width="18" height="18" viewBox="0 0 11 11" xmlns="http://www.w3.org/2000/svg"><path d="m6.387.375.876.876h1.24c.69 0 1.25.56 1.25 1.25v1.24l.876.875a1.25 1.25 0 0 1 0 1.768l-.876.876V8.5c0 .69-.56 1.25-1.25 1.25h-1.24l-.876.876a1.25 1.25 0 0 1-1.768 0l-.876-.876H2.504c-.69 0-1.25-.56-1.25-1.25V7.26l-.876-.876a1.25 1.25 0 0 1 0-1.768l.876-.876V2.501c0-.69.56-1.25 1.25-1.25h1.24l.875-.876a1.25 1.25 0 0 1 1.768 0" fill="currentColor"/><path d="M5.185 7.238 7.925 4.5a.54.54 0 0 0 .156-.38.5.5 0 0 0-.155-.37.5.5 0 0 0-.37-.154.45.45 0 0 0-.357.166L4.815 6.143l-1.013-1a.5.5 0 0 0-.37-.166q-.214 0-.357.166-.155.143-.155.357 0 .215.155.357l1.383 1.381a.5.5 0 0 0 .357.143.53.53 0 0 0 .37-.143" 
                                        fill="#ffffff"/>
                                    </svg>
                                </a>
                                <div className="tooltip-content">
                                    <div className="font-bold">Official Profile</div>
                                    <div className="text-xs">This profile is managed by its intellectual property owners or authorized individuals.</div>
                                </div>
                            </div>

                            : ""
                        }
                    </div>

                    <div className="flex items-center justify-center w-full">
                        <div className="flex relative items-center justify-center rounded-full px-3 h-6 gap-1.5 min-w-0 max-w-full">
                            <div className="flex min-w-0 items-center overflow-hidden">
                                <span className="truncate text-xs leading-snug">
                                    {owner?.displayName || owner.slug || owner.id}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="text-xs line-clamp-6 my-2">{about || "This character does not have an about."}</div>            
                </div>

                <div className="flex flex-row gap-8 justify-center w-full">
                    <div className="absolute z-1 bottom-3 flex flex-row gap-8 justify-center text-sm w-full p-1">
                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont text-base ${interactions?.views?.interacted ? "text-accent" : ""}`}>󰈈</span>
                            <span className="text-xs ml-2">{formatNumber(interactions?.views?.count || 0).short}</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <span className={`font-nerdfont text-base ${interactions?.likes?.interacted ? "text-accent" : ""}`}></span>
                            <span className="text-xs ml-2">{formatNumber(interactions?.likes?.count || 0).short}</span>
                        </div>
                    </div>
                </div>
            </Component>
        </div>
    );
}