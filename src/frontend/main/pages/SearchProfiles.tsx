import { useTranslation } from "react-i18next";

import { Metadata } from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";

export default function SearchProfiles() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>  
            <Metadata />
            
            <Navbar />

            <div className="px-4 md:px-14">
                <div className="sticky top-16 pb-5 pt-4 z-1 bg-base-200 flex flex-row gap-4">
                    <div className="flex flex-1 flex-col">
                        <legend className="fieldset-legend text-sm">Search</legend>
                        <label className="input w-full">
                            <span className="font-nerdfont text-base mr-1"></span>
                            <input type="search" required placeholder="Search by overview or topic..." />
                        </label>
                    </div>

                    <fieldset className="fieldset w-40">
                        <legend className="fieldset-legend text-sm">Type</legend>
                        <select className="select relative top-[-4px]" defaultValue="All">
                            <option>All</option>
                            <option>Verified</option>
                            <option disabled={true}>Complated</option>
                        </select>
                    </fieldset>
                </div>
     
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

            <Footer />
        </>
    );
}