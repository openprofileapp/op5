import { useState } from "react";
import { useTranslation } from "react-i18next";

type Screen = "menu" | "configure";

export type AssetType =
    | "character"
    | "universe"
    | "collection";

interface AssetTypeOption {
    method: AssetType;
    icon: string;
    title: string;
    description: string;
}

const TYPES: AssetTypeOption[] = [
    {
        method: "character",
        icon: "",
        title: "Character",
        description: "NO DESCRIPTION....."
    },
    {
        method: "universe",
        icon: `
            <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.8544 8.37058C23.866 11.3822 24.2665 16.0132 22.0594 19.458C22.0821 19.5181 22.1004 19.5822 22.1252 19.6461C22.3595 20.2508 22.7073 21.0766 23.0596 22.0241C23.1786 22.3462 23.1016 22.7093 22.8608 22.954C22.619 23.1987 22.255 23.2804 21.931 23.165C20.9381 22.8099 20.1193 22.4721 19.4933 22.2321C19.4391 22.2114 19.3856 22.1933 19.3342 22.174C15.8916 24.3666 11.2725 23.964 8.26671 20.9582C5.2723 17.9638 4.86015 13.3674 7.02492 9.92893C6.99483 9.84754 6.96724 9.76091 6.93317 9.67201C6.69318 9.04601 6.35545 8.22749 6.00029 7.23431C5.88432 6.90997 5.96627 6.54654 6.21134 6.3045C6.45612 6.06356 6.81903 5.98646 7.14115 6.10569C8.08841 6.45791 8.91471 6.80585 9.51921 7.04009C9.61808 7.07839 9.71524 7.10619 9.80519 7.13949C13.2458 4.96038 17.8541 5.37032 20.8544 8.37058Z" fill="#eaeaea"/>
                <path d="M3.09602 0.626051C5.03139 -0.491276 7.43306 -0.0648266 8.87922 1.52156C8.91278 1.51823 8.94795 1.51762 8.98372 1.51375C9.32201 1.4771 9.78778 1.41224 10.3157 1.36238C10.4951 1.34584 10.6688 1.43467 10.7601 1.58992C10.8513 1.74568 10.843 1.94138 10.7406 2.08992C10.4259 2.54477 10.1435 2.9137 9.93684 3.19832C9.91896 3.22295 9.90279 3.24816 9.88606 3.27156C9.98075 3.57206 10.0415 3.8781 10.0736 4.18465C9.9221 4.24946 9.7715 4.31708 9.62239 4.38875C9.1467 4.19801 8.57246 3.9708 8.01301 3.76277L8.00911 3.76082C6.78256 3.30687 5.39633 3.59853 4.45735 4.52254L4.45442 4.52547C3.51426 5.45414 3.20446 6.84158 3.64583 8.07625C3.77731 8.44393 3.91117 8.79779 4.03743 9.12605C3.27435 8.88721 2.5706 8.45403 2.00813 7.84675C1.96294 7.85094 1.91506 7.85331 1.86555 7.85847C1.51576 7.89508 1.05469 7.95495 0.503248 8.00007C0.323143 8.0148 0.149296 7.92468 0.0598885 7.76765C-0.0289832 7.61087 -0.0179192 7.4157 0.0862557 7.26863C0.393287 6.83657 0.681417 6.46497 0.882154 6.1905C0.91497 6.14563 0.942929 6.10068 0.971998 6.05965C0.334808 4.01987 1.16793 1.73923 3.09602 0.626051Z" fill="#eaeaea"/>
            </svg>
        `,
        title: "Universe",
        description: "NO DESCRIPTION....."
    },
    {
        method: "collection",
        icon: "󰉓",
        title: "Collection",
        description: "NO DESCRIPTION....."
    }
];

export interface NewFieldData {
    id: string;
    label: string;
    type: AssetType;
    url?: string;
    value?: any;
    options?: string[];
}

export default function CreateAssetModal() {
    const { t, ready: isTranslationReady } = useTranslation();

    const [loading] = useState(false);
    const [screen, setScreen] = useState<Screen>("menu");
    const [isSingleMethod] = useState(false);

    const [selectedType, setSelectedType] = useState<AssetType>("text");
    const [fieldLabel, setFieldLabel] = useState("");
    const [fieldId, setFieldId] = useState("");

    const [buttonUrl, setButtonUrl] = useState("");

    function go(method: AssetType) {
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

        // SAVE TO API THEN REDIRECT TO IT IN STUDIO

        const modal = document.getElementById("new-field") as HTMLDialogElement | null;
        modal?.close();
        resetForm();
    }

    if (!isTranslationReady) return null;

    return (
        <dialog id="create-asset" className="modal" onClose={resetForm}>
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
                        New Asset
                    </h3>

                    <p className="text-center text-sm text-sub py-4">
                        {screen === "menu"
                            ? "What type of asset do you want to create?"
                            : "Fill in the asset details to proceed."}
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
                                        {m.icon.trim().startsWith('<svg') ? (
                                            <span dangerouslySetInnerHTML={{ __html: m.icon }} />
                                        ) : (
                                            m.icon
                                        )}
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
        </dialog>
    );
}
