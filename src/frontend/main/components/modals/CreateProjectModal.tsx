import { useTranslation } from "react-i18next";
import { useState } from "react";

import ProjectCard from "../ProjectCard.js";
import ImageInput from "../ImageInput.js";
import { useObjectURL } from "../../../_common/hooks/useObjectURL.hook.js";

// Assign proper project owner
// create sends to server (avatarUrl too)

// On gif upload, remove it then prompt to join premium

export default function CreateProjectModal() {
    const { ready } = useTranslation();

    const [activeTab, setActiveTab] = useState("general");

    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const avatarUrl = useObjectURL(avatar);
    const bannerUrl = useObjectURL(banner);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [about, setAbout] = useState("");

    function closeCreateProjectModal() {
        (document.getElementById("create-project") as HTMLDialogElement)?.close();
        setActiveTab("general");
        setAvatar(null);
        setBanner(null);
        setName("");
        setSlug("");
        setAbout("");
    }
    
    if (!ready) return null;

    return (
        <dialog id="create-project" className="modal">
            <div className="modal-box max-w-235">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={() => { closeCreateProjectModal() }}>
                    </button>
                </form>
                <h3 className="font-bold text-2xl text-center">New Project</h3>
                <p className="pt-2 pb-6 text-sm text-center opacity-60">Your project will be saved privately.</p>

                <div className="flex flex-row gap-6">
                    <div className="tabs tabs-lift flex w-full">
                        <input type="radio" name="create-project-tabs" className="md:hidden tab bg-base-200 flex-1" aria-label="General" checked={activeTab === "general"} onChange={() => setActiveTab("general")}/>
                            <div className="tab-content border-t-base-300 md:border-0 rounded-none overflow-x-hidden overflow-y-auto h-108">
                                <fieldset className="fieldset w-full">
                                <div className="flex gap-3">
                                    <div className="w-32">
                                        <label className="label mt-1 mb-1">Avatar</label>
                                        <ImageInput
                                            value={avatar}
                                            onChange={setAvatar}
                                            accept="image/png, image/jpeg, image/jpg, image/gif"
                                            aspectRatio={1}
                                            height="32"
                                            width="32"
                                            label="avatar"
                                        />
                                    </div>

                                    <div className="w-full">
                                        <label className="label mt-1 mb-1">Banner</label>
                                        <ImageInput
                                            value={banner}
                                            onChange={setBanner}
                                            accept="image/png, image/jpeg, image/jpg"
                                            aspectRatio={2}
                                            height="32"
                                            width="full"
                                            label="banner"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">Name</label>
                                    <input 
                                        id="create-project-name"
                                        type="text" 
                                        className="input w-full" 
                                        placeholder="What is your project's name?"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">Slug (ADD VALIDATION)</label>
                                    <label className="input w-full validator">
                                        openprofile.app/
                                        <input
                                            id="create-project-slug"
                                            type="url"
                                            placeholder="project-name"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                        />
                                    </label>
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">About</label>                                
                                    <textarea
                                        id="create-project-about"
                                        className="textarea h-21 w-full resize-none"
                                        placeholder="What is your project about?"
                                        value={about}
                                        onChange={(e) => setAbout(e.target.value)}
                                    />
                                </div>
                            </fieldset>
                        </div>

                        <input type="radio" name="create-project-tabs" className="md:hidden tab bg-base-200 flex-1" aria-label="Preview" checked={activeTab === "preview"} onChange={() => setActiveTab("preview")}/>
                        <div className="md:hidden tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                            <br></br>
                            <ProjectCard
                                isPreview={true}
                                banner={bannerUrl}
                                name={name || "Untitled Project"}
                                slug={slug || ""}
                                owner={{
                                    id: "5019646586243236",
                                    username: "avatarkage",
                                    name: "AvatarKage",
                                    isVerified: false,
                                }}
                                about={about}
                            />
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <br></br>
                        <ProjectCard
                            isPreview={true}
                            banner={bannerUrl}
                            name={name || "Untitled Project"}
                            slug={slug || ""}
                            owner={{
                                id: "5019646586243236",
                                username: "avatarkage",
                                name: "AvatarKage",
                                isVerified: false,
                            }}
                            about={about}
                        />
                    </div>
                </div>

                <div className="flex gap-3 flex-row w-full">
                    <button className="btn btn-neutral mt-4 flex-1"
                        onClick={() => { closeCreateProjectModal() }}>
                        Close
                    </button>
                    <button className="btn btn-accent mt-4 flex-4">Create</button>
                </div>
            </div>
        </dialog>
    );
}