import { React, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";
import colors from "tailwindcss/colors";

import Metadata from "../../_common/components/Metadata.js";
import TemplateField from "./TemplateField.js";

export default function CharacterTemplate() {
    const { id } = useParams();
    const { t, ready } = useTranslation();

    const [drawerOpen, setDrawerOpen] = useState(true);

    const [activeCategory, setActiveCategory] = useState("name");
    const [activeTab, setActiveTab] = useState("");
    const [activeYear, setActiveYear] = useState(0);
    const [activeSeries, setActiveSeries] = useState(0);

    const [fieldRows, setFieldRows] = useState([
        {
            id: "row-1",
            items: [
                { id: "full-name", label: "Full Name" }
            ],
        },
        {
            id: "row-2",
            items: [
                { id: "first-name", label: "First Name" },
                { id: "middle-name", label: "Middle Name" },
                { id: "last-name", label: "Last Name" }
            ],
        },
    ]);

    function SortableRow({ row, children }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            transform,
            transition,
        } = useSortable({
            id: row.id,
        });

        return (
            <div
                ref={setNodeRef}
                className="w-full"
                style={{
                    transform: CSS.Transform.toString(transform),
                    transition,
                }}
            >
                {children({
                    dragHandleProps: {
                        ...attributes,
                        ...listeners,
                    },
                })}
            </div>
        );
    }

    function SortableCard({ item, children }) {
        const {
            attributes,
            listeners,
            setNodeRef,
            setActivatorNodeRef,
            transform,
            transition,
        } = useSortable({
            id: item.id,
        });

        return (
            <div
                ref={setNodeRef}
                style={{
                    transform: CSS.Transform.toString(transform),
                    transition,
                }}
            >
                {children({
                    dragHandleProps: {
                        ref: setActivatorNodeRef,
                        ...attributes,
                        ...listeners,
                    },
                })}
            </div>
        );
    }

    const handleDragEnd = ({active, over}) => {
        if (!over) return;

        const activeRowIndex = fieldRows.findIndex(r => r.id === active.id);

        if (activeRowIndex !== -1) {
            const overRowIndex = fieldRows.findIndex(r => r.id === over.id);

            if (overRowIndex !== -1) {
                setFieldRows(arrayMove(fieldRows, activeRowIndex, overRowIndex));
            }

            return;
        }

        let sourceRow;
        let sourceIndex;

        fieldRows.forEach(row => {
            const index = row.items.findIndex(i => i.id === active.id);
            if (index !== -1) {
                sourceRow = row;
                sourceIndex = index;
            }
        });

        if (!sourceRow) return;

        let targetRow;

        fieldRows.forEach(row => {
            if (row.items.some(i => i.id === over.id) || row.id === over.id) {
                targetRow = row;
            }
        });

        if (!targetRow) return;

        if (sourceRow.id === targetRow.id) {
            setFieldRows(fieldRows.map(row => {
                if (row.id !== sourceRow.id) return row;

                return {
                    ...row,
                    items: arrayMove(
                        row.items,
                        sourceIndex,
                        row.items.findIndex(i => i.id === over.id)
                    )
                };
            }));

            return;
        }

        if (targetRow.items.length >= 5) return;

        const item = sourceRow.items[sourceIndex];

        setFieldRows(rows.map(row => {
            if (row.id === sourceRow.id) {
                return {
                    ...row,
                    items: row.items.filter(i => i.id !== item.id)
                };
            }

            if (row.id === targetRow.id) {
                return {
                    ...row,
                    items: [...row.items, item]
                };
            }

            return row;
        }));
    };

    const setTab = (tab: string) => {
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

        return () => {
            window.removeEventListener("hashchange", updateTab);
        };
    }, []);

    if (!ready) return null;

    return (
        <>
            <Metadata
                title="Development"
                allowIndex="false"
            />

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
                                {activeCategory === "supernatural" && (
                                    <>
                                        {activeYear > 2010 && (
                                            <button
                                                className={`tab flex-1 ${
                                                    activeTab === "fire-manipulaton"
                                                        ? "tab-active bg-base-200"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setTab("fire-manipulaton")
                                                }
                                            >
                                                Fire Manipulaton
                                            </button>
                                        )}
                                        
                                        {activeYear > 2017 && (
                                            <button
                                                className={`tab flex-1 ${
                                                    activeTab === "force-manipulaton"
                                                        ? "tab-active bg-base-200"
                                                        : ""
                                                }`}
                                                onClick={() =>
                                                    setTab("force-manipulaton")
                                                }
                                            >
                                                Force Manipulaton
                                            </button>
                                        )}

                                        <button
                                            className="btn btn-accent text-2xl hidden"
                                        >
                                            +
                                        </button>
                                    </>
                                )}

                                {activeCategory === "relationships" && (
                                    <>
                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "about"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("about")
                                            }
                                        >
                                            Family
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "titles"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("titles")
                                            }
                                        >
                                            Friends
                                        </button>

                                        <button
                                            className={`tab flex-1 ${
                                                activeTab === "collaborations"
                                                    ? "tab-active bg-base-200"
                                                    : ""
                                            }`}
                                            onClick={() =>
                                                setTab("collaborations")
                                            }
                                        >
                                            Acquaintances
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </nav>
                    <div className="flex justify-center p-4">
                        <div className="bg-base-100 border border-base-300 p-4 rounded-lg z-1 w-232">
                            <div className="p-2 md:p-4">

                                {activeTab === "fire-manipulaton" && (
                                    <div className="flex flex-col gap-1">

                                        <DndContext
                                            collisionDetection={closestCorners}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={fieldRows.map(r => r.id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    {fieldRows.map(row => (
                                                        <SortableRow
                                                            key={row.id}
                                                            row={row}
                                                        >
                                                            {({dragHandleProps}) => (
                                                                <div className="flex gap-3">
                                                                    <span
                                                                        {...dragHandleProps}
                                                                    >
                                                                        <div className="flex h-full items-center justify-center py-2">
                                                                            <div className="flex h-full w-5 items-center justify-center rounded bg-base-300 cursor-grab">
                                                                                <span className="text-2xl leading-none font-nerdfont">
                                                                                󰇝
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    </span>

                                                                    <SortableContext
                                                                        items={row.items.map(i => i.id)}
                                                                        strategy={rectSortingStrategy}
                                                                    >
                                                                        <div className="flex w-full gap-3">
                                                                            {row.items.map(item => (
                                                                                <div key={item.id} className="flex-1">
                                                                                    <SortableCard item={item}>
                                                                                        {({ dragHandleProps }) => (
                                                                                            <TemplateField
                                                                                                id={item.id}
                                                                                                label={item.label}
                                                                                                dragHandleProps={dragHandleProps}
                                                                                            />
                                                                                        )}
                                                                                    </SortableCard>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </SortableContext>

                                                                    <button
                                                                        className="btn btn-accent text-2xl w-10 mt-10"
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </SortableRow>
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>

                                        <button
                                            className="btn btn-accent text-2xl w-full mt-2"
                                        >
                                            +
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="drawer-side is-drawer-close:overflow-visible">
                    <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
                        <div className="flex min-h-full flex-col items-center justify-center bg-base-100 is-drawer-close:w-14 is-drawer-open:w-64">                        <div className="menu w-full">
                            <ul>
                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Name"
                                        onClick={() =>
                                            setActiveCategory("name")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Name
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Astral"
                                        onClick={() =>
                                            setActiveCategory("astral")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Astral
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Physical"
                                        onClick={() =>
                                            setActiveCategory("physical")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Physical
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Supernatural"
                                        onClick={() =>
                                            setActiveCategory("supernatural")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Supernatural
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Personality"
                                        onClick={() =>
                                            setActiveCategory("personality")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Personality
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Favorites"
                                        onClick={() =>
                                            setActiveCategory("favorites")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Favorites
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Interactions"
                                        onClick={() =>
                                            setActiveCategory("interactions")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Interactions
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Emotional"
                                        onClick={() =>
                                            setActiveCategory("emotional")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Emotional
                                        </span>
                                    </button>
                                </li>

                                <li>
                                    <button 
                                        className="flex items-center gap-4 tooltip tooltip-accent tooltip-right"
                                        data-tip="Relationships"
                                        onClick={() =>
                                            setActiveCategory("relationships")
                                        }
                                    >
                                        <span className="font-nerdfont text-xl flex h-8 w-4 leading-none items-center justify-center">
                                            
                                        </span>
                                        <span className="is-drawer-close:hidden text-sm">
                                            Relationships
                                        </span>
                                    </button>
                                </li>

                                <button
                                    className="btn btn-accent text-2xl w-full mt-2"
                                >
                                    +
                                </button>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}