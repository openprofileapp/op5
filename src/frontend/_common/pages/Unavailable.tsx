import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Metadata from "../components/Metadata.js";
import Marquee from "../components/Marquee.js";
import { verifySession } from "../scripts/session.js";

export default function Unavailable() {
    const { t, ready: isTranslationReady } = useTranslation();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(60);

    useEffect(() => {
        if (window.session?.userId) {
            if (window.history.length > 1) {
                navigate(-1);
            } else {
                navigate("/", { replace: true });
            }
        }
    }, [navigate]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    verifySession();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate]);

    if (!isTranslationReady || window.session.userId) return null;

    return (
        <>
            <Metadata
                title={t("metadata.titles.unavailable")}
                allowIndex="false"
            />

            <div className="relative min-h-screen w-full flex items-center justify-center md:p-4 bg-base-200 overflow-hidden select-none"> 
                
                <Marquee 
                    primaryText={`${t("pages.unavailable.marquee")} • ${t("pages.unavailable.marquee")} • `}
                />

                <div className="relative z-10 w-full h-screen md:h-auto md:w-128 md:max-w-full md:rounded-lg bg-base-100 p-6 flex flex-col items-center justify-center text-center gap-2 text-2xl border border-base-300">
                    <div>
                        <h3 className="font-nerdfont text-6xl text-center mb-4">
                            
                        </h3>

                        <h3 className="text-center text-2xl font-bold">
                            {t("metadata.titles.unavailable")}
                        </h3>

                        <p className="text-center text-sm text-sub py-4">
                            {t("pages.unavailable.subtext")}
                        </p>

                        <p className="text-center text-sm text-sub pb-4">
                            {t("pages.unavailable.update")} {countdown} {t("pages.seconds")}...
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
