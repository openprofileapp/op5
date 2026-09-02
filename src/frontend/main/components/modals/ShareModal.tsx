import { useEffect, useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";

import { apiBaseUrl, cdnBaseUrl, mainBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";
import { formatNumber } from "kage-library/client";
import { formatDisplayNameToUrl } from "../../scripts/formatDisplayNameToUrl.js";

export interface ShareModalRef {
    open: (id: string) => void;
    close: () => void;
}

type AspectRatioOption = "landscape" | "square" | "portrait" | "story";

interface AspectPreset {
    label: string;
    width: number;
    height: number;
    aspectClass: string;
    maxBioChars: number;
    scaleClass: string;
}

const presets: Record<AspectRatioOption, AspectPreset> = {
    landscape: {
        label: "Landscape",
        width: 1200,
        height: 860,
        aspectClass: "aspect-[1200/860]",
        maxBioChars: 0,
        scaleClass: "scale-[100%]",
    },
    square: {
        label: "Square",
        width: 1080,
        height: 1080,
        aspectClass: "aspect-square",
        maxBioChars: 80,
        scaleClass: "scale-[70%]",
    },
    portrait: {
        label: "Portrait",
        width: 1080,
        height: 1350,
        aspectClass: "aspect-[1080/1350]",
        maxBioChars: 160,
        scaleClass: "scale-[56%]",
    },
    story: {
        label: "Story",
        width: 1080,
        height: 1920,
        aspectClass: "aspect-[1080/1920]",
        maxBioChars: 320,
        scaleClass: "scale-[40%]",
    },
};

const truncateText = (text: string, maxChars: number): string => {
    if (!text || maxChars <= 0) return "";
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars).trim() + "...";
};

const ShareModal = forwardRef<ShareModalRef>((_, ref) => {
    const { ready: isTranslationReady, t } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [activeId, setActiveId] = useState<string | null>(null);
    const [character, setCharacter] = useState<GetPublishedCharacterItemType | null>(null);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<AspectRatioOption>("square");

    const resetState = () => {
        setActiveId(null);
        setCharacter(null);
        setLoading(true);
        setIsDownloading(false);
        setSelectedPreset("square");
    };

    useImperativeHandle(ref, () => ({
        open: (id: string) => {
            setActiveId(id);
            dialogRef.current?.showModal();
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        },
    }));

    useEffect(() => {
        if (!activeId) return;

        const fetchCharacter = async () => {
            setLoading(true);
            try {
                const res = await fetch(`${apiBaseUrl}/v3/characters?id=${activeId}`, {
                    credentials: "include",
                });

                const data = await res.json();

                setCharacter(data.items[0]);
            } catch (err) {
                console.error(err);

                toast.show("Failed to load character data", { type: "error" });
            } finally {
                setLoading(false);
            }
        };

        fetchCharacter();
    }, [activeId]);

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    if (!isTranslationReady) return null;

    const currentPreset = presets[selectedPreset];

    const shareUrl =
        typeof window !== "undefined" && character
            ? `${mainBaseUrl}/character/${character.id}-${formatDisplayNameToUrl(character.displayName || "")}`
            : "";

    const shareText = `Check out ${character?.displayName || "this character"} on OpenProfile!`;

    const socialLinks = {
        x: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.show(t("components.modals.share.copied"), {
                type: "success",
            });
        } catch {
            toast.show("Failed to copy link", { type: "error" });
        }
    };

    const handleDownloadImage = async () => {
        if (!cardRef.current || loading) return;
        setIsDownloading(true);

        try {
            const dataUrl = await toPng(cardRef.current, {
                cacheBust: true,
                canvasWidth: currentPreset.width,
                canvasHeight: currentPreset.height,
                pixelRatio: 2,
            });

            const link = document.createElement("a");
            link.download = `${formatDisplayNameToUrl(character?.displayName || "")}-${selectedPreset}-card.png`;
            link.href = dataUrl;
            link.click();

            toast.show("Downloaded image", { type: "success" });
        } catch (err) {
            console.error(err);
            toast.show("Failed to download image", { type: "error" });
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <dialog ref={dialogRef} className="modal" onClose={resetState}>
            <div className="modal-box max-w-2xl relative flex flex-col gap-6 overflow-y-auto scrollbar">
                <form method="dialog">
                    <button
                        type="button"
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-30"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>

                <div className="flex flex-col gap-6 items-center w-full">
                    <div className="w-full">
                        <div role="tablist" className="tabs tabs-border w-full mb-4">
                            {(Object.keys(presets) as AspectRatioOption[]).map((key) => (
                                <button
                                    key={key}
                                    type="button"
                                    role="tab"
                                    onClick={() => setSelectedPreset(key)}
                                    className={`tab flex-1 text-sm ${
                                        selectedPreset === key ? "tab-active" : ""
                                    }`}
                                >
                                    {presets[key].label}
                                </button>
                            ))}
                        </div>

                        <div className="w-full h-64 rounded-md border border-base-300 bg-base-100 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:20px_20px]">
                            <div className="relative w-full h-full flex justify-center items-center my-auto overflow-hidden">
                                <button
                                    type="button"
                                    disabled={loading || isDownloading}
                                    onClick={handleDownloadImage}
                                    className="btn btn-accent h-10 w-10 absolute top-4 right-4 z-20"
                                >
                                    {isDownloading ? (
                                        <span className="loading w-4 h-4"></span>
                                    ) : (
                                        <span className="font-nerdfont leading-none text-lg w-4 h-4"></span>
                                    )}
                                </button>

                                <div className={`rounded border border-base-300 ${currentPreset.scaleClass}`}>
                                    <div
                                        ref={cardRef}
                                        className={`w-[320px] ${currentPreset.aspectClass} bg-base-100 p-5 flex flex-col justify-between shadow-2xl relative overflow-hidden select-none`}
                                    >
                                        <div className="flex items-center justify-between text-[80%] font-medium z-10 shrink-0">
                                            <span>
                                                View on <span className="text-white font-black">OpenProfile</span>
                                            </span>
                                            <img
                                                className="w-[7%]"
                                                src={`${cdnBaseUrl}/branding/logo.svg`}
                                                alt="Logo"
                                            />
                                        </div>

                                        <div className="flex flex-col justify-between gap-3 py-4 w-full overflow-hidden">
                                            <div className="flex-1 min-h-0 w-full flex items-center justify-start overflow-hidden">
                                                <div className="aspect-square h-full max-h-full max-w-full w-auto rounded-full overflow-hidden shrink-0">
                                                    {loading ? (
                                                        <div className="skeleton w-full h-full rounded-full"></div>
                                                    ) : (
                                                        <img
                                                            src={
                                                                character?.avatar
                                                                    ? `${cdnBaseUrl}${character.avatar}`
                                                                    : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`
                                                            }
                                                            alt={character?.displayName || "Avatar"}
                                                            className="w-full h-auto object-cover rounded-full"
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="text-left w-full shrink-0">
                                                {loading ? (
                                                    <>
                                                        <div className="skeleton rounded-full h-5 w-48 mb-2"></div>
                                                        <div className="skeleton rounded-full h-4 w-32"></div>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/* DEVELOPER NEEDED: Add unofficial and verified badges here */}
                                                        <h1 className="text-lg font-extrabold leading-tight">
                                                            {character?.displayName}
                                                        </h1>
                                                        <span className="block text-sub text-xs">
                                                            By {character?.owner?.displayName || character?.owner?.username || character?.owner?.id}
                                                        </span>
                                                    </>
                                                )}

                                                {!loading && character?.about && currentPreset.maxBioChars > 0 && (
                                                    <p className="mt-2 text-xs font-normal">
                                                        {truncateText(character.about, currentPreset.maxBioChars)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between px-4 items-center gap-4 text-xs text-sub border-t border-base-300 pt-4">
                                            <div className="flex items-center gap-2 leading-none">
                                                <span className="font-nerdfont text-sm leading-none">
                                                    󰈈
                                                </span>

                                                {formatNumber(character?.interactions?.views?.count || 0).short}
                                            </div>

                                            <div className="flex items-center gap-2 leading-none">
                                                <span className="font-nerdfont text-sm leading-none">
                                                    
                                                </span>

                                                {formatNumber(character?.interactions?.reads?.count || 0).short}
                                            </div>

                                            <div className="flex items-center gap-2 leading-none">
                                                <span className="font-nerdfont text-sm leading-none">
                                                    
                                                </span>

                                                {formatNumber(character?.interactions?.likes?.count || 0).short}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-5 w-full">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-sub font-bold uppercase mb-1">
                                Share Link
                            </span>

                            <div className="join w-full">
                                {loading ? (
                                    <div className="join-item skeleton h-10 w-full flex-1"></div>
                                ) : (
                                    <input
                                        type="text"
                                        readOnly
                                        value={shareUrl}
                                        className="input input-bordered text-sm text-sub flex-1 join-item focus:outline-none"
                                    />
                                )}
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={copyToClipboard}
                                    className="btn btn-accent text-xs join-item"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-sub font-bold uppercase mb-1">
                                Share to Socials
                            </span>

                            <div className="flex w-full gap-2">
                                <a
                                    href={loading ? "#" : socialLinks.reddit}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col w-full items-center gap-1 p-2 bg-base-200 hover:bg-base-300 rounded-lg text-xs"
                                >
                                    <span className="font-nerdfont text-lg"></span>
                                    <span>Reddit</span>
                                </a>

                                <a
                                    href={loading ? "#" : socialLinks.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col w-full items-center gap-1 p-2 bg-base-200 hover:bg-base-300 rounded-lg text-xs"
                                >
                                    <span className="font-nerdfont text-lg"></span>
                                    <span>Facebook</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

ShareModal.displayName = "ShareModal";
export default ShareModal;
