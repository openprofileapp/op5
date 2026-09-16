import { useState } from "react";

import ImageInput from "../../_common/components/ImageInput.js";
import { toast } from "../../_common/scripts/toast.js";

interface MediaFieldProps {
    initialValue?: string;
    onChange: (file: File | null, base64Url: string) => void;
}

export function MediaField({ initialValue = "", onChange }: MediaFieldProps) {
    const [image, setImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(initialValue);

    return (
            <ImageInput
                className={`${previewUrl ? "h-auto" : "min-h-36"} w-full`}
                value={image}
                defaultUrl={previewUrl}
                onChange={(file, base64Url) => {
                    if (file && file.size > 1 * 1024 * 1024) {
                        toast.show("File is too large (1 MB maximum)", { type: "error" });
                        return;
                    }

                    setImage(file);
                    if (base64Url) {
                        setPreviewUrl(base64Url);
                    }

                    onChange(file, base64Url as string);
                }}
                accept="image/png, image/jpeg, image/jpg"
                label="image"
                skipCrop={true}
            />
    );
}
