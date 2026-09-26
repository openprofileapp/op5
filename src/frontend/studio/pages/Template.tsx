import { useEffect, useState, useCallback, useRef, ReactNode, CSSProperties } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import {
    DndContext,
    pointerWithin,
    rectIntersection,
    getFirstCollision,
    useDroppable,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    CollisionDetection,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    Modifier,
} from "@dnd-kit/core";

import {
    SortableContext,
    rectSortingStrategy,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import { GetTemplateCategoryItemType } from "../../../_common/types/template/category.type.js";
import { apiBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { toast } from "../../_common/scripts/toast.js";
import { GetTemplateFieldItemType, TemplateFieldItemType } from "../../../_common/types/template/field.type.js";
import NewCategoryModal, { NewCategoryType } from "../components/modals/NewCategoryModal.js";
import { snowflake } from "../scripts/main.js";
import { NewBlockType } from "../components/modals/NewBlockModal.js";
import { GetTemplateBlockItemType } from "../../../_common/types/template/block.type.js";
import { GetTemplateRowItemType, TemplateRowItemType } from "../../../_common/types/template/row.type.js";
import { NewFieldType } from "../components/modals/NewFieldModal.js";
import { FieldNameType } from "../../../_common/types/field.type.js";
import Metadata from "../../_common/components/Metadata.js";
import TemplateField from "../components/TemplateField.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { GetTemplateValueType, TemplateValueType } from "../../../_common/types/template/value.type.js";
import { ValueOptionsType } from "../../../_common/types/value.type.js";
import TemplateContextMenu from "../components/TemplateContextMenu.js";

export interface FieldDropZoneProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export interface DragHandleProps {
    ref: (element: HTMLElement | null) => void;
    [key: string]: unknown;
}

export interface SortableProps {
    ref: (element: HTMLElement | null) => void;
    style: CSSProperties;
    className?: string;
}

export interface SortableItemChildrenArgs {
    sortableProps: SortableProps;
    dragHandleProps: DragHandleProps;
    isDragging: boolean;
}

export interface SortableItemProps {
    id: string;
    children: (args: SortableItemChildrenArgs) => ReactNode;
    disabled?: boolean;
}

export function FieldDropZone({ id, children, className = "" }: FieldDropZoneProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

export function SortableItem({ id, children, disabled = false }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id, disabled });

    const style: CSSProperties = {
        transform: CSS.Translate.toString(transform),
        transition: transition || "transform 200ms ease",
        willChange: "transform",
    };

    return (
        <>
            {children({
                sortableProps: {
                    ref: setNodeRef,
                    style,
                },
                dragHandleProps: {
                    ref: setActivatorNodeRef,
                    ...attributes,
                    ...listeners,
                },
                isDragging,
            })}
        </>
    );
}

export default function Template() {
    const { templateId, categoryId, blockId } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();
    const navigate = useNavigate();

    const { 
        saveFailedModal, 
        newFieldModal, 
        newBlockModal
    } = useModals()
    
    const [searchQuery, setSearchQuery] = useState("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isPreview, setIsPreview] = useState(false);
    const [lastToast, setLastToast] = useState<number>(0);

    const debounceTimers = useRef<{ [fieldId: string]: NodeJS.Timeout }>({});
    const valuesMapRef = useRef<{ [fieldId: string]: string }>({});
    const snapshotTemplateDataRef = useRef<GetTemplateCategoryItemType[] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [template, setTemplate] = useState<GetTemplateItemType>();
    const [templateData, setTemplateData] = useState<GetTemplateCategoryItemType[]>([]);

    const currentCategoryId = 
        categoryId 
        || (templateData[0]?.categoryId 
            ? templateData[0].categoryId
            : ""
        );
        
    const currentBlockId = blockId ? blockId : "";

    const currentCategoryData = templateData.find(
        (c) => c.categoryId === currentCategoryId
    );

    const currentCategoryBlocks: GetTemplateBlockItemType[] =
        currentCategoryData?.blocks?.items ?? [];

    const currentBlockData = currentCategoryBlocks.find(
        (b) => b.blockId === currentBlockId
    );

    useEffect(() => {
        const fetchTemplate = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates?id=${templateId}`,
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok || !data?.items?.[0]) {
                    navigate("/templates", { replace: true });
                    return;
                }

                setTemplate(data.items[0]);
            } catch (err) {
                console.error(err);
            }
        };

        if (templateId) {
            fetchTemplate();
        }
    }, [templateId, navigate]);

    useEffect(() => {
        const fetchTemplateData = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates/${templateId}/data`,
                    { credentials: "include" }
                );

                const json = await response.json();

                if (!response.ok) {
                    toast.show(
                        "Failed to load template",
                        {
                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                            type: "error",
                        }
                    );

                    return;
                }

                setTemplateData(json || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (templateId) {
            fetchTemplateData();
        }
    }, [templateId, navigate]);

    useEffect(() => {
        if (!Array.isArray(templateData)) return;

        valuesMapRef.current = {};

        templateData.forEach((category) => {
            category.blocks?.items?.forEach((block) => {
                block.rows?.items?.forEach((row) => {
                    row.fields?.items?.forEach((field: GetTemplateFieldItemType) => {
                        if (
                            field.fieldId &&
                            field.value?.content !== undefined
                        ) {
                            valuesMapRef.current[field.fieldId] = String(field.value.content);
                        }
                    });
                });
            });
        });
    }, [templateData]);

    const pluralize = (value: string): string => {
        const trimmed = value.trim();

        if (!trimmed) return value;

        if (/(s|x|z|ch|sh)$/i.test(trimmed)) {
            if (/ss$/i.test(trimmed)) {
                return `${trimmed}es`;
            }

            return trimmed.endsWith("s") ? trimmed : `${trimmed}es`;
        }

        if (/[^aeiou]y$/i.test(trimmed)) {
            return `${trimmed.slice(0, -1)}ies`;
        }

        if (/(?:f|fe)$/i.test(trimmed)) {
            if (/(?:roof|chief|belief|chef)$/i.test(trimmed)) {
                return `${trimmed}s`;
            }

            return trimmed.replace(/fe?$/i, "ves");
        }

        return `${trimmed}s`;
    };

    const resolveDynamicValues = useCallback((text: string | undefined): string => {
        if (!text) return "";

        return String(text).replace(
            /\{([^}]+)\}/g,
            (match, expression) => {
                const parts = expression
                    .split(".")
                    .map((part: string) => part.trim())
                    .filter(Boolean);

                const fieldId = parts.shift();

                if (!fieldId) return match;

                const value = valuesMapRef.current[fieldId];

                if (value === undefined) {
                    return match;
                }

                let result = String(value);

                for (const operation of parts) {
                    switch (operation.toLowerCase()) {
                        case "possessive":
                            if (result.endsWith("s") || result.endsWith("S")) {
                                result += "'";
                            } else {
                                result += "'s";
                            }
                            break;

                        case "pluralize":
                            result = pluralize(result);
                            break;

                        case "lowercase":
                            result = result.toLowerCase();
                            break;

                        case "uppercase":
                            result = result.toUpperCase();
                            break;

                        case "titlecase":
                            result = result
                                .toLowerCase()
                                .replace(/\b\w/g, char => char.toUpperCase());
                            break;

                        case "capitalize":
                            result =
                                result.charAt(0).toUpperCase() +
                                result.slice(1);
                            break;

                        default:
                            break;
                    }
                }

                return result;
            }
        );
    }, []);

    useEffect(() => {
        if (isLoading || !templateData.length || !templateId) return;

        const targetCategoryId = categoryId ?? "";
        const targetBlockId = blockId ?? "";

        let category = templateData.find(
            (c) => c.categoryId === targetCategoryId
        );

        if (!category) {
            category = templateData[0];
            if (category?.categoryId) {
                navigate(
                    `/template/${templateId}/${category.categoryId}`, 
                    { replace: true }
                );
            }
            return;
        }

        if (blockId) {
            const blocks = category.blocks?.items ?? [];

            const foundBlock = blocks.find(
                (b) => b.blockId === targetBlockId
            );

            if (!foundBlock && blocks.length > 0) {
                navigate(
                    `/template/${templateId}/${category.categoryId}`, 
                    { replace: true }
                );
            }
        }
    }, [templateData, isLoading, templateId, categoryId, blockId, navigate]);

    const setCurrentCategory = useCallback(
        (newCategoryId: string) => {
            navigate(`/template/${templateId}/${newCategoryId}`);
        },
        [navigate, templateId]
    );

    const setCurrentBlock = useCallback(
        (newBlockId?: string | null | undefined, targetCategoryId?: string) => {
            const categoryId = targetCategoryId || currentCategoryId;

            if (!categoryId) return;

            if (newBlockId) {
                navigate(`/template/${templateId}/${categoryId}/${newBlockId}`);
            } else {
                navigate(`/template/${templateId}/${categoryId}`);
            }
        },
        [currentCategoryId, navigate, templateId]
    );

    const scrollToField = useCallback((fieldId: string) => {
        if (!fieldId) return;

        setTimeout(() => {
            const element = document.getElementById(`field-${fieldId}`);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        }, 150);
    }, []);

    useEffect(() => {
        if (isLoading) return;

        const handleHashChange = () => {
            const hash = window.location.hash.replace("#", "");
            if (hash) {
                scrollToField(hash);
            }
        };

        window.addEventListener("hashchange", handleHashChange);

        if (window.location.hash) {
            scrollToField(window.location.hash.replace("#", ""));
        }

        return () => window.removeEventListener("hashchange", handleHashChange);
    }, [isLoading, scrollToField]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const customCollisionDetection: CollisionDetection = useCallback((args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }

        const intersections = rectIntersection(args);
        const firstCollision = getFirstCollision(intersections, "id");

        if (!firstCollision) {
            return [];
        }

        const collision = intersections.find((c) => c.id === firstCollision);
        return collision ? [collision] : [];
    }, []);

    const conditionalVerticalAxisModifier: Modifier = useCallback((args) => {
        const { active } = args;
        const activeDragIdStr = active?.id !== undefined ? String(active.id) : "";

        if (activeDragIdStr.startsWith("category:") || activeDragIdStr.startsWith("row:")) {
            return restrictToVerticalAxis(args);
        }

        return args.transform;
    }, []);

    const handleAddCategory = async (
        incoming: NewCategoryType
    ): Promise<boolean> => {
        setIsSaving(true);

        const payload: GetTemplateCategoryItemType = {
            categoryId: snowflake.gen(),
            types: incoming?.types,
            label: incoming?.label || "Untitled",
            position: templateData?.length ?? 0,
            createdBy: window.session.userId,
            updatedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            blocks: {
                items: [],
                count: 0,
            },
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/templates/${templateId}/categories/insert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        categoryId: payload.categoryId,
                        label: payload.label,
                        types: payload.types,
                        position: payload.position,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                setIsSaving(false);

                toast.show(
                    "Failed to create category",
                    {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    }
                );

                return false;
            }

            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);

            console.error("Failed to create category:", error);

            toast.show(
                "Failed to create category",
                {
                    subtext: String(error),
                    type: "error",
                }
            );

            return false;
        }

        setTemplateData((prev) => [...prev, payload]);

        navigate(`/template/${templateId}/${payload.categoryId}`);

        return true;
    };

    const handleAddBlock = async (
        incoming: NewBlockType
    ): Promise<boolean> => {
        if (!currentCategoryId) {
            toast.show(
                "No category selected", 
                { type: "error" }
            );

            return false;
        }

        setIsSaving(true);

        let payload: GetTemplateBlockItemType;

        if (incoming.sourceBlockId) {
            payload = {
                blockId: snowflake.gen(),
                sourceBlockId: incoming.sourceBlockId || "",
                isSourceBlockConnected: true,
                icon: "",
                label: "",
                description: "",
                position: currentCategoryBlocks?.length ?? 0,
                createdBy: window.session.userId,
                updatedDate: new Date().toISOString(),
                createdDate: new Date().toISOString(),
                rows: {
                    items: [],
                    count: 0,
                },
            };
        } else {
            payload = {
                blockId: snowflake.gen(),
                sourceBlockId: "",
                isSourceBlockConnected: false,
                icon: incoming?.icon || "",
                label: incoming?.label || "Untitled",
                description: incoming?.description,
                position: currentCategoryBlocks?.length ?? 0,
                createdBy: window.session.userId,
                updatedDate: new Date().toISOString(),
                createdDate: new Date().toISOString(),
                rows: {
                    items: [],
                    count: 0,
                },
            };
        }

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/templates/${templateId}/blocks/insert`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        blockId: payload.blockId,
                        categoryId: currentCategoryId,
                        sourceBlockId: payload.sourceBlockId,
                        icon: payload.sourceBlockId ? "" : payload.icon,
                        label: payload.sourceBlockId ? "" : payload.label,
                        description: payload.sourceBlockId ? "" : payload.description,
                        position: payload.position,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                setIsSaving(false);

                toast.show(
                    "Failed to create block",
                    {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    }
                );

                return false;
            }

            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);

            console.error("Failed to create block:", error);

            toast.show(
                "Failed to create block",
                {
                    subtext: String(error),
                    type: "error",
                }
            );

            return false;
        }

        setTemplateData((prev) =>
            prev.map((category) => {
                if (category.categoryId !== currentCategoryId) return category;

                const currentBlocks = category.blocks?.items ?? [];
                const updatedBlocks = [
                    ...currentBlocks,
                    {
                        ...payload,
                        position: currentBlocks.length,
                    },
                ];

                return {
                    ...category,
                    blocks: {
                        items: updatedBlocks,
                        count: updatedBlocks.length,
                    },
                };
            })
        );

        navigate(`/template/${templateId}/${currentCategoryId}/${payload.blockId}`);

        return true;
    };

    const handleAddRow = async (): Promise<boolean> => {
        if (!currentCategoryId) {
            toast.show("No category selected", { type: "error" });
            return false;
        }

        if (!currentBlockId) {
            toast.show("No block selected", { type: "error" });
            return false;
        }

        setIsSaving(true);

        const activeBlockRows = currentBlockData?.rows?.items ?? [];

        const payload: GetTemplateRowItemType = {
            rowId: snowflake.gen(),
            position: activeBlockRows.length,
            createdBy: window.session.userId,
            createdDate: new Date().toISOString(),
            fields: {
                items: [],
                count: 0,
            },
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/templates/${templateId}/rows/insert`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        rowId: payload.rowId,
                        blockId: currentBlockId,
                        position: payload.position,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                setIsSaving(false);

                toast.show("Failed to create row", {
                    subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                    type: "error",
                });
                return false;
            }

            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);

            console.error("Failed to create row:", error);

            toast.show("Failed to create row", {
                subtext: String(error),
                type: "error",
            });

            return false;
        }

        setTemplateData((prevCategories: GetTemplateCategoryItemType[]) =>
            prevCategories.map((category) => {
                if (category.categoryId !== currentCategoryId) {
                    return category;
                }

                const updatedBlocks = (category.blocks?.items ?? []).map((block) => {
                    if (block.blockId !== currentBlockId) {
                        return block;
                    }

                    const existingRows = block.rows?.items ?? [];
                    const updatedRows = [...existingRows, payload];

                    return {
                        ...block,
                        rows: {
                            items: updatedRows,
                            count: updatedRows.length,
                        },
                    };
                });

                return {
                    ...category,
                    blocks: {
                        items: updatedBlocks,
                        count: updatedBlocks.length,
                    },
                };
            })
        );

        return true;
    };

    const handleAddField = async (
        targetRowId: string,
        incoming: NewFieldType
    ): Promise<boolean> => {
        if (!currentCategoryId) {
            toast.show("No category selected", { type: "error" });
            return false;
        }

        if (!currentBlockId) {
            toast.show("No block selected", { type: "error" });
            return false;
        }

        if (!incoming?.id.trim()) {
            toast.show("Field ID is required", { type: "error" });
            return false;
        }

        const activeBlockRows = currentBlockData?.rows?.items ?? [];

        const targetRow = activeBlockRows.find(
            (r) => r.rowId === targetRowId
        );

        const targetFields = targetRow?.fields?.items ?? [];

        if (targetFields.length >= 5) {
            toast.show("A row cannot contain more than 5 fields", { type: "error" });
            return false;
        }

        const isDuplicateId = Boolean(
            incoming?.id &&
            templateData?.some((category) =>
                category.blocks?.items?.some((block) =>
                    block.rows?.items?.some((row) =>
                        row.fields?.items?.some((field) => field.fieldId === incoming.id)
                    )
                )
            )
        );

        if (isDuplicateId) {
            toast.show(`A field with ID "${incoming?.id}" already exists`, { type: "error" });
            return false;
        }

        setIsSaving(true);

        const payload: GetTemplateFieldItemType = {
            fieldId: incoming.id,
            type: incoming.type as FieldNameType,
            flex: incoming.flex ?? 1,
            label: incoming.label || "New Field",
            placeholder: incoming.placeholder || "",
            guide: incoming.guide || "",
            options: incoming.options,
            isLocked: false,
            position: targetFields.length,
            createdBy: window.session.userId,
            updatedDate: new Date().toISOString(),
            createdDate: new Date().toISOString()
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/templates/${templateId}/fields/insert`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        fieldId: payload.fieldId,
                        rowId: targetRowId,
                        type: payload.type,
                        flex: payload.flex,
                        label: payload.label,
                        placeholder: payload.placeholder,
                        guide: payload.guide,
                        options: payload.options,
                        position: payload.position,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                setIsSaving(false);

                toast.show("Failed to create field", {
                    subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                    type: "error",
                });

                return false;
            }

            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);

            console.error("Failed to create field:", error);

            toast.show("Failed to create field", {
                subtext: String(error),
                type: "error",
            });

            return false;
        }

        setTemplateData((prevCategories: GetTemplateCategoryItemType[]) =>
            prevCategories.map((category) => {
                if (category.categoryId !== currentCategoryId) {
                    return category;
                }

                const updatedBlocks = (category.blocks?.items ?? []).map((block) => {
                    if (block.blockId !== currentBlockId) {
                        return block;
                    }

                    const updatedRows = (block.rows?.items ?? []).map((row) => {
                        if (row.rowId !== targetRowId) {
                            return row;
                        }

                        const existingFields = row.fields?.items ?? [];
                        const updatedFields = [...existingFields, payload];

                        return {
                            ...row,
                            fields: {
                                items: updatedFields,
                                count: updatedFields.length,
                            },
                        };
                    });

                    return {
                        ...block,
                        rows: {
                            items: updatedRows,
                            count: updatedRows.length,
                        },
                    };
                });

                return {
                    ...category,
                    blocks: {
                        items: updatedBlocks,
                        count: updatedBlocks.length,
                    },
                };
            })
        );

        return true;
    };

    const handleUpdateField = async (
        targetRowId: string,
        originalFieldId: string,
        incoming: Partial<TemplateFieldItemType>
    ): Promise<boolean> => {
        if (originalFieldId !== incoming.fieldId) {
            const isDuplicateId = Boolean(
                incoming?.fieldId &&
                templateData?.some((category) =>
                    category.blocks?.items?.some((block) =>
                        block.rows?.items?.some((row) =>
                            row.fields?.items?.some((field) => field.fieldId === incoming.fieldId)
                        )
                    )
                )
            );

            if (isDuplicateId) {
                toast.show(`A field with ID "${incoming?.fieldId}" already exists`, { type: "error" });
                return false;
            }
        }

        setIsSaving(true);

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const payload: GetTemplateFieldItemType = {
            fieldId: incoming.fieldId as string,
            flex: incoming.flex ?? 1,
            label: incoming.label || "New Field",
            placeholder: incoming.placeholder || "",
            options: incoming.options,
            guide: incoming.guide,
            isLocked: incoming.isLocked as boolean
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/templates/${templateId}/fields/update`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        originalFieldId,
                        data: payload
                    })
                }
            );

            const json = await response.json();

            if (!response.ok) {
                setIsSaving(false);

                toast.show("Failed to update field", {
                    subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                    type: "error",
                });

                return false;
            }

            setIsSaving(false);
        } catch (error) {
            setIsSaving(false);

            console.error("Failed to update field:", error);

            toast.show("Failed to update field", {
                subtext: String(error),
                type: "error",
            });

            return false;
        }

        setTemplateData(
            (prevCategories: GetTemplateCategoryItemType[]) =>
                prevCategories.map((category) => {
                    if (category.categoryId !== currentCategoryId) {
                        return category;
                    }

                    const updatedBlocks = (
                        category.blocks?.items ?? []
                    ).map((block) => {
                        if (block.blockId !== currentBlockId) {
                            return block;
                        }

                        const updatedRows = (
                            block.rows?.items ?? []
                        ).map((row) => {
                            if (row.rowId !== targetRowId) {
                                return row;
                            }

                            const existingFields =
                                row.fields?.items ?? [];

                            const updatedFields = existingFields.map(
                                (field) => {
                                    if (
                                        field.fieldId !== originalFieldId
                                    ) {
                                        return field;
                                    }

                                    return {
                                        ...field,
                                        ...incoming,
                                    };
                                }
                            );

                            return {
                                ...row,
                                fields: {
                                    items: updatedFields,
                                    count: updatedFields.length,
                                },
                            };
                        });

                        return {
                            ...block,
                            rows: {
                                items: updatedRows,
                                count: updatedRows.length,
                            },
                        };
                    });

                    return {
                        ...category,
                        blocks: {
                            items: updatedBlocks,
                            count: updatedBlocks.length,
                        },
                    };
                })
        );

        return true;
    };

    const handleUpdateValue = (
        fieldId: string,
        type: FieldNameType,
        value: string,
        options: TemplateValueType,
        immediate = false
    ): Promise<boolean> => {
        valuesMapRef.current[fieldId] = value;

        setTemplateData((prev: GetTemplateCategoryItemType[]) =>
            prev.map((category) => ({
                ...category,
                blocks: {
                    ...category.blocks,
                    items: category.blocks.items.map((block) => ({
                        ...block,
                        rows: {
                            ...block.rows,
                            items: block.rows.items.map((row) => ({
                                ...row,
                                fields: {
                                    ...row.fields,
                                    items: row.fields.items.map((field) => {
                                        if (field.fieldId !== fieldId) return field;

                                        return {
                                            ...field,
                                            value: {
                                                fieldId,
                                                authorId: window.session?.userId,
                                                content: value,
                                                options: options as unknown as ValueOptionsType,
                                                date: new Date().toISOString(),
                                            },
                                        };
                                    }),
                                },
                            })),
                        },
                    })),
                },
            }))
        );

        if (debounceTimers.current[fieldId]) {
            clearTimeout(debounceTimers.current[fieldId]);
        }

        const executeSave = async (): Promise<boolean> => {
            setIsSaving(true);
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/templates/${templateId}/fields/update/value`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ fieldId, type, value, options }),
                    }
                );

                if (!response.ok) {
                    saveFailedModal.open(
                        { fieldId, type, value, options },
                        {
                            onRetry: async () => {
                                const retryResponse = await fetch(
                                    `${apiBaseUrl}/v3/templates/${templateId}/fields/update/value`,
                                    {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        credentials: "include",
                                        body: JSON.stringify({ fieldId, type, value, options }),
                                    }
                                );

                                if (!retryResponse.ok) {
                                    throw new Error("Retry save failed");
                                }

                                saveFailedModal.close();
                            }
                        }
                    );
                    return false;
                }

                return true;
            } catch (err) {
                console.error(err);
                return false;
            } finally {
                setIsSaving(false);
            }
        };

        if (immediate) {
            return executeSave();
        }

        return new Promise<boolean>((resolve) => {
            debounceTimers.current[fieldId] = setTimeout(async () => {
                const success = await executeSave();
                resolve(success);
            }, 300);
        });
    };

    const onDelete = (
        id: string,
        type: "field" | "row" | "block" | "category"
    ) => {
        setTemplateData((prev) => {
            if (!Array.isArray(prev)) return prev;

            switch (type) {
                case "category":
                    return prev.filter(
                        (category) => category.categoryId !== id
                    );

                case "block":
                    return prev.map((category) => ({
                        ...category,
                        blocks: category.blocks
                            ? {
                                ...category.blocks,
                                items: category.blocks.items?.filter(
                                    (block) => block.blockId !== id
                                ),
                            }
                            : category.blocks,
                    }));

                case "row":
                    return prev.map((category) => ({
                        ...category,
                        blocks: category.blocks
                            ? {
                                ...category.blocks,
                                items: category.blocks.items?.map((block) => ({
                                    ...block,
                                    rows: block.rows
                                        ? {
                                                ...block.rows,
                                                items: block.rows.items?.filter(
                                                    (row) => row.rowId !== id
                                                ),
                                            }
                                        : block.rows,
                                })),
                            }
                            : category.blocks,
                    }));

                case "field":
                    return prev.map((category) => ({
                        ...category,
                        blocks: category.blocks
                            ? {
                                ...category.blocks,
                                items: category.blocks.items?.map((block) => ({
                                    ...block,
                                    rows: block.rows
                                        ? {
                                                ...block.rows,
                                                items: block.rows.items?.map(
                                                    (row) => ({
                                                        ...row,
                                                        fields: row.fields
                                                            ? {
                                                                ...row.fields,
                                                                items: row.fields.items?.filter(
                                                                    (field) =>
                                                                        field.fieldId !==
                                                                        id
                                                                ),
                                                            }
                                                            : row.fields,
                                                    })
                                                ),
                                            }
                                        : block.rows,
                                })),
                            }
                            : category.blocks,
                    }));

                default:
                    return prev;
            }
        });
    };

    const handleDragStart = (): void => {
        if (isPreview) return;
        
        snapshotTemplateDataRef.current = templateData 
            ? JSON.parse(JSON.stringify(templateData)) 
            : null;

        document.body.style.cursor = "grabbing";
    };

    const handleDragOver = (event: DragOverEvent): void => {
        if (isPreview) return;

        const { active, over } = event;

        if (!over) return;

        const activeDragIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (!activeDragIdStr.startsWith("field:")) return;

        const activeFieldId = activeDragIdStr.replace("field:", "");
        const overType = overIdStr.includes(":") ? overIdStr.split(":")[0] : "field";
        const overRawId = overIdStr.includes(":") ? overIdStr.split(":")[1] : overIdStr;

        const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;

        setTemplateData((prevtemplate) => {
            const category = prevtemplate?.find((c) => c.categoryId === targetCategoryId);
            if (!category) return prevtemplate;

            const block = category.blocks.items.find((b) => b.blockId === currentBlockId);
            if (!block) return prevtemplate;

            const sourceRow = block.rows.items.find((r) =>
                (r.fields.items || []).some((f) => f.fieldId === activeFieldId)
            );
            if (!sourceRow) return prevtemplate;

            let targetRow: typeof sourceRow | undefined;

            if (overType === "field") {
                targetRow = block.rows.items.find((r) =>
                    (r.fields.items || []).some((f) => f.fieldId === overRawId)
                );
            } else if (overType === "row-fields" || overType === "row") {
                targetRow = block.rows.items.find((r) => r.rowId === overRawId);
            }

            if (!targetRow) return prevtemplate;

            const dragtargetRowId = targetRow.rowId;

            if (sourceRow.rowId === dragtargetRowId) return prevtemplate;

            if ((targetRow.fields.items || []).length >= 5) {
                if (Date.now() - lastToast > 5000) {
                    toast.show("A row cannot contain more than 5 fields", { type: "error" });
                    setLastToast(Date.now());
                }

                return prevtemplate;
            }

            const movedField = sourceRow.fields.items.find((f) => f.fieldId === activeFieldId);
            if (!movedField) return prevtemplate;

            return prevtemplate?.map((c) => {
                if (c.categoryId !== targetCategoryId) return c;

                return {
                    ...c,
                    blocks: {
                        ...c.blocks,
                        items: c.blocks.items.map((b) => {
                            if (b.blockId !== currentBlockId) return b;

                            return {
                                ...b,
                                rows: {
                                    ...b.rows,
                                    items: b.rows.items.map((row) => {
                                        if (row.rowId === sourceRow.rowId) {
                                            return {
                                                ...row,
                                                fields: {
                                                    ...row.fields,
                                                    items: (row.fields.items || []).filter(
                                                        (f) => f.fieldId !== activeFieldId
                                                    ),
                                                },
                                            };
                                        }

                                        if (row.rowId === dragtargetRowId) {
                                            const overIndex = row.fields.items.findIndex(
                                                (f) => f.fieldId === overRawId
                                            );
                                            const newIndex =
                                                overIndex >= 0 ? overIndex : row.fields.items.length;

                                            const nextFields = [...row.fields.items];
                                            nextFields.splice(newIndex, 0, movedField);

                                            return {
                                                ...row,
                                                fields: {
                                                    ...row.fields,
                                                    items: nextFields,
                                                },
                                            };
                                        }

                                        return row;
                                    }),
                                },
                            };
                        }),
                    },
                };
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
        if (isPreview) return;

        const { active, over } = event;

        document.body.style.cursor = "";

        const templateDataSnapshot = snapshotTemplateDataRef.current;

        const revertToInitial = () => {
            if (templateDataSnapshot) {
                setTemplateData(templateDataSnapshot);
            }
        };

        if (!over || active.id === over.id) {
            revertToInitial();

            return;
        }

        setIsSaving(true);

        const activeDragIdString = String(active.id);
        const overIdString = String(over.id);

        const [activeType, activeDragIdValue] = activeDragIdString.includes(":")
            ? activeDragIdString.split(":")
            : ["field", activeDragIdString];

        const [, overIdValue] = overIdString.includes(":")
            ? overIdString.split(":")
            : ["field", overIdString];

        if (activeType === "category") {
            const oldIndex = templateData?.findIndex((c) => c.categoryId === activeDragIdValue) ?? -1;
            const newIndex = templateData?.findIndex((c) => c.categoryId === overIdValue) ?? -1;

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex && templateData) {
                const reorderedCategories = arrayMove(templateData, oldIndex, newIndex);
                setTemplateData(reorderedCategories);

                try {
                    const response = await fetch(`${apiBaseUrl}/v3/templates/${templateId}/categories/update/positions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            data: reorderedCategories.map((c) => ({ categoryId: c.categoryId })),
                        }),
                    });

                    const json = await response.json();

                    if (!response.ok) {
                        setIsSaving(false);
                        revertToInitial();

                        toast.show("Failed to save positions", {
                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                            type: "error",
                        });
                    }
                } catch (error) {
                    setIsSaving(false);
                    revertToInitial();

                    console.error("Failed to save positions", error);
                    toast.show("Failed to save positions", { type: "error" });
                }
            } else {
                setIsSaving(false);
                revertToInitial();
            }

            setIsSaving(false);

            return;
        }

        const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;

        if (activeType === "block") {
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);

            if (!targetCategory) {
                setIsSaving(false);
                revertToInitial();

                return;
            }

            const blockItems = targetCategory.blocks.items || [];
            const oldIndex = blockItems.findIndex((b) => b.blockId === activeDragIdValue);
            const newIndex = blockItems.findIndex((b) => b.blockId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reorderedBlockItems = arrayMove(blockItems, oldIndex, newIndex);

                setTemplateData((prev) =>
                    prev?.map((category) =>
                        category.categoryId === targetCategoryId
                            ? {
                                ...category,
                                blocks: {
                                    ...category.blocks,
                                    items: reorderedBlockItems,
                                },
                            }
                            : category
                    )
                );

                try {
                    const response = await fetch(`${apiBaseUrl}/v3/templates/${templateId}/blocks/update/positions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            data: reorderedBlockItems.map((block) => ({ blockId: block.blockId })),
                        }),
                    });

                    const json = await response.json();

                    if (!response.ok) {
                        setIsSaving(false);
                        revertToInitial();

                        toast.show("Failed to save positions", {
                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                            type: "error",
                        });
                    }
                } catch (error) {
                    setIsSaving(false);
                    revertToInitial();

                    console.error("Failed to save positions", error);
                    toast.show("Failed to save positions", { type: "error" });
                }
            } else {
                setIsSaving(false);
                revertToInitial();
            }

            setIsSaving(false);

            return;
        }

        if (activeType === "row") {
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.items?.find((b) => b.blockId === currentBlockId);

            if (!targetBlockItem) {
                setIsSaving(false);
                revertToInitial();

                return;
            }

            const rowItems = targetBlockItem.rows.items || [];
            const oldIndex = rowItems.findIndex((r) => r.rowId === activeDragIdValue);
            const newIndex = rowItems.findIndex((r) => r.rowId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reorderedRowItems = arrayMove(rowItems, oldIndex, newIndex);

                setTemplateData((prev) =>
                    prev?.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: {
                                ...category.blocks,
                                items: category.blocks.items.map((block) => {
                                    if (block.blockId !== currentBlockId) return block;

                                    return {
                                        ...block,
                                        rows: {
                                            ...block.rows,
                                            items: reorderedRowItems,
                                        },
                                    };
                                }),
                            },
                        };
                    })
                );

                try {
                    const response = await fetch(`${apiBaseUrl}/v3/templates/${templateId}/rows/update/positions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            blockId: currentBlockId,
                            data: reorderedRowItems.map((row) => ({ rowId: row.rowId })),
                        }),
                    });

                    const json = await response.json();

                    if (!response.ok) {
                        setIsSaving(false);
                        revertToInitial();

                        toast.show("Failed to save positions", {
                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                            type: "error",
                        });
                    }
                } catch (error) {
                    setIsSaving(false);
                    revertToInitial();

                    console.error("Failed to save positions", error);
                    toast.show("Failed to save positions", { type: "error" });
                }
            } else {
                setIsSaving(false);
                revertToInitial();
            }

            setIsSaving(false);

            return;
        }

        if (activeType === "field") {
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.items?.find((b) => b.blockId === currentBlockId);

            if (!targetBlockItem) {
                setIsSaving(false);
                revertToInitial();

                return;
            }

            const targetRow = targetBlockItem.rows.items?.find((r) =>
                (r.fields.items || []).some((f) => f.fieldId === activeDragIdValue)
            );

            if (!targetRow) {
                setIsSaving(false);
                revertToInitial();

                return;
            }

            const fieldItems = targetRow.fields.items || [];

            if (fieldItems.length > 5) {
                toast.show("A row cannot contain more than 5 fields", { type: "error" });

                setIsSaving(false);
                revertToInitial();
                
                return;
            }

            const oldIndex = fieldItems.findIndex((f) => f.fieldId === activeDragIdValue);
            const newIndex = fieldItems.findIndex((f) => f.fieldId === overIdValue);

            let finalFields = fieldItems;
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                finalFields = arrayMove(fieldItems, oldIndex, newIndex);

                setTemplateData((prev) =>
                    prev?.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: {
                                ...category.blocks,
                                items: category.blocks.items.map((block) => {
                                    if (block.blockId !== currentBlockId) return block;

                                    return {
                                        ...block,
                                        rows: {
                                            ...block.rows,
                                            items: block.rows.items.map((row) =>
                                                row.rowId === targetRow.rowId
                                                    ? {
                                                        ...row,
                                                        fields: {
                                                            ...row.fields,
                                                            items: finalFields,
                                                        },
                                                    }
                                                    : row
                                            ),
                                        },
                                    };
                                }),
                            },
                        };
                    })
                );
            }

            try {
                const response = await fetch(`${apiBaseUrl}/v3/templates/${templateId}/fields/update/positions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        rowId: targetRow.rowId,
                        data: finalFields.map((field) => ({ fieldId: field.fieldId })),
                    }),
                });

                const json = await response.json();

                if (!response.ok) {
                    setIsSaving(false);
                    revertToInitial();

                    toast.show("Failed to save positions", {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    });
                }
            } catch (error) {
                setIsSaving(false);
                revertToInitial();

                console.error("Failed to save positions", error);
                toast.show("Failed to save positions", { type: "error" });
            }
        }

        setIsSaving(false);
    };

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata 
                title={`${template?.displayName} Template`}
                allowIndex={false}
            />

            <NewCategoryModal 
                onAddCategory={handleAddCategory}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                modifiers={[conditionalVerticalAxisModifier]}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="drawer lg:drawer-open">
                    <input 
                        id="my-drawer" 
                        type="checkbox" 
                        checked={isDrawerOpen}
                        onChange={(e) => setIsDrawerOpen(e.target.checked)}
                        className="drawer-toggle" 
                    />

                    <div className="drawer-content border-l border-base-300">
                        <nav className="navbar sticky top-0 z-10 border-b border-base-300 w-full bg-base-100 flex items-center justify-between px-4">
                            <label 
                                htmlFor="my-drawer" 
                                aria-label="open sidebar" 
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span className="flex h-8 w-4 leading-none items-center justify-center">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </label>
                            
                            <div className="px-4 text-center flex-1">
                                <span className="font-medium">
                                    {template?.displayName || template?.id} Template
                                </span>

                                <div className="text-sub text-xs">
                                    {template?.owner.displayName || template?.owner.primaryUsername || template?.owner.id }
                                </div>
                            </div>

                            {isSaving && !isPreview && (
                                <div className="absolute right-14 flex items-center text-accent gap-2 mr-3">
                                    <span className="text-sm">Saving</span>
                                    <span className="loading h-5 w-5" />
                                </div>
                            )}

                            <button
                                type="button"
                                aria-label="toggle preview mode"
                                onClick={() => setIsPreview(!isPreview)}
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span className="flex h-8 w-4 leading-none items-center justify-center">
                                    <span className="font-nerdfont text-xl">
                                        {isPreview ? "󰈉" : "󰈈"}
                                    </span>
                                </span>
                            </button>
                        </nav>

                        <div className="flex flex-col items-center p-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-full max-w-5xl">
                                {currentCategoryData && (
                                    <>
                                        {!currentBlockId ? (
                                            <div className="p-2 md:p-4">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-2xl font-bold">
                                                        {currentCategoryData?.label}
                                                    </h2>
                                                </div>

                                                {!isPreview && (
                                                    <fieldset className="fieldset flex-4">
                                                        <legend className="fieldset-legend">{t("words.Search")}</legend>
                                                        <label className="input mb-4 w-full">
                                                            <span className="font-nerdfont text-base mr-1"></span>
                                                            <input 
                                                                type="search" 
                                                                placeholder="Search blocks..."
                                                                value={searchQuery}
                                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                            />
                                                        </label>
                                                    </fieldset>
                                                )}

                                                {(() => {
                                                    const query = searchQuery.trim().toLowerCase();

                                                    const filteredBlocks = (currentCategoryData?.blocks.items ?? []).filter(block => {
                                                        const matchesSearch = !query || 
                                                            block.blockId?.toLowerCase().includes(query) || 
                                                            block.label?.toLowerCase().includes(query) ||
                                                            block.description?.toLowerCase().includes(query);

                                                        if (!matchesSearch) return false;

                                                        if (isPreview) {
                                                            return (block.rows?.items ?? []).some(row =>
                                                                (row.fields?.items ?? []).some(field =>
                                                                    field.type === "separator" ||
                                                                    Boolean(
                                                                        field.value?.content &&
                                                                        String(field.value.content).trim() !== ""
                                                                    )
                                                                )
                                                            );
                                                        }

                                                        return true;
                                                    });

                                                    if (isPreview && filteredBlocks.length === 0) {
                                                        return (
                                                            <div className="text-center py-8 text-sub text-sm">
                                                                No filled blocks in this category.
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <SortableContext
                                                            items={filteredBlocks.map(block => `block:${block.blockId}`)}
                                                            strategy={rectSortingStrategy}
                                                        >
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                                {filteredBlocks.map(block => (
                                                                    <SortableItem key={block.blockId} id={`block:${block.blockId}`} disabled={isPreview}>
                                                                        {({ sortableProps, dragHandleProps }) => (
                                                                            <button
                                                                                {...sortableProps}
                                                                                className={`aspect-square relative flex flex-col items-center justify-center p-2 bg-base-200 hover:bg-base-300 border border-base-300 rounded transition-all shadow-xs cursor-pointer ${sortableProps.className ?? ""}`}
                                                                                onClick={() => setCurrentBlock(block.blockId)}
                                                                            >
                                                                                {!isPreview && (
                                                                                    <div
                                                                                        {...dragHandleProps}
                                                                                        className="absolute top-2 left-2 p-1 cursor-grab active:cursor-grabbing touch-none"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        <span className="text-2xl leading-none font-nerdfont">
                                                                                            󰇛
                                                                                        </span>
                                                                                    </div>
                                                                                )}

                                                                                {!isPreview && (
                                                                                    <div
                                                                                        className="absolute top-2 right-2 p-1 touch-none"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        <span className="text-lg leading-none font-nerdfont">
                                                                                            󰇘
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                {block?.icon && (
                                                                                    <img 
                                                                                        className="h-20 rounded" 
                                                                                        src={block?.icon} 
                                                                                    />
                                                                                )}

                                                                                <span className="text-lg font-semibold mt-2">
                                                                                    {block?.label || block.blockId}
                                                                                </span>

                                                                                <span className="text-xs text-sub mt-1">
                                                                                    {block?.description}
                                                                                </span>
                                                                            </button>
                                                                        )}
                                                                    </SortableItem>
                                                                ))}

                                                                {!isPreview && (currentCategoryData?.blocks?.items.length ?? 0) <= 32 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            newBlockModal.open({
                                                                                types: currentCategoryData.types,
                                                                                onAddBlock: handleAddBlock
                                                                            });
                                                                        }}
                                                                        className="cursor-pointer border-2 aspect-square min-h-[160px] border-dashed border-base-300 rounded flex items-center justify-center py-3 transition-colors text-sm opacity-70 hover:opacity-100"
                                                                    >
                                                                        <span className="font-nerdfont text-3xl">
                                                                            
                                                                        </span>
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </SortableContext>
                                                    );
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="p-2 md:p-4">
                                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
                                                    <button
                                                        className="flex gap-2 text-sm items-center font-normal cursor-pointer"
                                                        onClick={() => setCurrentBlock()}
                                                    >
                                                        <span className="font-nerdfont text-lg leading-none">
                                                            
                                                        </span> 
                                                        Back to All
                                                    </button>
                                                    <div className="h-5 w-px bg-base-300" />
                                                    <h2 className="text-xl font-bold">
                                                        {currentBlockData?.label || currentBlockId}
                                                    </h2>
                                                </div>

                                                {(() => {
                                                    const visibleRows = (currentBlockData?.rows.items ?? []).filter(row => {
                                                        if (!isPreview) return true;

                                                        return (row.fields?.items ?? []).some(field =>
                                                            field.type === "separator" ||
                                                            Boolean(field.value?.content && String(field.value.content).trim() !== "")
                                                        );
                                                    });

                                                    return (
                                                        <SortableContext
                                                            items={visibleRows.map(row => `row:${row.rowId}`)}
                                                            strategy={verticalListSortingStrategy}
                                                        >
                                                            <div className="flex flex-col gap-1">
                                                                {visibleRows.map(row => {
                                                                    const visibleFields = (row.fields.items || []).filter(field => {
                                                                        if (!isPreview) return true;

                                                                        return (
                                                                            field.type === "separator" ||
                                                                            Boolean(String(field.value?.content ?? "").trim())
                                                                        );
                                                                    });

                                                                    const handleContextMenu = (e: React.MouseEvent) => {
                                                                        const target = e.target as HTMLElement;

                                                                        if (target.closest("[id^='field-']")) {
                                                                            return;
                                                                        }

                                                                        e.preventDefault();

                                                                        const popover = document.getElementById(
                                                                            `context-${row.rowId}`
                                                                        ) as HTMLElement | null;

                                                                        if (!popover) return;

                                                                        popover.showPopover();

                                                                        requestAnimationFrame(() => {
                                                                            const rect = popover.getBoundingClientRect();

                                                                            popover.style.left = `${Math.min(
                                                                                e.clientX,
                                                                                window.innerWidth - rect.width - 8
                                                                            )}px`;

                                                                            popover.style.top = `${Math.min(
                                                                                e.clientY,
                                                                                window.innerHeight - rect.height - 8
                                                                            )}px`;
                                                                        });
                                                                    };

                                                                    return (
                                                                        <>
                                                                            <TemplateContextMenu 
                                                                                id={row.rowId}
                                                                                type="row"
                                                                                label="Row"
                                                                                templateId={templateId as string}
                                                                                readOnly={isPreview}
                                                                                data={{ row: row as unknown as TemplateRowItemType }}
                                                                                // onChange={handleUpdateRow}
                                                                                onDelete={onDelete}
                                                                            />

                                                                            <SortableItem key={row.rowId} id={`row:${row.rowId}`} disabled={isPreview}>
                                                                                {({ sortableProps, dragHandleProps }) => (
                                                                                    <div 
                                                                                        {...sortableProps} 
                                                                                        className={`min-h-16 flex gap-3 ${sortableProps.className ?? ""}`}
                                                                                        onContextMenu={handleContextMenu}
                                                                                    >
                                                                                        {!isPreview && (
                                                                                            <span
                                                                                                {...dragHandleProps}
                                                                                                className="flex items-center cursor-grab active:cursor-grabbing touch-none"
                                                                                            >
                                                                                                <div className="flex h-full items-center justify-center py-2">
                                                                                                    <div className="flex h-full w-5 items-center justify-center rounded bg-base-300">
                                                                                                        <span className="text-2xl leading-none font-nerdfont">
                                                                                                            󰇝
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </div>
                                                                                            </span>
                                                                                        )}

                                                                                        <FieldDropZone
                                                                                            id={`row-fields:${row.rowId}`}
                                                                                            className="flex-1 min-w-0 w-full min-h-[44px]"
                                                                                        >
                                                                                            <SortableContext
                                                                                                items={visibleFields.map((f) => `field:${f.fieldId}`)}
                                                                                                strategy={rectSortingStrategy}
                                                                                            >
                                                                                                <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                                                                                    {visibleFields.map(field => {
                                                                                                        const rawContent = field.value?.content || "";

                                                                                                        const resolvedValue = resolveDynamicValues(rawContent);
                                                                                                        const resolvedLabel = resolveDynamicValues(field.label);
                                                                                                        const resolvedPlaceholder = resolveDynamicValues(field.placeholder);
                                                                                                        const resolvedGuide = resolveDynamicValues(field.guide);

                                                                                                        return (
                                                                                                            <SortableItem key={field.fieldId} id={`field:${field.fieldId}`} disabled={isPreview}>
                                                                                                                {({ sortableProps: fSortProps, dragHandleProps: fDragProps }) => {
                                                                                                                    const dragProps = fDragProps ?? {};
                                                                                                                    
                                                                                                                    return (
                                                                                                                        <div 
                                                                                                                            {...fSortProps} 
                                                                                                                            className={`flex-${field.flex || 1} min-w-0 ${fSortProps.className ?? ""}`}
                                                                                                                        >
                                                                                                                            <TemplateField
                                                                                                                                id={field.fieldId}
                                                                                                                                type={field.type}
                                                                                                                                label={resolvedLabel}
                                                                                                                                placeholder={resolvedPlaceholder}
                                                                                                                                guide={resolvedGuide}
                                                                                                                                value={{
                                                                                                                                    ...field.value as GetTemplateValueType,
                                                                                                                                    content: isPreview ? resolvedValue : rawContent,
                                                                                                                                }}
                                                                                                                                options={field.options}
                                                                                                                                isLocked={field.isLocked}
                                                                                                                                url={`${studioBaseUrl}/template/${templateId}/${categoryId}/${blockId}`}
                                                                                                                                templateId={templateId as string}
                                                                                                                                rowId={row.rowId}
                                                                                                                                readOnly={isPreview}
                                                                                                                                data={field as TemplateFieldItemType}
                                                                                                                                onChange={(value, options) => handleUpdateValue(
                                                                                                                                    field.fieldId, 
                                                                                                                                    field.type,
                                                                                                                                    value as string,
                                                                                                                                    options as unknown as TemplateValueType
                                                                                                                                )}
                                                                                                                                dragHandleProps={!isPreview && !field.isLocked ? {
                                                                                                                                    ...dragProps,
                                                                                                                                    className: `${dragProps.className ?? ""} touch-none cursor-grab active:cursor-grabbing`.trim(),
                                                                                                                                } : undefined}
                                                                                                                                onFieldChange={handleUpdateField}
                                                                                                                                onDelete={onDelete}
                                                                                                                            />
                                                                                                                        </div>
                                                                                                                    );
                                                                                                                }}
                                                                                                            </SortableItem>
                                                                                                        );
                                                                                                    })}
                                                                                                </div>
                                                                                            </SortableContext>
                                                                                        </FieldDropZone>

                                                                                        {!isPreview && (row.fields?.items.length ?? 0) < 5 && (
                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() => {
                                                                                                    newFieldModal.open({
                                                                                                        targetRowId: row.rowId,
                                                                                                        onAddField: handleAddField
                                                                                                    });
                                                                                                }}
                                                                                                className="cursor-pointer border-2 w-10 my-2 border-dashed border-base-300 rounded flex items-center justify-center transition-colors text-sm opacity-70 hover:opacity-100"
                                                                                            >
                                                                                                <span className="font-nerdfont text-lg">
                                                                                                    
                                                                                                </span>
                                                                                            </button>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </SortableItem>
                                                                        </>
                                                                    );
                                                                })}
                                                            </div>
                                                        </SortableContext>
                                                    );
                                                })()}

                                                {!isPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={handleAddRow}
                                                        className="cursor-pointer border-2 w-full mt-2 border-dashed border-base-300 rounded flex items-center justify-center py-2 transition-colors text-sm opacity-70 hover:opacity-100"
                                                    >
                                                        <span className="font-nerdfont text-xl">
                                                            
                                                        </span>
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="drawer-side is-drawer-close:overflow-visible">
                        <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                            <div className="menu w-full">
                                {(() => {
                                    const visibleCategories = (templateData ?? []).filter(category => {
                                        if (!isPreview) return true;

                                        return (category.blocks?.items ?? []).some(block => 
                                            (block.rows?.items ?? []).some(row => 
                                                (row.fields?.items ?? []).some(field => 
                                                    Boolean(field.value?.content && String(field.value.content).trim() !== "")
                                                )
                                            )
                                        );
                                    });

                                    return (
                                        <SortableContext items={visibleCategories.map(category => `category:${category.categoryId}`)}>
                                            <ul>
                                                {visibleCategories.map(category => (
                                                    <SortableItem key={category.categoryId} id={`category:${category.categoryId}`} disabled={isPreview}>
                                                        {({ sortableProps, dragHandleProps }) => (
                                                            <li {...sortableProps} className={sortableProps.className}>
                                                                <button
                                                                    className="flex items-center h-12 gap-4 tooltip tooltip-accent tooltip-right"
                                                                    template-tip={category.label}
                                                                    onClick={() => {
                                                                        setCurrentCategory(category.categoryId);
                                                                    }}
                                                                >
                                                                    {!isPreview && (
                                                                        <span
                                                                            {...dragHandleProps}
                                                                            className="flex items-center cursor-grab active:cursor-grabbing touch-none"
                                                                        >
                                                                            <div className="flex items-center justify-center py-2">
                                                                                <div className="flex w-5 items-center justify-center">
                                                                                    <span className="text-2xl leading-none font-nerdfont">
                                                                                        󰇝
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </span>
                                                                    )}

                                                                    <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                                                        
                                                                    </span>

                                                                    <span className="is-drawer-close:hidden text-sm">
                                                                        {category.label}
                                                                    </span>
                                                                </button>
                                                            </li>
                                                        )}
                                                    </SortableItem>
                                                ))}

                                                {!isPreview && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            const modal = document.getElementById("new-category") as HTMLDialogElement | null;
                                                            modal?.showModal();
                                                        }}
                                                        className="cursor-pointer border-2 w-full mt-2 border-dashed border-base-300 rounded flex items-center justify-center py-2 transition-colors text-sm opacity-70 hover:opacity-100"
                                                    >
                                                        <span className="font-nerdfont text-xl">
                                                            
                                                        </span>
                                                    </button>
                                                )}
                                            </ul>
                                        </SortableContext>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay dropAnimation={null} zIndex={1000} />
            </DndContext>
        </>
    );
}
