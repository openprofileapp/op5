import { useState } from "react";
import { useTranslation } from "react-i18next";

type Screen = "menu" | "configure";

export type FieldType =
    | "text"
    | "dropdown"
    | "slider"
    | "color"
    | "rating"
    | "asset"
    | "button";

interface FieldTypeOption {
    method: FieldType;
    icon: string;
    title: string;
    description: string;
}

const TYPES: FieldTypeOption[] = [
    {
        method: "text",
        icon: "󰦨",
        title: "Text",
        description: "Enter single or multi-line markdown-supported text."
    },
    {
        method: "dropdown",
        icon: "",
        title: "Dropdown",
        description: "Write a new or choose existing options from a list."
    },
    {
        method: "slider",
        icon: "",
        title: "Slider",
        description: "Select a value within a range."
    },
    {
        method: "color",
        icon: "󰏘",
        title: "Color",
        description: "Choose a color value such as HEX, RGB, or other formats."
    },
    {
        method: "rating",
        icon: "",
        title: "Rating",
        description: "Rate using a custom icon or a score."
    },
    {
        method: "asset",
        icon: "",
        title: "Asset",
        description: "Select an existing asset to define a relationship."
    },
    {
        method: "button",
        icon: "",
        title: "Button",
        description: "Trigger an action or open a link."
    }
];

export interface NewFieldData {
    id: string;
    label: string;
    type: FieldType;
    // Type-specific properties
    url?: string;
    value?: any;
    options?: string[];
}

interface NewFieldModalProps {
    targetRowId: string | null;
    onAddField: (targetRowId: string, data: NewFieldData) => void;
}

export default function NewFieldModal({ targetRowId, onAddField }: NewFieldModalProps) {
    const { ready } = useTranslation();

    const [loading] = useState(false);
    const [screen, setScreen] = useState<Screen>("menu");
    const [isSingleMethod] = useState(false);

    const [selectedType, setSelectedType] = useState<FieldType>("text");
    const [fieldLabel, setFieldLabel] = useState("");
    const [fieldId, setFieldId] = useState("");

    // Custom configuration fields per type
    const [buttonUrl, setButtonUrl] = useState("");

    function go(method: FieldType) {
        setSelectedType(method);
        const defaultName = `${method.charAt(0).toUpperCase() + method.slice(1)} Field`;
        setFieldLabel(defaultName);
        setFieldId(`${method}-${Date.now().toString().slice(-4)}`);
        setButtonUrl("");
        setScreen("configure");
    }

    function resetForm() {
        setScreen("menu");
        setFieldLabel("");
        setFieldId("");
        setButtonUrl("");
    }

    function handleSave() {
        if (!targetRowId) return;

        const finalLabel = fieldLabel.trim() || `${selectedType.toUpperCase()} Field`;
        const finalId = fieldId.trim() || `${selectedType}-${Date.now()}`;

        const fieldPayload: NewFieldData = {
            id: finalId,
            label: finalLabel,
            type: selectedType,
            ...(selectedType === "button" && { url: buttonUrl.trim() || "#" }),
            ...(selectedType === "dropdown" && { options: ["Option 1", "Option 2"], value: "" }),
            ...(selectedType === "slider" && { value: 50 }),
            ...(selectedType === "color" && { value: "#000000" }),
            ...(selectedType === "rating" && { value: 5 }),
            ...(selectedType === "text" && { value: "" })
        };

        onAddField(targetRowId, fieldPayload);

        const modal = document.getElementById("new-field") as HTMLDialogElement | null;
        modal?.close();
        resetForm();
    }

    if (!ready) return null;

    return (
        <dialog id="new-field" className="modal" onClose={resetForm}>
            <div className={`modal-box flex flex-col ${TYPES.length > 5 && screen === "menu" ? "max-w-245" : ""}`}>

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
                        New Field
                    </h3>

                    <p className="text-center text-sm text-sub py-4">
                        {screen === "menu"
                            ? "What type of field do you want to add?"
                            : "Specify the field details to proceed."}
                    </p>
                </div>

                <div>
                    {loading && (
                        <div className="flex justify-center py-10">
                            <span className="loading loading-spinner" />
                        </div>
                    )}

                    {!loading && screen === "menu" && (
                        <div
                            className={`grid gap-2 ${
                                TYPES.length > 5 ? "grid-cols-2" : "grid-cols-1"
                            }`}
                        >
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
                                placeholder={selectedType === "button" ? "Button Label" : "Field Label / Name"}
                                value={fieldLabel}
                                onChange={(e) => setFieldLabel(e.target.value)}
                            />

                            <input
                                type="text"
                                className="input input-bordered w-full font-mono text-sm"
                                placeholder="Field ID (e.g. nickname)"
                                value={fieldId}
                                onChange={(e) =>
                                    setFieldId(e.target.value.toLowerCase().replace(/\s+/g, "-"))
                                }
                            />

                            {/* TYPE-SPECIFIC CONFIGURE INPUTS */}
                            {selectedType === "button" && (
                                <input
                                    type="text"
                                    className="input input-bordered w-full"
                                    placeholder="Button Action / Link URL (e.g. https://...)"
                                    value={buttonUrl}
                                    onChange={(e) => setButtonUrl(e.target.value)}
                                />
                            )}
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
