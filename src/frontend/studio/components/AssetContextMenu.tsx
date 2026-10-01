import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { TemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import { TemplateRowItemType } from "../../../_common/types/template/row.type.js";
import { FieldNameType } from "../../../_common/types/field.type.js";
import { TemplateCategoryItemType } from "../../../_common/types/template/category.type.js";
import { TemplateBlockItemType } from "../../../_common/types/template/block.type.js";

interface Props {
    id: string;
    type: "field" | "row" | "block" | "category";
    label?: string;
    url?: string;
    assetId: string;
    rowId: string;
    readOnly?: boolean;
    isLocked?: boolean;
    isEditing?: boolean;
    data: {
        field?: TemplateFieldItemType;
        row?: TemplateRowItemType;
        block?: TemplateBlockItemType;
        category?: TemplateCategoryItemType;
    };
    onChange: (
        targetRowId: string,
        originalFieldId: string,
        incoming: Partial<TemplateFieldItemType>
    ) => boolean | Promise<boolean>;
    onDelete: (
        id: string,
        type: "field" | "row" | "block" | "category"
    ) => void;
    resolveDynamicValues: (text: string) => string;
    isBlockAsset: boolean;
    onPublish?: () => void | Promise<void>;
}

export default function AssetContextMenu({
    id,
    type,
    label,
    assetId,
    rowId,
    readOnly = false,
    isLocked = false,
    data,
    isEditing = false,
    onChange,
    onDelete,
    resolveDynamicValues,
    isBlockAsset = false,
    onPublish
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    const {
        deleteModal,
        editFieldModal,
        editBlockModal,
        editCategoryModal
    } = useModals();

    useEffect(() => {
        const menu = document.getElementById(`context-${id}`);

        if (!menu) return;

        const handleToggle = (event: Event) => {
            const toggleEvent = event as ToggleEvent;

            document.body.style.overflow =
                toggleEvent.newState === "open" ? "hidden" : "";
        };

        menu.addEventListener("toggle", handleToggle);

        return () => {
            menu.removeEventListener("toggle", handleToggle);
            document.body.style.overflow = "";
        };
    }, [id]);

    const closeContextMenu = () => {
        document.getElementById(`context-${id}`)?.hidePopover();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const menu = document.getElementById(`context-${id}`);

            if (menu && !menu.contains(event.target as Node)) {
                closeContextMenu();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [id]);

    if (!isTranslationReady) return null;

    return (
        <ul
            className={`${
                readOnly ? "hidden" : ""
            } dropdown menu w-fit min-w-54 rounded-box bg-base-100 shadow-sm cursor-default overflow-visible fixed z-50`}
            popover="manual"
            id={`context-${id}`}
        >
            <li>
                <button
                    className="flex items-center justify-between gap-4"
                    onClick={() => {
                        closeContextMenu();
                        void onPublish?.();
                    }}
                    disabled={!onPublish}
                >
                    Publish
                    <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                        󰐊
                    </span>
                </button>
            </li>

            <hr />

            {!isLocked && isEditing && type !== "row" && (
                <li>
                    <button
                        className="flex items-center justify-between gap-4"
                        onClick={() => {
                            closeContextMenu();

                            if (type === "field") {
                                editFieldModal.open({
                                    type: data.field?.type as FieldNameType,
                                    id,
                                    flex: data.field?.flex,
                                    label,
                                    placeholder: data.field?.placeholder,
                                    options: data.field?.options,
                                    guide: data.field?.guide,
                                    onChange: async (options) => {
                                        const result = await onChange(
                                            rowId,
                                            id,
                                            options
                                        );
                                        return result !== false;
                                    },
                                    resolveDynamicValues
                                });
                            }

                            if (type === "block") {
                                editBlockModal.open({
                                    isTemplate: true,
                                    block: {
                                        blockId: id,
                                        label: data.block?.label ?? "",
                                        description:
                                            data.block?.description?.trim() ?? "",
                                        icon: data.block?.icon || null
                                    },
                                    onUpdateBlock: async (options) => {
                                        // @ts-ignore
                                        const result = await onChange(id, options);
                                        return result !== false;
                                    }
                                });
                            }

                            if (type === "category") {
                                editCategoryModal.open({
                                    id,
                                    label: data.category?.label,
                                    types: data.category?.types,
                                    onChange: async (options) => {
                                        // @ts-ignore
                                        const result = await onChange(id, options);
                                        return result !== false;
                                    },
                                    resolveDynamicValues
                                });
                            }
                        }}
                    >
                        Edit
                        <span className="font-nerdfont text-lg flex h-6 w-4 leading-none items-center justify-center">
                            
                        </span>
                    </button>
                </li>
            )}

            <hr />

            {!isLocked && isEditing && (
                <li>
                    <button
                        className="flex items-center justify-between gap-4 text-accent"
                        onClick={() => {
                            closeContextMenu();

                            // @ts-ignore
                            deleteModal.open(
                                {
                                    id,
                                    displayName: label
                                },
                                {
                                    assetId,
                                    type,
                                    skipCountdown:
                                        type === "field" || type === "row",
                                    onDelete,
                                    isBlockAsset
                                }
                            );
                        }}
                    >
                        {t("words.Delete")}
                        <span className="font-nerdfont text-xl flex h-6 w-4 leading-none items-center justify-center">
                            󰗨
                        </span>
                    </button>
                </li>
            )}
        </ul>
    );
}
