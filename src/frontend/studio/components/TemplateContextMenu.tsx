import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { TemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { toast } from "../../_common/scripts/toast.js";
import { TemplateRowItemType } from "../../../_common/types/template/row.type.js";
import { FieldNameType } from "../../../_common/types/field.type.js";

interface Props {
    id: string;
    type: "field" | "row" | "block" | "category"
    label?: string;
    url?: string;
    templateId: string;
    rowId: string;
    readOnly?: boolean;
    isLocked?: boolean;
    data: {
        field?: TemplateFieldItemType
        row?: TemplateRowItemType
    }
    onChange: (
        targetRowId: string,
        originalFieldId: string,
        incoming: Partial<TemplateFieldItemType>
    ) => boolean | Promise<boolean>;
    onDelete: (
        id: string,
        type: "field" | "row" | "block" | "category"
    ) => void;
}

export default function TemplateContextMenu({
    id,
    type,
    label,
    url,
    templateId,
    rowId,
    readOnly = false,
    isLocked = false,
    data,
    onChange,
    onDelete
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();
    const { deleteModal, editFieldModal } = useModals();

    const [isLocking, setIsLocking] = useState<boolean>(false);

   useEffect(() => {
        const menu = document.getElementById(`context-${id}`);

        if (!menu) return;

        const handleToggle = (event: Event) => {
            const toggleEvent = event as ToggleEvent;

            if (toggleEvent.newState === "open") {
                document.body.style.overflow = "hidden";
            } else {
                document.body.style.overflow = "";
            }
        };

        menu.addEventListener("toggle", handleToggle);

        return () => {
            menu.removeEventListener("toggle", handleToggle);
            document.body.style.overflow = "";
        };
    }, [id]);

    const closeContextMenu = useCallback(() => {
        document.getElementById(`context-${id}`)?.hidePopover();
    }, [id]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`context-${id}`);

            if (!menu) return;

            if (menu.contains(e.target as Node)) {
                return;
            }

            closeContextMenu();
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [id, closeContextMenu]);

    if (!isTranslationReady) return;

    return (
        <ul
            className={`${readOnly ? "hidden" : ""} dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50`}
            popover="manual"
            id={`context-${id}`}
        >
            {!isLocked && (
                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            closeContextMenu();

                            // ONLY IF FIELD
                            editFieldModal.open({
                                type: type as FieldNameType,
                                id,
                                flex: data?.field?.flex,
                                label,
                                placeholder: data?.field?.placeholder,
                                options: data?.field?.options,
                                guide: data?.field?.guide,
                                onChange: async (options) => {
                                    const result = await onChange(rowId, id, options);
                                    return result !== false;
                                }
                            });
                        }}
                    >
                        Edit
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
            )}

            {type === "field" && (
                <li>
                    <button 
                        className="flex items-center justify-between gap-4"
                        onClick={async () => {
                            closeContextMenu();

                            setIsLocking(true);

                            await onChange(
                                rowId,
                                id,
                                {
                                    fieldId: id,
                                    isLocked: !isLocked
                                }
                            )

                            setIsLocking(false);
                        }}
                    >
                        {isLocked ? "Unlock" : "Lock"}
                        <span className={`${isLocking ? "loading" : ""} font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center`}>
                            {isLocked ? "" : ""}
                        </span>
                    </button>
                </li>
            )}

            <hr />

            {!isLocked && (
                <li>
                    <button 
                        className="flex items-center justify-between gap-4 text-accent"
                        onClick={() => {
                            closeContextMenu();

                            deleteModal.open(
                                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                // @ts-ignore
                                {
                                    id, 
                                    displayName: label 
                                },
                                { 
                                    templateId,
                                    type: type,
                                    skipCountdown: true,
                                    onDelete
                                }
                            )
                        }}
                    >
                        {t("words.Delete")}
                        <span className="font-nerdfont text-xl flex h-6 w-4 leading-none items-center justify-center">
                            󰗨
                        </span>
                    </button>
                </li>
            )}

            {type !== "row" && !isLocked && (
                <hr />
            )}

            {type !== "row" && (
                <>
                    <li>
                        <button 
                            className="flex items-center justify-between gap-4"
                            onClick={async () => {
                                closeContextMenu();

                                try {
                                    await navigator.clipboard.writeText(
                                        `${url}#${id}`
                                    );

                                    toast.show(
                                        t("components.toasts.copiedLink"), 
                                        { type: "success" }
                                    );
                                } catch {
                                    toast.show(
                                        t("components.toasts.failedCopiedLink"), 
                                        { type: "error" }
                                    );
                                }
                            }}
                        >
                            Copy Link
                            <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                                
                            </span>
                        </button>
                    </li>

                    <li>
                        <button 
                            className="flex items-center justify-between gap-4"
                            onClick={async () => {
                                closeContextMenu();

                                try {
                                    await navigator.clipboard.writeText(id);

                                    toast.show(
                                        t("components.toasts.copiedId"), 
                                        { type: "success" }
                                    );
                                } catch {
                                    toast.show(
                                        t("components.toasts.failedCopiedId"), 
                                        { type: "error" }
                                    );
                                }
                            }}
                        >
                            Copy ID
                            <span className="font-nerdfont text-3xl flex h-6 w-4 leading-none items-center justify-center">
                                󰻾
                            </span>
                        </button>
                    </li>
                </>
            )}
        </ul>
    )
}
