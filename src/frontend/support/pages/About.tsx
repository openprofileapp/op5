import Navbar from "../components/Navbar.js";

import { useTranslation } from "react-i18next";
import { Metadata } from "../../_common/components/Metadata.js";

export default function About() {
    const { t, ready } = useTranslation();

    if (!ready) return null;

    return (
        <>
            <Metadata
                title={t("pages.about.helmet.title")}
            />

            <Navbar dest="/" />

            <div className="hero bg-base-200 h-[calc(100vh-65px)]">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <p className="py-6">
                            {t("pages.about.description")}
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}