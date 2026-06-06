import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Metadata from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";
import Footer from "../components/Footer.js";
import Badges from "../components/Badges.js";
import ProjectCard from "../components/ProjectCard.js";

// DEFINE TYPE PROFILE SOMEWHERE GLOBALLY

export default function UserProfile() {
    const { id } = useParams();
    const { t, ready } = useTranslation();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("all");
    const [user, setUser] = useState<unknown[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetch(`https://${window.config.domains.api}/v2/users?id=${id}`);
                
                if (!res.ok) {
                    navigate("/404", { replace: true });
                    return;
                }
                    
                const data = await res.json();

                setUser(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    });

    const auraStyle = user.isAuraEnabled
        ? 
            {
                ["--aura-type" as string]:
                    // eslint-disable-next-line no-constant-binary-expression
                    `aura-${user.auraType}-user-profile` || "aura-flow-user-profile",

                ["--aura-primary" as string]:
                    user.auraPrimary || "var(--color-accent)",

                ["--aura-secondary" as string]:
                    user.auraSecondary || "var(--color-accent)",
            }
        : 
            {
                border: "1px solid #222222",
            }
        ;

    if (!ready || loading) return null;
    
    return (
        <>  
            <Metadata
                title="Search"
                allowIndex="false"
            />
            
            <Navbar isBannerPage={true} />

            <div className="hero bg-base-200">
                <div
                    className="absolute top-[64px] inset-0 bg-cover bg-center h-96"
                    style={{
                        backgroundImage: `url(https://cdn.openprofile.app${user.banner})`,
                    }}
                />

                <div
                    className="absolute inset-0 pointer-events-none top-[64px] h-96"
                    style={{
                        background: `
                            linear-gradient(
                                to bottom,
                                #080808 0%,
                                #00000000 25%,
                                #00000000 75%,
                                #111111 100%
                            )
                        `,
                    }}
                />
            </div>

            <div className="mx-8 mt-8 my-6 md:mx-64 md:mt-16">
                <div
                    className="user-profile relative p-4 shadow-sm"
                    style={auraStyle}
                >
                </div>

                <div className="flex flex-col w-full mt-4">
                    <div className="tabs tabs-lift w-full">
                        <button
                            className={`tab flex-1 ${activeTab === "all" ? "tab-active bg-base-200" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                        </button>

                        <button
                            className={`tab flex-1 ${activeTab === "projects" ? "tab-active bg-base-200" : ""}`}
                            onClick={() => setActiveTab("projects")}
                        >
                            Projects
                        </button>

                        <button
                            className={`tab flex-1 ${activeTab === "profiles" ? "tab-active bg-base-200" : ""}`}
                            onClick={() => setActiveTab("profiles")}
                        >
                            Profiles
                        </button>

                        <button
                            className={`tab flex-1 ${activeTab === "collaborations" ? "tab-active bg-base-200" : ""}`}
                            onClick={() => setActiveTab("collaborations")}
                        >
                            Collaborations
                        </button>

                        <button
                            className={`tab flex-1 ${activeTab === "collections" ? "tab-active bg-base-200" : ""}`}
                            onClick={() => setActiveTab("collections")}
                        >
                            Collections
                        </button>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-14 border border-base-300 border-t-0 rounded overflow-y-auto">
                {activeTab === "all" && 
                    <div className="flex flex-wrap gap-4">
                        
                    </div>
                }
                {activeTab === "projects" && 
                    <div className="flex flex-col justify-center">
                        <div className="flex flex-wrap gap-4">
                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                name="Dragonights"
                                slug="dragonights"
                                owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                status="Follow to keep up with the J9 universe. Follow to keep up with the J9 universe."
                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                name="Dragonights"
                                slug="dragonights"
                                owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                status="Follow to keep up with the J9 universe. Follow to keep up with the J9 universe."
                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                            />

                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: true, type: "flow", primary: "#76d1ff", secondary: "#76d1ff" }}
                                banner="https://us-east-1.tixte.net/uploads/cdn.avatarka.ge/dragonights_banner_comic_1024_png.png"
                                name="Dragonights"
                                slug="dragonights"
                                owner={{ id: "5019646586243236", username: "j9studios", name: "J9 Studios", isVerified: true, type: "publisher" }}
                                status="Follow to keep up with the J9 universe. Follow to keep up with the J9 universe."
                                about="Dragonights is an upcoming 3D-animated sci-fi action TV series set in the J9 Universe. Rated TV-14 for fantasy violence."
                                interactions={{ views: { count: 481, interacted: true }, follows: { count: 6, interacted: true }, profiles: { count: 52, interacted: true }, fanflairs: { count: 5 } }}
                            />
                        </div>

                        <div className="flex items-center justify-center mt-8 mb-8">
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
                }
                
                {activeTab === "profiles" && <div>Profiles content...</div>}
                {activeTab === "collaborations" && <div>Collaborations content...</div>}
                {activeTab === "collections" && <div>Collections content...</div>}
            </div>

            <Footer />
        </>
    );
}