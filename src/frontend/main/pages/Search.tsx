import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import CharacterCard from "../components/CharacterCard.js";
import SkeletonCharacterCard from "../components/SkeletonCharacterCard.js";

export default function Search() {
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

                <div className="mt-4 text-xl font-bold">Searching for "dragonights"</div>
                <div className="mb-6 text-xs">Found 3 results in 0.01ms</div>

                <div className="flex flex-wrap gap-4">

                    <CharacterCard
                        id="6587823496323314"
                        aura={{ primary: "#e03c17", secondary: "#e03c17" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/6587823496323314/6587823496323314.png"
                        name="Mable Jackson"
                        slug="eclipse"
                        owner={{ aura: { primary: "#76d1ff", secondary: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
                        overview="Mable Jackson, also known as Eclipse, is an American martial arts and hacking prodigy, associate nurse, and scientist specializing in dragonite research."
                        interactions={{ views: { count: 275, interacted: true }, likes: { count: 2, interacted: true } }}
                        notification={{ isActive: false, time: "5 minutes ago"}}
                    />

                    <CharacterCard
                        id="6690301862165288"
                        aura={{ primary: "#76d1ff", secondary: "#76d1ff" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/6690301862165288/nBbkedwiGNmsTZIvD470x3TYsw67AbIO.png"
                        name="AvatarKage"
                        slug="avatarkage"
                        owner={{ aura: { primary: "#76d1ff", secondary: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
                        overview="AvatarKage, also known as Blue Knight, is an American digital jack-of-all-trades who specializes in community leadership, brand management, and AI development."
                        interactions={{ views: { count: 200, interacted: true }, likes: { count: 2, interacted: true } }}
                    />

                    <CharacterCard
                        id="1655391085225720"
                        aura={{ primary: "#00a700", secondary: "#00a700" }}
                        avatar="https://cdn.openprofile.app/uploads/profiles/1655391085225720/kPfDPqJDCQKsxdFiNxnzkMGdD3ctFzzi.png"
                        name="Julia Anderson"
                        slug="ash"
                        owner={{ aura: { primary: "#76d1ff", secondary: "#76d1ff" }, id: "5019646586243236", slug: "dragonights", avatar: "https://cdn.dragonights.com/r/dragonights_logo_512_png.png", name: "Dragonights", verified: true }}
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
                    <SkeletonCharacterCard />
                </div>
            </div>

            <Footer />
        </>
    );
}