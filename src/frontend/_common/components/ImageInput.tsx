import { useRef, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { parseGIF, decompressFrames } from "gifuct-js";

import { useObjectURL } from "../hooks/useObjectURL.hook.js";
import CropModal from "../components/modals/CropImageModal.js";
import ZoomableMedia from "./ZoomableMedia.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { ValueOptionsType } from "../../../_common/types/value.type.js";

type Props = {
    id?: string;
    options?: ValueOptionsType;
    useModal?: boolean;
    value: File | null;
    defaultUrl?: string | null;
    animatedDefaultUrl?: string | null;
    readOnly?: boolean;
    onContextMenu?: (e: React.MouseEvent) => void;
    onChange: (
        file: File | null,
        base64Url: string | null,
        staticPreviewFile?: File | null,
        staticPreviewBase64?: string | null,
        options?: ValueOptionsType
    ) => boolean | Promise<boolean>;
    accept: string;
    aspectRatio?: number;
    height?: string;
    width?: string;
    label?: string;
    className?: string;
    skipCrop?: boolean;
};

function dataURLtoFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

export default function ImageInput({
    id,
    options,
    useModal = false,
    value,
    defaultUrl,
    animatedDefaultUrl,
    readOnly = false,
    onContextMenu,
    onChange,
    accept,
    aspectRatio,
    height,
    width,
    className = "",
    skipCrop = false,
}: Props) {
    const { uploadMediaModal } = useModals();
    const inputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [portalContainer, setPortalContainer] = useState<Element | null>(null);

    const [rawFile, setRawFile] = useState<File | null>(null);
    const [rawImage, setRawImage] = useState<string | null>(null);
    const [showCrop, setShowCrop] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isCleared, setIsCleared] = useState(false);

    const [staticFrameUrl, setStaticFrameUrl] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const fileUrl = useObjectURL(value);

    useEffect(() => {
        if (inputRef.current) {
            const closestDialog = inputRef.current.closest("dialog");
            setPortalContainer(closestDialog || document.body);
        } else {
            setPortalContainer(document.body);
        }
    }, []);

    const previewUrl = isCleared
        ? null
        : fileUrl || (value === null && defaultUrl ? defaultUrl : null);

    const animatedUrl = isCleared
        ? null
        : (value && value.type === "image/gif" ? fileUrl : null) ||
          animatedDefaultUrl ||
          fileUrl ||
          defaultUrl;

    const isVideo =
        value?.type.startsWith("video/") ||
        rawFile?.type.startsWith("video/") ||
        (previewUrl ? /^data:video\//i.test(previewUrl) : false) ||
        (previewUrl ? /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(previewUrl) : false) ||
        (defaultUrl ? /\.(mp4|webm|ogg|mov|m4v)($|\?)/i.test(defaultUrl) : false);

    const isGif =
        !isVideo &&
        (value?.type === "image/gif" ||
            rawFile?.type === "image/gif" ||
            (previewUrl ? /^data:image\/gif/i.test(previewUrl) : false) ||
            (previewUrl ? /\.gif($|\?)/i.test(previewUrl) : false) ||
            (animatedDefaultUrl ? /\.gif($|\?)/i.test(animatedDefaultUrl) : false));

    const isSvg =
        !isVideo &&
        (value?.type === "image/svg+xml" ||
            rawFile?.type === "image/svg+xml" ||
            (previewUrl ? /^data:image\/svg\+xml/i.test(previewUrl) : false) ||
            (previewUrl ? /\.svg($|\?)/i.test(previewUrl) : false) ||
            (defaultUrl ? /\.svg($|\?)/i.test(defaultUrl) : false));

    useEffect(() => {
        const sourceForStaticFrame = animatedUrl || previewUrl;

        if (!sourceForStaticFrame || isSvg || isVideo) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setStaticFrameUrl(null);
            return;
        }

        let isMounted = true;

        const generateStaticFrame = async () => {
            try {
                if (isGif) {
                    const response = await fetch(sourceForStaticFrame);
                    const arrayBuffer = await response.arrayBuffer();
                    const gif = parseGIF(arrayBuffer);
                    const frames = decompressFrames(gif, true);

                    if (!frames || frames.length === 0 || !isMounted) return;

                    const frame = frames[0];
                    const canvas = document.createElement("canvas");
                    canvas.width = gif.lsd.width;
                    canvas.height = gif.lsd.height;

                    const ctx = canvas.getContext("2d");
                    if (!ctx) return;

                    const patchCanvas = document.createElement("canvas");
                    patchCanvas.width = frame.dims.width;
                    patchCanvas.height = frame.dims.height;
                    const patchCtx = patchCanvas.getContext("2d");

                    if (patchCtx) {
                        const patchData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
                        patchData.data.set(frame.patch);
                        patchCtx.putImageData(patchData, 0, 0);
                        ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

                        if (isMounted) {
                            setStaticFrameUrl(canvas.toDataURL("image/png"));
                        }
                    }
                } else {
                    const img = new Image();
                    img.crossOrigin = "anonymous";
                    img.src = sourceForStaticFrame;

                    img.onload = () => {
                        if (!isMounted) return;

                        const canvas = document.createElement("canvas");
                        canvas.width = img.naturalWidth || img.width;
                        canvas.height = img.naturalHeight || img.height;

                        const ctx = canvas.getContext("2d");
                        if (ctx) {
                            ctx.drawImage(img, 0, 0);
                            setStaticFrameUrl(canvas.toDataURL("image/png"));
                        }
                    };

                    img.onerror = () => {
                        if (isMounted) setHasError(true);
                    };
                }
            } catch (err) {
                console.error("Failed to generate static frame:", err);
                if (isMounted) setHasError(true);
            }
        };

        generateStaticFrame();

        return () => {
            isMounted = false;
        };
    }, [previewUrl, animatedUrl, isGif, isSvg, isVideo]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCleared(false);
        setHasError(false);
    }, [defaultUrl]);

    useEffect(() => {
        if (!videoRef.current || !isVideo) return;

        if (isHovered) {
            videoRef.current.play().catch(() => {});
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    }, [isHovered, isVideo]);

    const resetInput = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const openFilePicker = (e: React.MouseEvent) => {
        if (readOnly) return;

        if (useModal) {
            e.preventDefault();
            e.stopPropagation();

            uploadMediaModal.open({
                type: "content",
                fieldId: id ?? "",
                url: previewUrl ?? "",
                description: (options?.description as string) ?? "",
                credit: (options?.credit as unknown as string) ?? "",
                onChange: async (fieldId, type, newValue, updatedOptions) => {
                    setIsCleared(false);
                    setHasError(false);

                    const result = await onChange(null, newValue, null, null, updatedOptions);
                    return result !== false;
                }
            });
        } else {
            inputRef.current?.click();
        }
    };

    const cleanupRawImage = () => {
        if (rawImage) {
            URL.revokeObjectURL(rawImage);
            setRawImage(null);
            setRawFile(null);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (readOnly) return;

        setIsCleared(true);
        setStaticFrameUrl(null);

        onChange(null, null, null, null);
        resetInput();
    };

    const handleCropComplete = async (croppedFile: File) => {
        setIsCleared(false);
        setHasError(false);

        let staticFile: File | null = null;
        let staticBase64Url: string | null = null;

        if (croppedFile.type === "image/gif") {
            try {
                const objectUrl = URL.createObjectURL(croppedFile);
                const response = await fetch(objectUrl);
                const arrayBuffer = await response.arrayBuffer();
                const gif = parseGIF(arrayBuffer);
                const frames = decompressFrames(gif, true);

                if (frames && frames.length > 0) {
                    const frame = frames[0];
                    const canvas = document.createElement("canvas");
                    canvas.width = gif.lsd.width;
                    canvas.height = gif.lsd.height;

                    const ctx = canvas.getContext("2d");
                    const patchCanvas = document.createElement("canvas");
                    patchCanvas.width = frame.dims.width;
                    patchCanvas.height = frame.dims.height;
                    const patchCtx = patchCanvas.getContext("2d");

                    if (ctx && patchCtx) {
                        const patchData = patchCtx.createImageData(frame.dims.width, frame.dims.height);
                        patchData.data.set(frame.patch);
                        patchCtx.putImageData(patchData, 0, 0);
                        ctx.drawImage(patchCanvas, frame.dims.left, frame.dims.top);

                        staticBase64Url = canvas.toDataURL("image/png");
                        staticFile = dataURLtoFile(staticBase64Url, "preview_static.png");
                        setStaticFrameUrl(staticBase64Url);
                    }
                }
                URL.revokeObjectURL(objectUrl);
            } catch (err) {
                console.error("Failed to produce static preview file:", err);
            }
        }

        const mainBase64Url = await fileToBase64(croppedFile);

        onChange(croppedFile, mainBase64Url, staticFile, staticBase64Url, options);

        setShowCrop(false);
        cleanupRawImage();
    };

    const hasMedia = Boolean(previewUrl && !hasError);

    const borderStyleClasses = hasMedia
        ? "border border-solid"
        : "border-2 border-dashed";

    const cursorClass = readOnly ? "cursor-default" : "cursor-pointer";
    const sizeClasses = `${height ? `h-${height}` : ""} ${width ? `w-${width}` : ""}`.trim();

    const displayImageSrc = isHovered || isSvg
        ? animatedUrl || previewUrl 
        : staticFrameUrl || previewUrl;

    return (
        <>
            <div
                className={`relative group border-base-300 rounded flex items-center justify-center overflow-hidden ${borderStyleClasses} ${cursorClass} ${sizeClasses} ${className}`.trim()}
                id={id}
                onContextMenu={onContextMenu}
                onClick={openFilePicker}
                onMouseEnter={() => !readOnly && setIsHovered(true)}
                onMouseLeave={() => !readOnly && setIsHovered(false)}
            >
                {hasMedia ? (
                    <>
                        {isVideo ? (
                            <video
                                id={id}
                                ref={videoRef}
                                src={previewUrl || undefined}
                                className="h-full w-full rounded object-cover"
                                muted
                                loop
                                playsInline
                                onError={() => setHasError(true)}
                            />
                        ) : readOnly ? (
                            <ZoomableMedia
                                id={id}
                                src={animatedUrl || previewUrl || ""}
                                description={options?.description}
                                credit={options?.credit}
                                className={`h-full w-full rounded ${
                                    isSvg ? "object-contain" : "object-cover"
                                }`}
                            />
                        ) : (
                            <img
                                id={id}
                                src={displayImageSrc ?? undefined}
                                className={`h-full w-full rounded ${
                                    isSvg ? "object-contain" : "object-cover"
                                }`}
                                onError={() => setHasError(true)}
                            />
                        )}

                        {!readOnly && (
                            <button
                                type="button"
                                className="absolute top-0 right-1 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer z-10"
                                onClick={handleClear}
                            >
                                <span className="font-nerdfont text-base"></span>
                            </button>
                        )}
                    </>
                ) : (
                    <span className="flex items-center justify-center opacity-60 hover:opacity-100 transition h-full w-full">
                        <span className="font-nerdfont text-xl"></span>
                    </span>
                )}

                <input
                    id={id}
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    disabled={readOnly}
                    readOnly={readOnly}
                    onChange={(e) => {
                        if (readOnly) return;
                        const file = e.target.files?.[0];
                        if (!file) return;

                        resetInput();

                        const isVideoFile = file.type.startsWith("video/");

                        if (skipCrop || isVideoFile || file.type === "image/svg+xml") {
                            handleCropComplete(file);
                        } else {
                            const cropPreviewUrl = URL.createObjectURL(file);
                            setRawFile(file);
                            setRawImage(cropPreviewUrl);
                            setShowCrop(true);
                        }
                    }}
                />
            </div>

            {showCrop && rawImage && !readOnly && portalContainer && createPortal(
                <CropModal
                    image={rawImage}
                    fileType={rawFile?.type}
                    onCancel={() => {
                        setShowCrop(false);
                        cleanupRawImage();
                    }}
                    onComplete={handleCropComplete}
                    aspectRatio={aspectRatio || 0}
                />,
                portalContainer
            )}
        </>
    );
}
