import { useEffect, useState, useCallback, useRef } from "react";
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
import { toast } from "../../_common/scripts/toast.js";

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

    const isToastActiveRef = useRef(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [targetRowId, setTargetRowId] = useState(null);
    const [activeCategory, setActiveCategory] = useState("identities");
    const [activeTab, setActiveTab] = useState("current");
    const [activeYear, setActiveYear] = useState(0);
    const [activeSeries, setActiveSeries] = useState(0);

    const [template, setTemplate] = useState([
        {
            id: "identities",
            label: "Identities",
            single: "Identity",
            tabs: [
                { id: "main", label: "Mable Jackson", description: "Real-life" },
                { id: "secret-identity", label: "Eclipse", description: "Secret identity" },
                { id: "online", label: "@???????", description: "Social Media" },
                // have for main, former, and alias by default
            ],
            rows: [
                {
                    id: "full-name",
                    fields: [{ id: "full-name", label: "Full Name", type: "text" }],
                },
                {
                    id: "first-middle-last-name",
                    fields: [
                        { id: "first-name", label: "First Name", type: "text" },
                        { id: "middle-name", label: "Middle Name", type: "text" },
                        { id: "last-name", label: "Last Name", type: "text" },
                    ],
                },
            ],
        },
        { id: "astral", label: "Astral", tabs: [], rows: [] },
        { id: "physical", label: "Physical", tabs: [], rows: [] },
        { 
            id: "supernatural", 
            label: "Supernatural", 
            tabs: [
                { id: "fire-manipulation", label: "Fire Manipulation" },
                { id: "frost-manipulation", label: "Frost Manipulation" },
            ],
            rows: [] 
        },
        { id: "personality", label: "Personality", tabs: [], rows: [] },
        { 
            id: "favorites", 
            label: "Favorites",
            tabs: [
                { id: "book", label: "Book" },
                { id: "author", label: "Author" },
                { id: "movie", label: "Movie" },
                { id: "actor", label: "Actor" },
                { id: "tv-series", label: "TV Series" },
                { id: "tv-channel", label: "TV Channel" }
            ], 
            rows: [] 
        },
        { id: "interactions", label: "Interactions", tabs: [], rows: [] },
        { 
            id: "emotional", 
            label: "Emotional", 
            tabs: [
                { id: "happiness", label: "Happiness" },
                { id: "sadness", label: "Sadness" },
                { id: "anger", label: "Anger" },
                { id: "fear", label: "Fear" },
                { id: "disgust", label: "Disgust" },
                { id: "surprise", label: "Surprise" },
                { id: "anxiety", label: "Anxiety" },
                { id: "love", label: "Love" },
                { id: "affection", label: "Affection" },
                { id: "excitement", label: "Excitement" },
                { id: "frustration", label: "Frustration" },
                { id: "calmness", label: "Calmness" },
                { id: "comfort", label: "Comfort" },
                { id: "hope", label: "Hope" },
                { id: "hurt", label: "Hurt" },
                { id: "guilt", label: "Guilt" },
                { id: "shame", label: "Shame" },
                { id: "amazement", label: "Amazement" },
                { id: "annoyance", label: "Annoyance" },
                { id: "boredom", label: "Boredom" },
                { id: "confusion", label: "Confusion" },
                { id: "curiosity", label: "Curiosity" },
                { id: "determination", label: "Determination" },
                { id: "embarrassment", label: "Embarrassment" },
                { id: "gratitude", label: "Gratitude" },
                { id: "jealousy", label: "Jealousy" },
                { id: "loneliness", label: "Loneliness" },
                { id: "pride", label: "Pride" },
            ],
            rows: [] 
        },
        { 
            id: "relationships", 
            label: "Relationships", 
            tabs: [
                { id: "mable-jackson", label: "Mable Jackson", description: "Friend" },
                { id: "julia-anderson", label: "Julia Anderson", description: "Friend" }
            ],
            rows: [] 
        },
    ]);

    const showToastOnce = (msg, options) => {
        if (isToastActiveRef.current) return;
        isToastActiveRef.current = true;
        toast.show(msg, options);
        setTimeout(() => {
            isToastActiveRef.current = false;
        }, 2000);
    };

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

        const category = template.find(cat => cat.id === activeCategory);
        if (!category) return;

        const sourceRow = findFieldRow(category, activeFieldId);
        if (!sourceRow) return;

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
            return;
        }

        const targetRow = category.rows.find(r => r.id === targetRowId);
        if (!targetRow) return;

        if (sourceRow.id !== targetRowId) {
            if (targetRow.fields.length >= 5) {
                showToastOnce("A row cannot contain more than 5 fields", { type: "error" });
                return;
            }

            const movedField = sourceRow.fields.find(f => f.id === activeFieldId);
            if (!movedField) return;

            setTemplate(prevTemplate =>
                prevTemplate.map(cat => {
                    if (cat.id !== activeCategory) return cat;
                    return {
                        ...cat,
                        rows: cat.rows.map(row => {
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
                })
            );
        }
    };

    const handleAddRow = (data) => {
        setTemplate((prev) =>
            prev.map((cat) => {
                if (cat.id !== activeCategory) return cat;
                return {
                    ...cat,
                    rows: [
                        ...cat.rows,
                        {
                            id: data.id,
                            label: data.label,
                            type: data.type,
                            fields: []
                        }
                    ]
                };
            })
        );
    };

    const handleAddField = (rowId, data) => {
        const currentCat = template.find(c => c.id === activeCategory);
        const targetRow = currentCat?.rows.find(r => r.id === rowId);

        if (targetRow && targetRow.fields.length >= 5) {
            toast.show("A row cannot contain more than 5 fields", { type: "error" });
            return;
        }

        setTemplate(prev =>
            prev.map(cat => {
                if (cat.id !== activeCategory) return cat;
                return {
                    ...cat,
                    rows: cat.rows.map(r => {
                        if (r.id !== rowId) return r;
                        return {
                            ...r,
                            fields: [
                                ...r.fields,
                                { id: data.id, label: data.label, type: data.type }
                            ]
                        };
                    })
                };
            })
        );
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

                // Updated for { id, label } object format
                if (activeType === "tab") {
                    const oldIndex = category.tabs.findIndex(t => t.id === activeId);
                    const newIndex = category.tabs.findIndex(t => t.id === overId);
                    
                    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
                        return {
                            ...category,
                            tabs: arrayMove(category.tabs, oldIndex, newIndex),
                        };
                    }
                    return category;
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
        if (!tab || tab === "about") {
            history.pushState(null, "", window.location.pathname + window.location.search);
            setActiveTab(null);
        } else {
            window.location.hash = tab;
        }
    };

    useEffect(() => {
        const updateTab = () => {
            const hash = window.location.hash.replace("#", "");
            setActiveTab(hash ? hash : null);
        };

        window.addEventListener("hashchange", updateTab);
        updateTab();

        return () => window.removeEventListener("hashchange", updateTab);
    }, []);

    if (!ready) return null;

    return (
        <>
            <Metadata title="Development" allowIndex="false" />

            <NewRowModal onAddRow={handleAddRow} />
            <NewFieldModal targetRowId={targetRowId} onAddField={handleAddField} />

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

                        <nav className="w-full bg-base-100 border-b border-base-300 hidden">
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
                            
                            <div 
                                className="tabs tabs-lift overflow-x-auto flex-nowrap scrollbar-none w-full"
                                onWheel={(e) => {
                                    if (e.deltaY !== 0) {
                                        e.currentTarget.scrollLeft += e.deltaY;
                                    }
                                }}
                            >
                                <SortableContext
                                    items={currentCategory?.tabs.map(tab => `tab:${tab.id}`) ?? []}
                                >
                                    {currentCategory?.tabs.map(tab => (
                                        <SortableItem key={tab.id} id={`tab:${tab.id}`}>
                                            {({ sortableProps, dragHandleProps }) => (
                                                <button
                                                    {...sortableProps}
                                                    className={`tab flex-1 min-w-[max-content] px-4 ${
                                                        activeTab === tab.id ? "tab-active bg-base-200" : ""
                                                    }`}
                                                    onClick={() => setTab(tab.id)}
                                                >
                                                    <span
                                                        {...dragHandleProps}
                                                        className="flex items-center cursor-grab touch-none"
                                                    >
                                                        <div className="flex items-center justify-center">
                                                            <div className="flex w-5 items-center justify-center">
                                                                <span className="text-2xl leading-none font-nerdfont">
                                                                    󰇝
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </span>
                                                
                                                    <span className="flex-1">
                                                        {tab.label}
                                                    </span>
                                                </button>
                                            )}
                                        </SortableItem>
                                    ))}
                                    
                                    <button className="btn btn-accent text-2xl shrink-0">
                                        +
                                    </button>
                                </SortableContext>
                            </div>
                        </nav>

                        <div className="flex flex-col items-center p-4 w-full">
                            <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-full max-w-5xl">

                                {!activeTab ? (
                                    <div className="p-2 md:p-4">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold">Select {currentCategory?.label}</h2>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 mb-6">
                                            <fieldset className="fieldset flex-1">
                                                <legend className="fieldset-legend">Search</legend>
                                                <label className="input w-full">
                                                    <span className="font-nerdfont text-base mr-1"></span>
                                                    <input type="search" placeholder="???..." />
                                                </label>
                                            </fieldset>

                                            <fieldset className="fieldset shrink-0 w-full sm:w-60">
                                                <legend className="fieldset-legend">Filter</legend>
                                                <select defaultValue="updated" className="select w-full">
                                                    <option value="updated">?????</option>
                                                    <option value="newest">Newest First</option>
                                                    <option value="oldest">Oldest First</option>
                                                    <option value="popular-desc">Most Popular</option>
                                                    <option value="popular-asc">Least Popular</option>
                                                    <option value="name-asc">Name (A–Z)</option>
                                                    <option value="name-desc">Name (Z–A)</option>
                                                </select>
                                            </fieldset>
                                        </div>

                                        <SortableContext
                                            items={currentCategory?.tabs.map(tab => `tab:${tab.id}`) ?? []}
                                            strategy={rectSortingStrategy}
                                        >
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                {currentCategory?.tabs.map(tab => (
                                                    <SortableItem key={tab.id} id={`tab:${tab.id}`}>
                                                        {({ sortableProps, dragHandleProps }) => (
                                                            <button
                                                                {...sortableProps}
                                                                className="relative flex flex-col items-center justify-center p-6 bg-base-200 hover:bg-base-300 border border-base-300 rounded transition-all shadow-xs cursor-pointer w-full"
                                                                onClick={() => setTab(tab.id)}
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

                                                                {/* ADD MORE MENU HERE TO COPY AND DELETE AND OPEN AND STUFF */}
                                                                <div
                                                                    className="absolute top-2 right-2 p-1 touch-none"
                                                                    onClick={(e) => e.stopPropagation()}
                                                                >
                                                                    <span className="text-lg leading-none font-nerdfont">
                                                                        󰇘
                                                                    </span>
                                                                </div>
                                                                
                                                                <img className="h-20" src="https://openmoji.org/data/color/svg/E282.svg" alt={tab.label} />
                                                                <span className="text-lg font-semibold mt-2">{tab.label}</span>
                                                                <span className="text-xs text-base-content/60 mt-1">{tab.description}</span>
                                                            </button>
                                                        )}
                                                    </SortableItem>
                                                ))}

                                                <button
                                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-base-300 hover:border-accent rounded transition-all text-accent cursor-pointer min-h-[160px]"
                                                    onClick={() => (document.getElementById("new-tab") as HTMLDialogElement | null)?.showModal()}
                                                >
                                                    <span className="text-3xl font-bold">+</span>
                                                    <span className="text-sm font-medium mt-1">Add {currentCategory?.single}</span>
                                                </button>
                                            </div>
                                        </SortableContext>
                                    </div>
                                ) : (
                                    <div className="p-2 md:p-4">
                                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-base-300">
                                            <button
                                                className="btn btn-ghost btn-sm gap-2 text-base font-normal"
                                                onClick={() => setTab(null)}
                                            >
                                                <span className="text-xl leading-none">←</span> Back to All
                                            </button>
                                            <div className="h-5 w-px bg-base-300" />
                                            <h2 className="text-xl font-bold">
                                                {currentCategory?.tabs.find(t => t.id === activeTab)?.label ?? activeTab}
                                            </h2>
                                        </div>

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

                                                                {(() => {
                                                                    switch (row.type) {
                                                                        case "media":
                                                                            return (
                                                                                <div className="flex-1 min-w-0 w-full min-h-[44px]">
                                                                                    {/* row content */}
                                                                                </div>
                                                                            );

                                                                        case "split":
                                                                            return (
                                                                                <div className="flex-1 min-w-0 w-full min-h-[44px]">
                                                                                    {/* row content */}
                                                                                </div>
                                                                            );

                                                                        case "timeline":
                                                                            return (
                                                                                <div className="flex-1 min-w-0 w-full min-h-[44px]">
                                                                                    {/* row content */}
                                                                                </div>
                                                                            );

                                                                        case "calendar":
                                                                            return (
                                                                                <div className="flex-1 min-w-0 w-full min-h-[44px]">
                                                                                    {/* row content */}
                                                                                </div>
                                                                            );

                                                                        case "field":
                                                                        default:
                                                                            return (
                                                                                <FieldDropZone
                                                                                    id={`row-fields:${row.id}`}
                                                                                    className="flex-1 min-w-0 w-full min-h-[44px]"
                                                                                >
                                                                                    <SortableContext
                                                                                        items={(row.fields || []).map(f => `field:${f.id}`)}
                                                                                        strategy={rectSortingStrategy}
                                                                                    >
                                                                                        <div className="flex w-full gap-3 min-w-0 min-h-[44px]">
                                                                                            {(row.fields || []).map(field => (
                                                                                                <SortableItem key={field.id} id={`field:${field.id}`}>
                                                                                                    {({ sortableProps: fSortProps, dragHandleProps: fDragProps }) => (
                                                                                                        <div {...fSortProps} className="flex-1 min-w-0">
                                                                                                            <TemplateField
                                                                                                                id={field.id}
                                                                                                                type={field.type}
                                                                                                                label={field.label}
                                                                                                                url={field.url}
                                                                                                                value={field.value}
                                                                                                                options={field.options}
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
                                                                            );
                                                                        }
                                                                })()}

                                                                {(!row.type || row.type === "field") && (
                                                                    <button
                                                                        className="btn btn-accent text-2xl w-10 mt-10"
                                                                        onClick={() => {
                                                                            if ((row.fields?.length || 0) >= 5) {
                                                                                toast.show("A row cannot contain more than 5 fields", { type: "error" });
                                                                                return;
                                                                            }
                                                                            // Set target row before opening the modal
                                                                            setTargetRowId(row.id);
                                                                            (document.getElementById("new-field") as HTMLDialogElement | null)?.showModal();
                                                                        }}
                                                                    >
                                                                        +
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </SortableItem>
                                                ))}
                                            </div>
                                        </SortableContext>

                                        <button
                                            className="btn btn-accent text-2xl w-full mt-2"
                                            onClick={() => (document.getElementById("new-row") as HTMLDialogElement | null)?.showModal()}
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
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
                                                            className="flex items-center h-12 gap-4 tooltip tooltip-accent tooltip-right"
                                                            data-tip={category.label}
                                                            onClick={() => {
                                                                setActiveCategory(category.id);
                                                                setTab(null);
                                                            }}
                                                        >
                                                            <span
                                                                {...dragHandleProps}
                                                                className="flex items-center cursor-grab touch-none"
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