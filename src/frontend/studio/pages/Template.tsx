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

import { GetTemplateCategoryItemType } from "../../../_common/types/template/category.type.js";
import { GetTemplateBlockItemType } from "../../../_common/types/template/block.type.js";
import { apiBaseUrl } from "../../_common/scripts/domains.js";
import { snowflake } from "../scripts/main.js";
import NewCategoryModal, { NewCategoryType } from "../components/modals/NewCategoryModal.js";
import { toast } from "../../_common/scripts/toast.js";
import Metadata from "../../_common/components/Metadata.js";
import { GetTemplateItemType } from "../../../_common/types/template/template.type.js";
import NewFieldModal from "../components/modals/NewFieldModal.js";
import NewBlockModal from "../components/modals/NewBlockModal.js";

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

    const [searchQuery, setSearchQuery] = useState("");

    const [isDrawerOpen, setIsDrawerOpen] = useState(true);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [lastToast, setLastToast] = useState<number>(0);

    const debounceTimers = useRef<{ [fieldId: string]: NodeJS.Timeout }>({});
    const valuesMapRef = useRef<{ [fieldId: string]: string }>({});

    const [isTemplateLoading, setIsTemplateLoading] = useState<boolean>(true);

    const [template, setTemplate] = useState<GetTemplateItemType>();
    const [templateData, setTemplateData] = useState<GetTemplateCategoryItemType[]>([]);

    const [currentLocation, setCurrentLocation] = useState<{ categoryId?: string; blockId?: string }>({});
    const [currentCategoryData, setCurrentCategoryData] = useState<GetTemplateCategoryItemType>();
    const [currentBlockData, setCurrentBlockData] = useState<GetTemplateBlockItemType>();

    const [activeDragId, setActiveDragId] = useState<string>();
    const [dragTargetRowId, setDragTargetRowId] = useState<string>();

    const currentCategoryId =
        currentLocation.categoryId 
        || categoryId 
        || templateData[0]?.categoryId;

    const currentBlockId = 
        blockId 
        || currentLocation.blockId 
        || "";

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
                setIsTemplateLoading(false);
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
            category.blocks?.forEach((blockWrapper) => {
                blockWrapper.items?.forEach((block) => {
                    block.rows?.forEach((rowWrapper) => {
                        rowWrapper.items.forEach((row) => {
                            row.fields?.forEach((fieldWrapper) => {
                                fieldWrapper.items.forEach((field) => {
                                    if (
                                        field.fieldId &&
                                        field.value?.content !== undefined
                                    ) {
                                        valuesMapRef.current[field.fieldId] = field.value.content;
                                    }
                                });
                            });
                        });
                    });
                });
            });
        });
    }, [templateData]);

    const resolveDynamicValues = useCallback((text: string | undefined): string => {
        if (!text) return "";

        return text.replace(/\{([^}]+)\}/g, (match, fieldId) => {
            const trimmedId = fieldId.trim();

            if (valuesMapRef.current[trimmedId] !== undefined) {
                return valuesMapRef.current[trimmedId] || match;
            }

            templateData.forEach((category) => {
                category.blocks?.forEach((blockWrapper) => {
                    blockWrapper.items?.forEach((block) => {
                        block.rows?.forEach((rowWrapper) => {
                            rowWrapper.items.forEach((row) => {
                                row.fields?.forEach((fieldWrapper) => {
                                    fieldWrapper.items.forEach((field) => {
                                        if (field.fieldId === trimmedId) {
                                            return field.value?.content || match;
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });

            return match;
        });
    }, [templateData]);

    useEffect(() => {
        if (categoryId) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentLocation((prev) => ({ ...prev, categoryId }));
        }

        if (blockId) {
            setCurrentLocation((prev) => ({ ...prev, blockId }));
        }
    }, [categoryId, blockId]);

    useEffect(() => {
        if (!templateData.length || isTemplateLoading || !templateId) return;

        if (!categoryId && currentCategoryId) {
            const targetUrl = currentBlockId
                ? `/template/${templateId}/${currentCategoryId}/${currentBlockId}`
                : `/template/${templateId}/${currentCategoryId}`;

            navigate(targetUrl, { replace: true });
        }
    }, [categoryId, currentCategoryId, currentBlockId, templateId, templateData.length, isTemplateLoading, navigate]);

    useEffect(() => {
        if (!templateData.length || !currentCategoryId) return;

        const category = templateData.find(
            (c) => String(c.categoryId) === String(currentCategoryId)
        );

        if (category) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentCategoryData(category);

            let foundBlock: GetTemplateBlockItemType | undefined;

            if (category?.blocks && currentBlockId) {
                for (const blockWrapper of category.blocks) {
                    const matched = blockWrapper.items?.find(
                        (b) => String(b.blockId) === String(currentBlockId)
                    );

                    if (matched) {
                        foundBlock = matched;
                        break;
                    }
                }
            }

            setCurrentBlockData(foundBlock);
        }
    }, [templateData, currentCategoryId, currentBlockId]);

    const setCurrentCategory = useCallback(
        (newCategoryId: string) => {
            setCurrentLocation({ categoryId: newCategoryId, blockId: "" });

            navigate(`/template/${templateId}/${newCategoryId}`);
        },
        [navigate, templateId]
    );

    const setCurrentBlock = useCallback(
        (newBlockId: string, targetCategoryId?: string) => {
            const categoryToUse = targetCategoryId || currentLocation.categoryId || categoryId || templateData[0]?.categoryId;

            setCurrentLocation((prev) => ({
                categoryId: targetCategoryId || prev.categoryId,
                blockId: newBlockId,
            }));

            if (categoryToUse) {
                navigate(`/template/${templateId}/${categoryToUse}/${newBlockId}`);
            }
        },
        [currentLocation.categoryId, categoryId, templateData, navigate, templateId]
    );

    const scrollToField = useCallback((fieldId: string) => {
        if (!fieldId) return;

        setTimeout(() => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "center" });

                if ("focus" in element && typeof element.focus === "function") {
                    element.focus({ preventScroll: true });
                }
            }
        }, 150);
    }, []);

    useEffect(() => {
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
    }, [scrollToField]);

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
        const activeDragIdStr = String(active?.id ?? "");

        if (activeDragIdStr.startsWith("category:") || activeDragIdStr.startsWith("row:")) {
            return restrictToVerticalAxis(args);
        }

        return args.transform;
    }, []);

    const handleAddCategory = async (incoming: NewCategoryType): Promise<boolean> => {
        const newCategory: GetTemplateCategoryItemType = {
            categoryId: snowflake.gen(),
            types: incoming?.types,
            label: incoming?.label || "Untitled",
            position: templateData?.length ?? 0,
            createdBy: window.session.userId,
            updatedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            blocks: [],
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
                        categoryId: newCategory.categoryId,
                        label: newCategory.label,
                        types: newCategory.types,
                        position: newCategory.position,
                    }),
                }
            );

            const json = await response.json();

            if (!response.ok) {
                toast.show(
                    "Failed to create category",
                    {
                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                        type: "error",
                    }
                );

                return false;
            }
        } catch (error) {
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

        setCurrentLocation({ categoryId: newCategory.categoryId, blockId: "" });
        setCurrentCategoryData(newCategory);
        setTemplateData((prev) => [...prev, newCategory]);

        navigate(`/template/${templateId}/${newCategory.categoryId}`);

        return true;
    };

















































    













    const handleFieldChange = (fieldId: string, newValue: string) => {
        valuesMapRef.current[fieldId] = newValue;

        setTemplateData((prev: GetCategoryType[]) =>
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
                                updatedDate: new Date().toISOString(),
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

    

    const handleAddBlock = async (newtemplate: NewBlocktemplate): Promise<boolean> => {
        const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;

        if (!targetCategoryId) {
            toast.show("No active category selected", { type: "error" });
            return false;
        }

        let fetchedRows: TemplateRowItemType[] = [];

        if (newtemplateData?.blockId) {
            try {
                const res = await fetch(`${apiBaseUrl}/v3/templates/blocks/template/${newtemplateData?.blockId}`, {
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

        const rawRows = fetchedRows.length > 0 ? fetchedRows : (newtemplateData?.rows ?? []);

        const existingFieldIds = new Set<string>();
        templateData?.forEach((category) => {
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

        const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
        const position = targetCategory?.blocks?.length ?? 0;

        try {
            const response = await fetch(`${apiBaseUrl}/v3/templates/insert/${templateId}/blocks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    blockId: newBlockId,
                    categoryId: String(BigInt(targetCategory)),
                    sourceBlockId: newtemplateData?.blockId ?? null,
                    icon: newtemplateData?.icon ?? null,
                    label: newtemplateData?.label ?? null,
                    description: newtemplateData?.description ?? null,
                    position,
                }),
            });

            if (!response.ok) {
                toast.show("Failed to create block", { type: "error" });
                return false;
            }
        } catch (error) {
            console.error("Failed to insert block:", error);
            toast.show("Error creating block", { type: "error" });
            return false;
        }

        const newBlock: GetBlockItemType = {
            blockId: newBlockId,
            label: newtemplateData?.label,
            description: newtemplateData?.description,
            icon: newtemplateData?.icon,
            position,
            createdBy: window.session.userId,
            updatedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            rows: uniqueRows,
        };

        setTemplateData((prev: GetCategoryType[]) =>
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

        setCurrentBlockId(newBlockId);

        return true;
    };

    const handleAddRow = async (): Promise<void> => {
    if (!currentBlockId) return;

    const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;
    const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
    const targetBlock = targetCategory?.blocks.find((b) => b.blockId === currentBlockId);
    
    if (!targetBlock) return;

    const newRowId = snowflake.gen();
    const position = targetBlock.rows?.length ?? 0;

    try {
        const response = await fetch(`${apiBaseUrl}/v3/templates/insert/${templateId}/rows`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                rowId: newRowId,
                blockId: currentBlockId,
                position,
            }),
        });

        if (!response.ok) {
            toast.show("Failed to create row", { type: "error" });
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

    setTemplateData((prev: GetCategoryType[]) =>
        prev.map((category) => {
            if (category.categoryId !== targetCategoryId) return category;

            return {
                ...category,
                blocks: category.blocks.map((block) => {
                    if (block.blockId !== currentBlockId) return block;

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

    const handleAddField = async (rowId: string, newtemplate: NewFieldtemplate): Promise<boolean> => {
    if (!currentBlockId) return false;

    if (!newtemplateData?.id.trim()) {
        toast.show("Field ID is required", { type: "error" });
        return false;
    }

    const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;
    const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
    const targetBlock = targetCategory?.blocks.find((b) => b.blockId === currentBlockId);
    const targetRow = targetBlock?.rows.find((r) => r.rowId === rowId);

    if (!targetRow) return false;

    const existingFields = targetRow.fields || [];

    if (existingFields.length >= 5) {
        toast.show("A row cannot contain more than 5 fields", { type: "error" });
        return false;
    }

    const isDuplicateId = templateData?.some((category) =>
        category.blocks.some((block) =>
            block.rows.some((row) =>
                (row.fields || []).some((field) => field.fieldId === newtemplateData?.id)
            )
        )
    );

    if (isDuplicateId) {
        toast.show(`A field with ID "${newtemplateData?.id}" already exists`, { type: "error" });
        return false;
    }

    const initialContent = newtemplateData?.value ?? "";
    const position = existingFields.length;

    try {
        const response = await fetch(`${apiBaseUrl}/v3/templates/insert/${templateId}/fields`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                fieldId: newtemplateData?.id,
                rowId,
                type: newtemplateData?.type,
                label: newtemplateData?.label,
                placeholder: newtemplateData?.placeholder ?? "",
                options: newtemplateData?.options ?? [],
                guide: newtemplateData?.guide ?? "",
                value: initialContent,
                position,
            }),
        });

        if (!response.ok) {
            toast.show("Failed to create field", { type: "error" });
            return false;
        }
    } catch (error) {
        console.error("Failed to insert field:", error);
        toast.show("Error creating field", { type: "error" });
        return false;
    }

    valuesMapRef.current[newtemplateData?.id] = initialContent;

    const newField: GetFieldType = {
        fieldId: newtemplateData?.id,
        type: newtemplateData?.type,
        label: newtemplateData?.label,
        placeholder: newtemplateData?.placeholder ?? "",
        options: newtemplateData?.options ?? [],
        guide: newtemplateData?.guide ?? "",
        isLocked: false,
        position,
        createdBy: window.session.userId,
        updatedDate: new Date().toISOString(),
        createdDate: new Date().toISOString(),
        value: {
            author: initialContent ? window.session.userId : "",
            content: initialContent,
            date: initialContent ? new Date().toISOString() : "",
        },
        notes: []
    };

    setTemplateData((prev: GetCategoryType[]) =>
        prev.map((category) => {
            if (category.categoryId !== targetCategoryId) return category;

            return {
                ...category,
                blocks: category.blocks.map((block) => {
                    if (block.blockId !== currentBlockId) return block;

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
        setActiveDragId(String(event.active.id));
        document.body.style.cursor = "grabbing";
    };

    const handleDragOver = (event: DragOverEvent): void => {
        if (isPreviewMode) return;
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
            const category = prevtemplateData?.find((c) => c.categoryId === targetCategoryId);
            if (!category) return prevtemplate;

            const block = category.blocks.find((b) => b.blockId === currentBlockId);
            if (!block) return prevtemplate;

            const sourceRow = block.rows.find((r) =>
                (r.fields || []).some((f) => f.fieldId === activeFieldId)
            );
            if (!sourceRow) return prevtemplate;

            let targetRow: typeof sourceRow | undefined;

            if (overType === "field") {
                targetRow = block.rows.find((r) =>
                    (r.fields || []).some((f) => f.fieldId === overRawId)
                );
            } else if (overType === "row-fields" || overType === "row") {
                targetRow = block.rows.find((r) => r.rowId === overRawId);
            }

            if (!targetRow) return prevtemplate;

            const dragtargetRowId = targetRow.rowId;

            if (sourceRow.rowId === dragtargetRowId) return prevtemplate;

            if ((targetRow.fields || []).length >= 5) {
                if (Date.now() - lastToast > 5000) {
                    toast.show("A row cannot contain more than 5 fields", { type: "error" });
                    setLastToast(Date.now());
                }

                return prevtemplate;
            }

            const movedField = sourceRow.fields.find((f) => f.fieldId === activeFieldId);
            if (!movedField) return prevtemplate;

            return prevtemplateData?.map((cat) => {
                if (cat.categoryId !== targetCategoryId) return cat;

                return {
                    ...cat,
                    blocks: cat.blocks.map((b) => {
                        if (b.blockId !== currentBlockId) return b;

                        return {
                            ...b,
                            rows: b.rows.map((row) => {
                                if (row.rowId === sourceRow.rowId) {
                                    return {
                                        ...row,
                                        fields: row.fields.filter((f) => f.fieldId !== activeFieldId),
                                    };
                                }

                                if (row.rowId === dragtargetRowId) {
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
        setActiveDragId(null);
        document.body.style.cursor = "";

        if (!over || active.id === over.id) return;

        const activeDragIdString = String(active.id);
        const overIdString = String(over.id);

        const [activeType, activeDragIdValue] = activeDragIdString.includes(":")
            ? activeDragIdString.split(":")
            : ["field", activeDragIdString];

        const [, overIdValue] = overIdString.includes(":")
            ? overIdString.split(":")
            : ["field", overIdString];

        if (activeType === "category") {
            const oldIndex = templateData?.findIndex((c) => c.categoryId === activeDragIdValue);
            const newIndex = templateData?.findIndex((c) => c.categoryId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originaltemplate = template;
                const reorderedCategories = arrayMove(originaltemplate, oldIndex, newIndex);

                setTemplateData(reorderedCategories);

                queueMicrotask(async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1000);

                    const revertUI = () => setTemplateData(originaltemplate);

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/templates/update/${templateId}/categories/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                template: reorderedCategories.map((c) => ({ categoryId: c.categoryId })),
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

        const targetCategoryId = currentCategoryId ?? currentCategoryData?.categoryId;

        if (activeType === "block") {
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
            if (!targetCategory) return;

            const oldIndex = targetCategory.blocks.findIndex((b) => b.blockId === activeDragIdValue);
            const newIndex = targetCategory.blocks.findIndex((b) => b.blockId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalBlocks = targetCategory.blocks;
                const reorderedBlocks = arrayMove(originalBlocks, oldIndex, newIndex);

                setTemplateData((prev: GetCategoryType[]) =>
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
                        setTemplateData((prev: GetCategoryType[]) =>
                            prev.map((category) =>
                                category.categoryId === targetCategoryId
                                    ? { ...category, blocks: originalBlocks }
                                    : category
                            )
                        );
                    };

                    try {
                        const response = await fetch(`${apiBaseUrl}/v3/templates/update/${templateId}/blocks/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                template: reorderedBlocks.map((block) => ({ blockId: block.blockId })),
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
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.find((b) => b.blockId === currentBlockId);
            if (!targetBlockItem) return;

            const oldIndex = targetBlockItem.rows.findIndex((r) => r.rowId === activeDragIdValue);
            const newIndex = targetBlockItem.rows.findIndex((r) => r.rowId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalRows = targetBlockItem.rows;
                const reorderedRows = arrayMove(originalRows, oldIndex, newIndex);

                setTemplateData((prev: GetCategoryType[]) =>
                    prev.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: category.blocks.map((block) => {
                                if (block.blockId !== currentBlockId) return block;

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
                        setTemplateData((prev: GetCategoryType[]) =>
                            prev.map((category) => {
                                if (category.categoryId !== targetCategoryId) return category;

                                return {
                                    ...category,
                                    blocks: category.blocks.map((block) => {
                                        if (block.blockId !== currentBlockId) return block;

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
                        const response = await fetch(`${apiBaseUrl}/v3/templates/update/${templateId}/rows/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                blockId: currentBlockId,
                                template: reorderedRows.map((row) => ({ rowId: row.rowId })),
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
            const targetCategory = templateData?.find((c) => c.categoryId === targetCategoryId);
            const targetBlockItem = targetCategory?.blocks.find((b) => b.blockId === currentBlockId);
            if (!targetBlockItem) return;

            const targetRow = targetBlockItem.rows.find((r) =>
                (r.fields || []).some((f) => f.fieldId === activeDragIdValue)
            );

            if (!targetRow) return;

            if ((targetRow.fields || []).length > 5) {
                toast.show("A row cannot contain more than 5 fields", { type: "error" });
                return;
            }

            const oldIndex = targetRow.fields.findIndex((f) => f.fieldId === activeDragIdValue);
            const newIndex = targetRow.fields.findIndex((f) => f.fieldId === overIdValue);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                const originalFields = targetRow.fields;
                const reorderedFields = arrayMove(originalFields, oldIndex, newIndex);

                setTemplateData((prev: GetCategoryType[]) =>
                    prev.map((category) => {
                        if (category.categoryId !== targetCategoryId) return category;

                        return {
                            ...category,
                            blocks: category.blocks.map((block) => {
                                if (block.blockId !== currentBlockId) return block;

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
                        setTemplateData((prev: GetCategoryType[]) =>
                            prev.map((category) => {
                                if (category.categoryId !== targetCategoryId) return category;

                                return {
                                    ...category,
                                    blocks: category.blocks.map((block) => {
                                        if (block.blockId !== currentBlockId) return block;

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
                        const response = await fetch(`${apiBaseUrl}/v3/templates/update/${templateId}/fields/positions`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            signal: controller.signal,
                            body: JSON.stringify({
                                rowId: targetRow.rowId,
                                template: reorderedFields.map((field) => ({ fieldId: field.fieldId })),
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
        if (!currentCategoryData || !currentBlockId) return;

        const blockExists = currentCategoryData?.blocks.some(
            (block) => block.blockId === currentBlockId
        );

        if (!blockExists) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCurrentBlockId(null);
        }
    }, [currentCategoryData, currentBlockId]);






    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata 
                title={`${template?.displayName} Template`}
                allowIndex={false} 
            />

            <NewCategoryModal onAddCategory={handleAddCategory} />

            <NewFieldModal
                dragtargetRowId={dragTargetRowId as string}
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
                                {currentCategoryData && (
                                    <>
                                        {!currentBlockId ? (
                                            <div className="p-2 md:p-4">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-2xl font-bold">
                                                        {currentCategoryData?.label}
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

                                                    const filteredBlocks = (currentCategoryData?.blocks ?? []).filter(block => 
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
                                                                        types={currentCategoryData?.types ?? []} 
                                                                    />
                                                                )}

                                                                {!isPreviewMode && (currentCategoryData?.blocks.length ?? 0) <= 32 && (
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
                                                        {currentCategoryData?.blocks?.find(t => t.blockId === currentBlockId)?.label ?? currentBlockId}
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
                                                                                        setdragTargetRowId(row.rowId);
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
                                <SortableContext items={templateData?.map(category => `category:${category.categoryId}`)}>
                                    <ul>
                                        {templateData?.map(category => (
                                            <SortableItem key={category.categoryId} id={`category:${category.categoryId}`} disabled={isPreviewMode}>
                                                {({ sortableProps, dragHandleProps }) => (
                                                    <li {...sortableProps} className={sortableProps.className}>
                                                        <button
                                                            className="flex items-center h-12 gap-4 tooltip tooltip-accent tooltip-right"
                                                            template-tip={category.label}
                                                            onClick={() => {
                                                                setCurrentCategory(category.categoryId);
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
