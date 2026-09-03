import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import JSZip from "jszip";

import { cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";
import { formatNumber } from "kage-library/client";
import { formatDisplayNameToUrl } from "../../scripts/formatDisplayNameToUrl.js";

export interface ShareModalRef {
    open: (data: GetPublishedCharacterItemType) => void;
    close: () => void;
}

type AspectRatioOption = 
    | "landscape" 
    | "square" 
    | "portrait" 
    | "story"
;

interface AspectPreset {
    label: string;
    width: number;
    height: number;
    aspectClass: string;
    maxBioLines: number;
    scaleClass: string;
    showAvatar: boolean;
    layoutMode: "vertical" | "horizontal";
    centerAvatar?: boolean;
    smallText?: boolean;
}

const presets: Record<AspectRatioOption, AspectPreset> = {
    landscape: {
        label: "Landscape",
        width: 1200,
        height: 675,
        aspectClass: "aspect-video",
        maxBioLines: 2,
        scaleClass: "scale-[100%]",
        showAvatar: true,
        layoutMode: "horizontal",
        centerAvatar: false,
        smallText: true,
    },
    square: {
        label: "Square",
        width: 1080,
        height: 1080,
        aspectClass: "aspect-square",
        maxBioLines: 3,
        scaleClass: "scale-[70%]",
        showAvatar: true,
        layoutMode: "vertical",
        centerAvatar: false,
        smallText: false,
    },
    portrait: {
        label: "Portrait",
        width: 1080,
        height: 1350,
        aspectClass: "aspect-[4/5]",
        maxBioLines: 5,
        scaleClass: "scale-[56%]",
        showAvatar: true,
        layoutMode: "vertical",
        centerAvatar: false,
        smallText: false,
    },
    story: {
        label: "Story",
        width: 1080,
        height: 1920,
        aspectClass: "aspect-[9/16]",
        maxBioLines: 8,
        scaleClass: "scale-[40%]",
        showAvatar: true,
        layoutMode: "vertical",
        centerAvatar: true,
        smallText: false,
    },
};

const truncateByLines = (text: string, maxLines: number, charsPerLine: number = 42): string => {
    if (!text || maxLines <= 0) return "";
    
    const rawLines = text.split("\n");
    let lineCount = 0;
    let resultText = "";

    for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const estimatedVisualLines = Math.max(1, Math.ceil(line.length / charsPerLine));

        if (lineCount + estimatedVisualLines > maxLines) {
            const allowedLines = maxLines - lineCount;
            const maxCharsForRemaining = allowedLines * charsPerLine - 3;
            
            resultText += (resultText ? "\n" : "") + line.slice(0, Math.max(0, maxCharsForRemaining)).trim() + "...";
            
            return resultText;
        }

        resultText += (resultText ? "\n" : "") + line;
        lineCount += estimatedVisualLines;

        if (lineCount >= maxLines) break;
    }

    if (text.length > maxLines * charsPerLine && !resultText.endsWith("...")) {
        return resultText.slice(0, maxLines * charsPerLine - 3).trim() + "...";
    }

    return resultText;
};

