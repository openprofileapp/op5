import { useRef } from "react";
import { CropperRef, Cropper } from 'react-advanced-cropper';
// import { Cropper, CropperRef } from "react-mobile-cropper";

import "react-mobile-cropper/dist/style.css";

type Props = {
    image: string;
    onCancel: () => void;
    onComplete: (file: File) => void;
    aspectRatio: number
};

export default function CropModal({ 
    image, 
    onCancel, 
    onComplete, 
    aspectRatio
}: Props) {
    const cropperRef = useRef<CropperRef>(null);

    const handleSave = () => {
        const cropper = cropperRef.current;
        if (!cropper) return;

        const canvas = cropper.getCanvas();
        if (!canvas) return;

        canvas.toBlob((blob) => {
            if (!blob) return;

            const file = new File([blob], `${image}.jpg`, {
                type: "image/jpeg",
            });

            onComplete(file);
        }, "image/jpeg");
    };

    return (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-3 p-6">
            <Cropper
                ref={cropperRef}
                src={image}
                className="h-full w-full rounded"
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                aspectRatio={aspectRatio}
            />

            <div className="flex items-center justify-center gap-3 mx-4 mt-4 w-full">
                <button className="btn flex-1" onClick={onCancel}>
                    Cancel
                </button>

                <button className="btn btn-accent flex-4" onClick={handleSave}>
                    Crop
                </button>
            </div>
        </div>
    );
}