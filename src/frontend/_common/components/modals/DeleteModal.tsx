import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, Dispatch, SetStateAction, useEffect } from "react";

import { GetDraftCharacterItemType } from "../../../../_common/types/characters/character.type.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import { toast } from "../../scripts/toast.js";
import { GetDatasetsType } from "../../../../_common/types/template/dataset.type.js";

export interface InteractionOptions {
    setIsDismissed?: Dispatch<SetStateAction<boolean>>;
    type?: "character" | "template" | "dataset";
    onConfirm?: () => void;
}

export interface DeleteModalRef {
    open: (
        data: GetDraftCharacterItemType | GetDatasetsType, 
        options?: InteractionOptions
    ) => Promise<boolean>;
    close: () => void;
}

const seconds = 5;

const DeleteModal = forwardRef<DeleteModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const [data, setData] = useState<GetDraftCharacterItemType | GetDatasetsType>();
    const [options, setOptions] = useState<InteractionOptions>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(seconds);

    const resetState = () => {
        setData(undefined);
        setOptions({});
        setIsLoading(false);
        setCountdown(seconds);
        resolverRef.current = null;
    };

    useEffect(() => {
        if (!data || countdown <= 0) return;

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [data, countdown]);

    useImperativeHandle(ref, () => ({
        open: (data, opts = {}) => {
            setData(data);
            setOptions(opts);
            setCountdown(seconds);

            requestAnimationFrame(() => {
                dialogRef.current?.showModal();
            });

            return new Promise<boolean>((resolve) => {
                resolverRef.current = resolve;
            });
        },
        close: () => {
            if (resolverRef.current) {
                resolverRef.current(false);
            }
            dialogRef.current?.close();
            resetState();
        }
    }));

    const handleClose = () => {
        if (resolverRef.current) {
            resolverRef.current(false);
        }
        dialogRef.current?.close();
        resetState();
    };

    const getEndpoint = () => {
        switch (options.type) {
            case "template":
                return `${apiBaseUrl}/v3/templates/delete/${(data && "id" in data && data?.id)}`;
            case "dataset":
                return `${apiBaseUrl}/v3/templates/datasets/delete/${(data && "id" in data && data?.id)}`;
            case "character":
            default:
                return `${apiBaseUrl}/v3/characters/delete/${(data && "id" in data && data?.id)}`;
        }
    };

    const handleDelete = async () => {
        if (isLoading || countdown > 0 || !(data && "id" in data && data?.id)) return;

        try {
            setIsLoading(true);

            const response = await fetch(getEndpoint(), { 
                method: "DELETE",
                credentials: "include" 
            });

            const responseData = await response.json();

            if (response.ok) {
                options.setIsDismissed?.(true);
                options.onConfirm?.();

                if (resolverRef.current) {
                    resolverRef.current(true);
                    resolverRef.current = null;
                }

                dialogRef.current?.close();
                resetState();

                toast.show(
                    `${t("words.You")} ${t("words.deleted")} ${(data && "displayName" in data && data?.displayName) || (data && "label" in data && data?.label) || (data && "id" in data && data?.id)}`, 
                    { icon: "󰗨", type: "error" }
                );
            } else {
                toast.show(
                    `Failed to ${t("words.delete")} ${(data && "displayName" in data && data?.displayName) || (data && "label" in data && data?.label) || (data && "id" in data && data?.id)}`, 
                    { 
                        subtext: `${responseData?.id || ""}${responseData?.id ? ": " : ""}${responseData?.message}`,
                        type: "error" 
                    }
                );
            }
        } catch (error) {
            console.error("Failed to delete asset:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal"
            onClose={handleClose}
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
                        {t("words.Delete")} {(data && "displayName" in data && data?.displayName) || (data && "label" in data && data?.label as string) || (data && "id" in data && data?.id as string)}
                    </h3>

                    <div className="flex gap-5 pb-8 pt-4 flex-col">
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-2xl font-nerdfont shrink-0">
                                󰗨
                            </div>

                            <div>
                                {t("components.modals.delete.rowOneTitle")}

                                <br/>

                                <span className="text-sub text-xs">
                                    {t("components.modals.delete.rowOneSubtext")}
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
                            className={`btn flex-1 bg-accent text-white border-accent ${countdown > 0 ? "opacity-50" : ""}`}
                            disabled={isLoading || countdown > 0}
                            onClick={handleDelete}
                        >
                            <div className={isLoading ? "loading" : ""}>
                                {countdown > 0 
                                    ? `${t("words.Delete")} (${countdown}s)` 
                                    : t("words.Delete")
                                }
                            </div>
                        </button>
                    </div>
                </div>
            )}
            <form 
                method="dialog" 
                className="modal-backdrop"
            >
                <button type="submit" onClick={handleClose}>close</button>
            </form>
        </dialog>
    );
});

DeleteModal.displayName = "DeleteModal";
export default DeleteModal;
