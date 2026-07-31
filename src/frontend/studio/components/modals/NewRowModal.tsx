import { useState } from "react";
import { useTranslation } from "react-i18next";

type Screen = "menu" | "configure";

export type RowType = "field" | "split" | "media" | "timeline" | "calendar";

interface RowTypeOption {
    method: RowType;
    icon: string;
    title: string;
    description: string;
}

const TYPES: RowTypeOption[] = [
    {
        method: "field",
        icon: "󰈚",
        title: "Field",
        description: "Add up to five customizable input fields."
    },
    {
        method: "media",
        icon: "󰋩",
        title: "Media",
        description: "Upload or link a single image or video."
    },
    {
        method: "split",
        icon: "󰯌",
        title: "Split Layout",
        description: "Divide the row into two side-by-side sections."
    },
    {
        method: "timeline",
        icon: "󰙮",
        title: "Timeline",
        description: "Present events in chronological order along a visual timeline."
    },
    {
        method: "calendar",
        icon: "󰃭",
        title: "Calendar",
        description: "Display events, tasks, or routines by day, week, or month."
    }
];

export interface NewRowData {
    id: string;
    label: string;
    type: RowType;
}

interface NewRowModalProps {
    onAddRow: (data: NewRowData) => void;
}

export default function NewRowModal({ onAddRow }: NewRowModalProps) {
    const { ready } = useTranslation();

    const [loading] = useState(false);
    const [screen, setScreen] = useState<Screen>("menu");
    const [isSingleMethod] = useState(false);

    const [selectedType, setSelectedType] = useState<RowType>("field");
    const [rowLabel, setRowLabel] = useState("");
    const [rowId, setRowId] = useState("");

    function go(method: RowType) {
        setSelectedType(method);
        const defaultName = `${method.charAt(0).toUpperCase() + method.slice(1)} Row`;
        setRowLabel(defaultName);
        setRowId(`${method}-${Date.now().toString().slice(-4)}`);
        setScreen("configure");
    }

    function resetForm() {
        setScreen("menu");
        setRowLabel("");
        setRowId("");
    }

    function handleSave() {
        const finalLabel = rowLabel.trim() || "New Row";
        const finalId = rowId.trim() || `row-${Date.now()}`;

        onAddRow({
            id: finalId,
            label: finalLabel,
            type: selectedType
        });

        const modal = document.getElementById("new-row") as HTMLDialogElement | null;
        modal?.close();
        resetForm();
    }

    if (!ready) return null;

    return (
        <dialog id="new-row" className="modal" onClose={resetForm}>
            <div className="modal-box flex flex-col">

                <form method="dialog">
                    <button
                        type="submit"
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer"
                    >
                        
                    </button>
                </form>

                {!isSingleMethod && screen !== "menu" && (
                    <button
                        type="button"
                        className="absolute left-0 top-1 m-5 flex items-center gap-2 cursor-pointer"
                        onClick={() => setScreen("menu")}
                    >
                        <span className="text-xl font-nerdfont leading-none">
                            
                        </span>
                        <span>Back</span>
                    </button>
                )}

                <div className="absolute top-12 left-6 right-6 md:relative md:top-0 md:right-0 md:left-0 pointer-events-none mb-8">
                    <h3 className="font-nerdfont text-6xl text-center mb-4">
                        
                    </h3>

                    <h3 className="text-center text-2xl font-bold">
                        New Row
                    </h3>

                    <p className="text-center text-sm text-sub py-4">
                        {screen === "menu"
                            ? "What type of row do you want to add?"
                            : "Specify the row details to proceed."}
                    </p>
                </div>

                <div>
                    {loading && (
                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner" />
                        </div>
                    )}

                    {!loading && screen === "menu" && (
                        <div className="flex flex-col gap-2">
                            {TYPES.map((m) => (
                                <button
                                    key={m.method}
                                    type="button"
                                    className="btn bg-base-100 border border-base-300 gap-4 h-16"
                                    onClick={() => go(m.method)}
                                >
                                    <div className="text-xl w-6 font-nerdfont">
                                        {m.icon}
                                    </div>

                                    <div className="flex flex-col text-left flex-1">
                                        <div>{m.title}</div>

                                        <div className="text-xs font-normal text-sub">
                                            {m.description}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {screen === "configure" && (
                        <div className="py-4 text-center flex flex-col gap-4">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Row Title / Name"
                                value={rowLabel}
                                onChange={(e) => setRowLabel(e.target.value)}
                            />
                            <input
                                type="text"
                                className="input input-bordered w-full font-mono text-sm"
                                placeholder="Row ID (e.g. overview-row)"
                                value={rowId}
                                onChange={(e) =>
                                    setRowId(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                                }
                            />
                        </div>
                    )}
                </div>

                {screen === "configure" && (
                    <button
                        type="button"
                        onClick={handleSave}
                        className="absolute bottom-6 left-6 right-6 md:relative md:bottom-0 md:right-0 md:left-0 md:mt-4 btn btn-accent"
                    >
                        Continue
                    </button>
                )}
            </div>

            <form method="dialog" className="modal-backdrop">
                <button type="submit" />
            </form>
        </dialog>
    );
}
