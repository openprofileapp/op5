import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { apiBaseUrl, cdnBaseUrl } from "../../_common/scripts/domains.js";
import { WhatIsType } from "../../../_common/types/whatIs.type.js";

export interface AdDataProps {
    id: string;
    imageUrl: string;
    targetUrl: string;
    provider: WhatIsType;
}

interface AdvertisementBoxProps {
    className?: string;
    adSlot?: string;
}

export default function AdvertisementBox({
    className,
    adSlot,
}: AdvertisementBoxProps) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [forceApiAd] = useState<boolean>(() => Math.random() < 0.15);

    const [adFailed, setAdFailed] = useState<boolean>(forceApiAd);
    const [isAdLoaded, setIsAdLoaded] = useState<boolean>(false);

    const [apiAd, setApiAd] = useState<AdDataProps | null>(null);
    const [isFetchingApi, setIsFetchingApi] = useState<boolean>(false);

    const insRef = useRef<HTMLModElement>(null);

    const shouldBypass = Boolean(
        window.session?.permissions?.array?.includes("BYPASS_EXTERNAL_ADS")
    );

    useEffect(() => {
        if (!adFailed || shouldBypass) return;

        let isMounted = true;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsFetchingApi(true);

        const fetchAdvertisements = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/v3/advertisements?adSlot=${adSlot}`, {
                    credentials: "include",
                });

                if (!res.ok) {
                    if (isMounted) setIsFetchingApi(false);
                    return;
                }

                const data = await res.json();

                if (isMounted) {
                    if (data?.id && data?.imageUrl && data?.targetUrl) {
                        setApiAd({
                            id: data.id,
                            imageUrl: `${cdnBaseUrl}${data.imageUrl}`,
                            targetUrl: data.targetUrl,
                            provider: data.provider,
                        });
                    }
                    
                    setIsFetchingApi(false);
                }
            } catch (err) {
                console.error("Failed to fetch fallback API advertisement:", err);
                if (isMounted) setIsFetchingApi(false);
            }
        };

        fetchAdvertisements();

        return () => {
            isMounted = false;
        };
    }, [adFailed, adSlot, shouldBypass, t]);

    useEffect(() => {
        if (shouldBypass || forceApiAd) return;

        if (!window.adsbygoogle) {
            console.warn(
                "AdSense script missing (AdBlocker active or script failed to load). Fetching API ad fallback."
            );
            
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setAdFailed(true);
            return;
        }

        const client = window.config?.integrations?.adsence;
        if (!client || !adSlot) {
            console.error(
                `Missing configuration parameters: client='${client}', adSlot='${adSlot}'.`
            );

            setAdFailed(true);
            return;
        }

        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error("AdSense runtime execution error:", e);

            setAdFailed(true);
            return;
        }

        const checkAdStatus = setTimeout(() => {
            if (insRef.current) {
                const status = insRef.current.getAttribute("data-ad-status");
                const height = insRef.current.clientHeight;

                if (status === "filled" && height > 0) {
                    setIsAdLoaded(true);
                } else if (status === "unfilled" || height === 0) {
                    console.warn(
                        `AdSense slot '${adSlot}' failed to render. Fetching API ad fallback.`
                    );

                    setAdFailed(true);
                }
            }
        }, 1500);

        return () => clearTimeout(checkAdStatus);
    }, [adSlot, shouldBypass, forceApiAd]);

    const handleAdClick = async () => {
        if (!apiAd) return;

        const targetWindow = window.open("about:blank", "_blank");

        try {
            await fetch(`${apiBaseUrl}/v3/advertisements/click/${apiAd.id}/${adSlot}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
        } catch (err) {
            console.error("Failed to assign click log:", err);
        } finally {
            if (targetWindow) {
                targetWindow.opener = null;
                targetWindow.location.href = apiAd.targetUrl;
            }
        }
    };

    if (
        !isTranslationReady || 
        shouldBypass || 
        (!adFailed && !isAdLoaded) || 
        (adFailed && (isFetchingApi || !apiAd))
    ) {
        return null;
    }

    return (
        <div className={className}>
            <div className="flex flex-col w-full mb-6">
                <div className="w-full text-center text-lg font-bold">
                    {t("words.Advertisement")}
                </div>

                <Link
                    className="text-center mt-1 text-xs text-sub underline"
                    to="/premium"
                >
                    {t("defaults.hideAds")}
                </Link>
            </div>

            {adFailed && apiAd ? (
                <button
                    type="button"
                    onClick={handleAdClick}
                    className="flex justify-center w-full cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                    <img
                        className="rounded border border-base-300 w-48 md:w-full object-cover"
                        src={apiAd.imageUrl}
                        alt={t("words.Advertisement")}
                    />
                </button>
            ) : (
                <div className="w-full flex justify-center overflow-hidden min-h-[250px]">
                    <ins
                        ref={insRef}
                        className="adsbygoogle"
                        style={{ display: "block", width: "100%" }}
                        data-ad-client={window.config?.integrations?.adsence}
                        data-ad-slot={adSlot}
                        data-ad-format="auto"
                        data-full-width-responsive="true"
                    />
                </div>
            )}

            <div className="text-center mt-6 text-xs text-sub">
                {t("words.ProvidedBy")}{" "}
                
                {adFailed && apiAd ? (
                    <Link 
                        to={`/user/${apiAd.provider.primaryUsername || apiAd.provider.id}`} 
                        className="underline"
                    >
                        {apiAd.provider.displayName || apiAd.provider.primaryUsername || apiAd.provider.id}
                    </Link>
                ) : (
                    "Google"
                )}
            </div>
        </div>
    );
}
