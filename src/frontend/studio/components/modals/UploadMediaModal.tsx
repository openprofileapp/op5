import { 
    useRef, 
    useState, 
    useCallback, 
    useEffect, 
    useImperativeHandle, 
    forwardRef 
} from "react";
import { useTranslation } from "react-i18next";

import { FieldNameType } from "../../../../_common/types/field.type.js";
import { ValueOptionsType } from "../../../../_common/types/value.type.js";
import { toast } from "../../../_common/scripts/toast.js";
import ImageInput from "../../../_common/components/ImageInput.js";

export type MediaType = "overview" | "content";

export interface UploadMediaModalOptions {
    type: MediaType;
    fieldId: string;
    url?: string;
    description?: string;
    credit?: string;
    onChange?: (
        fieldId: string,
        type: FieldNameType,
        value: string,
        options?: ValueOptionsType
    ) => Promise<boolean>;
}

export interface UploadMediaModalRef {
    open: (options: UploadMediaModalOptions) => void;
    close: () => void;
}

const UploadMediaModal = forwardRef<UploadMediaModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<UploadMediaModalOptions | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [credit, setCredit] = useState<string>("");

    const resetForm = useCallback(() => {
        optionsRef.current = null;
        setIsOpen(false);
        setMediaFile(null);
        setPreviewUrl("");
        setDescription("");
        setCredit("");
        setIsLoading(false);
    }, []);

    useImperativeHandle(ref, () => ({
        open: (modalOptions) => {
            optionsRef.current = modalOptions;
            
            if (modalOptions.url) {
                setPreviewUrl(modalOptions.url);
            }
            if (modalOptions.description) {
                setDescription(modalOptions.description);
            }
            if (modalOptions.credit) {
                setCredit(modalOptions.credit);
            }

            setIsOpen(true);
        },
        close: () => {
            modalRef.current?.close();
        }
    }), []);

    useEffect(() => {
        const dialogNode = modalRef.current;
        if (isOpen && dialogNode && !dialogNode.open) {
            dialogNode.showModal();
        }
    }, [isOpen]);

    async function handleSave() {
        if (!optionsRef.current?.onChange || isLoading) return;

        setIsLoading(true);

        try {
            const isSuccess = await optionsRef.current.onChange(
                optionsRef.current.fieldId,
                "media",
                previewUrl || "",
                {
                    description,
                    credit,
                }
            );

            if (isSuccess !== false) {
                modalRef.current?.close();
            }
        } catch (err) {
            console.error("Save error:", err);
        } finally {
            setIsLoading(false);
        }
    }

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={modalRef}
            className="modal"
            id="upload-media"
            onClose={resetForm}
        >
            <div className="modal-box flex flex-col relative">
                <button
                    type="button"
                    className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer z-10"
                    onClick={() => modalRef.current?.close()}
                >
                    
                </button>

                <div className="shrink-0 mb-4">
                    <h3 className="font-nerdfont text-6xl text-center mb-2">
                        󰋩
                    </h3>

                    <h3 className="text-center text-2xl font-bold capitalize">
                        Upload Media
                    </h3>
                </div>

                <div className="flex flex-col gap-6 py-2 mx-auto w-full">
                    <fieldset className="fieldset w-full gap-4">
                        <div className="flex flex-col justify-center items-center gap-1">
                            <label className="label self-start">
                                Media
                            </label>

                            <div className="flex justify-center items-center w-full">
                                <ImageInput
                                    className={`h-50 ${previewUrl ? "w-auto" : "w-full"}`}
                                    value={mediaFile}
                                    defaultUrl={previewUrl}
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    onChange={(file, base64Url) => {
                                        if (file && file.size > 1 * 1024 * 1024) {
                                            toast.show("File is too large (1 MB maximum)", { type: "error" });
                                            return;
                                        }

                                        setMediaFile(file);
                                        setPreviewUrl(base64Url || "");
                                    }}
                                    accept="image/png, image/jpeg, image/jpg"
                                    label="media"
                                />
                            </div>
                        </div>

                        <>
                            <div className="flex flex-col gap-1 mt-1">
                                <label className="label">Description</label>
                                <textarea
                                    className="textarea w-full resize-none"
                                    placeholder="Describe the image or provide context on where is it from."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1 mt-1">
                                <label className="label">Credit</label>
                                <input
                                    type="text"
                                    className="input w-full"
                                    placeholder="Who created the image?"
                                    value={credit}
                                    onChange={(e) => setCredit(e.target.value)}
                                />
                            </div>
                        </>
                    </fieldset>

                    <button
                        type="button"
                        className="btn btn-accent w-full mt-2"
                        onClick={handleSave}
                    >
                        {isLoading ? (
                            <span className="loading loading-spinner"></span>
                        ) : (
                            "Save"
                        )}
                    </button>
                </div>
            </div>

            <form method="dialog" className="modal-backdrop">
                <button type="submit" />
            </form>
        </dialog>
    );
});

UploadMediaModal.displayName = "UploadMediaModal";
export default UploadMediaModal;
