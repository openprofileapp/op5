import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";

export default function ComingSoon() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>
            <Metadata
                title="Coming Soon"
                allowIndex="false"
            />

            <Navbar />
            
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <div className="rounded-full border border-base-300 flex flex-col items-center justify-center bg-base-100 w-100 h-100 text-center gap-4 text-2xl">

                    <img className="rounded-full" width={192}
                        src={`https://${window.config.domains.cdn}/graphics/alice-happy.svg`}
                    />

                    <span>Coming Soon</span>

                    <a className="tooltip tooltip-bottom tooltip-accent"
                        data-tip="Join to follow live-updates"
                        href={window.config.metadata.urls.discord.joinUpdateRoles}
                    >
                        <span className="text-2xl font-nerdfont"></span>
                    </a>

                </div>
            </div>

            <Footer />
        </>
    );
}