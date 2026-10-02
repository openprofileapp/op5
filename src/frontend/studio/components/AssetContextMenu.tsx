/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { TemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { toast } from "../../_common/scripts/toast.js";
import { BlockItemType } from "../../../_common/types/blocks/block.type.js";

interface Props {
    data: BlockItemType
    onChange: (
        blockId: string,
        incoming: Partial<TemplateFieldItemType>
    ) => boolean | Promise<boolean>;
    onDelete: (
        blockId: string,
    ) => void;
}

export default function AssetContextMenu({
    data,
    onChange,
    onDelete
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const { 
        deleteModal,
        editBlockModal,
    } = useModals();

    useEffect(() => {
        const menu = document.getElementById(`block-${data.blockId}`);

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
    }, [data]);

    const closeContextMenu = useCallback(() => {
        document.getElementById(`block-${data.blockId}`)?.hidePopover();
    }, [data]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const menu = document.getElementById(`block-${data.blockId}`);

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
    }, [data, closeContextMenu]);

    if (!isTranslationReady) return;

    return (
        <ul
            className="dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50"
            popover="manual"
            id={`block-${data.blockId}`}
        >
            <li>
                <button 
                    className="flex items-center justify-between gap-4"
                    onClick={() => {
                        closeContextMenu();

                        editBlockModal.open({
                            isTemplate: true,
                            // @ts-ignore
                            block: data,
                            onUpdateBlock: async (options) => {
                                // @ts-ignore
                                const result = await onChange(options.blockId, options);
  
                                return result !== false;
                            },
                        });
                    }}
                >
                    Edit
                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                        
                    </span>
                </button>
            </li>

            <hr />

            <li>
                <button 
                    className="flex items-center justify-between gap-4 text-accent"
                    onClick={() => {
                        closeContextMenu();

                        deleteModal.open(
                            // @ts-ignore
                            {
                                id: data.blockId, 
                                displayName: data.displayName
                            },
                            { 
                                assetId: data.blockId,
                                type: "blockAsset",
                                onDelete,
                                isBlockAsset: true
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

            <hr />

            <li>
                <button 
                    className="flex items-center justify-between gap-4"
                    onClick={async () => {
                        closeContextMenu();

                        try {
                            await navigator.clipboard.writeText(data.blockId);

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
        </ul>
    )
}
