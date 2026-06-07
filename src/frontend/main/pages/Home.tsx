import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import CharacterCard from "../components/CharacterCard.js";

export default function Home() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>  
            <Metadata />
            
            <Navbar isBannerPage={true} />

            <div className="hero bg-base-200 h-150">
                <div
                    className="absolute top-[64px] inset-0 bg-cover bg-center h-150"
                    style={{
                        backgroundImage: `url(https://${window.config.domains.cdn}/media/hero.png)`,
                        opacity: 0.15
                    }}
                />

                <div
                    className="absolute inset-0 pointer-events-none top-[64px] h-150"
                    style={{
                        background: `
                            linear-gradient(
                                to bottom,
                                #080808 0%,
                                transparent 25%,
                                transparent 75%,
                                var(--color-base-200) 100%
                            )
                        `,
                    }}
                />

                <div className="hero-content text-center px-4 md:px-16">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Your 
                            <span className="ml-3 text-rotate duration-6000">
                                <span>
                                    <span>Characters</span>
                                    <span>Universes</span>
                                    <span>Worlds</span>
                                </span>
                            </span>
                            . All in one place.
                        </h1>
                        <p className="py-6">
                            OpenProfile is a free collaborative platform to create and share original characters using an advanced template and a public database.
                        </p>
                        <p className="pb-6 text-xs italic">
                            The most advanced character profile in the world — created by writers for writers!
                        </p>
                        <div className="flex justify-center gap-3">
                            <button className="btn btn-primary p-6" onClick={()=>document.getElementById("login").showModal()}>Get Started</button>
                            <button className="btn btn-outline btn-primary p-6">Browse Characters</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-14">
                <div className="text-lg pb-5">Popular Characters</div>
                
                <div className="flex gap-4 overflow-x-auto mb-8">
                    <CharacterCard
                        id="0"
                        avatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/Screenshot_2026-05-17_110157.png`}
                        animatedAvatar={`https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/ezgif-3bddc376754c9ed9.gif`}
                        name="AvatarKage"
                        owner={{
                            id: "0",
                            name: "?",
                            type: "user" // p.owner.type
                        }}
                        about="Testing how good GIFs would work."
                        interactions={{
                            views: {
                                count: 0,
                                interacted: true
                            },
                            likes: {
                                count: 0,
                                interacted: false
                            }
                        }}
                    />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                    <SkeletonCharacterCard />
                </div>
            </div>

            <Footer />
        </>
    );
}