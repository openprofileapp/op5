import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, Dispatch, SetStateAction } from "react";

import { GetDraftCharacterItemType } from "../../../../_common/types/characters/character.type.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import { toast } from "../../scripts/toast.js";

export interface InteractionOptions {
    setIsDismissed?: Dispatch<SetStateAction<boolean>>;
}

export interface TrashModalRef {
    open: (data: GetDraftCharacterItemType, options?: InteractionOptions) => void;
    close: () => void;
}

const TrashModal = forwardRef<TrashModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetDraftCharacterItemType>();
    const [options, setOptions] = useState<InteractionOptions>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);

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

    const handleTrash = async () => {
        if (isLoading) return;

        try {
            setIsLoading(true);

            const response = await fetch(
                `${apiBaseUrl}/v3/characters/trash/${data?.id}`, 
                { credentials: "include" }
            );

            const responseData = await response.json();

            if (response.ok) {
                options.setIsDismissed?.(true);

                handleClose();

                toast.show(
                    `${t("words.Moved")} ${data?.displayName || data?.id} ${t("words.toTrash")}`, 
                    { icon: "󰆴", type: "error" }
                );
            } else {
                toast.show(
                    `Failed to ${t("words.move")} ${data?.displayName || data?.id} ${t("words.toTrash")}`, 
                    { 
                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                        type: "error" 
                    }
                );
            }
        } catch (error) {
            console.error("Failed to move asset to trash:", error);
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
                        {t("words.Move")} {data.displayName} {t("components.modals.trash.toTrash")}
                    </h3>

                    <div className="flex gap-5 pb-8 pt-4 flex-col">
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-2xl font-nerdfont shrink-0">
                                󰆴
                            </div>

                            <div>
                                {t("components.modals.trash.rowOneTitle")}

                                <br/>

                                <span className="text-sub text-xs">
                                    {t("components.modals.trash.rowOneSubtext")}
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
                            onClick={handleTrash}
                        >
                            <div className={isLoading ? "loading" : ""}>
                                {t("words.MoveToTrash")}
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

TrashModal.displayName = "TrashModal";
export default TrashModal;
