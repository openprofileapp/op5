import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { apiBaseUrl } from "../../../_common/scripts/domains.js";
import { toast } from "../../../_common/scripts/toast.js";
import { DatasetItemType } from "../../../../_common/types/template/dataset.type.js";
import { BlockItemType } from "../../../../_common/types/blocks/block.type.js";
import { TemplateType } from "../../../../_common/types/template/template.type.js";
import { DraftCharacterType } from "../../../../_common/types/characters/character.type.js";

export interface InteractionOptions {
    type?: "dataset" | "block" | "template" | "character";
}

type DataType = 
    | DatasetItemType
    | BlockItemType
    | TemplateType
    | DraftCharacterType

export interface UnunpublishModalRef {
    open: (
        data: DataType, 
        options?: InteractionOptions
    ) => void;
    close: () => void;
}

const UnunpublishModal = forwardRef<UnunpublishModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<DataType>();
    const [options, setOptions] = useState<InteractionOptions>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const displayName = data?.displayName || data?.label || data?.id

    const resetState = () => {
        setData(undefined);
        setOptions({});
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data, opts = {}) => {
            setData(data);
            setOptions(opts);

            requestAnimationFrame(() => {
                dialogRef.current?.showModal();
            });
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    const handleunPublish = async () => {
        if (isLoading || !data) return;

        try {
            setIsLoading(true);

            const response = await fetch(
                `${apiBaseUrl}/v3/${
                    options.type === "dataset" ? "templates/dataset" : options.type
                }s/unpublish/${"id" in data && data?.id}`, 
                { credentials: "include" }
            );

            const responseData = await response.json();

            if (response.ok) {
                handleClose();

                toast.show(
                    `Unpublished ${displayName}`, 
                    { icon: "", type: "success" }
                );

                window.location.reload();
            } else {
                toast.show(
                    `Failed to unpublish ${displayName}`, 
                    { 
                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                        type: "error" 
                    }
                );
            }
        } catch (error) {
            console.error("Failed to unpublish asset:", error);

            toast.show(
                `Failed to unpublish ${displayName}`, 
                { 
                    subtext: String(error),
                    type: "error" 
                }
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal"
        >
            {data && (
                <div className="modal-box">
                    <form method="dialog">
                        <button 
                            type="button" 
                            className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                            onClick={handleClose}
                        >
                            
                        </button>
                    </form>
                    
                    <h3 className="font-bold text-2xl mb-6 text-center">
                        Unpublish {displayName}
                    </h3>

                    <div className="flex gap-5 pb-8 pt-4 flex-col">
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-2xl font-nerdfont shrink-0">
                                
                            </div>

                            <div>
                                Your {options.type} will no longer be public.

                                <br />

                                <span className="text-sub text-xs">
                                    Previously shared copies or references may still exist.
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2 flex-row relative">
                        <button 
                            type="button"
                            className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                            onClick={handleClose}
                        >
                            {t("components.modals.cancel")}
                        </button>

                        <button
                            type="button"
                            className="btn flex-1 bg-accent text-white border-accent"
                            disabled={isLoading}
                            onClick={handleunPublish}
                        >
                            <div className={isLoading ? "loading" : ""}>
                                Unpublish
                            </div>
                        </button>
                    </div>
                </div>
            )}
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

UnunpublishModal.displayName = "UnunpublishModal";
export default UnunpublishModal;
