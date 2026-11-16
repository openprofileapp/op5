import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";
import { toast } from "../../scripts/toast.js";
import { apiBaseUrl } from "../../scripts/domains.js";

export interface Props {
    id: string;
    message: string;
}

export interface AutomodModalRef {
    open: (data: Props) => void;
    close: () => void;
}

const AutomodModal = forwardRef<AutomodModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [data, setData] = useState<Props | null>(null);

    const resetState = () => {
        setData(null);
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data) => {
            setData(data ?? null);
            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal overflow-visible"
            onClose={handleClose}
        >
            <div className="modal-box flex flex-col">
                <form method="dialog">
                    <button 
                        type="button" 
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>

                <div className="flex flex-col items-center">
                    <h3 className="font-nerdfont text-warning text-6xl text-center mb-4">
                        
                    </h3>

                    <h3 className="text-center text-warning text-2xl font-bold">
                        AutoMod
                    </h3>

                    <p className="text-center text-sm text-sub py-2">
                        If you believe this is a mistake, please report it.
                    </p>

                    <div className="w-full my-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-sub">
                                Blocked Text
                            </span>
                        </div>

                        <textarea
                            className="textarea w-full resize-none !h-auto min-h-[2.5rem] max-h-30 [field-sizing:content]"
                            readOnly={true}
                            value={data?.message?.match(/"([^"]*)"$/)?.[1] ?? data?.message}
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 flex-row w-full pt-4 z-10 shrink-0">
                        <button
                            type="button"
                            className="btn btn-neutral flex-1"
                            onClick={handleClose}
                        >
                            Return to Editing
                        </button>

                        <button
                            type="button"
                            className="btn btn-error flex-1"
                            onClick={async () => {
                                setIsLoading(true);

                                const response = await fetch(
                                    `${apiBaseUrl}/v3/report/bug`, 
                                    { 
                                        credentials: "include", 
                                        method: "POST", 
                                        headers: {"Content-Type": "application/json"}, 
                                        body: JSON.stringify({ 
                                            type: "automod", 
                                            errorId: data?.id, 
                                            description: data?.message?.match(/"([^"]*)"$/)?.[1] ?? data?.message,
                                            affectsNightly: true
                                        })
                                    }
                                );

                                const json = await response.json();

                                if (response.ok) {
                                    setIsLoading(false);
                                    
                                    handleClose();

                                    toast.show(
                                        `${t("components.modals.report.result")}`, 
                                        { icon: "", type: "success" }
                                    );
                                } else {
                                    setIsLoading(false);

                                    toast.show(
                                        `${t("words.FailedTo")} submit bug report`,
                                        {
                                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                                            type: "error",
                                        }
                                    );
                                }
                            }}
                        >
                            <span className={`${isLoading ? "loading" : ""}`}>
                                Report Mistake
                            </span>
                        </button>
                    </div>
                </div>
            </div>
            <form 
                method="dialog" 
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

AutomodModal.displayName = "AutomodModal";
export default AutomodModal;
