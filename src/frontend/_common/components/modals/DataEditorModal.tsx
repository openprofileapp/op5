import { useState, useRef, useImperativeHandle, forwardRef, useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
    DndContext,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    DragEndEvent,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers";

import { CSS } from "@dnd-kit/utilities";

import { DatasetItemType, GetDatasetsType } from "../../../../_common/types/template/dataset.type.js";
import { DropdownOptionsType } from "../../../../_common/types/dropdown.type.js";
import { toast } from "../../scripts/toast.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import { snowflake } from "../../../studio/scripts/main.js";
import { useModals } from "../../hooks/ModalContext.hook.js";

export interface FlatRowItem {
    key: string;
    id: string;
    name: string;
    category?: string;
}

export interface InteractionOptions {
    onSave?: (updatedData: DatasetItemType | null) => void;
}

export interface DataEditorModalRef {
    open: (
        incomingData?: Partial<DatasetItemType> | null,
        options?: InteractionOptions
    ) => Promise<DatasetItemType | null>;
    close: () => void;
}

type EditorMode = "metadata" | "table" | "json";

function parseRawData(data: unknown): DropdownOptionsType {
    if (!data) return [];
    if (typeof data === "string") {
        try {
            return parseRawData(JSON.parse(data));
        } catch {
            return [];
        }
    }
    return data as DropdownOptionsType;
}

function flattenDatasetData(rawData: unknown): FlatRowItem[] {
    const data = parseRawData(rawData);

    if (Array.isArray(data)) {
        return data.flatMap((item, index) => {
            if (typeof item === "string" || typeof item === "number") {
                return { key: `key_${index}`, id: `item_${index}_${item}`, name: String(item) };
            }

            if (item && typeof item === "object" && "id" in item && "name" in item) {
                return {
                    key: `key_${index}`,
                    id: String(item.id),
                    name: String(item.name),
                    category: (item as Record<string, unknown>).category ? String((item as Record<string, unknown>).category) : "",
                };
            }

            return Object.entries(item || {}).map(([k, v], subIdx) => ({
                key: `key_${index}_${subIdx}`,
                id: k,
                name: String(v),
                category: "",
            }));
        });
    }

    if (data && typeof data === "object") {
        return Object.entries(data).flatMap(([categoryOrKey, val], index) => {
            if (Array.isArray(val)) {
                return val.map((subItem, subIndex) => {
                    if (typeof subItem === "string" || typeof subItem === "number") {
                        return {
                            key: `key_${index}_${subIndex}`,
                            id: `item_${subIndex}_${subItem}`,
                            name: String(subItem),
                            category: categoryOrKey,
                        };
                    }

                    return {
                        key: `key_${index}_${subIndex}`,
                        id: String(subItem?.id ?? ""),
                        name: String(subItem?.name ?? ""),
                        category: subItem?.category || categoryOrKey,
                    };
                });
            }
            return {
                key: `key_${index}`,
                id: categoryOrKey,
                name: String(val),
                category: "",
            };
        });
    }

    return [];
}

interface SortableRowProps {
    row: FlatRowItem;
    index: number;
    onCellChange: (index: number, key: keyof FlatRowItem, value: string) => void;
    onDeleteRow: (index: number) => void;
    onAddRowAbove?: (index: number) => void;
    onAddRowBelow?: (index: number) => void;
}

function SortableRow({
    row,
    index,
    onCellChange,
    onDeleteRow,
    onAddRowAbove,
    onAddRowBelow,
}: SortableRowProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: row.key });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 9999 : "auto",
        position: "relative" as const,
    };

    return (
        <tr ref={setNodeRef} style={style} className="hover">
            <td>
                <div
                    {...attributes}
                    {...listeners}
                    className="flex h-10 w-5 items-center justify-center rounded bg-base-300 cursor-grab active:cursor-grabbing touch-none"
                >
                    <span className="text-2xl leading-none font-nerdfont">
                        󰇝
                    </span>
                </div>
            </td>

            <td>
                <input
                    type="text"
                    className="input w-full"
                    placeholder={row.id}
                    value={row.id}
                    onChange={(e) => onCellChange(index, "id", e.target.value)}
                />
            </td>

            <td>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={row.name}
                    value={row.name}
                    onChange={(e) => onCellChange(index, "name", e.target.value)}
                />
            </td>

            <td>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    placeholder={row.category}
                    value={row.category || ""}
                    onChange={(e) => onCellChange(index, "category", e.target.value)}
                />
            </td>

            <td>
                <div className="flex items-center gap-2">
                    <div className="flex flex-col">
                        <button
                            type="button"
                            className="btn btn-xs btn-square"
                            onClick={() => onAddRowAbove?.(index)}
                        >
                            <span className="font-nerdfont leading-none text-base">
                                󰓴
                            </span>
                        </button>

                        <button
                            type="button"
                            className="btn btn-xs btn-square"
                            onClick={() => onAddRowBelow?.(index)}
                        >
                            <span className="font-nerdfont leading-none text-base">
                                󰓳
                            </span>
                        </button>
                    </div>

                    <button
                        type="button"
                        className="btn btn-error btn-square h-12"
                        onClick={() => onDeleteRow(index)}
                    >
                        <span className="font-nerdfont leading-none text-base">
                            󰆴
                        </span>
                    </button>
                </div>
            </td>
        </tr>
    );
}

