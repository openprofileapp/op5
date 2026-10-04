/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import ImageInput from "../ImageInput.js";
import { useObjectURL } from "../../hooks/useObjectURL.hook.js";
import ColorInput from "../ColorInput.js";
import { TypeableDropdownInput } from "../TypeableDropdownInput.js";
import UserCard from "../../../main/components/UserCard.js";
import { apiBaseUrl, cdnBaseUrl } from "../../scripts/domains.js";
import { VisibilityType } from "../../../../_common/types/visibility.type.js";
import { Tooltip } from "../Tooltip.js";
import { toast } from "../../scripts/toast.js";
import { CheckboxInput } from "../CheckboxInput.js";
import { recommendedTags } from "../../scripts/tags.js";
import TagInput from "../TagInput.js";
import { DraftCharacterType } from "../../../../_common/types/characters/character.type.js";

export interface EditTemplateModalRef {
    open: (
        incomingData: DraftCharacterType,
        onSave?: (updatedData: DraftCharacterType) => void
    ) => Promise<DraftCharacterType | null>;
    close: () => void;
}

const EditTemplateModal = forwardRef<EditTemplateModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const onSaveRef = useRef<((updatedData: DraftCharacterType) => void) | null>(null);

    const [data, setData] = useState<DraftCharacterType | null>(null);
    const [initialData, setInitialData] = useState<DraftCharacterType | null>(null);

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState("appearance");

    const [avatar, setAvatar] = useState<File | null>(null);
    const [animatedAvatar, setAnimatedAvatar] = useState<File | null>(null);

    const [banner, setBanner] = useState<File | null>(null);

    const avatarUrl = useObjectURL(avatar);
    const animatedAvatarUrl = useObjectURL(animatedAvatar);

    const bannerUrl = useObjectURL(banner);

    const isPremium = window.session.permissions.array.includes("PREMIUM_ACCESS");

    const resetState = () => {
        setData(null);
        setInitialData(null);
        setActiveTab("appearance");
        setAvatar(null);
        setAnimatedAvatar(null);
        setBanner(null);
    };

    useImperativeHandle(ref, () => ({
        // @ts-ignore
        open: (
            incomingData: DraftCharacterType,
            onSave?: (updatedData: DraftCharacterType) => void
        ) => {
            onSaveRef.current = onSave || null;

            const cloned = structuredClone(incomingData);

            setData(cloned);
            setInitialData(structuredClone(cloned));

            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        },
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    const handleFieldChange = <K extends keyof DraftCharacterType>(
        field: K,
        value: DraftCharacterType[K]
    ) => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    function omitId<T>(obj: T): T {
        if (obj === null || typeof obj !== "object") {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(omitId) as unknown as T;
        }

        const cleanObj: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj)) {
            if (key !== "_id") {
                cleanObj[key] = omitId(value);
            }
        }
        return cleanObj as T;
    }

    function getChangedData(
        data: DraftCharacterType,
        initialData: DraftCharacterType
    ) {
        const result: Partial<DraftCharacterType> = {};

        const cleanData = omitId(data);
        const cleanInitial = omitId(initialData);

        for (const k in cleanData) {
            const key = k as keyof DraftCharacterType;

            if (JSON.stringify(cleanData[key]) !== JSON.stringify(cleanInitial?.[key])) {
                // @ts-ignore
                result[key] = cleanData[key];
            }
        }

        return result;
    }

    const handleSave = async () => {
        setIsSaving(true);

        try {
            const response = await fetch(`${apiBaseUrl}/v3/characters/update/${data?.id}`, {
                credentials: "include", 
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ 
                    data: getChangedData(
                        data as DraftCharacterType, 
                        initialData as DraftCharacterType
                    ) 
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                if (onSaveRef.current) {
                    onSaveRef?.current(data as DraftCharacterType);
                }

                handleClose();

                setIsSaving(false);

                toast.show(
                    t("defaults.savedYourProfile"),
                    { type: "success" }
                );
            } else {
                setIsSaving(false);

                toast.show(
                    t("defaults.failedToSaveProfile"),
                    {
                        subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                        type: "error",
                    }
                );
            }
        } catch (error) {
            console.error(`Failed to save profile:`, error);
        }
    };

    if (!isTranslationReady || !data) return null;

    const currentAvatar = avatar !== null ? avatarUrl ?? undefined : data.avatar;
    const currentAnimatedAvatar = avatar !== null ? animatedAvatarUrl ?? undefined : data.animatedAvatar;

    const currentBanner = banner !== null ? bannerUrl ?? undefined : data.banner;

    const previewData: DraftCharacterType = {
        ...data,
        avatar: currentAvatar,
        animatedAvatar: currentAnimatedAvatar,
        banner: currentBanner,
    };

    const avatarInputDefaultUrl = data.avatar
        ? data.avatar.startsWith("blob:") || data.avatar.startsWith("data:")
            ? data.avatar
            : `${cdnBaseUrl}${data.avatar}`
        : null;

    const bannerInputDefaultUrl = data.banner
        ? data.banner.startsWith("blob:") || data.banner.startsWith("data:")
            ? data.banner
            : `${cdnBaseUrl}${data.banner}`
        : null;

    return (
        <dialog ref={dialogRef} className="modal" onClose={resetState}>
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
                                className={`tab bg-base-200 flex-1 ${
                                    activeTab === "appearance" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("appearance")}
                            >
                                Appearance
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${
                                    activeTab === "overview" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("overview")}
                            >
                                Overview
                            </button>

                            <button
                                type="button"
                                className={`tab bg-base-200 flex-1 ${
                                    activeTab === "privacy" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("privacy")}
                            >
                                Privacy
                            </button>

                            <button
                                type="button"
                                className={`md:hidden tab bg-base-200 flex-1 ${
                                    activeTab === "preview" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("preview")}
                            >
                                Preview
                            </button>
                        </div>

                        <div className="border-base-300 pt-3 md:pr-6 rounded-b overflow-x-hidden overflow-y-auto h-108">
                            {activeTab === "appearance" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex gap-3">
                                        <div className="w-32">
                                            <label className="label mb-1">
                                                Avatar
                                            </label>

                                            <ImageInput
                                                value={animatedAvatar || avatar}
                                                defaultUrl={avatarInputDefaultUrl}
                                                animatedDefaultUrl={data.animatedAvatar ? `${cdnBaseUrl}${data.animatedAvatar}` : null}
                                                // @ts-ignore
                                                onChange={(file, base64Url, staticPreviewFile, staticPreviewBase64) => {
                                                    if (file && file.size > 1 * 1024 * 1024) {
                                                        toast.show("File is too large (1 MB maximum)", { type: "error" });
                                                        return;
                                                    }
                                                    
                                                    const isGif = file?.type === "image/gif";

                                                    setAvatar(staticPreviewFile || file);
                                                    setAnimatedAvatar(isGif ? file : null);

                                                    const staticBase64 = staticPreviewBase64 || base64Url;
                                                    const animatedBase64 = isGif ? base64Url : null;

                                                    handleFieldChange("avatar", staticBase64 as DraftCharacterType["avatar"]);
                                                    handleFieldChange("animatedAvatar", animatedBase64 as DraftCharacterType["animatedAvatar"]);
                                                }}
                                                accept={`image/png, image/jpeg, image/jpg${isPremium ? ", image/gif" : ""}`}
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
                                                defaultUrl={bannerInputDefaultUrl}
                                                // @ts-ignore
                                                onChange={(file, base64Url) => {
                                                    
                                                    if (file && file.size > 1 * 1024 * 1024) {
                                                        toast.show("File is too large (1 MB maximum)", { type: "error" });
                                                        return;
                                                    }

                                                    setBanner(file);

                                                    handleFieldChange(
                                                        "banner",
                                                        base64Url as DraftCharacterType["banner"]
                                                    );
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
                                            Display Name ({(data.displayName ?? "").length}/32)
                                        </label>

                                        <input
                                            type="text"
                                            className="input w-full"
                                            placeholder={
                                                initialData?.displayName ||
                                                "What is your display name?"
                                            }
                                            value={data.displayName ?? ""}
                                            maxLength={32}
                                            onChange={(e) =>
                                                handleFieldChange(
                                                    "displayName",
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="divider text-xs my-0 mt-3">
                                        <span 
                                            className="flex gap-2 tooltip" 
                                            data-tip="Premium Feature"
                                        >
                                            Aura
                                            <span className="font-nerdfont leading-none text-sm text-premium"></span>
                                        </span>
                                    </div>

                                    <CheckboxInput
                                        label="Aura"
                                        checked={data.isAuraEnabled}
                                        disabled={!isPremium}
                                        // @ts-ignore
                                        onChange={(checked) => handleFieldChange("isAuraEnabled", checked)}
                                    />

                                    <div className="flex gap-3">
                                        <div className="w-full">
                                            <label className="label mb-1">
                                                Primary
                                            </label>
                                           
                                           {/* @ts-ignore */}
                                            <ColorInput
                                                placeholder={
                                                    initialData?.auraPrimary || "#000000"
                                                }
                                                value={data.auraPrimary || "#000000"}
                                                disabled={!isPremium}
                                                onChange={(val) =>
                                                    handleFieldChange(
                                                        "auraPrimary",
                                                        val
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="w-full">
                                            <label className="label mb-1">
                                                Secondary
                                            </label>

                                            {/* @ts-ignore */}
                                            <ColorInput
                                                placeholder={
                                                    initialData?.auraSecondary || "#000000"
                                                }
                                                value={data.auraSecondary || "#000000"}
                                                disabled={!isPremium}
                                                onChange={(val) =>
                                                    handleFieldChange(
                                                        "auraSecondary",
                                                        val
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            )}

                            {activeTab === "overview" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex flex-col">
                                        <label className="label flex gap-2">
                                            Content Flags

                                            <Tooltip content={(
                                                <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                    <div>
                                                        <strong>Sensitive Content (viewable by everyone):</strong>
                                                        <br />
                                                        Your content includes sensitive themes, such as trauma, severe mental health struggles (e.g., self-harm or suicide), grief, hate speech, abuse, minor gore, or non-sexual revealing clothing.
                                                    </div>

                                                    <div>
                                                        <strong>Mature Content (18+ accounts only):</strong>
                                                        <br />
                                                        Your content includes themes restricted to adult audiences due to explicit detail, such as graphic violence, suggestive sexual content, severe profanity, explicit substance abuse, simulated gambling, or sexually suggestive revealing clothing.
                                                    </div>
                                                </div>
                                            )}>
                                                <span className="font-nerdfont text-sm"></span>
                                            </Tooltip>
                                        </label>

                                        <div className="flex gap-2">
                                            <CheckboxInput
                                                label="Sensitive Content"
                                                checked={data.isSensitive}
                                                className="mt-1"
                                                onChange={(checked) => handleFieldChange("isSensitive", checked as unknown as boolean)}
                                            />

                                            <CheckboxInput
                                                label="Mature Content"
                                                checked={data.isMature}
                                                className="mt-1"
                                                onChange={(checked) => handleFieldChange("isMature", checked as unknown as boolean)}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">About ({`${data.about?.length}/320`})</label>

                                        <textarea
                                            className="textarea w-full resize-none !h-auto min-h-[2.5rem] [field-sizing:content]"
                                            placeholder={
                                                initialData?.about || "Tell us about yourself..."
                                            }
                                            value={data.about ?? ""}
                                            maxLength={320}
                                            onChange={(e) =>
                                                handleFieldChange("about", e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="divider text-xs my-0 mt-3">
                                        <span className="flex gap-2">
                                            Tags
                                        </span>
                                    </div>

                                    <TagInput
                                        id="tags"
                                        value={data?.tags}
                                        // @ts-ignore
                                        onChange={(tags) => handleFieldChange("tags", tags)}
                                        recommendedTags={recommendedTags}
                                        maxTags={10}
                                        minLength={3}
                                        maxLength={24}
                                        onInvalid={(message) =>
                                            toast.show(message, { type: "error" })
                                        }
                                    />
                                </fieldset>
                            )}

                            {activeTab === "privacy" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex gap-2">
                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="label flex gap-2">
                                                Profile Visibility

                                                <Tooltip content={(
                                                    <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                        <div><strong>Public:</strong> Visible to everyone.</div>
                                                        <div><strong>Unlisted:</strong> Only accessible via direct link.</div>
                                                        <div><strong>Registered:</strong> Visible only to logged-in users.</div>
                                                        <div><strong>Friends:</strong> Visible only to friends on your list.</div>
                                                        <div><strong>Private:</strong> Visible only to you.</div>
                                                    </div>
                                                )}>
                                                    <span className="font-nerdfont text-sm"></span>
                                                </Tooltip>
                                            </label>

                                            <TypeableDropdownInput
                                                value={
                                                    data?.visibility?.charAt(0)?.toUpperCase() + data?.visibility?.slice(1)?.toLowerCase()
                                                }
                                                options={[
                                                    { id: "public", name: "Public" },
                                                    { id: "unlisted", name: "Unlisted" },
                                                    { id: "registered", name: "Registered" },
                                                    { id: "friends", name: "Friends" },
                                                    { id: "private", name: "Private" },
                                                ]}
                                                placeholder="Select Option"
                                                typeable={false}
                                                onChange={(option) =>
                                                    handleFieldChange(
                                                        "visibility",
                                                        option as VisibilityType
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="divider text-xs my-0 mt-3">
                                        <span className="flex gap-2">
                                            Social
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="label flex gap-2">
                                                Content Comments

                                                <Tooltip content={(
                                                    <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                        <div><strong>Public:</strong> Everyone can post comments.</div>
                                                        <div><strong>Followers:</strong> Users who follow you can post comments.</div>
                                                        <div><strong>Friends:</strong> Friends on your list can post comments.</div>
                                                        <div><strong>Private:</strong> Only you or collaborators can post comments.</div>
                                                    </div>
                                                )}>
                                                    <span className="font-nerdfont text-sm"></span>
                                                </Tooltip>
                                            </label>

                                            <TypeableDropdownInput
                                                value={
                                                    data?.sendComments?.charAt(0)?.toUpperCase() + data?.sendComments?.slice(1)?.toLowerCase()
                                                }
                                                options={[
                                                    { id: "public", name: "Public" },
                                                    { id: "followers", name: "Followers" },
                                                    { id: "friends", name: "Friends" },
                                                    { id: "private", name: "Private" },
                                                ]}
                                                placeholder="Select Option"
                                                typeable={false}
                                                onChange={(option) =>
                                                    handleFieldChange(
                                                        "sendComments",
                                                        option as VisibilityType
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </fieldset>
                            )}

                            {activeTab === "preview" && (
                                <div className="md:hidden">
                                    {/*<UserCard
                                        key={JSON.stringify(previewData)}
                                        // @ts-ignore
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
                                // @ts-ignore
                                data={previewData}
                                isPreview={true}
                            />*/}
                        </div>
                    </div>
                </div>

                {(() => {
                    const hasChanges = Object.keys(getChangedData(data, initialData as DraftCharacterType)).length > 0;

                    return (
                        <div className="flex items-center gap-2 sm:gap-3 flex-row w-full pt-4 z-10 shrink-0">
                            <button
                                type="button"
                                className="btn btn-neutral flex-1"
                                onClick={handleClose}
                            >
                                {t("words.Close")}
                            </button>

                            <button
                                type="button"
                                className={`btn flex-3 flex items-center justify-center border rounded gap-2 transition-colors ${
                                    !hasChanges 
                                        ? "bg-base-200 border-base-300 cursor-not-allowed opacity-60" 
                                        : "bg-success border-success text-white cursor-pointer"
                                }`}
                                onClick={handleSave}
                                disabled={isSaving || !hasChanges}
                            >
                                <span className={`font-nerdfont leading-none ${isSaving ? "loading w-6 h-6" : ""}`}>
                                    {!isSaving && (!hasChanges ? "" : "󰆓")}
                                </span>
                                {!isSaving && (hasChanges ? t("words.Save") : t("words.Saved"))}
                            </button>
                        </div>
                    );
                })()}
            </div>
        </dialog>
    );
});

EditTemplateModal.displayName = "EditTemplateModal";
export default EditTemplateModal;
