import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../scripts/toast.js";
import { authBaseUrl } from "../../scripts/domains.js";
import { PartnerEarningsType } from "../../../../_common/types/partner.type.js";

export interface WithdrawModalRef {
    open: () => void;
    close: () => void;
}

const WithdrawModal = forwardRef<WithdrawModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [data, setData] = useState<PartnerEarningsType | null>(null);
    const [email, setEmail] = useState<string>("");
    const [confirmEmail, setConfirmEmail] = useState<string>("");
    const [amount, setAmount] = useState<string>("");

    const resetState = () => {
        setData(null);
        setEmail("");
        setConfirmEmail("");
        setAmount("");
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        open: async () => {
            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);

            try {
                const response = await fetch(
                    `${authBaseUrl}/billing/earnings/${window.session?.userId}`,
                    { credentials: "include" }
                );

                const data = await response.json();

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
                setEmail(data?.lastPayoutEmail);
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
                    Withdraw Earnings
                </h3>

                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Your earnings will be delivered directly to your PayPal account within minutes.
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        PayPal Email
                        <input
                            type="text"
                            className="input w-full"
                            value={email}
                            placeholder="What is an email connected to your PayPal account?"
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </legend>

                    <legend className="flex flex-col mb-2 items-start w-full fieldset-legend text-sm font-normal">
                        Confirm PayPal Email
                        <input
                            type="text"
                            className="input w-full"
                            placeholder="Retype the above email."
                            onChange={(event) => setConfirmEmail(event.target.value)}
                        />
                    </legend>
                    
                    <hr />

                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        Amount
                        <div className="flex w-full gap-2 items-center">
                            <div className="text-lg font-nerdfont text-center">
                                
                            </div>
                            <input
                                type="text"
                                inputMode="decimal"
                                className="input w-full"
                                placeholder="0.00"
                                value={amount}
                                onChange={(event) => {
                                    let value = event.target.value.replace(/[^0-9.]/g, "");

                                    const [whole, ...decimals] = value.split(".");
                                    value = decimals.length
                                        ? `${whole}.${decimals.join("").slice(0, 2)}`
                                        : whole;

                                    setAmount(value);
                                }}
                            />
                            <button 
                                className="btn btn-accent"
                                onClick={() => setAmount(data?.available as unknown as string)}
                            >
                                Max
                            </button>
                        </div>
                    </legend>
                </div>

                <span className="flex text-sub text-xs mt-2">
                    PayPal charges a $0.25 fee per withdrawal.
                    We'll cover the fee on all Withdrawals of $10 or more.
                    It is recommended to withdraw once a month.
                </span>

                <div className="pt-4 flex gap-2 flex-row relative">
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent ${
                            (Number(amount) <= 0.25 || !email || !confirmEmail || email !== confirmEmail)
                                ? "btn-disabled"
                                : ""
                        }`}
                        disabled={(Number(amount) <= 0.25) || !email || !confirmEmail || email !== confirmEmail}
                        onClick={async () => {
                            setIsLoading(true);

                            try {
                                const response = await fetch(
                                    `${authBaseUrl}/billing/withdraw`,
                                    {
                                        method: "POST",
                                        credentials: "include",
                                        headers: {
                                            "Content-Type": "application/json",
                                        },
                                        body: JSON.stringify({
                                            email,
                                            confirmEmail,
                                            amount: Number(amount).toFixed(2),
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
                            Withdraw ${Math.max(0, Number(amount) - (Number(amount) >= 10 ? 0 : 0.25)).toFixed(2)}
                        </span>
                    </button>
                </div>
            </div>
        </dialog>
    );
});

WithdrawModal.displayName = "WithdrawModal";
export default WithdrawModal;
