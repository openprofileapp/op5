import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import CharacterCard from "../components/CharacterCard.js";

export default function SearchProfiles() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>  
            <Metadata
                title="Search"
                allowIndex="false"
            />
            
            <Navbar />

            {/* use border: 1px solid base300 smth on non-aura; */}

            <div className="px-4 py-4 md:px-14">
                <div className="flex flex-wrap gap-4">

                    <CharacterCard
                        id="6587823496323314"
                        aura={{ start: "#e03c17", end: "#e03c17" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/6587823496323314/6587823496323314.png"
                        name="Mable Jackson"
                        overview="Mable Jackson, also known as Eclipse, is an American martial arts and hacking prodigy, associate nurse, and scientist specializing in dragonite research."
                    />

                    <CharacterCard
                        id="6690301862165288"
                        aura={{ start: "#76d1ff", end: "#76d1ff" }}
                        name="AvatarKage"
                    />

                    <CharacterCard
                        id="1655391085225720"
                        name="Julia Anderson"
                    />

                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="card-tall skeleton">
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