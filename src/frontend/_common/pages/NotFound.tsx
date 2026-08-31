import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Metadata from "../components/Metadata.js";
import Marquee from "../components/Marquee.js";

export default function NotFound() {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title={t("metadata.titles.notFound")}
                allowIndex="false"
            />

            <div className="relative min-h-screen w-full flex items-center justify-center md:p-4 bg-base-200 overflow-hidden select-none"> 
                
                <Marquee 
                    primaryText={`${t("pages.notFound.marquee")} • ${t("pages.notFound.marquee")} • `}
                />

                <div className="relative z-10 w-full h-screen md:h-auto md:w-128 md:max-w-full md:rounded-lg bg-base-100 p-6 flex flex-col items-center justify-center text-center gap-2 text-2xl border border-base-300">
                    <div>
                        <h3 className="font-nerdfont text-6xl text-center mb-4">
                            󰡯
                        </h3>

                        <h3 className="text-center text-2xl font-bold">
                            {t("metadata.titles.notFound")}
                        </h3>

                        <p className="text-center text-sm text-sub py-4">
                            {t("pages.notFound.subtext")}
                        </p>
                    </div>

                    <div className="flex flex-row gap-2 w-full">
                        <Link
                            className="btn btn-accent flex-1"
                            to="/"
                        >
                            {t("pages.goHome")}
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