const DatasetEditorModal = forwardRef<DataEditorModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const { deleteModal } = useModals();

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const resolverRef = useRef<((value: DatasetItemType | null) => void) | null>(null);
    
    const [editorMode, setEditorMode] = useState<EditorMode>("table");
    const [options, setOptions] = useState<InteractionOptions>({});

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [data, setData] = useState<Partial<DatasetItemType>>();
    const [label, setLabel] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [editableRows, setEditableRows] = useState<FlatRowItem[]>([]);

    const [jsonText, setJsonText] = useState<string>("");
    const [jsonError, setJsonError] = useState<string | null>(null);

    const isNewDataset = !data?.id;

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const cleanRowsForOutput = (rows: FlatRowItem[]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return rows.map(({ key, category, ...rest }) => {
            const item: Record<string, unknown> = { ...rest };

            if (category) {
                item.category = category;
            }

            return item;
        });
    };

    const initialFormattedData = useMemo(() => {
        if (!data) return "";

        const normalized = flattenDatasetData(data.data);

        return JSON.stringify(cleanRowsForOutput(normalized), null, 2);
    }, [data]);

    const hasChanges = useMemo(() => {
        if (isNewDataset) return true;
        if (!data) return false;

        const labelChanged = (label || "") !== (data.label || "");
        const descriptionChanged = (description || "") !== (data.description || "");
        if (labelChanged || descriptionChanged) return true;

        if (editorMode === "json") {
            try {
                const parsedCurrent = JSON.parse(jsonText);
                const normalizedCurrent = flattenDatasetData(parsedCurrent);
                return JSON.stringify(cleanRowsForOutput(normalizedCurrent), null, 2) !== initialFormattedData;
            } catch {
                return true;
            }
        }

        const currentData = JSON.stringify(cleanRowsForOutput(editableRows), null, 2);

        return currentData !== initialFormattedData;
    }, [data, label, description, editorMode, jsonText, editableRows, initialFormattedData, isNewDataset]);

    const resetState = () => {
        setData(undefined);
        setLabel("");
        setDescription("");
        setEditableRows([]);
        setJsonText("");
        setJsonError(null);
        setEditorMode("table");
        setOptions({});
        setIsLoading(false);
        resolverRef.current = null;
    };

    useImperativeHandle(ref, () => ({
        open: (incomingData, opts = {}) => {
            const targetData = incomingData || { data: [] };
            const flattened = flattenDatasetData(targetData.data);
            const cleanedData = cleanRowsForOutput(flattened);

            const creatingNew = !targetData.id;

            setData(targetData);
            setLabel(targetData.label || "");
            setDescription(targetData.description || "");
            setEditableRows(flattened);
            setJsonText(JSON.stringify(cleanedData, null, 2));
            setJsonError(null);
            setEditorMode(creatingNew ? "metadata" : "table");
            setOptions(opts);

            requestAnimationFrame(() => {
                dialogRef.current?.showModal();
            });

            return new Promise<DatasetItemType | null>((resolve) => {
                resolverRef.current = resolve;
            });
        },
        close: () => {
            if (resolverRef.current) {
                resolverRef.current(null);
            }

            dialogRef.current?.close();

            resetState();
        },
    }));

    const handleClose = () => {
        if (resolverRef.current) {
            resolverRef.current(null);
        }

        dialogRef.current?.close();

        resetState();
    };

    const handleDeleteDataset = () => {
        if (!data) return;

        deleteModal.open(
            data as GetDatasetsType,
            {
                type: "dataset",
                onConfirm: () => {
                    options.onSave?.(null);

                    if (resolverRef.current) {
                        resolverRef.current(data as DatasetItemType);
                        resolverRef.current = null;
                    }

                    dialogRef.current?.close();
                    resetState();
                },
            }
        );
    };

    const handleTabChange = (newMode: EditorMode) => {
        if (newMode === editorMode) return;

        if (newMode === "json") {
            setJsonText(JSON.stringify(cleanRowsForOutput(editableRows), null, 2));
            setJsonError(null);
        } else if (editorMode === "json") {
            try {
                const parsed = JSON.parse(jsonText);
                setEditableRows(flattenDatasetData(parsed));
                setJsonError(null);
            } catch {
                setJsonError("Valid JSON syntax is needed to switch view");
                return;
            }
        }

        setEditorMode(newMode);
    };

    const handleJsonChange = (text: string) => {
        setJsonText(text);
        try {
            JSON.parse(text);
            setJsonError(null);
        } catch (err) {
            setJsonError((err as Error).message);
        }
    };

    const handleCellChange = (index: number, key: keyof FlatRowItem, value: string) => {
        setEditableRows((prev) => {
            const next = [...prev];
            next[index] = { ...next[index], [key]: value };
            return next;
        });
    };

    const handleAddRow = () => {
        setEditableRows((prev) => [
            ...prev,
            { 
                key: snowflake.gen(), 
                id: "", 
                name: "",
                category: "",
            },
        ]);
    };

    const handleAddRowAbove = (index: number) => {
        setEditableRows((prev) => {
            const newRow: FlatRowItem = {
                key: snowflake.gen(),
                id: "",
                name: "",
                category: "",
            };
            const next = [...prev];
            next.splice(index, 0, newRow);
            return next;
        });
    };

    const handleAddRowBelow = (index: number) => {
        setEditableRows((prev) => {
            const newRow: FlatRowItem = {
                key: snowflake.gen(),
                id: "",
                name: "",
                category: "",
            };
            const next = [...prev];
            next.splice(index + 1, 0, newRow);
            return next;
        });
    };

    const handleDeleteRow = (index: number) => {
        setEditableRows((prev) => prev.filter((_, i) => i !== index));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setEditableRows((items) => {
                const oldIndex = items.findIndex((item) => item.key === active.id);
                const newIndex = items.findIndex((item) => item.key === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        if (!data || isLoading || !hasChanges) return;

        let updatedDataPayload: DropdownOptionsType;

        if (editorMode === "json") {
            try {
                updatedDataPayload = JSON.parse(jsonText);
            } catch {
                toast.show(
                    "Fix JSON syntax errors before saving", 
                    { type: "error" }
                );

                return;
            }
        } else {
            updatedDataPayload = cleanRowsForOutput(editableRows) as unknown as DropdownOptionsType;
        }

        try {
            setIsLoading(true);

            const endpoint = isNewDataset
                ? `${apiBaseUrl}/v3/templates/datasets/insert`
                : `${apiBaseUrl}/v3/templates/datasets/update/${data.id}`;

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    label,
                    description,
                    data: updatedDataPayload,
                }),
            });

            const responseData = await response.json().catch(() => ({}));

            if (response.ok) {
                const finalData: DatasetItemType = {
                    ...data,
                    id: responseData.id || data.id,
                    label,
                    description,
                    data: updatedDataPayload,
                } as DatasetItemType;

                options.onSave?.(finalData);

                if (resolverRef.current) {
                    resolverRef.current(finalData);
                    resolverRef.current = null;
                }

                dialogRef.current?.close();

                resetState();

                toast.show(
                    isNewDataset ? "Dataset created" : "Dataset saved", 
                    { type: "success" }
                );
            } else {
                toast.show(
                    isNewDataset ? "Failed to create dataset" : "Failed to save dataset", 
                    {
                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                        type: "error",
                    }
                );
            }
        } catch (error) {
            console.error("Failed to save dataset:", error);

            toast.show(
                isNewDataset ? "Failed to create dataset" : "Failed to save dataset", 
                { type: "error" }
            );
        } finally {
            setIsLoading(false);
        }
    };

    if (!isTranslationReady) return null;

    const datasetDisplayName = label || data?.label || data?.id || "";

    return (
        <dialog ref={dialogRef} className="modal">
            {data && (
                <div className="modal-box w-[80vw] h-[90vh] max-w-none max-h-none flex flex-col">
                    <form method="dialog">
                        <button
                            type="button"
                            className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-30"
                            onClick={handleClose}
                        >
                            
                        </button>
                    </form>

                    <h3 className="font-bold text-2xl text-center pb-4">
                        {isNewDataset
                            ? `Create ${datasetDisplayName} Dataset`.trim()
                            : `Edit ${datasetDisplayName} Dataset`.trim()}
                    </h3>

                    <div className="flex tabs tabs-border mb-6 w-full">
                        <button
                            type="button"
                            className={`tab flex-1 ${editorMode === "metadata" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("metadata")}
                        >
                            Metadata
                        </button>

                        <button
                            type="button"
                            className={`tab flex-1 ${editorMode === "table" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("table")}
                        >
                            Table View
                        </button>
                        
                        <button
                            type="button"
                            className={`tab flex-1 ${editorMode === "json" ? "tab-active" : ""}`}
                            onClick={() => handleTabChange("json")}
                        >
                            Raw JSON
                        </button>
                    </div>

                    {editorMode === "metadata" && (
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                            <fieldset className="fieldset w-full">
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">
                                        Label
                                    </label>

                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder={data.label}
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">Description</label>

                                    <textarea
                                        className="textarea w-full resize-none !h-auto min-h-[2.5rem] [field-sizing:content]"
                                        placeholder={data.description}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </fieldset>

                            {!isNewDataset && (
                                <button
                                    type="button"
                                    className="btn btn-error"
                                    onClick={handleDeleteDataset}
                                >
                                    {t("words.Delete")}
                                </button>
                            )}
                        </div>
                    )}

                    {editorMode === "table" && (
                        <>
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                            >
                                <div className="overflow-y-auto flex-1 rounded border border-base-300">
                                    <table className="table table-pin-rows rounded w-full">
                                        <thead>
                                            <tr>
                                                <th />
                                                <th>ID</th>
                                                <th>Label</th>
                                                <th>Category</th>
                                                <th />
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <SortableContext
                                                items={editableRows.map((r) => r.key)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {editableRows.map((row, index) => (
                                                    <SortableRow
                                                        key={row.key}
                                                        row={row}
                                                        index={index}
                                                        onCellChange={handleCellChange}
                                                        onDeleteRow={handleDeleteRow}
                                                        onAddRowAbove={handleAddRowAbove}
                                                        onAddRowBelow={handleAddRowBelow}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </tbody>
                                    </table>
                                </div>
                            </DndContext>

                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="cursor-pointer border-2 w-full mt-2 border-dashed border-base-300 rounded flex items-center justify-center py-2 transition-colors text-sm opacity-70 hover:opacity-100"
                            >
                                <span className="font-nerdfont text-xl">
                                    
                                </span>
                            </button>
                        </>
                    )}

                    {editorMode === "json" && (
                        <div className="flex-1 flex flex-col min-h-[300px]">
                            <textarea
                                className={`textarea textarea-bordered font-mono text-sm flex-1 w-full resize-none p-3 ${
                                    jsonError ? "textarea-error" : ""
                                }`}
                                value={jsonText}
                                onChange={(e) => handleJsonChange(e.target.value)}
                                placeholder="Edit raw JSON..."
                            />
                            
                            {jsonError && (
                                <span className="text-sm text-error mt-2">
                                    {jsonError}
                                </span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center gap-2 sm:gap-3 flex-row w-full pt-4 z-10 shrink-0">
                        <button
                            type="button"
                            className="btn btn-neutral flex-1"
                            onClick={handleClose}
                        >
                            {t("words.Close")}
                        </button>

                        <button
                            type="button"
                            className={`btn flex-3 flex items-center justify-center border rounded gap-2 transition-colors ${
                                !hasChanges || (editorMode === "json" && Boolean(jsonError))
                                    ? "bg-base-200 border-base-300 cursor-not-allowed opacity-60" 
                                    : "bg-success border-success text-white cursor-pointer"
                            }`}
                            onClick={handleSave}
                            disabled={isLoading || !hasChanges || (editorMode === "json" && Boolean(jsonError))}
                        >
                            <span className={`font-nerdfont leading-none ${isLoading ? "loading w-6 h-6" : ""}`}>
                                {!isLoading && (!hasChanges ? "" : "󰆓")}
                            </span>
                            {!isLoading && (hasChanges ? t("words.Save") : t("words.Saved"))}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    );
});

DatasetEditorModal.displayName = "DatasetEditorModal";
export default DatasetEditorModal;
