import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Metadata from "../components/Metadata.js";
import { isNightly, nightlyBaseUrl } from "../scripts/domains.js";
import Marquee from "../components/Marquee.js";

export default function ComingSoon() {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;

    return (
        <>
            <Metadata
                title={t("metadata.titles.construction")}
                allowIndex="false"
            />

            <div className="relative min-h-screen w-full flex items-center justify-center md:p-4 bg-base-200 overflow-hidden select-none"> 
                
                <Marquee 
                    primaryText={`${t("pages.construction.marquee.1")} • ${t("pages.construction.marquee.2")} • ${t("pages.construction.marquee.3")} • `}
                    secondaryText={`${t("pages.construction.marquee.2")} • ${t("pages.construction.marquee.1")} • ${t("pages.construction.marquee.3")} • `}
                />

                <div className="relative z-10 w-full h-screen md:h-auto md:w-128 md:max-w-full md:rounded-lg bg-base-100 p-6 flex flex-col items-center justify-center text-center gap-2 text-2xl border border-base-300">
                    <div>
                        <h3 className="font-nerdfont text-6xl text-center mb-4">
                            
                        </h3>

                        <h3 className="text-center text-2xl font-bold">
                            {t("metadata.titles.construction")}
                        </h3>

                        <p className="text-center text-sm text-sub py-4">
                            {!isNightly() && (t("pages.construction.subtext"))}
                            {isNightly() && (t("pages.construction.subtextNightly"))}
                        </p>
                    </div>

                    <div className="pt-2 flex flex-row gap-2 w-full">
                        {!isNightly() && (
                            <a
                                className="btn btn-secondary flex-1"
                                href={`${nightlyBaseUrl}${window.location.pathname}${window.location.search}`}
                            >
                                {t("pages.construction.nightly")}
                            </a>
                        )}

                        <a
                            className="btn btn-secondary flex-1"
                            href={window.config.metadata.urls.discord.joinUpdateRoles}
                        >
                            {t("pages.construction.updates")}
                        </a>
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
