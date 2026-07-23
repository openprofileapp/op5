import { useState } from "react";
import { useTranslation } from "react-i18next";

type MfaScreen =
    | "menu"
    | "totp"
    | "biometric"
    | "connection"
    | "qr"
    | "backup";

type MfaMethod =
    | "field"
    | "split"
    | "media"
    | "timeline"
    | "calendar"

const TYPES: {
    method: string;
    icon: string;
    title: string;
    description: string;
}[] = [
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

export default function NewFieldModal() {
    const { ready } = useTranslation();

    const [loading] = useState(false);
    const [screen, setScreen] = useState<MfaScreen>("menu");
    const [isSingleMethod] = useState(false);

    function go(method: MfaMethod) {
        setScreen(method);
    }

    if (!ready) return null;

    return (
        <dialog id="new-field" className="modal">
            <div className={`modal-box flex flex-col ${TYPES.length > 5 && screen === "menu" ? "max-w-245" : ""}`}>

                <form method="dialog">
                    <button
                        className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer"
                    >
                        
                    </button>
                </form>

                {!isSingleMethod && screen !== "menu" && (
                    <button
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
                            : "Complete the challenge to proceed."}
                    </p>
                </div>

                <div>
                    {loading &&
                        screen !== "biometric" &&
                        screen !== "qr" && 
                    (
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

                    {screen === "totp" && (
                        <div className="py-8 text-center">
                            TOTP Challenge
                        </div>
                    )}

                    {screen === "biometric" && (
                        <div className="py-8 text-center">
                            Biometric Challenge
                        </div>
                    )}

                    {screen === "connection" && (
                        <div className="py-8 text-center">
                            Connected Account Challenge
                        </div>
                    )}

                    {screen === "qr" && (
                        <div className="py-8 text-center">
                            QR Code Challenge
                        </div>
                    )}

                    {screen === "backup" && (
                        <div className="py-8 text-center">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Enter backup code"
                            />
                        </div>
                    )}
                </div>

                {screen === "backup" && (
                    <button
                        type="button"
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