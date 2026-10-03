import {
    useState,
    useRef,
    useEffect,
    useCallback,
    useImperativeHandle,
    forwardRef,
} from "react";
import { useTranslation } from "react-i18next";

import { CategoryIdType, categories } from "../../../../_common/scripts/categories.js";
import { cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import ImageInput from "../../../_common/components/ImageInput.js";
import TagInput from "../../../_common/components/TagInput.js";
import { useModals } from "../../../_common/hooks/ModalContext.hook.js";

export type EditBlockType = {
    blockId: string;
    sourceBlockId?: string;
    label: string;
    description: string;
    icon: string | null;
    type?: CategoryIdType;
    tags?: string[];
};

export interface EditBlockModalOptions {
    skipAssetFields: boolean;
    isTemplate: boolean;
    block: EditBlockType;
    onUpdateBlock: (data: EditBlockType) => boolean | Promise<boolean>;
}

export interface EditBlockModalRef {
    open: (options: EditBlockModalOptions) => void;
    close: () => void;
}

const EditBlockModal = forwardRef<EditBlockModalRef, object>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();
    const { 
        publishModal,
        unpublishModal
    } = useModals();
    
    const modalRef = useRef<HTMLDialogElement | null>(null);
    const optionsRef = useRef<EditBlockModalOptions | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [icon, setIcon] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState("");

    const [label, setLabel] = useState("");
    const [description, setDescription] = useState("");
    const [type, setType] = useState<CategoryIdType>();
    const [tags, setTags] = useState<string[]>([]);

    const resetForm = useCallback(() => {
        optionsRef.current = null;

        setIsOpen(false);
        setIsSaving(false);

        setIcon(null);
        setPreviewUrl("");
        setLabel("");
        setDescription("");
        setType(undefined);
        setTags([]);
    }, []);

    useImperativeHandle(
        ref,
        () => ({
            open: (options) => {
                optionsRef.current = options;

                const block = options.block;

                setIcon(null);

                setPreviewUrl(
                    block.icon
                        ? block.icon.startsWith("data:") ||
                          block.icon.startsWith("http")
                            ? block.icon
                            : `${cdnBaseUrl}${block.icon}`
                        : ""
                );

                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setLabel(block?.label || block?.displayName || "");
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setDescription(block?.description || block?.about || "");
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                setType(block?.categoryType);
                setTags(block.tags ?? []);

                setIsSaving(false);
                setIsOpen(true);
            },

            close: () => {
                modalRef.current?.close();
            },
        }),
        []
    );

    useEffect(() => {
        const dialog = modalRef.current;

        if (isOpen && dialog && !dialog.open) {
            dialog.showModal();
        }
    }, [isOpen]);

    async function handleSave() {
        const options = optionsRef.current;

        if (!options || isSaving) return;

        setIsSaving(true);

        try {
            const success = await options.onUpdateBlock({
                ...options.block,
                label: label.trim(),
                description: description.trim(),
                icon: previewUrl || null,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                categoryType: type,
                tags,
            });

            if (success) {
                modalRef.current?.close();
            } else {
                setIsSaving(false);
            }
        } catch (error) {
            console.error("Failed to update block:", error);

            toast.show("Failed to update block", {
                subtext: String(error),
                type: "error",
            });

            setIsSaving(false);
        }
    }

    const handlePublish = () => {
        if (!optionsRef.current?.block) return;

        publishModal.open(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            optionsRef.current?.block,
            { type: "block" }
        );
    };

    const handleUnpublish = () => {
        if (!optionsRef.current?.block) return;

        unpublishModal.open(
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            optionsRef.current?.block,
            { type: "block" }
        );
    };

    if (!isTranslationReady) return null;

    return (
        <dialog
            id="edit-block"
            ref={modalRef}
            className="modal"
            onClose={resetForm}
        >
            <div className="modal-box flex flex-col relative max-w-md">
                <form method="dialog">
                    <button
                        type="submit"
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer z-10"
                        aria-label="Close"
                    >
                        
                    </button>
                </form>

                <div className="mb-6">
                    <h3 className="text-center text-2xl font-bold">
                        Edit Block
                    </h3>
                </div>

                <div className="flex flex-col gap-6 py-2 mx-auto w-116 max-w-full">
                    <fieldset className="fieldset w-full">
                        <div className="flex flex-col justify-center items-center gap-1 mt-1">
                            <label className="label self-start">
                                Icon
                            </label>

                            <div className="flex justify-center items-center w-full">
                                <ImageInput
                                    className="aspect-square h-24 w-24"
                                    value={icon}
                                    defaultUrl={previewUrl}
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    onChange={(file, base64Url) => {
                                        if (
                                            file &&
                                            file.size > 1 * 1024 * 1024
                                        ) {
                                            toast.show(
                                                "File is too large (1 MB maximum)",
                                                { type: "error" }
                                            );
                                            return;
                                        }

                                        setIcon(file);
                                        setPreviewUrl(base64Url || "");
                                    }}
                                    accept="image/png, image/jpeg, image/jpg, image/svg+xml"
                                    label="icon"
                                    skipCrop
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                            <label className="label">
                                Label
                            </label>

                            <input
                                type="text"
                                className="input w-full"
                                placeholder="What is the name of your block?"
                                value={label}
                                maxLength={64}
                                onChange={(e) =>
                                    setLabel(e.target.value)
                                }
                            />
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                            <label className="label">
                                Description
                            </label>

                            <input
                                type="text"
                                className="input w-full"
                                placeholder="What does this block cover?"
                                value={description}
                                maxLength={64}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                            />
                        </div>

                        {!optionsRef.current?.skipAssetFields && (
                            <>
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Type
                                    </label>

                                    <TypeableDropdownInput
                                        value={type}
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        options={categories}
                                        typeable={false}
                                        onChange={(value) =>
                                            setType(value as CategoryIdType)
                                        }
                                        placeholder="What type of block is this?"
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Tags
                                    </label>

                                    <TagInput
                                        id="edit-block-tags"
                                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                        // @ts-ignore
                                        value={tags}
                                        onChange={setTags}
                                        maxTags={10}
                                        minLength={3}
                                        maxLength={24}
                                        onInvalid={(message) =>
                                            toast.show(message, {
                                                type: "error",
                                            })
                                        }
                                    />
                                </div>
                            </>
                        )}
                    </fieldset>

                    <button
                        type="button"
                        className="btn btn-success"
                        onClick={() => {
                            handleSave();
                            handlePublish();
                        }}
                    >
                        Save and Publish
                    </button>

                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    {optionsRef.current?.block?.isPublished && (
                        <button
                            type="button"
                            className="btn bg-base-300"
                            onClick={() => {
                                handleSave();
                                handleUnpublish();
                            }}
                        >
                            Save and Unpublish
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn btn-accent w-full"
                    >
                        {isSaving ? (
                            <span className="loading loading-spinner" />
                        ) : (
                            "Save as Draft"
                        )}
                    </button>
                </div>
            </div>
        </dialog>
    );
});

EditBlockModal.displayName = "EditBlockModal";
export default EditBlockModal;
