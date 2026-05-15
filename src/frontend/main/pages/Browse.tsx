import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";

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

                <div className="mt-4 mb-6 text-xl font-bold">Popular</div>

                <div className="flex flex-wrap gap-4">

                    {/*<CharacterCard
                        id="6587823496323314"
                        aura={{ start: "#e03c17", end: "#e03c17" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/6587823496323314/6587823496323314.png"
                        name="Mable Jackson"
                        slug="eclipse"
                        owner={{ aura: { start: "#76d1ff", end: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
                        overview="Mable Jackson, also known as Eclipse, is an American martial arts and hacking prodigy, associate nurse, and scientist specializing in dragonite research."
                        interactions={{ views: { count: 275, interacted: true }, likes: { count: 2, interacted: true } }}
                        notification={{ isActive: false, time: "5 minutes ago"}}
                    />

                    <CharacterCard
                        id="6690301862165288"
                        aura={{ start: "#76d1ff", end: "#76d1ff" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/6690301862165288/nBbkedwiGNmsTZIvD470x3TYsw67AbIO.png"
                        name="AvatarKage"
                        slug="avatarkage"
                        owner={{ aura: { start: "#76d1ff", end: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
                        overview="AvatarKage, also known as Blue Knight, is an American digital jack-of-all-trades who specializes in community leadership, brand management, and AI development."
                        interactions={{ views: { count: 200, interacted: true }, likes: { count: 2, interacted: true } }}
                    />*/}

                    <CharacterCard
                        id="1655391085225720"
                        aura={{ start: "#00a700", end: "#00a700" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/1655391085225720/kPfDPqJDCQKsxdFiNxnzkMGdD3ctFzzi.png"
                        name="Julia Anderson"
                        slug="ash"
                        owner={{ aura: { start: "#76d1ff", end: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
                        overview="Julia Anderson, also known as Ash, is an American alternative goth patrol officer who specializes in a variety of weapons and deadly martial arts."
                        interactions={{ views: { count: 261, interacted: true }, likes: { count: 2, interacted: false } }}
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