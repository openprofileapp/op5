import { useRef, useState, useEffect } from "react";

import { useObjectURL } from "../hooks/useObjectURL.hook.js";
import CropModal from "../../main/components/modals/CropImageModal.js";

type Props = {
    value: File | null;
    defaultUrl?: string | null;
    onChange: (file: File | null) => void;
    accept: string;
    aspectRatio?: number;
    height?: string;
    width?: string;
    label?: string;
    className?: string;
};

export default function ImageInput({
    value,
    defaultUrl,
    onChange,
    accept,
    aspectRatio,
    height,
    width,
    label,
    className = "",
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [rawImage, setRawImage] = useState<string | null>(null);
    const [showCrop, setShowCrop] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isCleared, setIsCleared] = useState(false);

    const fileUrl = useObjectURL(value);

    const previewUrl = isCleared 
        ? null 
        : fileUrl || (value === null && defaultUrl ? defaultUrl : null);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsCleared(false);
        setHasError(false);
    }, [defaultUrl]);

    const resetInput = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const openFilePicker = () => {
        inputRef.current?.click();
    };

    const cleanupRawImage = () => {
        if (rawImage) {
            URL.revokeObjectURL(rawImage);
            setRawImage(null);
        }
    };

    const handleClear = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsCleared(true);
        onChange(null);
        resetInput();
    };

    const sizeClasses = `${height ? `h-${height}` : ""} ${width ? `w-${width}` : ""}`.trim();

    return (
        <>
            <div
                className={`relative group cursor-pointer border-2 border-base-300 border-dashed rounded flex items-center justify-center overflow-hidden ${sizeClasses} ${className}`.trim()}
                onClick={openFilePicker}
            >
                {previewUrl && !hasError ? (
                    <>
                        <img
                            src={previewUrl}
                            alt={label ?? "image"}
                            className="h-full w-full object-cover rounded"
                            onError={() => setHasError(true)}
                        />

                        <button
                            type="button"
                            className="absolute top-0 right-1 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            onClick={handleClear}
                        >
                            <span className="font-nerdfont text-base"></span>
                        </button>
                    </>
                ) : (
                    <span className="flex items-center justify-center opacity-60 hover:opacity-100 transition h-full w-full">
                        <span className="font-nerdfont text-xl"></span>
                    </span>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        resetInput();

                        const cropPreviewUrl = URL.createObjectURL(file);
                        setRawImage(cropPreviewUrl);
                        setShowCrop(true);
                    }}
                />
            </div>

            {showCrop && rawImage && (
                <CropModal
                    image={rawImage}
                    onCancel={() => {
                        setShowCrop(false);
                        cleanupRawImage();
                    }}
                    onComplete={(croppedFile) => {
                        setIsCleared(false);
                        setHasError(false);
                        onChange(croppedFile);
                        setShowCrop(false);
                        cleanupRawImage();
                    }}
                    aspectRatio={aspectRatio || 0}
                />
            )}
        </>
    );
}
