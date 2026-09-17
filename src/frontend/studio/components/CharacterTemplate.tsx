import { useEffect, useState, useCallback, ReactNode, CSSProperties } from "react";
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
import { GetRowType } from "../../../_common/types/template/row.type.js";
import { GetFieldType } from "../../../_common/types/template/field.type.js";
import NewFieldModal, { NewFieldData } from "./modals/NewFieldModal.js";
import { snowflake } from "../scripts/main.js";
import { GetBlockItemType } from "../../../_common/types/template/block.type.js";
import NewBlockModal from "./modals/NewBlockModal.js";

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
}

export function FieldDropZone({ id, children, className = "" }: FieldDropZoneProps) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={className}>
            {children}
        </div>
    );
}

export function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

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

    const [lastToast, setLastToast] = useState<number>(0);
    const [targetRowId, setTargetRowId] = useState<string | null>(null);
    
    const [data, setData] = useState<GetCategoryType[]>([]);

    const [activeCategory, setActiveCategory] = useState<string | null>();
    const [activeBlock, setActiveBlock] = useState<string | null>();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [activeId, setActiveId] = useState<string | null>(null);

    const currentCategory =
        data.find((category) => category.categoryId === activeCategory) ?? data[0];

    const currentBlock = currentCategory?.blocks?.find(
        (block) => block.blockId === activeBlock
    );

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

    const handleAddCategory = (newData: NewCategoryData): boolean => {
        if (!newData.id.trim()) {
            toast.show("Category ID is required", { type: "error" });
            return false;
        }

        const isDuplicate = data.some((cat) => cat.categoryId === newData.id);

        if (isDuplicate) {
            toast.show(`A category with ID "${newData.id}" already exists`, { type: "error" });
            return false;
        }

        const newCategory: GetCategoryType = {
            categoryId: newData.id,
            types: newData.types,
            label: newData.label,
            position: data.length ?? 0,
            createdBy: window.session.userId,
            lastEditedDate: new Date().toISOString(),
            createdDate: new Date().toISOString(),
            blocks: []
        };

        setData((prev) => [newCategory, ...prev]);
        setActiveCategory(newData.id);
        setActiveBlock(null);

        // SAVE TO API

        return true;
    };

    const handleAddBlock = (newData: NewBlockData): boolean => {
        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        if (!targetCategoryId) {
            toast.show("No active category selected", { type: "error" });
            return false;
        }

        setData((prev: GetCategoryType[]) =>
            prev.map((category) => {
                if (category.categoryId !== targetCategoryId) return category;

                const newBlock: GetBlockItemType = {
                    blockId: snowflake.gen(),
                    label: newData.label,
                    description: newData.description,
                    icon: newData.icon,
                    position: category.blocks ? category.blocks.length : 0,
                    createdBy: window.session.userId,
                    lastEditedDate: new Date().toISOString(),
                    createdDate: new Date().toISOString(),
                    rows: newData.rows ?? [],
                };

                return {
                    ...category,
                    blocks: [...(category.blocks ?? []), newBlock],
                };
            })
        );

        setActiveBlock(newData.blockId);

        // SAVE TO API

        return true;
    };

    const handleAddRow = (): void => {
        if (!activeBlock) return;

        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        const newRow: GetRowType = {
            rowId: snowflake.gen(),
            position: 0,
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

        // SAVE TO API
    };

    const handleAddField = (rowId: string, newData: NewFieldData): boolean => {
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

                                const newField: GetFieldType = {
                                    fieldId: newData.id,
                                    type: newData.type,
                                    label: newData.label,
                                    placeholder: newData.placeholder ?? "",
                                    options: newData.options ?? [],
                                    guide: newData.guide ?? "",
                                    isLocked: false,
                                    position: existingFields.length,
                                    createdBy: window.session.userId,
                                    lastEditedDate: new Date().toISOString(),
                                    createdDate: new Date().toISOString(),
                                    value: {
                                        author: newData.value ? window.session.userId : "",
                                        content: newData.value ?? "",
                                        date: newData.value ? new Date().toISOString() : "",
                                    },
                                    notes: []
                                };

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

        // SAVE TO API

        return true;
    };

    const handleDragStart = (event: DragStartEvent): void => {
        setActiveId(String(event.active.id));
        document.body.style.cursor = "grabbing";
    };

    const handleDragOver = (event: DragOverEvent): void => {
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
        const { active, over } = event;
        setActiveId(null);
        document.body.style.cursor = "";

        if (!over || active.id === over.id) return;

        const activeIdString = String(active.id);
        const overIdString = String(over.id);

        const [activeType, activeIdVal] = activeIdString.includes(":")
            ? activeIdString.split(":")
            : ["field", activeIdString];

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [overType, overIdVal] = overIdString.includes(":")
            ? overIdString.split(":")
            : ["field", overIdString];

        if (activeType === "category") {
            setData((prev: GetCategoryType[]) => {
                const oldIndex = prev.findIndex((c) => c.categoryId === activeIdVal);
                const newIndex = prev.findIndex((c) => c.categoryId === overIdVal);

                if (oldIndex !== -1 && newIndex !== -1) {
                    return arrayMove(prev, oldIndex, newIndex);
                }
                return prev;
            });
            return;
        }

        const targetCategoryId = activeCategory ?? currentCategory?.categoryId;

        setData((prev: GetCategoryType[]) =>
            prev.map((category) => {
                if (category.categoryId !== targetCategoryId) return category;

                if (activeType === "block") {
                    const oldIndex = category.blocks.findIndex((b) => b.blockId === activeIdVal);
                    const newIndex = category.blocks.findIndex((b) => b.blockId === overIdVal);

                    if (oldIndex !== -1 && newIndex !== -1) {
                        return {
                            ...category,
                            blocks: arrayMove(category.blocks, oldIndex, newIndex),
                        };
                    }
                    return category;
                }

                if (activeType === "row") {
                    return {
                        ...category,
                        blocks: category.blocks.map((block) => {
                            if (block.blockId !== activeBlock) return block;

                            const oldIndex = block.rows.findIndex((r) => r.rowId === activeIdVal);
                            const newIndex = block.rows.findIndex((r) => r.rowId === overIdVal);

                            if (oldIndex !== -1 && newIndex !== -1) {
                                return {
                                    ...block,
                                    rows: arrayMove(block.rows, oldIndex, newIndex),
                                };
                            }
                            return block;
                        }),
                    };
                }

                if (activeType === "field") {
                    return {
                        ...category,
                        blocks: category.blocks.map((block) => {
                            if (block.blockId !== activeBlock) return block;

                            const targetRow = block.rows.find((r) =>
                                (r.fields || []).some((f) => f.fieldId === activeIdVal)
                            );

                            if (targetRow && (targetRow.fields || []).length > 5) {
                                toast.show("A row cannot contain more than 5 fields", { type: "error" });
                                return block;
                            };

                            const oldIndex = targetRow?.fields.findIndex((f) => f.fieldId === activeIdVal) || 0;
                            const newIndex = targetRow?.fields.findIndex((f) => f.fieldId === overIdVal) || 0;

                            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                                return {
                                    ...block,
                                    rows: block.rows.map((row) =>
                                        row.rowId === targetRow?.rowId
                                            ? { ...row, fields: arrayMove(row.fields, oldIndex, newIndex) }
                                            : row
                                    ),
                                };
                            }

                            return block;
                        }),
                    };
                }

                return category;
            })
        );

        // SAVE TO API
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
                        id="my-drawer-4" 
                        type="checkbox" 
                        checked={isDrawerOpen}
                        onChange={(e) => setIsDrawerOpen(e.target.checked)}
                        className="drawer-toggle" 
                    />

                    <div className="drawer-content border-l border-base-300">
                        <nav className="navbar w-full bg-base-100">
                            <label htmlFor="my-drawer-4" aria-label="open sidebar" className="btn btn-square btn-ghost">
                                <span className="flex h-8 w-4 leading-none items-center justify-center">
                                    <span className="font-nerdfont text-xl is-drawer-close:hidden">
                                        
                                    </span>
                                </span>
                            </label>
                            <div className="px-4 w-full text-center">
                                <span className="font-medium">Example Character Here</span>
                                <div className="text-sub text-xs">Author</div>
                            </div>
                        </nav>

                        <div className="flex flex-col items-center p-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-full max-w-5xl">
                                {currentCategory && (
                                    <>
                                        {!activeBlock ? (
                                            <div className="p-2 md:p-4">
                                                <div className="flex justify-between items-center mb-6">
                                                    <h2 className="text-2xl font-bold">
                                                        {currentCategory?.blocks.length === 0 
                                                            ? "Add Block" 
                                                            : "Select Block"
                                                        }
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
                                                                    <SortableItem key={block.blockId} id={`block:${block.blockId}`}>
                                                                        {({ sortableProps, dragHandleProps }) => (
                                                                            <button
                                                                                {...sortableProps}
                                                                                className={`aspect-square relative flex flex-col items-center justify-center p-2 bg-base-200 hover:bg-base-300 border border-base-300 rounded transition-all shadow-xs cursor-pointer ${sortableProps.className ?? ""}`}
                                                                                onClick={() => setBlock(block.blockId)}
                                                                            >
                                                                                <div
                                                                                    {...dragHandleProps}
                                                                                    className="absolute top-2 left-2 p-1 cursor-grab active:cursor-grabbing touch-none"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    <span className="text-2xl leading-none font-nerdfont">
                                                                                        󰇛
                                                                                    </span>
                                                                                </div>

                                                                                <div
                                                                                    className="absolute top-2 right-2 p-1 touch-none"
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                >
                                                                                    {/* DEVELOPER NEEDED: Add a context menu with "view, edit, delete, copyId" */}
                                                                                    <span className="text-lg leading-none font-nerdfont">
                                                                                        󰇘
                                                                                    </span>
                                                                                </div>
                                                                                
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

                                                                <NewBlockModal 
                                                                    onAddBlock={handleAddBlock} 
                                                                    types={currentCategory?.types ?? []} 
                                                                />

                                                                {(currentCategory?.blocks.length ?? 0) <= 32 && (
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
                                                        {currentBlock?.rows?.map(row => (
                                                            <SortableItem key={row.rowId} id={`row:${row.rowId}`}>
                                                                {({ sortableProps, dragHandleProps }) => (
                                                                    <div {...sortableProps} className={`flex gap-3 ${sortableProps.className ?? ""}`}>
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
                                                                            id={`row-fields:${row.rowId}`}
                                                                            className="flex-1 min-w-0 w-full min-h-[44px]"
                                                                        >
                                                                            <SortableContext
                                                                                items={(row.fields || []).map((f) => `field:${f.fieldId}`)}
                                                                                strategy={rectSortingStrategy}
                                                                            >
                                                                                <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                                                                    {(row.fields || []).map(field => (
                                                                                        <SortableItem key={field.fieldId} id={`field:${field.fieldId}`}>
                                                                                            {({ sortableProps: fSortProps, dragHandleProps: fDragProps }) => {
                                                                                                const dragProps = fDragProps ?? {};
                                                                                                
                                                                                                return (
                                                                                                    <div 
                                                                                                        {...fSortProps} 
                                                                                                        className={`flex-1 min-w-0 ${fSortProps.className ?? ""}`}
                                                                                                    >
                                                                                                        <TemplateField
                                                                                                            id={field.fieldId}
                                                                                                            type={field.type}
                                                                                                            label={field.label}
                                                                                                            placeholder={field.placeholder}
                                                                                                            guide={field.guide}
                                                                                                            value={field.value}
                                                                                                            options={field.options}
                                                                                                            notes={field.notes}
                                                                                                            thoughts={field.thoughts}
                                                                                                            dragHandleProps={{
                                                                                                                ...dragProps,
                                                                                                                className: `${dragProps.className ?? ""} touch-none cursor-grab active:cursor-grabbing`.trim(),
                                                                                                            }}
                                                                                                        />

                                                                                                        {/* ADD AN ON CHANGE (value, notes, thoughts) SO AN API CAN BE CALLED HERE */}
                                                                                                    </div>
                                                                                                );
                                                                                            }}
                                                                                        </SortableItem>
                                                                                    ))}
                                                                                </div>
                                                                            </SortableContext>
                                                                        </FieldDropZone>

                                                                        {(row.fields?.length ?? 0) < 5 && (
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
                                                        ))}
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
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="drawer-side is-drawer-close:overflow-visible">
                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                            <div className="menu w-full">
                                <SortableContext items={data.map(category => `category:${category.categoryId}`)}>
                                    <ul>
                                        {data.map(category => (
                                            <SortableItem key={category.categoryId} id={`category:${category.categoryId}`}>
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
