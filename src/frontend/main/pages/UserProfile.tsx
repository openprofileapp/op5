import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import Confetti from "react-confetti";
import { CSS } from "@dnd-kit/utilities";
import { formatNumber } from "kage-library/client";

import { useInteractions } from "../../_common/hooks/useInteractions.hook.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";
import { apiBaseUrl, cdnBaseUrl } from "../../_common/scripts/domains.js";
import { GetPublishedCharacterItemType } from "../../../_common/types/character.type.js";
import { isBirthdayToday } from "../../_common/scripts/time.js";
import { GetAssetType } from "../../../_common/types/asset.type.js";
import { MarkdownRenderer } from "../../_common/components/MarkdownRenderer.js";
import Metadata from "../../_common/components/Metadata.js";
import { hexToRgba } from "../scripts/colors.js";
import Badges from "../../_common/components/Badges.js";
import { toast } from "../../_common/scripts/toast.js";
import ExternalLinks from "../components/ExternalLinks.js";
import { ContextMenuBuilder } from "../../_common/components/ContextMenuBuilder.js";
import { Tooltip } from "../../_common/components/Tooltip.js";
import Presense from "../../_common/components/Presense.js";
import ZoomableMedia from "../../_common/components/ZoomableMedia.js";

interface SortableCardProps {
    item: GetAssetType;
    children: (props: {
        dragHandleProps: {
            ref: (element: HTMLElement | null) => void;
            [key: string]: unknown;
        };
    }) => React.ReactNode;
}

function SortableCard({ item, children }: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
    } = useSortable({
        id: item.id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
        >
            {children({
                dragHandleProps: {
                    ref: setActivatorNodeRef,
                    ...attributes,
                    ...listeners,
                },
            })}
        </div>
    );
}

