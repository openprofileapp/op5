import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../scripts/toast.js";
import { GetAssetType } from "../../../../_common/types/asset.type.js";
import { authBaseUrl } from "../../scripts/domains.js";
import { formatShortRelative } from "../../scripts/time.js";
import { GetSubscriptionType } from "../../../../_common/types/subscription.type.js";
import { CheckboxInput } from "../CheckboxInput.js";

export interface UnsubscribeModalRef {
    open: (data: GetAssetType) => void;
    close: () => void;
}

const UnsubscribeModal = forwardRef<UnsubscribeModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [data, setData] = useState<GetSubscriptionType | null>(null);
    const [reason, setReason] = useState<string>("");
    const [requestRefund, setRequestRefund] = useState<boolean>(false);

    const resetState = () => {
        setData(null);
        setReason("");
        setIsLoading(false);
        setRequestRefund(false);
    };

    useImperativeHandle(ref, () => ({
        open: async () => {
            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);

            try {
                const response = await fetch(
                    `${authBaseUrl}/billing/subscription`,
                    { credentials: "include" }
                );

                const data: GetSubscriptionType = await response.json();

                if (!response.ok) {
                    toast.show("Failed to get subscription end date", {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        subtext: `${data.id || ""}${data.id ? ": " : ""}${data?.message}`,
                        type: "error"
                    });

                    return;
                }

                setData(data);
            } catch (error) {
                toast.show("Failed to get subscription end date", {
                    subtext: String(error),
                    type: "error"
                });
            }
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
        >
            <div className="modal-box overflow-visible">
                <form method="dialog">
                    <button 
                        type="button" 
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>
                
                <h3 className="font-bold text-2xl mb-6 text-center">
                    Cancel Premium
                </h3>

                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Your subscription will end immediately and we will no longer charge your account.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            {requestRefund 
                                ? "Your ad-free experience and other benefits will end immediately." 
                                : `Your ad-free experience and other benefits will remain available until ${formatShortRelative(data?.endDate)}.`
                            }
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    {data?.refundEligible && !data?.isOver48Hours && data.hasPaid && (
                        <div className="my-1">
                            <CheckboxInput
                                label="Request Refund (once per account)"
                                checked={requestRefund}
                                onChange={(checked) => setRequestRefund(checked as unknown as boolean)}
                            />
                        </div>
                    )}
                        
                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        Reason
                        <textarea
                            className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                            id={`report-description`}
                            placeholder="Why are you unsubscribing from Premium? (optional)"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            onChange={(event) => setReason(event.target.value)}
                        />
                    </legend>
                </div>

                <div className="pt-4 flex gap-2 flex-row relative">
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={async () => {
                            setIsLoading(true);

                            try {
                                const response = await fetch(
                                    `${authBaseUrl}/billing/unsubscribe`,
                                    {
                                        method: "POST",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            reason,
                                            requestRefund,
                                        }),
                                    }
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                    setIsLoading(false);

                                    toast.show("Failed to unsubscribe", {
                                        subtext: `${data.id || ""}${data.id ? ": " : ""}${data.message}`,
                                        type: "error"
                                    });

                                    return;
                                }

                                toast.show("Subscription canceled", {
                                    type: "success"
                                });

                                window.location.reload();
                            } catch (error) {
                                setIsLoading(false);

                                toast.show("Failed to unsubscribe", {
                                    subtext: String(error),
                                    type: "error"
                                });
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                    >
                        <span className={`${isLoading ? "loading" : ""}`}>
                            Unsubscribe
                        </span>
                    </button>
                </div>
            </div>
        </dialog>
    );
});

UnsubscribeModal.displayName = "UnsubscribeModal";
export default UnsubscribeModal;
