import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, useEffect, useCallback } from "react";
import { FieldNameType } from "../../../../_common/types/field.type.js";

export interface SaveFailedData {
    fieldId?: string;
    type?: FieldNameType;
    value?: unknown;
    [key: string]: unknown;
}

export interface InteractionOptions {
    onRetry?: () => void | Promise<void>;
}

export interface SaveFailedModalRef {
    open: (data?: SaveFailedData | null, options?: InteractionOptions) => void;
    close: () => void;
}

const retrySeconds = 3;

const SaveFailedModal = forwardRef<SaveFailedModalRef>((_, ref) => {
    const { ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isOpen, setIsOpen] = useState(false);
    const [countdown, setCountdown] = useState(retrySeconds);
    const [data, setData] = useState<SaveFailedData | null>(null);
    const [copied, setCopied] = useState(false);

    const optionsRef = useRef<InteractionOptions | undefined>(undefined);

    const resetState = () => {
        setCountdown(retrySeconds);
        setIsOpen(false);
        setData(null);
        setCopied(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data, options) => {
            optionsRef.current = options;
            setData(data ?? null);
            setCountdown(retrySeconds);
            setIsOpen(true);
            setCopied(false);
            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    const executeRetry = useCallback(async () => {
        try {
            if (optionsRef.current?.onRetry) {
                await optionsRef.current.onRetry();
            }
        } finally {
            setCountdown(retrySeconds);
        }
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    executeRetry();
                    return retrySeconds;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, executeRetry]);

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    const handleCopy = async () => {
        if (data?.value !== undefined && data?.value !== null && data?.value !== "") {
            const textToCopy = typeof data.value === "string" 
                ? data.value 
                : JSON.stringify(data.value, null, 2);

            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
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
                    <h3 className="font-nerdfont text-error text-6xl text-center mb-4">
                        
                    </h3>

                    <h3 className="text-center text-error text-2xl font-bold">
                        Save Failed
                    </h3>

                    <p className="text-center text-sm text-sub py-2">
                        Changes within the last few seconds were not saved.
                    </p>

                    {data?.value !== undefined && data?.value !== null && data?.value !== "" && (
                        <div className="w-full my-4">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs text-sub uppercase">
                                    Your text
                                </span>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    className="text-xs text-sub uppercase border border-base-300 rounded bg-base-100 px-2 py-1 cursor-pointer"
                                >
                                    {copied ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            <textarea
                                className="textarea w-full resize-none !h-auto min-h-[2.5rem] max-h-30 [field-sizing:content]"
                                readOnly={true}
                                value={typeof data.value === "string" ? data.value : JSON.stringify(data.value, null, 2)}
                            />
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center my-4">
                        <div className="flex flex-col items-center gap-2">
                            <div className="loading loading-lg" />

                            <div className="text-sm font-semibold mt-2">
                                Retrying in {countdown}...
                            </div>
                        </div>
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

SaveFailedModal.displayName = "SaveFailedModal";
export default SaveFailedModal;