export default function UserProfile() {
    const { id } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();
    const navigate = useNavigate();

    const { handleFollowInteraction } = useInteractions();

    const [activeTab, setActiveTab] = useState("pinned");
    
    const [isContextMenuOpen, setIsContextMenuOpen] = useState<boolean>(false);

    const [data, setData] = useState<GetUserItemType>();
    const [loading, setLoading] = useState(true);

    const [characters, setCharacters] = useState<GetPublishedCharacterItemType[]>([]);
    const [areCharactersLoading, setAreCharactersLoading] = useState(true);

    const [pins, setPins] = useState<GetAssetType[]>([]);
    const [arePinsLoading, setArePinsLoading] = useState(true);

    const [showConfetti, setShowConfetti] = useState(false);

    const [auraStyle, setAuraStyle] = useState<React.CSSProperties>({});
    const [primaryUsername, setPrimaryUsername] = useState<string | undefined>();

    const [isSensitive, setIsSensitive] = useState<boolean>(false);
    const [isMature, setIsMature] = useState<boolean>(false);
    const [isRevealed, setIsRevealed] = useState<boolean>(false);

    const [isFollowing, setIsFollowing] = useState<boolean>(false);
    const [followCount, setFollowCount] = useState<number>(0);
    const [isFollowInteractionLoading, setIsFollowInteractionLoading] = useState<boolean>(false);

    const [isHidden, setIsHidden] = useState<boolean>(false);
    const [isHideInteractionLoading, setIsHideInteractionLoading] = useState<boolean>(false);

    const [isRestricted, setIsRestricted] = useState<boolean>(false);
    const [isRestrictInteractionLoading, setIsRestrictInteractionLoading] = useState<boolean>(false);

    const [isBlocked, setIsBlocked] = useState<boolean>(false);
    const [isBlockInteractionLoading, setIsBlockInteractionLoading] = useState<boolean>(false);
    const [isBlockRevealed, setIsBlockRevealed] = useState<boolean>(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v3/users?id=${id}`, 
                    { credentials: "include" }
                );

                if (!res.ok) {
                    navigate("/404", { replace: true });
                    return;
                }

                const json = await res.json();
                const data: GetUserItemType = json.items[0];
                
                setData(data);

                setAuraStyle(
                    data?.isAuraEnabled
                        ? {
                            ["--aura-type" as string]: `aura-${data?.auraType || "flow"}`,
                            ["--aura-primary" as string]: data?.auraPrimary || "var(--color-accent)",
                            ["--aura-secondary" as string]: data?.auraSecondary || "var(--color-accent)",
                        }
                        : {
                            border: "1px solid #222222",
                        }
                );

                setPrimaryUsername(data?.usernames?.find(u => u.isPrimary)?.username);
                setShowConfetti(isBirthdayToday(data?.birthdate) || false);
                setIsSensitive(data?.isSensitive);
                setIsMature(data?.isMature);
                setIsFollowing(data?.interactions?.follows?.hasInteracted || false);
                setFollowCount(data?.interactions?.follows?.count || 0);
                setIsHidden(data?.interactions?.hides?.hasInteracted || false);
                setIsRestricted(data?.interactions?.restricts?.hasInteracted || false);
                setIsBlocked(data?.interactions?.blocks?.hasInteracted || false);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id, navigate]);

    useEffect(() => {
        if (!data?.id) return;

        const fetchCharacters = async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v3/characters?owner=${data?.id}`, 
                    { credentials: "include" }
                );

                if (!res.ok) return;

                const json = await res.json();

                setCharacters(json?.items || []);
            } catch (err) {
                console.error(err);
            } finally {
                setAreCharactersLoading(false);
            }
        };

        fetchCharacters();
    }, [data?.id]);

    useEffect(() => {
        if (!data?.id) return;

        const fetchPins = async () => {
            try {
                const res = await fetch(
                    `${apiBaseUrl}/v3/pins/${data?.id}`, 
                    { credentials: "include" }
                );

                if (!res.ok) return;
                
                const json = await res.json();

                setPins(json.pins || []);
            } catch (err) {
                console.error(err);
            } finally {
                setArePinsLoading(false);
            }
        };

        fetchPins();
    }, [data?.id]);

    useEffect(() => {
        const updateTab = () => {
            const hashTab = window.location.hash.replace("#", "");
            const defaultTab = pins.length > 0 ? "pinned" : "about";

            setActiveTab(hashTab || defaultTab);
        };

        window.addEventListener("hashchange", updateTab);
        updateTab();

        return () => {
            window.removeEventListener("hashchange", updateTab);
        };
    }, [pins.length]);

    const contextMenuBuilder = ContextMenuBuilder({
        data: data!,
        isContextMenuOpen,
        setIsContextMenuOpen,
        isFollowing,
        isFollowInteractionLoading,
        setIsFollowing,
        setIsFollowInteractionLoading,
        setFollowCount,
        isHidden,
        isHideInteractionLoading,
        setIsHidden,
        setIsHideInteractionLoading,
        isRestricted,
        isRestrictInteractionLoading,
        setIsRestricted,
        setIsRestrictInteractionLoading,
        isBlocked,
        isBlockInteractionLoading,
        setIsBlocked,
        setIsBlockInteractionLoading,
    });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setData((prevData) => {
            if (!prevData) return prevData;

            return {
                ...prevData,
                interactions: {
                    ...prevData?.interactions,
                    follows: {
                        ...prevData?.interactions?.follows,
                        count: followCount,
                        hasInteracted: isFollowing,
                    }
                },
            } as GetUserItemType;
        });
    }, [followCount, isFollowing]);

    const handleDragEnd = async ({ active, over }: DragEndEvent) => {
        if (!over || active.id === over.id) return;

        const oldIndex = pins.findIndex((item) => item.id === active.id);
        const newIndex = pins.findIndex((item) => item.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        const updated = arrayMove(pins, oldIndex, newIndex);
        setPins(updated);

        try {
            await Promise.all(
                updated.map((item, index) =>
                    fetch(
                        `${apiBaseUrl}/v3/pins/${window.session.userId}/${item.id}`,
                        {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                            },
                            credentials: "include",
                            body: JSON.stringify({
                                position: index + 1,
                            }),
                        }
                    )
                )
            );
        } catch (err) {
            console.error("Failed to sync pin reorder:", err);
        }
    };

    const setTab = (tab: string) => {
        const defaultTab = pins.length > 0 ? "pinned" : "about";

        if (tab === defaultTab) {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            window.location.hash = tab;
        }

        setActiveTab(tab);
    };

    const Banner = data?.banner ? ZoomableMedia : "img";
    const Avatar = (data?.avatar || data?.animatedAvatar) ? ZoomableMedia : "img";

    return (
        <>
            <Metadata
                title={data?.displayName || primaryUsername || data?.id}
                description={data?.about || t("defaults.noUserAbout")}
                keywords={data?.tags.toString()}
                image={`${cdnBaseUrl}${data?.avatar || window.config.metadata.assets.icon}`}
                author={primaryUsername || data?.id}
            />

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

            <div style={{backgroundColor: data?.isAuraEnabled ? hexToRgba(data?.auraPrimary, 0.05) : "transparent"}}>
                <div className="hero">
                    <Banner
                        className="mask-graident absolute top-[64px] w-full object-cover h-96"
                        src={data?.banner ? `${cdnBaseUrl}${data?.banner}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                        alt={t("words.banner")}
                    />
                </div>

                <div className="px-0 py-8 md:px-25 md:py-20">
                    <div className="grid grid-cols-1 md:grid-cols-[320px_minmax(0,1fr)] gap-4">
                        <div className="flex flex-col gap-4">
                            <div 
                                className="aura-effect bg-base-100 rounded-lg z-1 p-6 h-fit" 
                                style={auraStyle}
                            >
                                {contextMenuBuilder && contextMenuBuilder.items([
                                    window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        contextMenuBuilder.quickActions([
                                            (props) => contextMenuBuilder.view(props),
                                            (props) => contextMenuBuilder.follow(props),
                                            (props) => contextMenuBuilder.message(props),
                                            (props) => contextMenuBuilder.share(props)
                                        ]),
                                    contextMenuBuilder.edit(),
                                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        window.session.userId === data?.id && 
                                        contextMenuBuilder.separator(),
                                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        contextMenuBuilder.view(),
                                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        contextMenuBuilder.follow(),
                                    contextMenuBuilder.friend(),
                                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        contextMenuBuilder.message(),
                                    !isHidden && !isBlocked && 
                                        contextMenuBuilder.separator(),
                                    contextMenuBuilder.notifications(),
                                    contextMenuBuilder.mute(),
                                    isFollowing && window.session.userId !== data?.id && 
                                        contextMenuBuilder.separator(),
                                    contextMenuBuilder.notInterested(),
                                    isHidden && 
                                        contextMenuBuilder.separator(),
                                    contextMenuBuilder.restrict(),
                                    contextMenuBuilder.block(),
                                    contextMenuBuilder.report(),
                                    contextMenuBuilder.moderate(),
                                    contextMenuBuilder.manage(),
                                    (Boolean(window.session.user?.isDeveloper) || (!isBlocked && !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR"))) && 
                                        contextMenuBuilder.separator(),
                                    !window.session.user?.flags?.includes("QUICK_ACTIONS_BAR") && 
                                        contextMenuBuilder.share(),
                                    contextMenuBuilder.copyId()
                                ].filter(Boolean))}

                                <div className="relative flex flex-col items-center py-2 z-2">
                                    {(
                                        data?.id === "5719552362357773" ||
                                        data?.id === "5019646586243236"
                                    ) && (
                                        // DEVELOPER NEEDED: Disable id override and add fanflairs
                                        <div 
                                            className="absolute z-1 top-[-6px] cursor-pointer"
                                                onClick={() => {
                                                document.getElementById("avatar")?.click();
                                            }}
                                        >
                                            <Tooltip
                                                position="right"
                                                content={
                                                    <div className="tooltip-content bg-base-200 text-base-content border border-base-300 rounded shadow-2xl flex flex-col max-w-[300px] text-center p-1">
                                                        <div className="flex flex-col p-1 gap-3">
                                                            <div className="flex justify-center w-full">
                                                                <img
                                                                    className="h-32 w-32 object-contain"
                                                                    src={`${cdnBaseUrl}/uploads/942ba7b3-f359-4b06-8189-2223950b246c.png`}
                                                                    alt=""
                                                                />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <div className="font-bold text-sm">
                                                                    Cyeletal Crystals
                                                                </div>

                                                                <hr />
                                                                
                                                                <div className="text-xs text-sub">
                                                                    From <strong>J9 Studios</strong>
                                                                    <br/>
                                                                    <br/>
                                                                    {t("defaults.noFanflair")}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            >
                                                <img
                                                    className="h-38 w-38 object-contain"
                                                    src={`${cdnBaseUrl}/uploads/942ba7b3-f359-4b06-8189-2223950b246c.png`}
                                                    alt={t("words.fanflair")}
                                                />
                                            </Tooltip>
                                        </div>
                                    )}

                                    <div className="relative group pointer-events-auto">
                                        {!data?.animatedAvatar && (
                                            <Avatar
                                                className="rounded-full h-32 w-32 object-cover"
                                                id={"avatar"}
                                                src={data?.avatar ? `${cdnBaseUrl}${data?.avatar}` : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`}
                                                alt={t("words.avatar")}
                                            />
                                        )}

                                        {data?.animatedAvatar && (
                                            <Avatar
                                                className="absolute rounded-full top-0 h-32 w-32 object-cover"
                                                id={"avatar"}
                                                src={data?.animatedAvatar}
                                                alt={t("words.avatar")}
                                            />
                                        )}

                                        <Presense 
                                            data={data}
                                            largeIcons={true}
                                        />
                                    </div>

                                    <div className="flex items-center justify-center w-full mt-5 gap-2">
                                        <h1 className="truncate text-xl font-bold text-center">
                                            {data?.displayName || primaryUsername || data?.id}
                                        </h1>

                                        <Badges 
                                            data={data as GetAssetType} 
                                            assetType="USER" 
                                        />
                                    </div>

                                    <div className="flex items-center justify-center gap-2 w-full">
                                        <div className="truncate text-sm text-center text-sub">
                                            @{data?.usernames[0].username}{data?.pronouns ? ` • ${data?.pronouns}` : ""}
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

                                        {primaryUsername === "avatarkage" && (
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

                                        {primaryUsername !== "avatarkage" && data?.visibility !== "friends" && (
                                            <button
                                                className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300"
                                                // TO UNFOLLOW; DISPLAY UNFOLLOW PROMPT (are you sure you want to unfollow)
                                                onClick={() => {
                                                    if (isFollowing || isFollowInteractionLoading) return;
    
                                                    setIsFollowInteractionLoading(true);
    
                                                    setTimeout(() => {
                                                        setIsFollowInteractionLoading(false);
                                                        setIsFollowing(true);
                                                        toast.show(`You followed ${data?.displayName}`, { icon: "", type: "success" });
                                                    }, 500);
                                                }}
                                            >
                                                <span className={`text-lg font-nerdfont w-4 ${isFollowInteractionLoading ? "loading" : ""}`}>
                                                    {!isFollowing ? `${data?.visibility === "public" ? "" : ""}` : ""}
                                                </span>
                                                {!isFollowing ? `${data?.visibility === "public" ? "Follow" : "Request Follow"}` : "Following"}
                                            </button>
                                        )}

                                        {primaryUsername !== "avatarkage" && (
                                            <button
                                                className="flex gap-2 h-8 flex-1 px-3 text-sm btn btn-base-200 border-base-300"
                                                //  onClick={() => { closeCreateProjectModal() }}
                                                data-guide="message"
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
                
                                        {data?.visibility === "friends" && (
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
                
                                        { data?.isMature ? 
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

                                    {data?.about && (
                                        <p className="text-sm w-full mt-4">
                                            {data?.about}
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
                                            <span className={`leading-none font-nerdfont text-base ${data?.interactions?.fanflairs?.interacted ? "text-accent" : ""}`}>
                                                󰃫
                                            </span>
                                            <span className="text-sm ml-2 whitespace-nowrap">
                                                March 23, 2003
                                            </span>
                                        </div>

                                        <div className="flex items-center ml-auto">
                                            <span className={`leading-none font-nerdfont text-base ${data?.interactions?.fanflairs?.interacted ? "text-accent" : ""}`}>
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
                                <ExternalLinks links={data?.links} hasBackground={false} />
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

                        <div className="bg-base-100 border border-base-300 rounded-lg z-1">
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
                                        <MarkdownRenderer content={data?.markdown?.trim()} />
                                    </div>
                                )}

                                {activeTab === "pinned" && (
                                    <DndContext
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={pins.map(item => item.id)}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="p-4 flex flex-wrap gap-4">

                                                {pins.map((d) => (
                                                    <SortableCard
                                                        key={d.id}
                                                        item={d}
                                                    >
                                                        {({ dragHandleProps }) => (
                                                            <CharacterCard
                                                                id={d.id}

                                                                aura={{
                                                                    isEnabled: d.isAuraEnabled,
                                                                    type: d.auraType,
                                                                    primary: d.auraPrimary,
                                                                    secondary: d.auraSecondary
                                                                }}

                                                                avatar={
                                                                    d.avatar
                                                                        ? `${cdnBaseUrl}${d.avatar}`
                                                                        : ""
                                                                }

                                                                displayName={d.displayName}
                                                                slug={d.slug}

                                                                owner={{
                                                                    id: profiles?.owner?.id,
                                                                    slug: profiles?.owner?.username,
                                                                    displayName: profiles?.owner?.displayName,
                                                                    isVerified: profiles?.owner?.badges?.some(
                                                                        b => b.type === "VERIFIED"
                                                                    ),
                                                                    type: profiles?.owner?.type
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

                                                                isPinnedPass={true}
                                                                dragHandleProps={dragHandleProps}
                                                            />
                                                            )}
                                                    </SortableCard>
                                                ))}

                                            </div>
                                        </SortableContext>
                                    </DndContext>
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
                                            displayName="Dragonights"
                                            slug="dragonights"
                                            owner={{
                                                id: "5019646586243236",
                                                username: "j9studios",
                                                displayName: "J9 Studios",
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
                                                <select className="select w-full">
                                                    <option value="updated">Recently Updated</option>
                                                    <option value="newest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                    <option value="popular-desc" selected>Most Popular</option>
                                                    <option value="popular-asc">Least Popular</option>
                                                    <option value="name-asc">Name (A-Z)</option>
                                                    <option value="name-desc">Name (Z-A)</option>
                                                </select>
                                            </fieldset>
                                        </div>
                                        
                                        <div className="px-0 md:px-4 flex flex-wrap gap-4">
                                            {profileLoading && (
                                                <>
                                                    <SkeletonCharacterCard />
                                                    <SkeletonCharacterCard />
                                                    <SkeletonCharacterCard />
                                                    <SkeletonCharacterCard />
                                                    
                                                </>
                                            )}
                                            
                                            {!profileLoading &&
                                                profiles.profiles?.map((d) => (
                                                    <CharacterCard
                                                        key={d?.id}
                                                        id={d?.id}
                                                        aura={{
                                                            isEnabled: d.isAuraEnabled,
                                                            type: d.auraType,
                                                            primary: d.auraPrimary,
                                                            secondary: d.auraSecondary
                                                        }}
                                                        avatar={
                                                            d.avatar
                                                                ? `${cdnBaseUrl}${d.avatar}`
                                                                : ""
                                                        }
                                                        displayName={d?.displayName}
                                                        slug={d?.slug}
                                                        owner={{
                                                            id: profiles.owner.id,
                                                            slug: profiles.owner.username,
                                                            displayName: profiles.owner.displayName,
                                                            isVerified: profiles.owner.badges?.some(
                                                                (b) => b.type === "VERIFIED"
                                                            ),
                                                            type: profiles.owner.type
                                                        }}
                                                        about={d?.about}
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
                                        <div className="px-0 md:px-4 text-center mb-24 mt-2 text-sm text-sub">Follow {data?.displayName} to never miss a new publication.</div>

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
        </>
    );
}
