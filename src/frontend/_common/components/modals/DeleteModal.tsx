import { useTranslation } from "react-i18next";
import {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    Dispatch,
    SetStateAction,
    useEffect,
} from "react";

import { GetDraftCharacterItemType } from "../../../../_common/types/characters/character.type.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import { toast } from "../../scripts/toast.js";
import { DatasetItemType } from "../../../../_common/types/template/dataset.type.js";

export interface InteractionOptions {
    setIsDismissed?: Dispatch<SetStateAction<boolean>>;
    type?:
        | "character"
        | "template"
        | "dataset"
        | "field"
        | "row"
        | "block"
        | "category";
    templateId?: string;
    skipCountdown?: boolean;
    onConfirm?: () => void;
    onDelete?: (
        id: string,
        type: InteractionOptions["type"]
    ) => void;
}

export interface DeleteModalRef {
    open: (
        data: GetDraftCharacterItemType | DatasetItemType,
        options?: InteractionOptions
    ) => Promise<boolean>;
    close: () => void;
}

const seconds = 5;

const DeleteModal = forwardRef<DeleteModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const resolverRef = useRef<((value: boolean) => void) | null>(null);

    const [data, setData] = useState<
        GetDraftCharacterItemType | DatasetItemType
    >();

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
        open: (data, options = {}) => {
            setData(data);
            setOptions(options);
            setCountdown(options.skipCountdown ? 0 : seconds);

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
        },
    }));

    const handleClose = () => {
        if (resolverRef.current) {
            resolverRef.current(false);
        }

        dialogRef.current?.close();
        resetState();
    };

    const getItemId = () => {
        if (data && "id" in data) {
            return data.id;
        }

        return undefined;
    };

    const getEndpoint = () => {
        const id = getItemId();

        switch (options.type) {
            case "template":
                return `${apiBaseUrl}/v3/templates/delete/${id}`;

            case "dataset":
                return `${apiBaseUrl}/v3/templates/datasets/delete/${id}`;

            case "category":
                return `${apiBaseUrl}/v3/templates/${options.templateId}/categories/delete/${id}`;

            case "block":
                return `${apiBaseUrl}/v3/templates/${options.templateId}/blocks/delete/${id}`;

            case "row":
                return `${apiBaseUrl}/v3/templates/${options.templateId}/rows/delete/${id}`;

            case "field":
                return `${apiBaseUrl}/v3/templates/${options.templateId}/fields/delete/${id}`;

            case "character":
            default:
                return `${apiBaseUrl}/v3/characters/delete/${id}`;
        }
    };

    const getDisplayName = (): string => {
        if (!data) {
            return "";
        }

        if ("displayName" in data && data.displayName) {
            return String(data.displayName);
        }

        if ("label" in data && data.label) {
            return String(data.label);
        }

        if ("id" in data && data.id) {
            return String(data.id);
        }

        return "";
    };

    const handleDelete = async () => {
        if (
            isLoading ||
            countdown > 0 ||
            !(data && "id" in data && data.id)
        ) {
            return;
        }

        if (
            ["field", "row", "block", "category"].includes(
                options.type || ""
            ) &&
            !options.templateId
        ) {
            toast.show(
                `${t("words.FailedTo")} ${t("words.delete")} ${getDisplayName()}`,
                {
                    subtext: "Missing template ID",
                    type: "error",
                }
            );

            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(getEndpoint(), {
                method: "DELETE",
                credentials: "include",
            });

            const responseData = await response.json();

            if (response.ok) {
                options.setIsDismissed?.(true);
                options.onConfirm?.();

                options.onDelete?.(
                    String(data.id),
                    options.type
                );

                if (resolverRef.current) {
                    resolverRef.current(true);
                    resolverRef.current = null;
                }

                const displayName = getDisplayName();

                dialogRef.current?.close();
                resetState();

                toast.show(
                    `${t("words.You")} ${t("words.deleted")} ${displayName}`,
                    {
                        icon: "󰗨",
                        type: "error",
                    }
                );
            } else {
                const displayName = getDisplayName();

                toast.show(
                    `Failed to ${t("words.delete")} ${displayName}`,
                    {
                        subtext: `${responseData?.id || ""}${
                            responseData?.id ? ": " : ""
                        }${responseData?.message || ""}`,
                        type: "error",
                    }
                );
            }
        } catch (error) {
            console.error("Failed to delete asset:", error);

            toast.show(
                `Failed to ${t("words.delete")} ${getDisplayName()}`,
                {
                    subtext: "An unexpected error occurred.",
                    type: "error",
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
                        {t("words.Delete")} {getDisplayName()}
                    </h3>

                    <div className="flex gap-5 pb-8 pt-4 flex-col">
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-2xl font-nerdfont shrink-0">
                                󰗨
                            </div>

                            <div>
                                {t("components.modals.delete.rowOneTitle")}

                                <br />

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
                            className={`btn flex-1 bg-accent text-white border-accent ${
                                countdown > 0 ? "opacity-50" : ""
                            }`}
                            disabled={isLoading || countdown > 0}
                            onClick={handleDelete}
                        >
                            <div className={isLoading ? "loading" : ""}>
                                {countdown > 0
                                    ? `${t("words.Delete")} (${countdown}s)`
                                    : t("words.Delete")}
                            </div>
                        </button>
                    </div>
                </div>
            )}

            <form
                method="dialog"
                className="modal-backdrop"
            >
                <button
                    type="submit"
                    onClick={handleClose}
                >
                    close
                </button>
            </form>
        </dialog>
    );
});

DeleteModal.displayName = "DeleteModal";
export default DeleteModal;
