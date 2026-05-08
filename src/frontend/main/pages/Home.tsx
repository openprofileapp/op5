import { useTranslation } from "react-i18next";
import { Metadata } from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";

export default function Home() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>  
            <Metadata />
            
            <Navbar dest="/about" />
            
            <div className="hero bg-base-200 h-[calc(100vh-65px)]">
                <div className="hero-content text-center">
                    <div className="max-w-md">
                        <h1 className="text-5xl font-bold">{t("pages.home.title")}</h1>
                        <p className="py-6">
                            {t("pages.home.body")}
                        </p>
                        <button className="btn btn-primary">{t("pages.home.button")}</button>
                    </div>
                </div>
            </div>
        </>
    );
}