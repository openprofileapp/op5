import { useRef, useState } from "react";

import { useObjectURL } from "../../_common/hooks/useObjectURL.hook.js";
import CropModal from "./modals/CropImageModal.js";

type Props = {
    value: File | null;
    onChange: (file: File | null) => void;
    accept: string;
    aspectRatio?: number;
    height?: string;
    width?: string;
    label?: string;
};

export default function ImageInput({
    value,
    onChange,
    accept,
    aspectRatio,
    height,
    width,
    label,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [rawImage, setRawImage] = useState<string | null>(null);
    const [showCrop, setShowCrop] = useState(false);

    const url = useObjectURL(value);

    const resetInput = () => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const openFilePicker = () => {
        inputRef.current?.click();
    };

    return (
        <>
            <div
                className={`relative group cursor-pointer border-2 border-base-300 border-dashed rounded-box flex items-center justify-center overflow-hidden h-${height} w-${width}`}
                onClick={openFilePicker}
            >
                {url ? (
                    <>
                        <img
                            src={url}
                            alt={label ?? "image"}
                            className="h-full w-full object-cover rounded-box"
                        />

                        <button
                            type="button"
                            className="absolute top-0 right-1 p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                onChange(null);
                                if (inputRef.current) inputRef.current.value = "";
                            }}
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

                        const previewUrl = URL.createObjectURL(file);
                        setRawImage(previewUrl);
                        setShowCrop(true);
                    }}
                />
            </div>

            {showCrop && rawImage && (
                <CropModal
                    image={rawImage}
                    onCancel={() => {
                        setShowCrop(false);
                        setRawImage(null);
                    }}
                    onComplete={(croppedFile) => {
                        onChange(croppedFile);
                        setShowCrop(false);
                        setRawImage(null);
                    }}
                    aspectRatio={aspectRatio || 0}
                />
            )}
        </>
    );
}