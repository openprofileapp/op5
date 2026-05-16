import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";
import ProjectCard from "../components/ProjectCard.js";

// DEFINE TYPE PROFILE SOMEWHERE GLOBALLY

export default function SearchProfiles() {
    const { t, ready } = useTranslation();

    const [profiles, setProfiles] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfiles = async () => {
            try {
                const res = await fetch(`https://${window.config.domains.api}/v1/profiles?visibility=public`);
                const data = await res.json();

                setProfiles(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfiles();
    }, []);

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

                <div className="mt-4 mb-6 text-xl font-bold">Popular</div>

                <div className="flex flex-wrap gap-4">

                    {loading && (
                        <>
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                            <SkeletonCharacterCard />
                        </>
                    )}

                    {!loading && (
                        <>
                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                name="Dragonights"
                                slug="dragonights"
                                owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                status="Follow to keep up with the J9 universe."
                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#7b22fd", secondary: "#e6d044" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/pq_bookert@2xww.jpg"
                                name="Portal Quest"
                                slug="portalquest"
                                owner={{ id: "5019646586243236", username: "1052", name: "1052 Productions", isVerified: true, type: "publisher" }}
                                status="One of the oldest Minecraft animated films"
                                about="Ermythia, a beautiful world where alien relics hold incredible powers and where legendary heroes once known as the Overseers protected the land from rising dangers alongside the Ender Knights. However, this is a different era, an era where wicked forces have stolen the relics from the tombs of the fallen heroes and are now threatening the remaining peace."
                                interactions={{ views: { count: 124, interacted: true }, follows: { count: 4, interacted: false }, profiles: { count: 12, interacted: false } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#4c6369", secondary: "#151b2f" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/card_preview.png"
                                name="Urban Legends"
                                slug="legends-of-urban"
                                owner={{ id: "5019646586243236", username: "avatarkage", name: "AvatarKage", isVerified: true, type: "author" }}
                                status="On hold since 2023"
                                about="A work-in-progress video game revolving the world of martial arts."
                                interactions={{ views: { count: 16, interacted: true }, follows: { count: 1, interacted: false }, profiles: { count: 1, interacted: true } }}
                            />
                        </>
                    )}

                    {!loading && profiles.map((p) => (
                        <CharacterCard
                            id={p.id}
                            aura={{
                                isEnabled: p.isAuraEnabled,
                                type: p.auraType,
                                primary: p.auraPrimary,
                                secondary: p.auraSecondary
                            }}
                            avatar={`https://cdn.openprofile.app${p.avatar}`}
                            name={p.displayName}
                            slug={p.slug}
                            owner={{
                                id: p.owner.id,
                                slug: p.owner.username,
                                name: p.owner.displayName,
                                isVerified: p.owner?.badges?.some(b => b.type === "verified"),
                                type: p.owner.type
                            }}
                            about={p.about}
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
                    ))}
                </div>

                <div className="flex items-center justify-center mt-8 mb-6">
                    <div className="join border border-base-300 rounded">
                        <button className="join-item btn font-nerdfont"></button>
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="1" />
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="2" />
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="3" />
                        <input className="join-item btn btn-square font-nerdfont" type="radio" name="options" aria-label="󰇘" disabled={true} />
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="98" />
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="99" />
                        <input className="join-item btn btn-square" type="radio" name="options" aria-label="100" />
                        <button className="join-item btn font-nerdfont"></button>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}