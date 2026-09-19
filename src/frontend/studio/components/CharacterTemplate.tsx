import { useEffect, useState, useCallback, useRef, ReactNode, CSSProperties } from "react";
import { useParams } from "react-router-dom";
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
    DragStartEvent,
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

import Metadata from "../../_common/components/Metadata.js";
import TemplateField from "./TemplateField.js";
import { toast } from "../../_common/scripts/toast.js";
import NewCategoryModal, { NewCategoryData } from "./modals/NewCategoryModal.js";
import { GetCategoryType } from "../../../_common/types/template/category.type.js";
import { GetRowType, TemplateRowItemType } from "../../../_common/types/template/row.type.js";
import { GetFieldType } from "../../../_common/types/template/field.type.js";
import NewFieldModal, { NewFieldData } from "./modals/NewFieldModal.js";
import { snowflake } from "../scripts/main.js";
import { GetBlockItemType } from "../../../_common/types/template/block.type.js";
import NewBlockModal from "./modals/NewBlockModal.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";

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
                    style
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

export default function CharacterTemplate() {
    const { id } = useParams();
    const { t, ready: isTranslationReady } = useTranslation();

    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isPreviewMode, setIsPreviewMode] = useState(false);

    const [lastToast, setLastToast] = useState<number>(0);
    const [targetRowId, setTargetRowId] = useState<string | null>(null);
    
    const [data, setData] = useState<GetCategoryType[]>([]);

    const [activeCategory, setActiveCategory] = useState<string | null>();
    const [activeBlock, setActiveBlock] = useState<string | null>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeId, setActiveId] = useState<string | null>(null);

    const debounceTimers = useRef<{ [fieldId: string]: NodeJS.Timeout }>({});
    const valuesMapRef = useRef<{ [fieldId: string]: string }>({});

    const currentCategory =
        data.find((category) => category.categoryId === activeCategory) ?? data[0];

    const currentBlock = currentCategory?.blocks?.find(
        (block) => block.blockId === activeBlock
    );

    useEffect(() => {
        data.forEach((category) => {
            category.blocks?.forEach((block) => {
                block.rows?.forEach((row) => {
                    row.fields?.forEach((field) => {
                        if (field.fieldId && field.value?.content !== undefined) {
                            valuesMapRef.current[field.fieldId] = field.value.content;
                        }
                    });
                });
            });
        });
    }, [data]);

    useEffect(() => {
        if (!currentCategory || !activeBlock) return;

        const blockExists = currentCategory?.blocks.some(
            (block) => block.blockId === activeBlock
        );

        if (!blockExists) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setActiveBlock(null);
        }
    }, [currentCategory, activeBlock]);

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
        const activeIdStr = String(active?.id ?? "");

        if (activeIdStr.startsWith("category:") || activeIdStr.startsWith("row:")) {
            return restrictToVerticalAxis(args);
        }

        return args.transform;
    }, []);

    const resolveDynamicValues = useCallback((text: string | undefined): string => {
        if (!text) return "";

        return text.replace(/\{([^}]+)\}/g, (match, fieldId) => {
            const trimmedId = fieldId.trim();

            if (valuesMapRef.current[trimmedId] !== undefined) {
                return valuesMapRef.current[trimmedId] || match;
            }

            for (const category of data) {
                for (const block of category.blocks || []) {
                    for (const row of block.rows || []) {
                        for (const field of row.fields || []) {
                            if (field.fieldId === trimmedId) {
                                return field.value?.content || match;
                            }
                        }
                    }
                }
            }
            return match;
        });
    }, [data]);

    const handleFieldChange = (fieldId: string, newValue: string) => {
        valuesMapRef.current[fieldId] = newValue;

        setData((prev: GetCategoryType[]) =>
            prev.map((category) => ({
                ...category,
                blocks: category.blocks.map((block) => ({
                    ...block,
                    rows: block.rows.map((row) => ({
                        ...row,
                        fields: row.fields.map((field) => {
                            if (field.fieldId !== fieldId) return field;

                            return {
                                ...field,
                                lastEditedDate: new Date().toISOString(),
                                value: {
                                    author: window.session?.userId ?? "",
                                    content: newValue,
                                    date: new Date().toISOString(),
                                },
                            };
                        }),
                    })),
                })),
            }))
        );

        if (debounceTimers.current[fieldId]) {
            clearTimeout(debounceTimers.current[fieldId]);
        }

        debounceTimers.current[fieldId] = setTimeout(() => {
            // DEVELOPER NEEDED: Call save API here
        }, 300);
    };

    const handleAddCategory = async (newData: NewCategoryData): Promise<boolean> => {
    const id = snowflake.gen();
    const position = data.length ?? 0;
    const assetId = "2662847145319592";

    const newCategory: GetCategoryType = {
        categoryId: id,
        types: newData.types,
        label: newData.label || "Untitled",
        position,
        createdBy: window.session.userId,
        lastEditedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        blocks: []
    };

    try {
        const response = await fetch(`${apiBaseUrl}/v3/characters/insert/${assetId}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                categoryId: id,
                label: newCategory.label,
                types: newCategory.types,
                position,
            }),
        });

        if (!response.ok) {
            toast.show("Failed to create category on server", { type: "error" });
            return false;
        }
    } catch (error) {
        console.error("Failed to insert category:", error);
        toast.show("Error creating category", { type: "error" });
        return false;
    }

    setData((prev) => [newCategory, ...prev]);
    setActiveCategory(id);
    setActiveBlock(null);

    return true;
};

    const handleAddBlock = async (newData: NewBlockData): Promise<boolean> => {
        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        if (!targetCategoryId) {
            toast.show("No active category selected", { type: "error" });
            return false;
        }

        let fetchedRows: TemplateRowItemType[] = [];

        if (newData.blockId) {
            try {
                const res = await fetch(`${apiBaseUrl}/v3/templates/data/${newData.blockId}`, {
                    credentials: "include",
                });

                if (res.ok) {
                    const json = await res.json();
                    fetchedRows = json.items ?? [];
                } else {
                    toast.show("Failed to fetch rows for this block", { type: "error" });
                }
            } catch (error) {
                console.error("Failed to fetch block rows:", error);
                toast.show("Error fetching block rows", { type: "error" });
            }
        }

        const rawRows = fetchedRows.length > 0 ? fetchedRows : (newData.rows ?? []);

        const existingFieldIds = new Set<string>();
        data.forEach((category) => {
            category.blocks?.forEach((block) => {
                block.rows?.forEach((row) => {
                    row.fields?.forEach((field) => {
                        if (field.fieldId) {
                            existingFieldIds.add(field.fieldId);
                        }
                    });
                });
            });
        });

        const getUniqueFieldId = (id: string): string => {
            let uniqueId = id;
            while (existingFieldIds.has(uniqueId)) {
                const random4Digits = Math.floor(1000 + Math.random() * 9000);
                uniqueId = `${id}-${random4Digits}`;
            }
            existingFieldIds.add(uniqueId);
            return uniqueId;
        };

        const uniqueRows = rawRows.map((row) => ({
            ...row,
            fields: row.fields?.map((field) => ({
                ...field,
                fieldId: getUniqueFieldId(field.fieldId),
            })) ?? [],
        }));

        const newBlockId = snowflake.gen();

        const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
        const position = targetCategory?.blocks?.length ?? 0;

        // DEVELOPER NEEDED: REMOVE THIS
        const assetId = "2662847145319592";

        try {
            const response = await fetch(`${apiBaseUrl}/v3/characters/insert/${assetId}/blocks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    blockId: newBlockId,
                    categoryId: targetCategoryId,
                    sourceBlockId: newData.blockId ?? null,
                    icon: newData.icon ?? null,
                    label: newData.label ?? null,
                    description: newData.description ?? null,
                    position,
                }),
            });

            if (!response.ok) {
                toast.show("Failed to create block on server", { type: "error" });
                return false;
            }
        } catch (error) {
            console.error("Failed to insert block:", error);
            toast.show("Error creating block", { type: "error" });
            return false;
        }

        const newBlock: GetBlockItemType = {
            blockId: newBlockId,
            label: newData.label,
            description: newData.description,
            icon: newData.icon,
            position,
            createdBy: window.session.userId,
            lastEditedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            rows: uniqueRows,
        };

        setData((prev: GetCategoryType[]) =>
            prev.map((category) => {
                if (category.categoryId !== targetCategoryId) return category;

                const currentBlocks = category.blocks ?? [];
                return {
                    ...category,
                    blocks: [
                        ...currentBlocks,
                        {
                            ...newBlock,
                            position: currentBlocks.length,
                        },
                    ],
                };
            })
        );

        setActiveBlock(newBlockId);

        return true;
    };

    const handleAddRow = async (): Promise<void> => {
    if (!activeBlock) return;

    const targetCategoryId = activeCategory ?? currentCategory?.categoryId;
    const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
    const targetBlock = targetCategory?.blocks.find((b) => b.blockId === activeBlock);
    
    if (!targetBlock) return;

    const newRowId = snowflake.gen();
    const position = targetBlock.rows?.length ?? 0;
    const assetId = "2662847145319592";

    try {
        const response = await fetch(`${apiBaseUrl}/v3/characters/insert/${assetId}/rows`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                rowId: newRowId,
                blockId: activeBlock,
                position,
            }),
        });

        if (!response.ok) {
            toast.show("Failed to create row on server", { type: "error" });
            return;
        }
    } catch (error) {
        console.error("Failed to insert row:", error);
        toast.show("Error creating row", { type: "error" });
        return;
    }

    const newRow: GetRowType = {
        rowId: newRowId,
        position,
        createdBy: window.session.userId,
        createdDate: new Date().toISOString(),
        fields: []
    };

    setData((prev: GetCategoryType[]) =>
        prev.map((category) => {
            if (category.categoryId !== targetCategoryId) return category;

            return {
                ...category,
                blocks: category.blocks.map((block) => {
                    if (block.blockId !== activeBlock) return block;

                    const currentRows = block.rows ?? [];
                    return {
                        ...block,
                        rows: [...currentRows, { ...newRow, position: currentRows.length }],
                    };
                }),
            };
        })
    );
};

    const handleAddField = async (rowId: string, newData: NewFieldData): Promise<boolean> => {
    if (!activeBlock) return false;

    if (!newData.id.trim()) {
        toast.show("Field ID is required", { type: "error" });
        return false;
    }

    const targetCategoryId = activeCategory ?? currentCategory?.categoryId;
    const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
    const targetBlock = targetCategory?.blocks.find((b) => b.blockId === activeBlock);
    const targetRow = targetBlock?.rows.find((r) => r.rowId === rowId);

    if (!targetRow) return false;

    const existingFields = targetRow.fields || [];

    if (existingFields.length >= 5) {
        toast.show("A row cannot contain more than 5 fields", { type: "error" });
        return false;
    }

    const isDuplicateId = data.some((category) =>
        category.blocks.some((block) =>
            block.rows.some((row) =>
                (row.fields || []).some((field) => field.fieldId === newData.id)
            )
        )
    );

    if (isDuplicateId) {
        toast.show(`A field with ID "${newData.id}" already exists`, { type: "error" });
        return false;
    }

    const initialContent = newData.value ?? "";
    const position = existingFields.length;
    const assetId = "2662847145319592";

    try {
        const response = await fetch(`${apiBaseUrl}/v3/characters/insert/${assetId}/fields`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                fieldId: newData.id,
                rowId,
                type: newData.type,
                label: newData.label,
                placeholder: newData.placeholder ?? "",
                options: newData.options ?? [],
                guide: newData.guide ?? "",
                value: initialContent,
                position,
            }),
        });

        if (!response.ok) {
            toast.show("Failed to create field on server", { type: "error" });
            return false;
        }
    } catch (error) {
        console.error("Failed to insert field:", error);
        toast.show("Error creating field", { type: "error" });
        return false;
    }

    valuesMapRef.current[newData.id] = initialContent;

    const newField: GetFieldType = {
        fieldId: newData.id,
        type: newData.type,
        label: newData.label,
        placeholder: newData.placeholder ?? "",
        options: newData.options ?? [],
        guide: newData.guide ?? "",
        isLocked: false,
        position,
        createdBy: window.session.userId,
        lastEditedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        value: {
            author: initialContent ? window.session.userId : "",
            content: initialContent,
            date: initialContent ? new Date().toISOString() : "",
        },
        notes: []
    };

    setData((prev: GetCategoryType[]) =>
        prev.map((category) => {
            if (category.categoryId !== targetCategoryId) return category;

            return {
                ...category,
                blocks: category.blocks.map((block) => {
                    if (block.blockId !== activeBlock) return block;

                    return {
                        ...block,
                        rows: block.rows.map((row) => {
                            if (row.rowId !== rowId) return row;

                            return {
                                ...row,
                                fields: [...existingFields, newField],
                            };
                        }),
                    };
                }),
            };
        })
    );

    return true;
};

    const handleDragStart = (event: DragStartEvent): void => {
        if (isPreviewMode) return;
        setActiveId(String(event.active.id));
        document.body.style.cursor = "grabbing";
    };

    const handleDragOver = (event: DragOverEvent): void => {
        if (isPreviewMode) return;
        const { active, over } = event;
        if (!over) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (!activeIdStr.startsWith("field:")) return;

        const activeFieldId = activeIdStr.replace("field:", "");
        const overType = overIdStr.includes(":") ? overIdStr.split(":")[0] : "field";
        const overRawId = overIdStr.includes(":") ? overIdStr.split(":")[1] : overIdStr;

        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        setData((prevData) => {
            const category = prevData.find((c) => c.categoryId === targetCategoryId);
            if (!category) return prevData;

            const block = category.blocks.find((b) => b.blockId === activeBlock);
            if (!block) return prevData;

            const sourceRow = block.rows.find((r) =>
                (r.fields || []).some((f) => f.fieldId === activeFieldId)
            );
            if (!sourceRow) return prevData;

            let targetRow: typeof sourceRow | undefined;

            if (overType === "field") {
                targetRow = block.rows.find((r) =>
                    (r.fields || []).some((f) => f.fieldId === overRawId)
                );
            } else if (overType === "row-fields" || overType === "row") {
                targetRow = block.rows.find((r) => r.rowId === overRawId);
            }

            if (!targetRow) return prevData;

            const targetRowId = targetRow.rowId;

            if (sourceRow.rowId === targetRowId) return prevData;

            if ((targetRow.fields || []).length >= 5) {
                if (Date.now() - lastToast > 5000) {
                    toast.show("A row cannot contain more than 5 fields", { type: "error" });
                    setLastToast(Date.now());
                }

                return prevData;
            }

            const movedField = sourceRow.fields.find((f) => f.fieldId === activeFieldId);
            if (!movedField) return prevData;

            return prevData.map((cat) => {
                if (cat.categoryId !== targetCategoryId) return cat;

                return {
                    ...cat,
                    blocks: cat.blocks.map((b) => {
                        if (b.blockId !== activeBlock) return b;

                        return {
                            ...b,
                            rows: b.rows.map((row) => {
                                if (row.rowId === sourceRow.rowId) {
                                    return {
                                        ...row,
                                        fields: row.fields.filter((f) => f.fieldId !== activeFieldId),
                                    };
                                }

                                if (row.rowId === targetRowId) {
                                    const overIndex = row.fields.findIndex((f) => f.fieldId === overRawId);
                                    const newIndex = overIndex >= 0 ? overIndex : row.fields.length;

                                    const nextFields = [...row.fields];
                                    nextFields.splice(newIndex, 0, movedField);

                                    return {
                                        ...row,
                                        fields: nextFields,
                                    };
                                }

                                return row;
                            }),
                        };
                    }),
                };
            });
        });
    };

    const handleDragEnd = (event: DragEndEvent): void => {
        if (isPreviewMode) return;

        const { active, over } = event;
        setActiveId(null);
        document.body.style.cursor = "";

        if (!over || active.id === over.id) return;

        const activeIdString = String(active.id);
        const overIdString = String(over.id);

        const [activeType, activeIdValue] = activeIdString.includes(":")
            ? activeIdString.split(":")
            : ["field", activeIdString];

        const [, overIdValue] = overIdString.includes(":")
            ? overIdString.split(":")
            : ["field", overIdString];

        const assetId = "2662847145319592";

        if (activeType === "category") {
            const oldIndex = data.findIndex((c) => c.categoryId === activeIdValue);
            const newIndex = data.findIndex((c) => c.categoryId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalData = data;
                const reorderedCategories = arrayMove(originalData, oldIndex, newIndex);

                setData(reorderedCategories);

                queueMicrotask(async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);

                    const revertUI = () => setData(originalData);

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/characters/update/${assetId}/categories/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                data: reorderedCategories.map((c) => ({ categoryId: c.categoryId })),
                            }),
                        });

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            revertUI();
                            toast.show("Failed to update category positions", { type: "error" });
                        }
                    } catch (error: any) {
                        clearTimeout(timeoutId);
                        revertUI();

                        if (error.name === "AbortError") {
                            toast.show("Request timed out. Reverting positions...", { type: "error" });
                        } else {
                            console.error("Failed to update category positions:", error);
                            toast.show("Error saving category positions", { type: "error" });
                        }
                    }
                });
            }
            return;
        }

        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        if (activeType === "block") {
            const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
            if (!targetCategory) return;

            const oldIndex = targetCategory.blocks.findIndex((b) => b.blockId === activeIdValue);
            const newIndex = targetCategory.blocks.findIndex((b) => b.blockId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalBlocks = targetCategory.blocks;
                const reorderedBlocks = arrayMove(originalBlocks, oldIndex, newIndex);

                setData((prev: GetCategoryType[]) =>
                    prev.map((category) =>
                        category.categoryId === targetCategoryId
                            ? { ...category, blocks: reorderedBlocks }
                            : category
                    )
                );

                queueMicrotask(async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);

                    const revertUI = () => {
                        setData((prev: GetCategoryType[]) =>
                            prev.map((category) =>
                                category.categoryId === targetCategoryId
                                    ? { ...category, blocks: originalBlocks }
                                    : category
                            )
                        );
                    };

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/characters/update/${assetId}/blocks/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                data: reorderedBlocks.map((block) => ({ blockId: block.blockId })),
                            }),
                        });

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            revertUI();
                            toast.show("Failed to update block positions", { type: "error" });
                        }
                    } catch (error: any) {
                        clearTimeout(timeoutId);
                        revertUI();

                        if (error.name === "AbortError") {
                            toast.show("Request timed out. Reverting positions...", { type: "error" });
                        } else {
                            console.error("Failed to update block positions:", error);
                            toast.show("Error saving block positions", { type: "error" });
                        }
                    }
                });
            }
            return;
        }

        if (activeType === "row") {
            const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.find((b) => b.blockId === activeBlock);
            if (!targetBlockItem) return;

            const oldIndex = targetBlockItem.rows.findIndex((r) => r.rowId === activeIdValue);
            const newIndex = targetBlockItem.rows.findIndex((r) => r.rowId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalRows = targetBlockItem.rows;
                const reorderedRows = arrayMove(originalRows, oldIndex, newIndex);

                setData((prev: GetCategoryType[]) =>
                    prev.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: category.blocks.map((block) => {
                                if (block.blockId !== activeBlock) return block;

                                return {
                                    ...block,
                                    rows: reorderedRows,
                                };
                            }),
                        };
                    })
                );

                queueMicrotask(async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);

                    const revertUI = () => {
                        setData((prev: GetCategoryType[]) =>
                            prev.map((category) => {
                                if (category.categoryId !== targetCategoryId) return category;

                                return {
                                    ...category,
                                    blocks: category.blocks.map((block) => {
                                        if (block.blockId !== activeBlock) return block;

                                        return {
                                            ...block,
                                            rows: originalRows,
                                        };
                                    }),
                                };
                            })
                        );
                    };

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/characters/update/${assetId}/rows/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                blockId: activeBlock,
                                data: reorderedRows.map((row) => ({ rowId: row.rowId })),
                            }),
                        });

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            revertUI();
                            toast.show("Failed to update row positions", { type: "error" });
                        }
                    } catch (error: any) {
                        clearTimeout(timeoutId);
                        revertUI();

                        if (error.name === "AbortError") {
                            toast.show("Request timed out. Reverting positions...", { type: "error" });
                        } else {
                            console.error("Failed to update row positions:", error);
                            toast.show("Error saving row positions", { type: "error" });
                        }
                    }
                });
            }
            return;
        }

        if (activeType === "field") {
            const targetCategory = data.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.find((b) => b.blockId === activeBlock);
            if (!targetBlockItem) return;

            const targetRow = targetBlockItem.rows.find((r) =>
                (r.fields || []).some((f) => f.fieldId === activeIdValue)
            );

            if (!targetRow) return;

            if ((targetRow.fields || []).length > 5) {
                toast.show("A row cannot contain more than 5 fields", { type: "error" });
                return;
            }

            const oldIndex = targetRow.fields.findIndex((f) => f.fieldId === activeIdValue);
            const newIndex = targetRow.fields.findIndex((f) => f.fieldId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalFields = targetRow.fields;
                const reorderedFields = arrayMove(originalFields, oldIndex, newIndex);

                setData((prev: GetCategoryType[]) =>
                    prev.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: category.blocks.map((block) => {
                                if (block.blockId !== activeBlock) return block;

                                return {
                                    ...block,
                                    rows: block.rows.map((row) =>
                                        row.rowId === targetRow.rowId
                                            ? { ...row, fields: reorderedFields }
                                            : row
                                    ),
                                };
                            }),
                        };
                    })
                );

                queueMicrotask(async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);

                    const revertUI = () => {
                        setData((prev: GetCategoryType[]) =>
                            prev.map((category) => {
                                if (category.categoryId !== targetCategoryId) return category;

                                return {
                                    ...category,
                                    blocks: category.blocks.map((block) => {
                                        if (block.blockId !== activeBlock) return block;

                                        return {
                                            ...block,
                                            rows: block.rows.map((row) =>
                                                row.rowId === targetRow.rowId
                                                    ? { ...row, fields: originalFields }
                                                    : row
                                            ),
                                        };
                                    }),
                                };
                            })
                        );
                    };

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/characters/update/${assetId}/fields/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                rowId: targetRow.rowId,
                                data: reorderedFields.map((field) => ({ fieldId: field.fieldId })),
                            }),
                        });

                        clearTimeout(timeoutId);

                        if (!response.ok) {
                            revertUI();
                            toast.show("Failed to update field positions", { type: "error" });
                        }
                    } catch (error: any) {
                        clearTimeout(timeoutId);
                        revertUI();

                        if (error.name === "AbortError") {
                            toast.show("Request timed out. Reverting positions...", { type: "error" });
                        } else {
                            console.error("Failed to update field positions:", error);
                            toast.show("Error saving field positions", { type: "error" });
                        }
                    }
                });
            }
        }
    };

    useEffect(() => {
        if (!activeBlock || activeBlock === "about") {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            window.location.hash = activeBlock;
        }
    }, [activeBlock]);

    const setBlock = (block?: string | null): void => {
        if (!block || block === "about") {
            setActiveBlock(null);
        } else {
            setActiveBlock(block);
        }
    };

    useEffect(() => {
        const updateBlock = () => {
            const hash = window.location.hash.replace("#", "");
            setActiveBlock(hash ? hash : null);
        };

        window.addEventListener("hashchange", updateBlock);
        updateBlock();

        return () => window.removeEventListener("hashchange", updateBlock);
    }, []);

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata title="Development" allowIndex="false" />

            <NewCategoryModal onAddCategory={handleAddCategory} />

            <NewFieldModal
                targetRowId={targetRowId as string}
                onAddField={handleAddField}
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
                        <nav className="navbar w-full bg-base-100 flex items-center justify-between px-4">
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
                                <span className="font-medium">Example Character Here</span>
                                <div className="text-sub text-xs">Author</div>
                            </div>

                            <button
                                type="button"
                                aria-label="toggle preview mode"
                                onClick={() => setIsPreviewMode(!isPreviewMode)}
                                className="btn btn-square btn-ghost hover:bg-base-100 hover:border-base-100"
                            >
                                <span className="flex h-8 w-4 leading-none items-center justify-center">
                                    <span className="font-nerdfont text-xl">
                                        {isPreviewMode ? "󰈉" : "󰈈"}
                                    </span>
                                </span>
                            </button>
                        </nav>

                        <div className="flex flex-col items-center p-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-full max-w-5xl">
                                {currentCategory && (
                                    <>
                                        {!activeBlock ? (
                                            <div className="p-2 md:p-4">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-2xl font-bold">
                                                        {currentCategory?.label}
                                                    </h2>
                                                </div>

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

                                                {(() => {
                                                    const query = searchQuery.trim().toLowerCase();

                                                    const filteredBlocks = (currentCategory?.blocks ?? []).filter(block => 
                                                        !query || 
                                                        block.blockId?.toLowerCase().includes(query) || 
                                                        block.label?.toLowerCase().includes(query) ||
                                                        block.description?.toLowerCase().includes(query)
                                                    );

                                                    return (
                                                        <SortableContext
                                                            items={filteredBlocks.map(block => `block:${block.blockId}`)}
                                                            strategy={rectSortingStrategy}
                                                        >
                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                                {filteredBlocks.map(block => (
                                                                    <SortableItem key={block.blockId} id={`block:${block.blockId}`} disabled={isPreviewMode}>
                                                                        {({ sortableProps, dragHandleProps }) => (
                                                                            <button
                                                                                {...sortableProps}
                                                                                className={`aspect-square relative flex flex-col items-center justify-center p-2 bg-base-200 hover:bg-base-300 border border-base-300 rounded transition-all shadow-xs cursor-pointer ${sortableProps.className ?? ""}`}
                                                                                onClick={() => setBlock(block.blockId)}
                                                                            >
                                                                                {!isPreviewMode && (
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

                                                                                {!isPreviewMode && (
                                                                                    <div
                                                                                        className="absolute top-2 right-2 p-1 touch-none"
                                                                                        onClick={(e) => e.stopPropagation()}
                                                                                    >
                                                                                        <span className="text-lg leading-none font-nerdfont">
                                                                                            󰇘
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                
                                                                                <img 
                                                                                    className="h-20 rounded" 
                                                                                    src={block?.icon} 
                                                                                    alt={block?.label} 
                                                                                />
                                                                                <span className="text-lg font-semibold mt-2">{block.label}</span>
                                                                                <span className="text-xs text-sub mt-1">{block.description}</span>
                                                                            </button>
                                                                        )}
                                                                    </SortableItem>
                                                                ))}

                                                                {!isPreviewMode && (
                                                                    <NewBlockModal 
                                                                        onAddBlock={handleAddBlock} 
                                                                        types={currentCategory?.types ?? []} 
                                                                    />
                                                                )}

                                                                {!isPreviewMode && (currentCategory?.blocks.length ?? 0) <= 32 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => (document.getElementById("new-block") as HTMLDialogElement | null)?.showModal()}
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
                                                        onClick={() => setBlock(null)}
                                                    >
                                                        <span className="font-nerdfont text-lg leading-none">
                                                            
                                                        </span> 
                                                        
                                                        Back to All
                                                    </button>
                                                    <div className="h-5 w-px bg-base-300" />
                                                    <h2 className="text-xl font-bold">
                                                        {currentCategory?.blocks?.find(t => t.blockId === activeBlock)?.label ?? activeBlock}
                                                    </h2>
                                                </div>

                                                <SortableContext
                                                    items={currentBlock?.rows?.map(row => `row:${row.rowId}`) ?? []}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="flex flex-col gap-1">
                                                        {currentBlock?.rows?.map(row => {
                                                            const visibleFields = (row.fields || []).filter(field => {
                                                                if (!isPreviewMode) return true;
                                                                const raw = field.value?.content;
                                                                return Boolean(raw && raw.trim() !== "");
                                                            });

                                                            if (isPreviewMode && visibleFields.length === 0) {
                                                                return null;
                                                            }

                                                            return (
                                                                <SortableItem key={row.rowId} id={`row:${row.rowId}`} disabled={isPreviewMode}>
                                                                    {({ sortableProps, dragHandleProps }) => (
                                                                        <div {...sortableProps} className={` min-h-16 flex gap-3 ${sortableProps.className ?? ""}`}>
                                                                            {!isPreviewMode && (
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
                                                                                                <SortableItem key={field.fieldId} id={`field:${field.fieldId}`} disabled={isPreviewMode}>
                                                                                                    {({ sortableProps: fSortProps, dragHandleProps: fDragProps }) => {
                                                                                                        const dragProps = fDragProps ?? {};
                                                                                                        
                                                                                                        return (
                                                                                                            <div 
                                                                                                                {...fSortProps} 
                                                                                                                className={`flex-${field.flex} min-w-0 ${fSortProps.className ?? ""}`}
                                                                                                            >
                                                                                                                <TemplateField
                                                                                                                    id={field.fieldId}
                                                                                                                    type={field.type}
                                                                                                                    label={resolvedLabel}
                                                                                                                    placeholder={resolvedPlaceholder}
                                                                                                                    guide={resolvedGuide}
                                                                                                                    value={{
                                                                                                                        ...field.value,
                                                                                                                        content: isPreviewMode ? resolvedValue : rawContent,
                                                                                                                    }}
                                                                                                                    options={field.options}
                                                                                                                    notes={field.notes}
                                                                                                                    thoughts={field.thoughts}
                                                                                                                    onChange={(value) => handleFieldChange(field.fieldId, value)}
                                                                                                                    dragHandleProps={!isPreviewMode ? {
                                                                                                                        ...dragProps,
                                                                                                                        className: `${dragProps.className ?? ""} touch-none cursor-grab active:cursor-grabbing`.trim(),
                                                                                                                    } : undefined}
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

                                                                            {!isPreviewMode && (row.fields?.length ?? 0) < 5 && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => {
                                                                                        setTargetRowId(row.rowId);
                                                                                        (document.getElementById("new-field") as HTMLDialogElement | null)?.showModal();
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
                                                            );
                                                        })}
                                                    </div>
                                                </SortableContext>

                                                {!isPreviewMode && (
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
                                <SortableContext items={data.map(category => `category:${category.categoryId}`)}>
                                    <ul>
                                        {data.map(category => (
                                            <SortableItem key={category.categoryId} id={`category:${category.categoryId}`} disabled={isPreviewMode}>
                                                {({ sortableProps, dragHandleProps }) => (
                                                    <li {...sortableProps} className={sortableProps.className}>
                                                        <button
                                                            className="flex items-center h-12 gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip={category.label}
                                                            onClick={() => {
                                                                setActiveCategory(category.categoryId);
                                                                setBlock(null);
                                                            }}
                                                        >
                                                            {!isPreviewMode && (
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

                                        {!isPreviewMode && (
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
                            </div>
                        </div>
                    </div>
                </div>

                <DragOverlay dropAnimation={null} zIndex={1000} />
            </DndContext>
        </>
    );
}