import { useEffect, useState, useCallback } from "react";
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
} from "@dnd-kit/core";

import {
    SortableContext,
    rectSortingStrategy,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
    sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import Metadata from "../../_common/components/Metadata.js";
import TemplateField from "./TemplateField.js";
import NewRowModal from "./modals/NewRowModal.js";
import NewFieldModal from "./modals/NewFieldModal.js";

function FieldDropZone({ id, children, className = "" }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className={className}
        >
            {children}
        </div>
    );
}

function SortableItem({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        setActivatorNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 999 : "auto",
    };

    return children({
        sortableProps: {
            ref: setNodeRef,
            style,
        },
        dragHandleProps: {
            ref: setActivatorNodeRef,
            ...attributes,
            ...listeners,
        },
    });
}

export default function CharacterTemplate() {
    const { id } = useParams();
    const { ready } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [activeCategory, setActiveCategory] = useState("names");
    const [activeTab, setActiveTab] = useState("current");
    const [activeYear, setActiveYear] = useState(0);
    const [activeSeries, setActiveSeries] = useState(0);

    const [template, setTemplate] = useState([
        {
            id: "names",
            label: "Names",
            tabs: ["current", "former"],
            rows: [
                {
                    id: "full-name",
                    fields: [{ id: "full-name", label: "Full Name" }],
                },
                {
                    id: "first-middle-last-name",
                    fields: [
                        { id: "first-name", label: "First Name" },
                        { id: "middle-name", label: "Middle Name" },
                        { id: "last-name", label: "Last Name" },
                    ],
                },
            ],
        },
        { id: "astral", label: "Astral", tabs: [], rows: [] },
        { id: "physical", label: "Physical", tabs: [], rows: [] },
        { id: "supernatural", label: "Supernatural", tabs: [], rows: [] },
        { id: "personality", label: "Personality", tabs: [], rows: [] },
        { id: "favorites", label: "Favorites", tabs: [], rows: [] },
        { id: "interactions", label: "Interactions", tabs: [], rows: [] },
        { id: "emotional", label: "Emotional", tabs: [], rows: [] },
        { id: "relationships", label: "Relationships", tabs: [], rows: [] },
    ]);

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

    const currentCategory = template.find(cat => cat.id === activeCategory);

    const customCollisionDetection = useCallback((args) => {
        const pointerCollisions = pointerWithin(args);
        if (pointerCollisions.length > 0) {
            return pointerCollisions;
        }

        const intersections = rectIntersection(args);
        return getFirstCollision(intersections, "id");
    }, []);

    const findFieldRow = (cat, fieldId) => {
        return cat.rows.find(row => row.fields.some(f => f.id === fieldId));
    };

    const handleDragOver = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeStr = String(active.id);
        const overStr = String(over.id);

        if (!activeStr.startsWith("field:")) return;

        const activeFieldId = activeStr.replace("field:", "");

        setTemplate(prevTemplate => {
            return prevTemplate.map(category => {
                if (category.id !== activeCategory) return category;

                const sourceRow = findFieldRow(category, activeFieldId);
                if (!sourceRow) return category;

                let targetRowId = null;
                let targetFieldIndex = -1;

                if (overStr.startsWith("field:")) {
                    const overFieldId = overStr.replace("field:", "");
                    const targetRow = findFieldRow(category, overFieldId);
                    if (targetRow) {
                        targetRowId = targetRow.id;
                        targetFieldIndex = targetRow.fields.findIndex(f => f.id === overFieldId);
                    }
                } else if (overStr.startsWith("row-fields:")) {
                    targetRowId = overStr.replace("row-fields:", "");
                }

                if (!targetRowId || (sourceRow.id === targetRowId && overStr.startsWith("row-fields:"))) {
                    return category;
                }

                const targetRow = category.rows.find(r => r.id === targetRowId);
                if (!targetRow) return category;

                if (sourceRow.id !== targetRowId) {
                    const movedField = sourceRow.fields.find(f => f.id === activeFieldId);
                    
                    return {
                        ...category,
                        rows: category.rows.map(row => {
                            if (row.id === sourceRow.id) {
                                return {
                                    ...row,
                                    fields: row.fields.filter(f => f.id !== activeFieldId),
                                };
                            }
                            if (row.id === targetRowId) {
                                const newFields = [...row.fields];
                                const insertIndex = targetFieldIndex >= 0 ? targetFieldIndex : newFields.length;
                                if (!newFields.some(f => f.id === activeFieldId)) {
                                    newFields.splice(insertIndex, 0, movedField);
                                }
                                return { ...row, fields: newFields };
                            }
                            return row;
                        }),
                    };
                }

                return category;
            });
        });
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        const activeStr = String(active.id);
        const overStr = String(over.id);

        const [activeType, activeId] = activeStr.split(":");
        const [overType, overId] = overStr.split(":");

        if (activeType === "field" && overType === "field") {
            setTemplate(prev =>
                prev.map(cat => {
                    if (cat.id !== activeCategory) return cat;

                    const row = cat.rows.find(r => r.fields.some(f => f.id === activeId));
                    if (!row) return cat;

                    const oldIdx = row.fields.findIndex(f => f.id === activeId);
                    const newIdx = row.fields.findIndex(f => f.id === overId);

                    if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
                        return {
                            ...cat,
                            rows: cat.rows.map(r =>
                                r.id === row.id
                                    ? { ...r, fields: arrayMove(r.fields, oldIdx, newIdx) }
                                    : r
                            ),
                        };
                    }
                    return cat;
                })
            );
            return;
        }

        if (activeType !== overType) return;

        setTemplate(prev =>
            prev.map(category => {
                if (activeType === "category") {
                    const oldIndex = prev.findIndex(c => c.id === activeId);
                    const newIndex = prev.findIndex(c => c.id === overId);
                    return arrayMove(prev, oldIndex, newIndex)[prev.indexOf(category)];
                }

                if (category.id !== activeCategory) return category;

                if (activeType === "tab") {
                    const oldIndex = category.tabs.indexOf(activeId);
                    const newIndex = category.tabs.indexOf(overId);
                    return {
                        ...category,
                        tabs: arrayMove(category.tabs, oldIndex, newIndex),
                    };
                }

                if (activeType === "row") {
                    const oldIndex = category.rows.findIndex(r => r.id === activeId);
                    const newIndex = category.rows.findIndex(r => r.id === overId);
                    return {
                        ...category,
                        rows: arrayMove(category.rows, oldIndex, newIndex),
                    };
                }

                return category;
            })
        );
    };

    const setTab = (tab) => {
        if (tab === "about") {
            history.replaceState(null, "", window.location.pathname + window.location.search);
        } else {
            window.location.hash = tab;
        }
        setActiveTab(tab);
    };

    useEffect(() => {
        const updateTab = () => {
            setActiveTab(window.location.hash.replace("#", ""));
        };
        window.addEventListener("hashchange", updateTab);
        updateTab();
        return () => window.removeEventListener("hashchange", updateTab);
    }, []);

    if (!ready) return null;

    return (
        <>
            <Metadata title="Development" allowIndex="false" />

            <NewRowModal />
            <NewFieldModal />

            <DndContext
                sensors={sensors}
                collisionDetection={customCollisionDetection}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="drawer lg:drawer-open">
                    <input 
                        id="my-drawer-4" 
                        type="checkbox" 
                        checked={drawerOpen}
                        onChange={(e) => setDrawerOpen(e.target.checked)}
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
                                Example Character Here
                                <div className="text-sub text-xs">By Author</div>
                            </div>
                        </nav>

                        <nav className="w-full bg-base-100 border-b border-base-300">
                            <div className="mx-4">
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={1}
                                    value={activeSeries}
                                    onChange={(e) => setActiveSeries(Number(e.target.value))}
                                    className="range range-primary w-full h-2"
                                />

                                <div className="flex justify-between text-xs opacity-60">
                                    <span>Original Film</span>
                                    <span>Tv Series</span>
                                    <span>Film Remake</span>
                                </div>

                                <div className="hidden mt-2 text-center text-sm font-medium">
                                    {activeSeries}
                                </div>
                            </div>

                            <div className="mx-4 my-4">
                                <input
                                    type="range"
                                    min={2000}
                                    max={2020}
                                    step={1}
                                    value={activeYear}
                                    onChange={(e) => setActiveYear(Number(e.target.value))}
                                    className="range range-primary w-full h-2"
                                />

                                <div className="flex justify-between text-xs opacity-60">
                                    <span>2000</span>
                                    <span>2005</span>
                                    <span>2010</span>
                                    <span>2015</span>
                                    <span>2020</span>
                                </div>

                                <div className="hidden mt-2 text-center text-sm font-medium">
                                    {activeYear}
                                </div>
                            </div>
                            
                            <div className="px-4 w-full mt-6">
                                <div className="tabs tabs-lift flex-nowrap">
                                    <SortableContext
                                        items={currentCategory?.tabs.map(tab => `tab:${tab}`) ?? []}
                                    >
                                        {currentCategory?.tabs.map(tab => (
                                            <SortableItem key={tab} id={`tab:${tab}`}>
                                                {({ sortableProps, dragHandleProps }) => (
                                                    <button
                                                        {...sortableProps}
                                                        className={`tab flex-1 ${
                                                            activeTab === tab ? "tab-active bg-base-200" : ""
                                                        }`}
                                                        onClick={() => setTab(tab)}
                                                    >
                                                        {tab}

                                                        <span
                                                            {...dragHandleProps}
                                                            className="ml-2 cursor-grab touch-none"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <span className="text-xl font-nerdfont">
                                                                󰇝
                                                            </span>
                                                        </span>
                                                    </button>
                                                )}
                                            </SortableItem>
                                        ))}
                                        <button className="btn btn-accent text-2xl mt-2">+</button>
                                    </SortableContext>
                                </div>
                            </div>
                        </nav>

                        <div className="flex justify-center p-4">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-232">
                                <div className="p-2 md:p-4">
                                    <SortableContext
                                        items={currentCategory?.rows.map(row => `row:${row.id}`) ?? []}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col gap-1">
                                            {currentCategory?.rows.map(row => (
                                                <SortableItem key={row.id} id={`row:${row.id}`}>
                                                    {({ sortableProps, dragHandleProps }) => (
                                                        <div {...sortableProps} className="flex gap-3">
                                                            <span
                                                                {...dragHandleProps}
                                                                className="flex items-center cursor-grab touch-none"
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
                                                                id={`row-fields:${row.id}`}
                                                                className="flex-1 min-w-0 w-full min-h-[44px]"
                                                            >
                                                                <SortableContext
                                                                    items={row.fields.map(f => `field:${f.id}`)}
                                                                    strategy={rectSortingStrategy}
                                                                >
                                                                    <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                                                        {row.fields.map(field => (
                                                                            <SortableItem key={field.id} id={`field:${field.id}`}>
                                                                                {({ sortableProps: fSortProps, dragHandleProps: fDragProps }) => (
                                                                                    <div {...fSortProps} className="flex-1 min-w-0">
                                                                                        <TemplateField
                                                                                            id={field.id}
                                                                                            label={field.label}
                                                                                            dragHandleProps={{
                                                                                                ...fDragProps,
                                                                                                className: `${fDragProps.className || ""} touch-none`,
                                                                                            }}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </SortableItem>
                                                                        ))}
                                                                    </div>
                                                                </SortableContext>
                                                            </FieldDropZone>
                                                            
                                                            <button
                                                                className="btn btn-accent text-2xl w-10 mt-10"
                                                                onClick={() => document.getElementById("new-field").showModal()}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    )}
                                                </SortableItem>
                                            ))}
                                        </div>
                                    </SortableContext>

                                    <button
                                        className="btn btn-accent text-2xl w-full mt-2"
                                        onClick={() => document.getElementById("new-row").showModal()}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="drawer-side is-drawer-close:overflow-visible">
                        <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">
                            <div className="menu w-full">
                                <SortableContext items={template.map(category => `category:${category.id}`)}>
                                    <ul>
                                        {template.map(category => (
                                            <SortableItem key={category.id} id={`category:${category.id}`}>
                                                {({ sortableProps, dragHandleProps }) => (
                                                    <li {...sortableProps}>
                                                        <button
                                                            className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip={category.label}
                                                            onClick={() => {
                                                                setActiveCategory(category.id);
                                                                if (category.tabs.length) {
                                                                    setTab(category.tabs[0]);
                                                                }
                                                            }}
                                                        >
                                                            <span
                                                                {...dragHandleProps}
                                                                className="touch-none"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                <div className="flex h-full items-center justify-center py-2">
                                                                    <div className="flex h-full w-5 items-center justify-center rounded bg-base-300 cursor-grab">
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

                                        <button className="btn btn-accent text-2xl w-full mt-2">+</button>
                                    </ul>
                                </SortableContext>
                            </div>
                        </div>
                    </div>
                </div>
            </DndContext>
        </>
    );
}