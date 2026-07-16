import { useTranslation } from "react-i18next";

import isGateway from "../helpers/isGateway.js";

import Metadata from "../components/Metadata.js";
import Navbar from "../../main/components/Navbar.js";
import Footer from "../../main/components/Footer.js";

export default function NotFound() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>
            <Metadata
                title="Not Found"
                allowIndex="false"
            />

            <Navbar />
                        
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="rounded-full border border-base-300 flex flex-col items-center justify-center bg-base-100 w-100 h-100 text-center gap-4 text-2xl">

                    <img className="rounded-full" width={192}
                        src={`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/graphics/alice-happy.svg`}
                    />

                    <span>404 - Not Found</span>
                </div>
            </div>

            <Footer />
        </>
    );
}