const ShareModal = forwardRef<ShareModalRef>((_, ref) => {
    const { ready: isTranslationReady, t } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const cardRef = useRef<HTMLDivElement | null>(null);

    const [data, setData] = useState<GetPublishedCharacterItemType>();
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [downloadingType, setDownloadingType] = useState<"single" | "all" | null>(null);
    const [selectedPreset, setSelectedPreset] = useState<AspectRatioOption>("square");

    const resetState = () => {
        setData(undefined);
        setLoading(true);
        setIsDownloading(false);
        setDownloadingType(null);
        setSelectedPreset("square");
    };

    useImperativeHandle(ref, () => ({
        open: (data: GetPublishedCharacterItemType) => {
            setData(data);
            setLoading(false);

            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();

            resetState();
        },
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        
        resetState();
    };

    if (!isTranslationReady || !data) return null;

    const currentPreset = presets[selectedPreset];

    const shareUrl =
        typeof window !== "undefined"
            ? `https://${window.config.domains.shortlink}/${data.id}`
            : "";

    const shareText = `Check out ${data.displayName || "this character"} on OpenProfile!`;

    const socialLinks = {
        x: `https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        reddit: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareText)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    const copyToClipboard = async () => {
        try {
            handleClose();

            await navigator.clipboard.writeText(shareUrl);

            toast.show(t("components.modals.share.copied"), {
                type: "success",
            });
        } catch {
            toast.show("Failed to copy link", { type: "error" });
        }
    };

    const generatePresetDataUrl = async (presetKey: AspectRatioOption): Promise<string> => {
        if (!cardRef.current) throw new Error("Card container not rendered");
        const preset = presets[presetKey];

        return await toPng(cardRef.current, {
            cacheBust: true,
            canvasWidth: preset.width,
            canvasHeight: preset.height,
            pixelRatio: 1,
        });
    };

    const handleDownloadSingle = async () => {
        if (!cardRef.current || loading) return;

        setIsDownloading(true);
        setDownloadingType("single");

        try {
            const dataUrl = await generatePresetDataUrl(selectedPreset);
            const link = document.createElement("a");
            
            link.download = `${formatDisplayNameToUrl(data.displayName || "")}-${selectedPreset}-card.png`;
            link.href = dataUrl;
            link.click();

            toast.show(`Downloaded ${currentPreset.label} image`, { type: "success" });
        } catch (err) {
            console.error(err);

            toast.show("Failed to download image", { type: "error" });
        } finally {
            setIsDownloading(false);
            setDownloadingType(null);
        }
    };

    const handleDownloadAll = async () => {
        if (!cardRef.current || loading) return;
        setIsDownloading(true);
        setDownloadingType("all");

        const zip = new JSZip();

        const previousPreset = selectedPreset;
        const characterSlug = formatDisplayNameToUrl(data.displayName || "character");

        try {
            const keys = Object.keys(presets) as AspectRatioOption[];
            for (const key of keys) {
                setSelectedPreset(key);
                await new Promise((resolve) => setTimeout(resolve, 100));

                const dataUrl = await generatePresetDataUrl(key);
                const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");

                zip.file(`${characterSlug}-${key}-card.png`, base64Data, { base64: true });
            }

            const zipBlob = await zip.generateAsync({ type: "blob" });
            const zipUrl = URL.createObjectURL(zipBlob);

            const link = document.createElement("a");

            link.download = `${characterSlug}-share-cards.zip`;
            link.href = zipUrl;
            link.click();

            URL.revokeObjectURL(zipUrl);

            toast.show("Downloaded all images", { type: "success" });
        } catch (err) {
            console.error(err);

            toast.show("Failed to create zip archive", { type: "error" });
        } finally {
            setSelectedPreset(previousPreset);
            setIsDownloading(false);
            setDownloadingType(null);
        }
    };

    const renderAvatar = (customClasses = "") => (
        <div className={`aspect-square rounded-full overflow-hidden shrink-0 flex items-center justify-center ${customClasses}`}>
            {loading ? (
                <div className="skeleton w-full h-auto rounded-full"></div>
            ) : (
                <img
                    src={
                        data.avatar
                            ? `${cdnBaseUrl}${data.avatar}`
                            : `${cdnBaseUrl}${window.config.metadata.assets.noImage}`
                    }
                    alt={data.displayName || "Avatar"}
                    className="w-full h-auto object-cover rounded-full"
                />
            )}
        </div>
    );

    const auraStyle: React.CSSProperties = data.isAuraEnabled
        ? {
            ["--aura-type" as string]: `aura-${data.auraType || "flow"}`,
            ["--aura-primary" as string]: data.auraPrimary || "var(--color-accent)",
            ["--aura-secondary" as string]: data.auraSecondary || "var(--color-accent)",
        }
        : {
            border: "1px solid #222222",
        };

    return (
        <dialog ref={dialogRef} className="modal">
            <div className="modal-box relative flex flex-col gap-6 overflow-y-auto scrollbar">
                <form method="dialog">
                    <button 
                        type="button" 
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
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
                                    className={`tab flex-1 ${
                                        selectedPreset === key ? "tab-active" : ""
                                    }`}
                                >
                                    {presets[key].label}
                                </button>
                            ))}
                        </div>

                        <div className="w-full flex flex-col gap-4">
                            <div className="w-full h-64">
                                <div className="relative w-full h-full flex justify-center items-center my-auto overflow-hidden">
                                    <div className={`rounded border border-base-300 ${currentPreset.scaleClass}`}>
                                        <div
                                            ref={cardRef}
                                            className={`aura-effect w-[320px] ${currentPreset.aspectClass} bg-base-100 p-5 flex flex-col justify-between relative overflow-hidden select-none`}
                                            style={auraStyle}
                                        >
                                            <div className={`flex items-center justify-between ${currentPreset.smallText ? "text-[60%]" : "text-[80%]"} font-medium z-10 shrink-0`}>
                                                <span>
                                                    View on <span className="text-white font-black">OpenProfile</span>
                                                </span>

                                                <img
                                                    className={`${currentPreset.smallText ? "w-[5%]" : "w-[7%]"}`}
                                                    src={`${cdnBaseUrl}/branding/logo.svg`}
                                                    alt="Logo"
                                                />
                                            </div>

                                            <div className="flex-1 min-h-0 flex flex-col justify-center gap-3 py-3 w-full overflow-hidden">
                                                {currentPreset.layoutMode === "horizontal" ? (
                                                    <div className="flex flex-col justify-center h-full w-full">
                                                        <div className="flex items-center gap-3 w-full shrink-0">
                                                            {currentPreset.showAvatar && renderAvatar(currentPreset.smallText ? "h-9 w-9" : "h-12 w-12")}
                                                            <div className="text-left flex-1 min-w-0">
                                                                {loading ? (
                                                                    <>
                                                                        <div className="skeleton rounded-full h-4 w-36 mb-1"></div>
                                                                        <div className="skeleton rounded-full h-3 w-24"></div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        {/* DEVELOPER NEEDED: Add unofficial and verified badges here */}
                                                                        <h1 className={`font-extrabold leading-tight truncate ${currentPreset.smallText ? "text-sm" : "text-base"}`}>
                                                                            {data.displayName}
                                                                        </h1>

                                                                        <span className={`block text-sub truncate ${currentPreset.smallText ? "text-[10px]" : "text-xs"}`}>
                                                                            {data.owner?.displayName || data.owner?.username || data.owner?.id}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {!loading && data.about && currentPreset.maxBioLines > 0 && (
                                                            <p className={`mt-2 font-normal leading-relaxed whitespace-pre-line break-words overflow-hidden text-left ${currentPreset.smallText ? "text-[10px] leading-snug" : "text-xs"}`}>
                                                                {truncateByLines(data.about, currentPreset.maxBioLines, currentPreset.smallText ? 52 : 42)}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="min-h-0 w-full flex flex-col justify-center items-center gap-3">
                                                        {currentPreset.showAvatar && (
                                                            <div className={`flex-1 min-h-0 w-full flex items-center overflow-hidden ${currentPreset.centerAvatar ? "justify-center" : "justify-start"}`}>
                                                                {renderAvatar("h-full w-auto max-h-full max-w-full")}
                                                            </div>
                                                        )}

                                                        <div className={`w-full shrink-0 flex flex-col min-h-0 ${currentPreset.centerAvatar ? "text-center items-center" : "text-left"}`}>
                                                            {loading ? (
                                                                <>
                                                                    <div className="skeleton rounded-full h-5 w-48 mb-2"></div>
                                                                    <div className="skeleton rounded-full h-4 w-32"></div>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {/* DEVELOPER NEEDED: Add unofficial and verified badges here */}
                                                                    <h1 className={`font-extrabold leading-tight ${currentPreset.smallText ? "text-sm" : "text-lg"}`}>
                                                                        {data.displayName}
                                                                    </h1>

                                                                    <span className={`block text-sub ${currentPreset.smallText ? "text-[10px]" : "text-xs"}`}>
                                                                        {data.owner?.displayName || data.owner?.username || data.owner?.id}
                                                                    </span>
                                                                </>
                                                            )}

                                                            {!loading && data.about && currentPreset.maxBioLines > 0 && (
                                                                <p className={`mt-2 font-normal leading-relaxed whitespace-pre-line break-words overflow-hidden ${currentPreset.centerAvatar ? "text-center" : "text-left"} ${currentPreset.smallText ? "text-[10px] leading-snug" : "text-xs"}`}>
                                                                    {truncateByLines(data.about, currentPreset.maxBioLines)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 px-2 items-center text-xs text-sub border-t border-base-300 pt-3 shrink-0">
                                                <div className="flex items-center gap-1.5 min-w-0 justify-start">
                                                    <span className={`font-nerdfont ${currentPreset.smallText ? "text-[10px]" : "text-sm"} leading-none shrink-0`}>
                                                        󰈈
                                                    </span>

                                                    <span className={`truncate font-semibold ${currentPreset.smallText ? "text-[8px]" : "text-[11px]"}`}>
                                                        {formatNumber(data.interactions?.views?.count || 0).short}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 min-w-0 justify-center">
                                                    <span className={`font-nerdfont ${currentPreset.smallText ? "text-[10px]" : "text-sm"} leading-none shrink-0`}>
                                                        
                                                    </span>

                                                    <span className={`truncate font-semibold ${currentPreset.smallText ? "text-[8px]" : "text-[11px]"}`}>
                                                        {formatNumber(data.interactions?.reads?.count || 0).short}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-1.5 min-w-0 justify-end">
                                                    <span className={`font-nerdfont ${currentPreset.smallText ? "text-[10px]" : "text-sm"} leading-none shrink-0`}>
                                                        
                                                    </span>

                                                    <span className={`truncate font-semibold ${currentPreset.smallText ? "text-[8px]" : "text-[11px]"}`}>
                                                        {formatNumber(data.interactions?.likes?.count || 0).short}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex w-full gap-2">
                                <button
                                    type="button"
                                    disabled={loading || isDownloading}
                                    onClick={handleDownloadSingle}
                                    className="btn btn-accent flex-6 gap-3"
                                >
                                    {isDownloading && downloadingType === "single" ? (
                                        <span className="loading loading-spinner w-4 h-4"></span>
                                    ) : (
                                        <span className="font-nerdfont leading-none text-lg"></span>
                                    )}

                                    Download {currentPreset.label} (.png)
                                </button>

                                <button
                                    type="button"
                                    disabled={loading || isDownloading}
                                    onClick={handleDownloadAll}
                                    className="btn btn-outline bg-base-100 border border-base-300 hover:bg-base-100 hover:border-base-300 flex-2 gap-3"
                                >
                                    {isDownloading && downloadingType === "all" ? (
                                        <span className="loading loading-spinner w-4 h-4"></span>
                                    ) : (
                                        <span className="font-nerdfont leading-none text-lg"></span>
                                    )}

                                    All (.zip)
                                </button>
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
                                        className="input input-bordered text-sub flex-1 join-item focus:outline-none"
                                    />
                                )}

                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={copyToClipboard}
                                    className="btn btn-accent join-item"
                                >
                                    Copy
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-xs text-sub font-bold uppercase mb-1">
                                Share to Socials
                            </span>

                            <div className="flex w-full">
                                <a
                                    href={loading ? "#" : socialLinks.reddit}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col w-full items-center gap-1 p-2 bg-base-200 hover:bg-base-300 rounded text-sm"
                                >
                                    <span className="font-nerdfont text-lg">
                                        
                                    </span>
                                    Reddit
                                </a>

                                <a
                                    href={loading ? "#" : socialLinks.facebook}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex flex-col w-full items-center gap-1 p-2 bg-base-200 hover:bg-base-300 rounded text-sm"
                                >
                                    <span className="font-nerdfont text-lg">
                                        
                                    </span>
                                    Facebook
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <form 
                method="dialog" 
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

ShareModal.displayName = "ShareModal";
export default ShareModal;
