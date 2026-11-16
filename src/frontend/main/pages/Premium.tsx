import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import { authBaseUrl } from "../../_common/scripts/domains.js";
import { useModals } from "../../_common/hooks/ModalContext.hook.js";
import { GetSubscriptionType } from "../../../_common/types/subscription.type.js";
import { toast } from "../../_common/scripts/toast.js";

export default function Premium() {
    const { ready: isTranslationReady } = useTranslation();
    const { subscribeModal, unsubscribeModal } = useModals();

    const [data, setData] = useState<GetSubscriptionType | null>(null);
    const [isPremiumActivating, setIsPremiumActivating] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await fetch(
                    `${authBaseUrl}/billing/subscription`,
                    { credentials: "include" }
                );

                const data: GetSubscriptionType = await response.json();

                if (!response.ok) {
                    toast.show("Failed to get subscription data", {
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        subtext: `${data.id || ""}${data.id ? ": " : ""}${data?.message}`,
                        type: "error"
                    });

                    return;
                }

                setData(data);

                setIsPremium(
                    data?.subscription?.method === "PAYPAL" 
                    && data?.subscription?.status !== "PENDING"
                    && data?.subscription?.status !== "CANCELED"
                )
            } catch (error) {
                toast.show("Failed to get subscription data", {
                    subtext: String(error),
                    type: "error"
                });
            }
        };

        fetchSubscription();

        const interval = setInterval(() => {
            fetchSubscription();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (
            data?.hasPaid ||
            (data?.endDate && new Date(data.endDate) > new Date())
        ) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsPremiumActivating(false);
        }
    }, [data?.endDate, data?.hasPaid]);

    useEffect(() => {
        const url = new URL(window.location.href);

        const paymentParams = ["token", "ba_token", "subscription_id"];

        const hasParams = paymentParams.some((param) =>
            url.searchParams.has(param)
        );

        if (hasParams) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsPremium(true);
            setIsPremiumActivating(true);

            paymentParams.forEach((param) => {
                url.searchParams.delete(param);
            });

            window.history.replaceState({}, "", url.toString());
        }
    }, []);

    const isPrecursor = data?.subscription?.method === "PRECURSOR_GIFT"

    const isGifted = data?.subscription?.method === "PARTNER_GIFT"

    const auraStyle: React.CSSProperties = {
        ["--aura-type" as string]: "aura-flow",
        ["--aura-primary" as string]: "var(--color-premium)",
        ["--aura-secondary" as string]: "var(--color-premium)",
    }

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title="Premium"
            />

            <div className="flex flex-col gap-12 min-h-[calc(100vh-64px)] items-center justify-center py-16">
                <span className="text-4xl font-bold pointer-events-none">
                    Support OpenProfile
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-5xl mx-auto px-4">
                    <div className="card w-full h-full bg-base-100 border border-alt text-white relative z-1">
                        <div className="card-body rounded-lg flex flex-col">
                            <div className="flex justify-between items-center gap-4">
                                <h2 className="text-3xl font-bold">
                                    Standard
                                </h2>
                                <span className="text-xl">
                                    FREE
                                </span>
                            </div>

                            <ul className="mt-6 flex flex-col gap-3 text-sm">
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Unlimited characters</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Unlimited collaborators</span>
                                </li>
                            </ul>

                            <div className="mt-auto">
                                <button
                                    className={`btn bg-accent text-white btn-block ${isGifted || isPrecursor || !isPremium  || isPremiumActivating? "btn-disabled" : ""}`}
                                    onClick={unsubscribeModal.open}
                                    disabled={isGifted || isPrecursor || !isPremium || isPremiumActivating}
                                >
                                    {isGifted
                                        ? "Not available during a gift"
                                        : isPrecursor
                                            ? "Not available for your account"
                                            : isPremiumActivating
                                                ? "Not available during activation"
                                                : isPremium
                                                    ? "Switch Plan"
                                                    : "Current Plan"
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="aura-effect card w-full h-full bg-base-100 border border-alt text-white relative z-1"
                        style={auraStyle}
                    >
                        <div className="card-body rounded-lg flex flex-col">
                            <div className="flex justify-between items-center gap-4">
                                <h2 className="text-3xl font-bold">
                                    Premium
                                </h2>

                                <div className="flex flex-col items-end">
                                    <span className="text-xl">
                                        {isPrecursor ? "$0.00/mo" : "$4.99/mo"}
                                    </span>

                                    {isPrecursor && (
                                        <span className="text-xs text-sub">
                                            Price exclusive to your account
                                        </span>
                                    )}
                                </div>
                            </div>
                            <ul className="mt-6 flex flex-col gap-3 text-sm">
                                <li className="text-sub">
                                    <span>All in Standard plus:</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>No ads</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Custom themes</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Profile auras</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Premium badge</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Premium Discord community role</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Characters become more visible in the algorithm</span>
                                </li>
                                <li>
                                    <span className="inline-block w-3 text-center text-base leading-none font-nerdfont text-success mr-2"></span>
                                    <span>Animated avatars</span>
                                </li>
                            </ul>

                            <div className="mt-6">
                                <button
                                    className={`btn bg-premium text-black btn-block ${isPrecursor || isPremium || isPremiumActivating ? "btn-disabled" : ""}`}
                                    onClick={subscribeModal.open}
                                    disabled={isPrecursor || isPremium || isPremiumActivating}
                                >
                                    {isPremiumActivating && (
                                        <span className="loading"></span>
                                    )}

                                    {isGifted
                                        ? "Subscribe now. Pay when your gift ends."
                                        : isPrecursor
                                            ? "Included with your account"
                                            : isPremiumActivating
                                                ? "Premium is activating..."
                                                : isPremium
                                                    ? "Current Plan"
                                                    : "Subscribe"
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
