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

            <label className="input">
                <span className="font-nerdfont text-base mr-1"></span>
                <input type="search" required placeholder="Search" />
            </label>

            <div className="px-4 md:px-16">                
                <div className="flex flex-wrap gap-4">
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                </div>
            </div>

        </>
    );
}