import { useTranslation } from "react-i18next";
import Metadata from "../../_common/components/Metadata.js";

export default function NotFound() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>
            <Metadata
                title={t("pages.404.status")}
            />
            
            <div className="bg-black flex items-center justify-center min-h-screen">
                <div className="mr-50 ml-50">
                    <pre><code>{t("pages.404.status")}</code></pre>
                </div>
            </div>
        </>
    );
}