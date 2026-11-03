import { useTranslation } from "react-i18next";
import {
    useState,
    useRef,
    useImperativeHandle,
    forwardRef,
    useCallback,
    useEffect
} from "react";

import { toast } from "../../scripts/toast.js";
import { authBaseUrl } from "../../scripts/domains.js";
import { GetSubscriptionType } from "../../../../_common/types/subscription.type.js";
import { formatShortRelative } from "../../scripts/time.js";

export interface SubscribeModalRef {
    open: () => void;
    close: () => void;
}

const SubscribeModal = forwardRef<SubscribeModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [data, setData] = useState<GetSubscriptionType | null>(null);

    const resetState = useCallback(() => {
        setData(null);
        setIsLoading(false);
    }, []);

    const open = useCallback(async () => {
        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }

        try {
            const response = await fetch(
                `${authBaseUrl}/billing/subscription`,
                { credentials: "include" }
            );

            const subscription: GetSubscriptionType = await response.json();

            if (!response.ok) {
                toast.show("Failed to get subscription end date", {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    subtext: `${subscription.id || ""}${subscription.id ? ": " : ""}${subscription?.message}`,
                    type: "error"
                });

                return;
            }

            setData(subscription);
        } catch (error) {
            toast.show("Failed to get subscription end date", {
                subtext: String(error),
                type: "error"
            });
        }
    }, []);

    const close = useCallback(() => {
        dialogRef.current?.close();
        resetState();
    }, [resetState]);

    useImperativeHandle(
        ref,
        () => ({
            open,
            close
        }),
        [open, close]
    );

    useEffect(() => {
        const handleOpen = () => {
            void open();
        };

        window.addEventListener("open-subscribe-modal", handleOpen);

        return () => {
            window.removeEventListener("open-subscribe-modal", handleOpen);
        };
    }, [open]);

    const handleClose = () => {
        close();
    };

    const isEndDateToday =
        !data?.endDate ||
        new Date(data?.endDate ?? "").toDateString() === new Date().toDateString();

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
                    Subscribe to Premium
                </h3>

                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            You will be charged $4.99
                            {" "}
                            {isEndDateToday ? "today" : `on ${formatShortRelative(data?.endDate)}`}
                            {" "}
                            and automatically every month {!isEndDateToday && "after"} until you cancel your subscription.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            You will be redirected to our secure payment provider to complete your payment.
                        </div>
                    </div>

                    {data?.refundEligible && (
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>

                            <div>
                                Cancel within 48 hours and get a full refund.

                                <div className="text-xs text-sub mt-1">
                                    Limited once per account. Benefits will end immediately.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 flex gap-2 flex-row relative">
                    <button
                        className="btn flex-1 bg-premium text-base-100 border-premium"
                        disabled={isLoading}
                        onClick={async () => {
                            setIsLoading(true);

                            try {
                                const response = await fetch(
                                    `${authBaseUrl}/billing/subscribe`, 
                                    { credentials: "include" }
                                );

                                const data = await response.json();

                                if (!response.ok) {
                                    setIsLoading(false);

                                    toast.show(
                                        "Failed to subscribe",
                                        {
                                            subtext: `${data.id || ""}${data.id ? ": " : ""}${data.message}`,
                                            type: "error",
                                        }
                                    );
                                } else {
                                    window.location.assign(data.approvalUrl);
                                }
                            } catch (error) {
                                setIsLoading(false);

                                toast.show("Failed to subscribe", {
                                    subtext: String(error),
                                    type: "error",
                                });
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                    >
                        <span className={isLoading ? "loading" : ""}>
                            Subscribe
                        </span>
                    </button>
                </div>
            </div>
        </dialog>
    );
});

SubscribeModal.displayName = "SubscribeModal";
export default SubscribeModal;
