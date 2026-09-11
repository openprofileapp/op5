import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { GetUserItemType } from "../../../../_common/types/user.type.js";
import ImageInput from "../../../_common/components/ImageInput.js";
import { useObjectURL } from "../../../_common/hooks/useObjectURL.hook.js";
import { cdnBaseUrl } from "../../../_common/scripts/domains.js";
import { UsernameType } from "../../../../_common/types/username.type.js";
import ColorInput from "../../../_common/components/ColorInput.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import UserCard from "../UserCard.js";

export interface EditUserProfileModalRef {
    open: (data: GetUserItemType) => void;
    close: () => void;
}

const EditUserProfileModal = forwardRef<EditUserProfileModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetUserItemType | null>(null);
    const [initialData, setInitialData] = useState<GetUserItemType | null>(null);

    const [activeTab, setActiveTab] = useState("appearance");

    const [avatar, setAvatar] = useState<File | null>(null);
    const [banner, setBanner] = useState<File | null>(null);

    const avatarUrl = useObjectURL(avatar);
    const bannerUrl = useObjectURL(banner);

    const resetState = () => {
        setData(null);
        setInitialData(null);
        setActiveTab("appearance");
        setAvatar(null);
        setBanner(null);
    };

    useImperativeHandle(ref, () => ({
        open: (incomingData: GetUserItemType) => {
            setData(structuredClone(incomingData));
            setInitialData(structuredClone(incomingData));

            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    const handleFieldChange = <K extends keyof GetUserItemType>(field: K, value: GetUserItemType[K]) => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: value
            };
        });
    };

    const handleUsernameChange = (newUsername: string) => {
        setData((prev) => {
            if (!prev) return prev;

            const usernames = prev.usernames ? [...prev.usernames] : [];
            const hasPrimary = usernames.some((u) => u.isPrimary);

            const updatedUsernames = hasPrimary
                ? usernames.map((u) => (u.isPrimary ? { ...u, username: newUsername } : u))
                : [{ isPrimary: true, username: newUsername } as UsernameType];

            return {
                ...prev,
                usernames: updatedUsernames
            };
        });
    };

    const handleSave = () => {
        handleClose();
    };

    if (!isTranslationReady || !data) return null;

    const primaryUsername = data.usernames?.find((u) => u.isPrimary)?.username ?? "";
    const initialPrimaryUsername = initialData?.usernames?.find((u) => u.isPrimary)?.username ?? "";

    const previewData: GetUserItemType = {
        ...data,
        ...(avatarUrl && { avatar: avatarUrl }),
        ...(bannerUrl && { banner: bannerUrl })
    };

    return (
        <dialog 
            ref={dialogRef} 
            className="modal"
            onClose={resetState}
        >
            <div className="modal-box max-w-235">
                <form method="dialog">
                    <button 
                        type="button"
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont z-30"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>

                <h3 className="font-bold text-2xl text-center pb-6">
                    {t("words.EditProfile")}
                </h3>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full">
                        <div className="relative md:right-3 tabs tabs-border flex w-full">
                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${activeTab === "appearance" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("appearance")}
                            >
                                Appearance
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${activeTab === "overview" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("overview")}
                            >
                                Overview
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${activeTab === "usernames" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("usernames")}
                            >
                                Usernames
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${activeTab === "links" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("links")}
                            >
                                Links
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${activeTab === "privacy" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("privacy")}
                            >
                                Privacy
                            </button>

                            <button
                                type="button"
                                className={`md:hidden tab bg-base-200 flex-1 ${activeTab === "preview" ? "tab-active" : ""}`}
                                onClick={() => setActiveTab("preview")}
                            >
                                Preview
                            </button>
                        </div>

                        <div className="border-base-300 pt-3 md:pr-6 rounded-b-box overflow-x-hidden overflow-y-auto h-108">
                            {activeTab === "appearance" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex gap-3">
                                        <div className="w-32">
                                            <label className="label mb-1">
                                                Avatar
                                            </label>

                                            <ImageInput
                                                value={avatar}
                                                defaultUrl={data.avatar ? `${cdnBaseUrl}${data.avatar}` : null}
                                                onChange={(file) => {
                                                    setAvatar(file);
                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    handleFieldChange("avatar", file ? avatarUrl : null);
                                                }}
                                                accept="image/png, image/jpeg, image/jpg, image/gif"
                                                aspectRatio={1}
                                                height="32"
                                                width="32"
                                                label="avatar"
                                            />
                                        </div>

                                        <div className="w-full">
                                            <label className="label mb-1">
                                                Banner
                                            </label>

                                            <ImageInput
                                                value={banner}
                                                defaultUrl={data.banner ? `${cdnBaseUrl}${data.banner}` : null}
                                                onChange={(file) => {
                                                    setBanner(file);
                                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                                    // @ts-ignore
                                                    handleFieldChange("banner", file ? bannerUrl : null);
                                                }}
                                                accept="image/png, image/jpeg, image/jpg"
                                                aspectRatio={2}
                                                height="32"
                                                width="full"
                                                label="banner"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            Display Name
                                        </label>

                                        <input 
                                            id="edit-profile-name"
                                            type="text"
                                            className="input w-full" 
                                            placeholder={initialData?.displayName || "What is your display name?"}
                                            value={data.displayName ?? ""}
                                            onChange={(e) => handleFieldChange("displayName", e.target.value)}
                                        />
                                    </div>

                                    <div className="divider my-0 mt-3">Aura</div>

                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            Aura
                                        </label>

                                        <TypeableDropdownInput
                                            value={data.isAuraEnabled ? "true" : "false"}
                                            options={[
                                                { id: "true", name: "Enabled" },
                                                { id: "false", name: "Disabled" }
                                            ]}
                                            placeholder="Filter Results"
                                            typeable={false}
                                            onChange={(option) => handleFieldChange("isAuraEnabled", option === "true")}
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <div className="w-full">
                                            <label className="label mb-1">
                                                Primary
                                            </label>

                                            <ColorInput
                                                placeholder={initialData?.auraPrimary || "#000000"}
                                                value={data.auraPrimary || "#000000"}
                                                onChange={(val) => handleFieldChange("auraPrimary", val)}
                                            />
                                        </div>

                                        <div className="w-full">
                                            <label className="label mb-1">
                                                Secondary
                                            </label>

                                            <ColorInput
                                                placeholder={initialData?.auraSecondary || "#000000"}
                                                value={data.auraSecondary || "#000000"}
                                                onChange={(val) => handleFieldChange("auraSecondary", val)}
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            )}
                            
                            {activeTab === "overview" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            About
                                        </label>

                                        <textarea
                                            id="edit-profile-about"
                                            className="textarea h-20 w-full resize-none"
                                            placeholder={initialData?.about || "Tell us about yourself..."}
                                            value={data.about ?? ""}
                                            onChange={(e) => handleFieldChange("about", e.target.value)}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            Tags
                                        </label>

                                        <input 
                                            id="edit-profile-tags"
                                            type="text"
                                            className="input w-full" 
                                            placeholder={initialData?.tags?.join(", ") || "tag1, tag2, tag3"}
                                            value={Array.isArray(data.tags) ? data.tags.join(", ") : data.tags ?? ""}
                                            onChange={(e) => handleFieldChange("tags", e.target.value.split(",").map((s) => s.trim()) as unknown as GetUserItemType["tags"])}
                                        />
                                    </div>
                                </fieldset>
                            )}

                            {activeTab === "usernames" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">
                                            Username
                                        </label>

                                        <input 
                                            id="edit-profile-username"
                                            type="text"
                                            className="input w-full" 
                                            placeholder={initialPrimaryUsername}
                                            value={primaryUsername}
                                            onChange={(e) => handleUsernameChange(e.target.value)}
                                        />
                                    </div>
                                </fieldset>
                            )}

                            {activeTab === "preview" && (
                                <div className="md:hidden">
                                    {/*<UserCard 
                                        key={JSON.stringify(previewData)}
                                        data={previewData}
                                        isPreview={true}
                                    />*/}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center min-h-[500px] h-full w-full p-4 overflow-hidden">
                        <div className="flex items-center justify-center w-full max-w-[340px]">
                            {/*<UserCard 
                                key={JSON.stringify(previewData)}
                                data={previewData}
                                isPreview={true}
                            />*/}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-row w-full mt-2 pt-4 z-10 shrink-0">
                    <button 
                        type="button"
                        className="btn btn-neutral flex-1"
                        onClick={handleClose}
                    >
                        {t("words.Close")}
                    </button>

                    <button 
                        type="button" 
                        className="btn btn-accent flex-3"
                        onClick={handleSave}
                    >
                        {t("words.Save")}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

EditUserProfileModal.displayName = "EditUserProfileModal";
export default EditUserProfileModal;
















































/*import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";

import {
    DndContext,
    closestCenter,
} from "@dnd-kit/core";

import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";

import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { CSS } from "@dnd-kit/utilities";
import ProjectCard from "../ProjectCard.js";

export default function EditEditUserProfileModal() {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;


     const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const [avatar, setAvatar] = useState(null);
    const [banner, setBanner] = useState(null);

    const [items, setItems] = useState([
        { id: "draggable-link-1" },
        { id: "draggable-link-2" },
    ]);

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setItems((items) => {
            const oldIndex = items.findIndex(i => i.id === active.id);
            const newIndex = items.findIndex(i => i.id === over.id);

            return arrayMove(items, oldIndex, newIndex);
        });
    }

    const [url, setUrl] = useState("https://");

const isValid =
    /^(https?:\/\/)?([a-zA-Z0-9]([a-zA-Z0-9\-].*[a-zA-Z0-9])?\.)+[a-zA-Z].*$/.test(
        url
    );


    
function SortableFieldset({ 
    id,
    children,
    index,
    isFirst,
    isLast, 
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
    } = useSortable({ id });

    return (
        <div
            className={`
                text-xs w-full border border-base-300 p-4 transition-colors
                ${index % 2 === 0 ? "bg-base-200" : "bg-[var(--color-sub)]"}
                ${isFirst ? "rounded-t" : ""}
                ${isLast ? "rounded-b" : ""}
            `}
            style={{
                transform: CSS.Transform.toString(transform),
                transition: "transform 150ms ease",
            }}
            ref={setNodeRef}
        >
            <div className="flex gap-4">

                <button type="button" className="cursor-grab active:cursor-grabbing opacity-60 hover:opacity-100" 
                    {...attributes} 
                    {...listeners}   
                >
                    <div className="font-nerdfont text-xl leading-none">󰇝</div>
                </button>

                {children}

                <button type="button" className="cursor-pointer">
                    <div className="font-nerdfont text-accent text-lg leading-none"></div>
                    {/* ☰ https://youtube.com; no url label, just icon as type and update name of link w/ trash icon at the end, fetch metadata on unfocus }
                </button>

            </div>
        </div>
    );
}


    return (
        <dialog id="edit-user" className="modal">
            <div className="modal-box max-w-5xl">

                <div className="flex flex-row gap-6">
                    <div className="tabs tabs-lift">
                        <input type="radio" name="edit-user-tabs" className="tab bg-base-200" aria-label="General" defaultChecked/>
                            <div className="tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                                <fieldset className="fieldset w-full">
                                <div className="flex gap-2">
                                    <div className="w-32">
                                        <label className="label mb-1">Avatar</label>

                                        <label className="relative cursor-pointer border-2 border-base-300 border-dashed rounded-box flex items-center justify-center overflow-hidden h-32 w-32">
                                            {avatar ? (
                                                <>
                                                    <img
                                                        src={URL.createObjectURL(avatar)}
                                                        alt="Avatar Preview"
                                                        className="h-full w-full object-cover rounded-box"
                                                    />

                                                    <button
                                                        type="button"
                                                        className="absolute top-0 right-1 p-1 hidden hover:block"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setAvatar(null);
                                                            if (avatarInputRef.current) {
                                                                avatarInputRef.current.value = "";
                                                            }
                                                        }}
                                                    >
                                                        <span className="font-nerdfont text-base cursor-pointer"></span>
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="opacity-60">
                                                    <span className="font-nerdfont text-xl"></span>
                                                </span>
                                            )}

                                            <input
                                                ref={avatarInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    setAvatar(e.target.files[0]);
                                                }}
                                            />
                                        </label>
                                    </div>

                                    <div className="w-full">
                                        <label className="label mb-1">Banner</label>

                                        {/* Maybe have an image component with id and size {} values }
                                        <label className="relative cursor-pointer border-2 border-base-300 border-dashed rounded-box flex items-center justify-center overflow-hidden h-32">
                                            {banner ? (
                                                <>
                                                    <img
                                                        src={URL.createObjectURL(banner)}
                                                        alt="Banner Preview"
                                                        className="h-full w-full object-cover rounded-box"
                                                    />

                                                    <button
                                                        type="button"
                                                        className="absolute top-0 right-1 p-1 hidden hover:block"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setBanner(null);
                                                            if (bannerInputRef.current) {
                                                                bannerInputRef.current.value = "";
                                                            }
                                                        }}
                                                    >
                                                        <span className="font-nerdfont text-base cursor-pointer"></span>
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="opacity-60">
                                                    <span className="font-nerdfont text-xl"></span>
                                                </span>
                                            )}

                                            <input
                                                ref={bannerInputRef}
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    setBanner(e.target.files[0]);
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">Name</label>
                                    <input type="text" className="input w-full" placeholder="What is your project's name?" />
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">Slug</label>
                                    <label className="input w-full validator">
                                        openprofile.app/
                                        <input
                                            type="url"
                                            required
                                            placeholder="project-name"
                                            // value=""
                                            // onChange={(e) => setUrl(e.target.value)}
                                        />
                                    </label>
                                </div>

                                <div className="flex flex-col gap-1 mt-1">
                                    <label className="label">About</label>
                                    <textarea className="textarea h-21 w-full resize-none" placeholder="What is your project about?"></textarea>
                                </div>
                            </fieldset>
                        </div>

                        <input type="radio" name="edit-user-tabs" className="tab bg-base-200" aria-label="Media" />
                        <div className="tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                            <fieldset className="fieldset w-full">
                                <label className="label mt-1">WIP</label>
                                <input type="text" className="input w-full" placeholder="WIP" />
                            </fieldset>
                        </div>

                        <input type="radio" name="edit-user-tabs" className="tab bg-base-200" aria-label="Links" />
                        <div className="tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                            <div className="flex flex-col gap-3 mt-6">
                                <div className="hidden collapse collapse-arrow border border-base-300">
                                    <input type="checkbox" />
                                    <div className="collapse-title flex items-center justify-center text-sm p-3 bg-base-100 border-b border-base-300 rounded">
                                        Social Media
                                    </div>
                                    <div className="collapse-content">
                                        <fieldset className="fieldset w-full">
                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">YouTube</label>
                                                <label className="input w-full validator">
                                                    <span className="font-nerdfont text-xl flex items-center justify-center p-3 h-10 w-10 bg-[#FF0000] text-white border border-base-300 relative -ml-[13px] rounded-l leading-none">
                                                        
                                                    </span>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="@openprofile"
                                                        // value={url}
                                                        // onChange={(e) => setUrl(e.target.value)}
                                                        title=""
                                                    />
                                                </label>
                                                {/*{!isValid && (
                                                    <p className="text-error text-sm mt-1">
                                                        Must be valid URL
                                                    </p>
                                                )}}
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">X (Twitter)</label>
                                                <label className="input w-full validator">
                                                    <span className="font-nerdfont text-xl flex items-center justify-center p-3 h-10 w-10 bg-[#000000] text-white border border-base-300 relative -ml-[13px] rounded-l leading-none">
                                                        
                                                    </span>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="openprofileapp"
                                                        // value={url}
                                                        // onChange={(e) => setUrl(e.target.value)}
                                                        title=""
                                                    />
                                                </label>
                                                {/*{!isValid && (
                                                    <p className="text-error text-sm mt-1">
                                                        Must be valid URL
                                                    </p>
                                                )}}
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">BlueSky</label>
                                                <label className="input w-full validator">
                                                    <span className="flex items-center justify-center p-3 h-10 w-10 bg-[#1185FE] text-white border border-base-300 relative -ml-[13px] rounded-l leading-none">
                                                        <svg className="w-5 h-5 fill-white shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>
                                                    </span>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="openprofile.app"
                                                        // value={url}
                                                        // onChange={(e) => setUrl(e.target.value)}
                                                        title=""
                                                    />
                                                </label>
                                                {/*{!isValid && (
                                                    <p className="text-error text-sm mt-1">
                                                        Must be valid URL
                                                    </p>
                                                )}}
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">Facebook</label>
                                                <label className="input w-full validator">
                                                    <span className="font-nerdfont text-xl flex items-center justify-center p-3 h-10 w-10 bg-[#0866FF] text-white border border-base-300 relative -ml-[13px] rounded-l leading-none">
                                                        
                                                    </span>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="openprofileapp"
                                                        // value={url}
                                                        // onChange={(e) => setUrl(e.target.value)}
                                                        title=""
                                                    />
                                                </label>
                                                {/*{!isValid && (
                                                    <p className="text-error text-sm mt-1">
                                                        Must be valid URL
                                                    </p>
                                                )}}
                                            </div>

                                            <div className="flex flex-col gap-1 mt-1">
                                                <label className="label">Instagram</label>
                                                <label className="input w-full validator">
                                                    <span className="font-nerdfont text-xl flex items-center justify-center p-3 h-10 w-10 bg-[#FF0069] text-white border border-base-300 relative -ml-[13px] rounded-l leading-none">
                                                        
                                                    </span>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="openprofileapp"
                                                        // value={url}
                                                        // onChange={(e) => setUrl(e.target.value)}
                                                        title=""
                                                    />
                                                </label>
                                                {/*{!isValid && (
                                                    <p className="text-error text-sm mt-1">
                                                        Must be valid URL
                                                    </p>
                                                )}}
                                            </div>
                                        </fieldset>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col">                                        
                                <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                                    <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
                                        {items.map((item, index) => (
                                            <SortableFieldset key={item.id} id={item.id} index={index} isFirst={index === 0} isLast={index === items.length - 1}>
                                                {item.id === "draggable-link-1" && (
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <label className="input w-full validator">
                                                            {/* Visit link on click icon }
                                                            <span className="flex items-center justify-center p-3 h-10 w-10 bg-[#0866FF] text-white border border-base-300 relative -ml-[13px] rounded-l tooltip tooltip-accent tooltip-top cursor-pointer" 
                                                                data-tip="Facebook"
                                                            >
                                                                <span className="font-nerdfont text-xl leading-none"></span>
                                                            </span>
                                                            <input
                                                                type="url"
                                                                required
                                                                placeholder="https://example.com"
                                                                // value={url}
                                                                // onChange={(e) => setUrl(e.target.value)}
                                                                title=""
                                                            />
                                                        </label>
                                                        {/*{!isValid && (
                                                            <p className="text-error text-sm mt-1">
                                                                Must be valid URL
                                                            </p>
                                                        )}}
                                                    </div>
                                                )}

                                                {item.id === "draggable-link-2" && (
                                                    <div className="flex flex-col gap-1 w-full">
                                                        <label className="input w-full validator">
                                                            <span className="flex items-center justify-center p-3 h-10 w-10 bg-[#0866FF] text-white border border-base-300 relative -ml-[13px] rounded-l tooltip tooltip-accent tooltip-top cursor-pointer" 
                                                                data-tip="Facebook"
                                                            >
                                                                <span className="font-nerdfont text-xl leading-none"></span>
                                                            </span>
                                                            <input
                                                                type="url"
                                                                required
                                                                placeholder="https://example.com"
                                                                // value={url}
                                                                // onChange={(e) => setUrl(e.target.value)}
                                                                title=""
                                                            />
                                                        </label>
                                                        {/*{!isValid && (
                                                            <p className="text-error text-sm mt-1">
                                                                Must be valid URL
                                                            </p>
                                                        )}}
                                                    </div>
                                                )}
                                            </SortableFieldset>
                                        ))}
                                    </SortableContext>
                                </DndContext>
                                <div className="relative cursor-pointer border-2 border-base-300 border-dashed rounded-box flex items-center justify-center overflow-hidden h-[74px] mt-3">
                                    <span className="opacity-60">
                                        <span className="font-nerdfont text-xl"></span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        <input type="radio" name="edit-user-tabs" className="tab bg-base-200" aria-label="Collaborators" />
                        <div className="tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                            <fieldset className="fieldset w-full">
                                <label className="label mt-1">WIP</label>
                                <input type="text" className="input w-full" placeholder="WIP" />
                            </fieldset>
                        </div>

                        <input type="radio" name="edit-user-tabs" className="md:hidden tab bg-base-200" aria-label="Preview" />
                        <div className="md:hidden tab-content border-t-base-300 rounded-none overflow-x-hidden overflow-y-auto h-108">
                            <br></br>
                            {/* disable click to visit on preview }
                            <ProjectCard
                                id="1655391085225720"
                                aura={{ isEnabled: false, type: "flow", primary: "#4c6369", secondary: "#151b2f" }}
                                banner=""
                                name="I am a title"
                                slug="legends-of-urban"
                                owner={{ id: "5019646586243236", username: "avatarkage", name: "AvatarKage", isVerified: false }}
                                status=""
                                about="WIP"
                            />
                        </div>
                    </div>

                    <div className="hidden md:block">
                        <br></br>
                        {/* disable click to visit on preview }
                        <ProjectCard
                            id="1655391085225720"
                            aura={{ isEnabled: false, type: "flow", primary: "#4c6369", secondary: "#151b2f" }}
                            banner=""
                            name="I am a title"
                            slug="legends-of-urban"
                            owner={{ id: "5019646586243236", username: "avatarkage", name: "AvatarKage", isVerified: false }}
                            status=""
                            about="WIP"
                        />
                    </div>
                </div>

                <div className="flex gap-2 flex-row w-full">
                    <button className="btn btn-neutral mt-4 flex-1"
                        onClick={() => {
                            // Clear all fields on close
                            document.getElementById("edit-user")?.close();
                        }}>
                        Close
                    </button>
                    <button className="btn btn-accent mt-4 flex-4">Create</button>
                </div>
            </div>
        </dialog>
    );
}*/