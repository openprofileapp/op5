/* eslint-disable @typescript-eslint/ban-ts-comment */

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

import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { BlockItemType, GetBlockItemType } from "../../../_common/types/blocks/block.type.js";
import { GetRowItemType, RowItemType } from "../../../_common/types/blocks/row.type.js";
import { apiBaseUrl, studioBaseUrl } from "../../_common/scripts/domains.js";
import { toast } from "../../_common/scripts/toast.js";
import { FieldItemType, GetFieldItemType } from "../../../_common/types/blocks/field.type.js";
import { snowflake } from "../scripts/main.js";
import { NewFieldType } from "../components/modals/NewFieldModal.js";
import { FieldNameType } from "../../../_common/types/field.type.js";
import { GetValueType, ValueType } from "../../../_common/types/blocks/value.type.js";
import { ValueOptionsType } from "../../../_common/types/value.type.js";
import Metadata from "../../_common/components/Metadata.js";
import downloadOp5 from "../../_common/scripts/download.js";
import TemplateContextMenu from "../components/TemplateContextMenu.js";
import TemplateField from "../components/TemplateField.js";

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

export default function Block() {
    const { blockId } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();
    const navigate = useNavigate();

    const { 
        saveFailedModal, 
        newFieldModal
    } = useModals()
    
    const [lastToast, setLastToast] = useState<number>(0);

    const debounceTimers = useRef<{ [fieldId: string]: NodeJS.Timeout }>({});
    const valuesMapRef = useRef<{ [fieldId: string]: string }>({});
    const snapshotBlockDataRef = useRef<GetBlockItemType[] | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [block, setBlock] = useState<BlockItemType>();
    const [blockData, setBlockData] = useState<GetRowItemType[]>([]);

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/blocks/drafts?id=${blockId}`,
                    { credentials: "include" }
                );

                const data = await response.json();

                if (!response.ok || !data?.items?.[0]) {
                    navigate("/blocks", { replace: true });
                    return;
                }

                setBlock(data.items[0]);
            } catch (err) {
                console.error(err);
            }
        };

        if (blockId) {
            fetchBlock();
        }
    }, [blockId, navigate]);

    useEffect(() => {
        const fetchBlockData = async () => {
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/blocks/drafts/${blockId}/data`,
                    { credentials: "include" }
                );

                const json = await response.json();

                if (!response.ok) {
                    toast.show(
                        "Failed to load block",
                        {
                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                            type: "error",
                        }
                    );

                    return;
                }

                setBlockData(json || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (blockId) {
            fetchBlockData();
        }
    }, [blockId, navigate]);

    useEffect(() => {
        if (!Array.isArray(blockData)) return;

        valuesMapRef.current = {};

        blockData.forEach((row) => {
            // @ts-ignore
            row.fields?.items?.forEach((field: GetFieldItemType) => {
                if (
                    field.fieldId &&
                    field.value?.content !== undefined
                ) {
                    valuesMapRef.current[field.fieldId] = String(field.value.content);
                }
            });
        });
    }, [blockData]);

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

    const resolveDynamicValues = useCallback((fieldIdOrExpression: string | undefined): string => {
        if (!fieldIdOrExpression) return "";

        const getFieldValue = (id: string): { field: GetFieldItemType; text: string } | undefined => {
            for (const row of blockData || []) {
                // @ts-ignore
                for (const field of row.fields?.items || []) {
                    if (field.fieldId === id) {
                        if (field.type?.toLowerCase() === "button") {
                            let options = field.options;

                            if (typeof options === "string") {
                                try {
                                    options = JSON.parse(options);
                                } catch {
                                    options = {};
                                }
                            }

                            return {
                                field,
                                text: options?.text || ""
                            };
                        }

                        return {
                            field,
                            text: field.value?.content ?? ""
                        };
                    }
                }
            }
            return undefined;
        };

        const target = getFieldValue(fieldIdOrExpression);
        const textToResolve = target ? target.text : fieldIdOrExpression;

        if (!textToResolve) return "";

        return String(textToResolve).replace(
            /\{([^}]+)\}/g,
            (match, expression) => {
                const parts = expression
                    .split(".")
                    .map((part: string) => part.trim())
                    .filter(Boolean);

                const refFieldId = parts.shift();

                if (!refFieldId) return match;

                const normalizedKey = refFieldId.toLowerCase().replace(/[-_]/g, "");
                let result: string;

                if (normalizedKey === "displayname") {
                    result = block?.displayName || "";
                } else {
                    const refTarget = getFieldValue(refFieldId);

                    if (!refTarget) {
                        return match;
                    }

                    result = String(refTarget.text);
                }

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
                                .replace(/\b\w/g, (char) => char.toUpperCase());
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
    }, [blockData, block?.displayName]);

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

    const handleAddRow = async (): Promise<boolean> => {
        setIsSaving(true);

        const payload = {
            rowId: snowflake.gen(),
            position: blockData.length,
            createdBy: window.session.userId,
            createdDate: new Date().toISOString(),
            fields: {
                // @ts-ignore
                items: [],
                count: 0,
            },
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/blocks/${blockId}/rows/insert`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        rowId: payload.rowId,
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

        // @ts-ignore
        setBlockData((prev) => [...prev, payload]);

        return true;
    };

    const handleAddField = async (
        targetRowId: string,
        incoming: NewFieldType
    ): Promise<boolean> => {
        if (!incoming?.id.trim()) {
            toast.show("Field ID is required", { type: "error" });
            return false;
        }

        // @ts-ignore
        const targetRow = blockData.find((r) => r.rowId === targetRowId);

        // @ts-ignore
        const targetFields = targetRow?.fields?.items ?? [];

        if (targetFields.length >= 5) {
            toast.show("A row cannot contain more than 5 fields", { type: "error" });
            return false;
        }

        const isDuplicateId = Boolean(
            incoming?.id &&
            blockData.some((row) =>
                // @ts-ignore
                row.fields?.items?.some((field) => field.fieldId === incoming.id)
            )
        );

        if (isDuplicateId) {
            toast.show(`A field with ID "${incoming?.id}" already exists`, { type: "error" });
            return false;
        }

        setIsSaving(true);

        const payload = {
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
                `${apiBaseUrl}/v3/blocks/${blockId}/fields/insert`,
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

        // @ts-ignore
        setBlockData((prev) =>
            prev.map((row) => {
                // @ts-ignore
                if (row.rowId !== targetRowId) {
                    return row;
                }

                // @ts-ignore
                const existingFields = row.fields?.items ?? [];
                const updatedFields = [...existingFields, payload];

                return {
                    ...row,
                    fields: {
                        items: updatedFields,
                        count: updatedFields.length,
                    },
                };
            })
        );

        return true;
    };

      const handleUpdateField = async (
        targetRowId: string,
        originalFieldId: string,
        incoming: Partial<FieldItemType>
    ): Promise<boolean> => {
        if (originalFieldId !== incoming.fieldId) {
            const isDuplicateId = Boolean(
                incoming?.fieldId &&
                blockData?.some((row) =>
                    // @ts-ignore
                    row.fields?.items?.some((field) => field.fieldId === incoming.fieldId)
                )
            );

            if (isDuplicateId) {
                toast.show(`A field with ID "${incoming?.fieldId}" already exists`, { type: "error" });
                return false;
            }
        }

        setIsSaving(true);

        const payload = {
            fieldId: incoming.fieldId,
            flex: incoming.flex ?? 1,
            label: incoming.label || "New Field",
            placeholder: incoming.placeholder || "",
            options: incoming.options,
            guide: incoming.guide,
            isLocked: incoming.isLocked
        };

        try {
            const response = await fetch(
                `${apiBaseUrl}/v3/blocks/${blockId}/fields/update`,
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

        // @ts-ignore
        setBlockData((prev) =>
            prev.map((row) => {
                // @ts-ignore
                if (row.rowId !== targetRowId) {
                    return row;
                }

                // @ts-ignore
                const existingFields = row.fields?.items ?? [];

                // @ts-ignore
                const updatedFields = existingFields.map((field) => {
                    if (field.fieldId !== originalFieldId) {
                        return field;
                    }

                    return {
                        ...field,
                        ...incoming,
                    };
                });

                return {
                    ...row,
                    fields: {
                        items: updatedFields,
                        count: updatedFields.length,
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
        options: ValueType,
        immediate = false
    ): Promise<boolean> => {
        valuesMapRef.current[fieldId] = value;

        setBlockData((prev) =>
            prev.map((row) => ({
                ...row,
                fields: {
                    ...row.fields,
                    // @ts-ignore
                    items: (row.fields?.items ?? []).map((field) => {
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
            }))
        );

        if (debounceTimers.current[fieldId]) {
            clearTimeout(debounceTimers.current[fieldId]);
        }

        const executeSave = async (): Promise<boolean> => {
            setIsSaving(true);
            try {
                const response = await fetch(
                    `${apiBaseUrl}/v3/blocks/${blockId}/fields/update/value`,
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
                                    `${apiBaseUrl}/v3/blocks/${blockId}/fields/update/value`,
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

        return new Promise((resolve) => {
            debounceTimers.current[fieldId] = setTimeout(async () => {
                const success = await executeSave();
                resolve(success);
            }, 300);
        });
    };

    const onDelete = (
        id: string,
        type: "field" | "row"
    ) => {
        setBlockData((prev) => {
            if (!Array.isArray(prev)) return prev;

            switch (type) {
                case "row":
                    // @ts-ignore
                    return prev.filter((row) => row.rowId !== id);

                case "field":
                    return prev.map((row) => ({
                        ...row,
                        fields: row.fields
                            ? {
                                ...row.fields,
                                // @ts-ignore
                                items: row.fields.items?.filter(
                                    // @ts-ignore
                                    (field) => field.fieldId !== id
                                ),
                                // @ts-ignore
                                count: row.fields.items
                                    // @ts-ignore
                                    ? row.fields.items.filter((field) => field.fieldId !== id).length
                                    // @ts-ignore
                                    : row.fields.count,
                            }
                            : row.fields,
                    }));

                default:
                    return prev;
            }
        });
    };

    const handleDragStart = (): void => {        
        snapshotBlockDataRef.current = blockData 
            ? JSON.parse(JSON.stringify(blockData)) 
            : null;

        document.body.style.cursor = "grabbing";
    };

    const handleDragOver = (event: DragOverEvent): void => {
        const { active, over } = event;

        if (!over) return;

        const activeDragIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (!activeDragIdStr.startsWith("field:")) return;

        const activeFieldId = activeDragIdStr.replace("field:", "");
        const overType = overIdStr.includes(":") ? overIdStr.split(":")[0] : "field";
        const overRawId = overIdStr.includes(":") ? overIdStr.split(":")[1] : overIdStr;

        setBlockData((prev) => {
            if (!Array.isArray(prev)) return prev;

            const sourceRow = prev.find((r) =>
                // @ts-ignore
                (r.fields?.items || []).some((f) => f.fieldId === activeFieldId)
            );
            if (!sourceRow) return prev;

            let targetRow: typeof sourceRow | undefined;

            if (overType === "field") {
                targetRow = prev.find((r) =>
                    // @ts-ignore
                    (r.fields?.items || []).some((f) => f.fieldId === overRawId)
                );
            } else if (overType === "row-fields" || overType === "row") {
                // @ts-ignore
                targetRow = prev.find((r) => r.rowId === overRawId);
            }

            if (!targetRow) return prev;

            // @ts-ignore
            const dragtargetRowId = targetRow.rowId;

            // @ts-ignore
            if (sourceRow.rowId === dragtargetRowId) return prev;

            // @ts-ignore
            if ((targetRow.fields?.items || []).length >= 5) {
                if (Date.now() - lastToast > 5000) {
                    toast.show("A row cannot contain more than 5 fields", { type: "error" });
                    setLastToast(Date.now());
                }

                return prev;
            }

            // @ts-ignore
            const movedField = sourceRow.fields?.items?.find((f) => f.fieldId === activeFieldId);
            if (!movedField) return prev;

            return prev.map((row) => {
                // @ts-ignore
                if (row.rowId === sourceRow.rowId) {
                    // @ts-ignore
                    const nextItems = (row.fields?.items || []).filter(
                        // @ts-ignore
                        (f) => f.fieldId !== activeFieldId
                    );

                    return {
                        ...row,
                        fields: {
                            ...row.fields,
                            items: nextItems,
                            count: nextItems.length,
                        },
                    };
                }

                // @ts-ignore
                if (row.rowId === dragtargetRowId) {
                    // @ts-ignore
                    const existingItems = row.fields?.items || [];
                    const overIndex = existingItems.findIndex(
                        // @ts-ignore
                        (f) => f.fieldId === overRawId
                    );
                    const newIndex =
                        overIndex >= 0 ? overIndex : existingItems.length;

                    const nextItems = [...existingItems];
                    nextItems.splice(newIndex, 0, movedField);

                    return {
                        ...row,
                        fields: {
                            ...row.fields,
                            items: nextItems,
                            count: nextItems.length,
                        },
                    };
                }

                return row;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent): Promise<void> => {
        const { active, over } = event;

        document.body.style.cursor = "";

        const blockDataSnapshot = snapshotBlockDataRef.current;

        const revertToInitial = () => {
            if (blockDataSnapshot) {
                // @ts-ignore
                setBlockData(blockDataSnapshot);
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

        // Handle Row Reordering
        if (activeType === "row") {
            const rowItems = blockData || [];
            // @ts-ignore
            const oldIndex = rowItems.findIndex((r) => r.rowId === activeDragIdValue);
            // @ts-ignore
            const newIndex = rowItems.findIndex((r) => r.rowId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const reorderedRowItems = arrayMove(rowItems, oldIndex, newIndex);
                setBlockData(reorderedRowItems);

                try {
                    const response = await fetch(`${apiBaseUrl}/v3/blocks/${blockId}/rows/update/positions`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            // @ts-ignore
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

        // Handle Field Reordering
        if (activeType === "field") {
            const targetRow = blockData?.find((r) =>
                // @ts-ignore
                (r.fields?.items || []).some((f) => f.fieldId === activeDragIdValue)
            );

            if (!targetRow) {
                setIsSaving(false);
                revertToInitial();
                return;
            }

            // @ts-ignore
            const fieldItems = targetRow.fields?.items || [];

            if (fieldItems.length > 5) {
                toast.show("A row cannot contain more than 5 fields", { type: "error" });
                setIsSaving(false);
                revertToInitial();
                return;
            }

            // @ts-ignore
            const oldIndex = fieldItems.findIndex((f) => f.fieldId === activeDragIdValue);
            // @ts-ignore
            const newIndex = fieldItems.findIndex((f) => f.fieldId === overIdValue);

            let finalFields = fieldItems;
            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                finalFields = arrayMove(fieldItems, oldIndex, newIndex);

                setBlockData((prev) =>
                    prev?.map((row) =>
                        // @ts-ignore
                        row.rowId === targetRow.rowId
                            ? {
                                ...row,
                                fields: {
                                    ...row.fields,
                                    items: finalFields,
                                    count: finalFields.length,
                                },
                            }
                            : row
                    )
                );
            }

            try {
                const response = await fetch(`${apiBaseUrl}/v3/blocks/${blockId}/fields/update/positions`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        // @ts-ignore
                        rowId: targetRow.rowId,
                        // @ts-ignore
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
                title={`${block?.displayName} Block`}
                allowIndex={false}
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
                    <div className="drawer-content border-l border-base-300">
                        <nav className="navbar sticky top-0 z-10 border-b border-base-300 w-full bg-base-100 flex items-center justify-between px-4">
                            <div className="px-4 text-center flex-1">
                                <span className="font-medium">
                                    {block?.displayName || block?.blockId} Block
                                </span>

                                <div className="text-sub text-xs">
                                    {/* @ts-ignore */}
                                    {block?.owner.displayName || block?.owner.primaryUsername || block?.owner.id }
                                </div>
                            </div>

                            {isSaving && (
                                <div className="absolute right-14 flex items-center text-accent gap-2 mr-3">
                                    <span className="text-sm">Saving</span>
                                    <span className="loading h-5 w-5" />
                                </div>
                            )}

                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    aria-label="toggle preview mode"
                                    onClick={() => downloadOp5(block, blockData, "block", block?.displayName || block?.blockId)}
                                    className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                                >
                                    <span 
                                        className="flex h-8 w-4 font-normal items-center justify-center tooltip tooltip-accent tooltip-left"
                                        data-tip="Download"
                                    >
                                        <span className="font-nerdfont leading-none text-xl text-center">
                                            
                                        </span>
                                    </span>
                                </button>
                            </div>
                        </nav>

                        <div className="flex flex-col items-center p-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-full max-w-5xl">
                                <div className="p-2 md:p-4">
                                    <SortableContext
                                        // @ts-ignore
                                        items={blockData.map(row => `row:${row.rowId}`)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-1">
                                            {blockData.map(row => {
                                                // @ts-ignore
                                                const visibleFields = row.fields.items || [];

                                                const handleContextMenu = (e: React.MouseEvent) => {
                                                    const target = e.target as HTMLElement;

                                                    if (target.closest("[id^='field-']")) {
                                                        return;
                                                    }

                                                    e.preventDefault();

                                                    const popover = document.getElementById(
                                                        // @ts-ignore
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
                                                            // @ts-ignore
                                                            id={row.rowId}
                                                            type="row"
                                                            label="Row"
                                                            assetId={blockId as string}
                                                            // @ts-ignore
                                                            data={{ row: row as unknown as RowItemType }}
                                                            // @ts-ignore
                                                            onChange={() => {}}
                                                            // @ts-ignore
                                                            onDelete={onDelete}
                                                            isEditing={true}
                                                            isBlockAsset={true}
                                                        />

                                                        {/* @ts-ignore */}
                                                        <SortableItem key={row.rowId} id={`row:${row.rowId}`}>
                                                            {({ sortableProps, dragHandleProps }) => (
                                                                <div 
                                                                    {...sortableProps} 
                                                                    className={`min-h-16 flex gap-3 ${sortableProps.className ?? ""}`}
                                                                    onContextMenu={handleContextMenu}
                                                                >
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

                                                                    <FieldDropZone
                                                                        // @ts-ignore
                                                                        id={`row-fields:${row.rowId}`}
                                                                        className="flex-1 min-w-0 w-full min-h-[44px]"
                                                                    >
                                                                        <SortableContext
                                                                            // @ts-ignore
                                                                            items={visibleFields.map((f) => `field:${f.fieldId}`)}
                                                                            strategy={rectSortingStrategy}
                                                                        >
                                                                            <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                                                                {/* @ts-ignore */}
                                                                                {visibleFields.map(field => {
                                                                                    const rawContent = field.value?.content || "";

                                                                                    const resolvedLabel = resolveDynamicValues(field.label);
                                                                                    const resolvedPlaceholder = resolveDynamicValues(field.placeholder);
                                                                                    const resolvedGuide = resolveDynamicValues(field.guide);

                                                                                    return (
                                                                                        <SortableItem key={field.fieldId} id={`field:${field.fieldId}`}>
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
                                                                                                            // @ts-ignore
                                                                                                            value={{
                                                                                                                ...field.value as GetValueType,
                                                                                                                content: rawContent,
                                                                                                            }}
                                                                                                            options={field.options}
                                                                                                            isLocked={field.isLocked}
                                                                                                            url={`${studioBaseUrl}/block/${blockId}`}
                                                                                                            assetId={blockId as string}
                                                                                                            // @ts-ignore
                                                                                                            rowId={row.rowId}
                                                                                                            // @ts-ignore
                                                                                                            data={field as FieldItemType}
                                                                                                            onChange={(value, options) => handleUpdateValue(
                                                                                                                field.fieldId, 
                                                                                                                field.type,
                                                                                                                value as string,
                                                                                                                options as unknown as ValueType
                                                                                                            )}
                                                                                                            dragHandleProps={{
                                                                                                                ...dragProps,
                                                                                                                className: `${dragProps.className ?? ""} touch-none cursor-grab active:cursor-grabbing`.trim(),
                                                                                                            }}
                                                                                                            onFieldChange={handleUpdateField}
                                                                                                            // @ts-ignore
                                                                                                            onDelete={onDelete}
                                                                                                            resolveDynamicValues={resolveDynamicValues}
                                                                                                            isBlockAsset={true}
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

                                                                    {/* @ts-ignore */}
                                                                    {(row.fields?.items.length ?? 0) < 5 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => {
                                                                                newFieldModal.open({
                                                                                    // @ts-ignore
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

                                    <button
                                        type="button"
                                        onClick={handleAddRow}
                                        className="cursor-pointer border-2 w-full mt-2 border-dashed border-base-300 rounded flex items-center justify-center py-2 transition-colors text-sm opacity-70 hover:opacity-100"
                                    >
                                        <span className="font-nerdfont text-xl">
                                            
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <DragOverlay dropAnimation={null} zIndex={1000} />
            </DndContext>
        </>
    );
}
