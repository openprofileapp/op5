/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, useMemo, useEffect } from "react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { CSS } from "@dnd-kit/utilities";
import ImageInput from "../ImageInput.js";
import { useObjectURL } from "../../hooks/useObjectURL.hook.js";
import ColorInput from "../ColorInput.js";
import { TypeableDropdownInput } from "../TypeableDropdownInput.js";
import { apiBaseUrl, cdnBaseUrl } from "../../scripts/domains.js";
import { VisibilityType } from "../../../../_common/types/visibility.type.js";
import { Tooltip } from "../Tooltip.js";
import { toast } from "../../scripts/toast.js";
import { CheckboxInput } from "../CheckboxInput.js";
import { recommendedTags } from "../../scripts/tags.js";
import TagInput from "../TagInput.js";
import { GetDraftCharacterItemType } from "../../../../_common/types/characters/character.type.js";
import CharacterCard from "../CharacterCard.js";
import { GetMediaType } from "../../../../_common/types/media.type.js";

export interface EditCharacterModalRef {
    open: (
        incomingData: GetDraftCharacterItemType,
        onSave?: (updatedData: GetDraftCharacterItemType) => void
    ) => Promise<GetDraftCharacterItemType | null>;
    close: () => void;
}

type MediaItem = NonNullable<GetDraftCharacterItemType["media"]>[number] & { _id: string };

interface SortableMediaItemProps {
    item: MediaItem;
    index: number;
    isFirst: boolean;
    isLast: boolean;
    onChangeUrl: (id: string, value: string) => void;
    onChangeOptions: (
        id: string,
        options: {
            description: string;
            credit: string;
        }
    ) => void;
    onDelete: (id: string) => void;
}

function SortableMediaItem({
    item,
    index,
    isFirst,
    isLast,
    onChangeUrl,
    onChangeOptions,
    onDelete,
}: SortableMediaItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({
            id: item._id,
        });

    const [localUrl, setLocalUrl] = useState(item.url ?? "");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLocalUrl(item.url ?? "");
    }, [item.url]);

    const handleImageChange = (
        file: File | null | undefined,
        base64Url: string,
        staticFile?: File | null,
        staticBase64?: string,
        updatedOptions?: {
            description?: string;
            credit?: string;
        }
    ) => {
        if (file && file.size > 1 * 1024 * 1024) {
            toast.show("File is too large (1 MB maximum)", {
                type: "error",
            });
            return;
        }

        if (!base64Url) {
            return;
        }

        onChangeUrl(item._id, base64Url);

        onChangeOptions(item._id, {
            description: updatedOptions?.description ?? item.description ?? "",
            credit: updatedOptions?.credit ?? item.credit ?? "",
        });
    };

    const mediaUrl = useMemo(() => {
        const url = localUrl;

        if (!url) {
            return "";
        }

        if (
            url.startsWith("data:") ||
            url.startsWith("blob:") ||
            url.startsWith("http://") ||
            url.startsWith("https://")
        ) {
            return url;
        }

        const isBase64 = url.startsWith("data:") || url.startsWith("blob:");

        return `${!isBase64 ? cdnBaseUrl : ""}${url}`;
    }, [localUrl]);

    console.log(mediaUrl)

    const mediaOptions = useMemo(
        () => ({
            description: item.description ?? "",
            credit: item.credit ?? "",
        }),
        [item.description, item.credit]
    );

    return (
        <div
            ref={setNodeRef}
            style={{
                transform: CSS.Transform.toString(transform),
                transition,
            }}
            className={`
                text-xs w-full border border-base-300 p-3
                transition-colors flex items-center gap-3
                ${index % 2 === 0 ? "bg-base-200" : "bg-[#151515]"}
                ${isFirst ? "rounded-t" : ""}
                ${isLast ? "rounded-b" : ""}
            `}
        >
            <button
                type="button"
                className="
                    cursor-grab active:cursor-grabbing
                    opacity-60 hover:opacity-100
                    flex items-center justify-center p-1
                "
                {...attributes}
                {...listeners}
            >
                <span className="font-nerdfont text-xl leading-none">
                    󰇝
                </span>
            </button>

            <ImageInput
                value={null}
                defaultUrl={mediaUrl}
                options={mediaOptions}
                // @ts-ignore
                onChange={handleImageChange}
                accept="image/png, image/jpeg, image/jpg"
                aspectRatio={2}
                height="32"
                width="full"
                label="media"
                useModal={true}
            />

            <button
                type="button"
                className="text-error w-8 cursor-pointer"
                onClick={() => onDelete(item._id)}
            >
                <span className="font-nerdfont text-lg leading-none">
                    
                </span>
            </button>
        </div>
    );
}

const EditCharacterModal = forwardRef<EditCharacterModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const onSaveRef = useRef<((updatedData: GetDraftCharacterItemType) => void) | null>(null);

    const [data, setData] = useState<GetDraftCharacterItemType | null>(null);
    const [initialData, setInitialData] = useState<GetDraftCharacterItemType | null>(null);

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
            incomingData: GetDraftCharacterItemType,
            onSave?: (updatedData: GetDraftCharacterItemType) => void
        ) => {
            onSaveRef.current = onSave || null;

            const cloned = structuredClone(incomingData);

            if (cloned.media) {
                cloned.media = cloned.media.map((m, i) => ({
                    ...m,
                    _id: (m as MediaItem)._id || `media-${Date.now()}-${i}`,
                })) as GetMediaType[];
            } else {
                cloned.links = [];
            }

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

    const handleFieldChange = <K extends keyof GetDraftCharacterItemType>(
        field: K,
        value: GetDraftCharacterItemType[K]
    ) => {
        setData((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                [field]: value,
            };
        });
    };

    const mediaList: MediaItem[] = (data?.media as MediaItem[]) || [];

    const handleMediaDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        setData((prev) => {
            if (!prev?.media) {
                return prev;
            }

            const media = prev.media as MediaItem[];

            const oldIndex = media.findIndex(
                (item) => item._id === active.id
            );

            const newIndex = media.findIndex(
                (item) => item._id === over.id
            );

            if (oldIndex === -1 || newIndex === -1) {
                return prev;
            }

            return {
                ...prev,
                media: arrayMove(media, oldIndex, newIndex),
            };
        });
    };

    const updateMediaItem = (
        id: string,
        update: Partial<MediaItem>
    ) => {
        setData((prev) => {
            if (!prev?.media) return prev;

            return {
                ...prev,
                media: (prev.media as MediaItem[]).map((item) =>
                    item._id === id
                        ? {
                            ...item,
                            ...update,
                        }
                        : item
                ),
            };
        });
    };

    const handleMediaUrlChange = (id: string, value: string) => {
        updateMediaItem(id, {
            url: value,
        });
    };

    const handleMediaOptionsChange = (
        id: string,
        options: {
            description: string;
            credit: string;
        }
    ) => {
        updateMediaItem(id, {
            description: options.description,
            credit: options.credit,
        });
    };

    const handleAddMedia = () => {
        if (mediaList.length >= 9) return;
        
        // @ts-ignore
        const newMedia: MediaItem = {
            _id: `link-${Date.now()}-${mediaList.length}`,
            url: "",
        };
        handleFieldChange("media", [...mediaList, newMedia]);
    };

    const handleDeleteMedia = (id: string) => {
        setData((prev) => {
            if (!prev?.media) return prev;

            return {
                ...prev,
                media: (prev.media as MediaItem[]).filter(
                    (item) => item._id !== id
                ),
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
        data: GetDraftCharacterItemType,
        initialData: GetDraftCharacterItemType
    ) {
        const result: Partial<GetDraftCharacterItemType> = {};

        const cleanData = omitId(data);
        const cleanInitial = omitId(initialData);

        for (const k in cleanData) {
            const key = k as keyof GetDraftCharacterItemType;

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
                        data as GetDraftCharacterItemType, 
                        initialData as GetDraftCharacterItemType
                    ) 
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                if (onSaveRef.current) {
                    onSaveRef?.current(data as GetDraftCharacterItemType);
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

    const previewData: GetDraftCharacterItemType = {
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
                                    activeTab === "media" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("media")}
                            >
                                Media
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

                                                    handleFieldChange("avatar", staticBase64 as GetDraftCharacterItemType["avatar"]);
                                                    handleFieldChange("animatedAvatar", animatedBase64 as GetDraftCharacterItemType["animatedAvatar"]);
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
                                                        base64Url as GetDraftCharacterItemType["banner"]
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

                                            <Tooltip 
                                                content={(
                                                    <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                        <div>
                                                            <strong>Sensitive Content (viewable by everyone):</strong>
                                                            <br />
                                                            Your content includes sensitive themes, such as trauma, severe mental health struggles (e.g., self-harm or suicide), grief, hate speech, abuse, minor gore, or non-sexual revealing clothing.
                                                        </div>

                                                        {window.session.isAdult && (
                                                            <div>
                                                                <strong>Mature Content (18+ accounts only):</strong>
                                                                <br />
                                                                Your content includes themes restricted to adult audiences due to explicit detail, such as graphic violence, suggestive sexual content, severe profanity, explicit substance abuse, simulated gambling, or sexually suggestive revealing clothing.
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                                position="bottom"
                                            >
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

                                            {window.session.isAdult && (
                                                <CheckboxInput
                                                    label="Mature Content"
                                                    checked={data.isMature}
                                                    className="mt-1"
                                                    onChange={(checked) => handleFieldChange("isMature", checked as unknown as boolean)}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    <CheckboxInput
                                        label="Confidiential Content (NDA Enclosed)"
                                        checked={data.isConfidential}
                                        className="mt-1"
                                        onChange={(checked) => handleFieldChange("isConfidential", checked as unknown as boolean)}
                                    />

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

                                    <div className="flex flex-col gap-1 mt-1">
                                        <label className="label">Legal Information</label>

                                        <textarea
                                            className="textarea w-full resize-none !h-auto min-h-[2.5rem] [field-sizing:content]"
                                            placeholder={
                                                // @ts-ignore
                                                initialData?.license || `© ${data.owner.username}`
                                            }
                                            value={data.license ?? ""}
                                            maxLength={320}
                                            onChange={(e) =>
                                                handleFieldChange("license", e.target.value)
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
                                        // @ts-ignore
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

                            {activeTab === "media" && (
                                <fieldset className="fieldset w-full">
                                    <div className="flex flex-col">
                                        <DndContext
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleMediaDragEnd}
                                            modifiers={[restrictToVerticalAxis]}
                                        >
                                            <SortableContext
                                                items={mediaList.map((l) => l._id)}
                                                strategy={verticalListSortingStrategy}
                                            >
                                                {mediaList.map((item, index) => (
                                                    <SortableMediaItem
                                                        key={item._id}
                                                        item={item}
                                                        index={index}
                                                        isFirst={index === 0}
                                                        isLast={index === mediaList.length - 1}
                                                        onChangeUrl={handleMediaUrlChange}
                                                        onChangeOptions={handleMediaOptionsChange}
                                                        onDelete={handleDeleteMedia}
                                                    />
                                                ))}
                                            </SortableContext>
                                        </DndContext>

                                        {mediaList.length < 9 && (
                                            <button
                                                type="button"
                                                onClick={handleAddMedia}
                                                className="mt-3 cursor-pointer border-2 border-dashed border-base-300 rounded flex items-center justify-center py-3 transition-colors text-sm opacity-70 hover:opacity-100"
                                            >
                                                <span className="font-nerdfont text-lg">
                                                    
                                                </span>
                                            </button>
                                        )}
                                    </div>
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

                                        <div className="flex flex-col gap-1 mt-1">
                                            <label className="label flex gap-2">
                                                Read Visibility

                                                <Tooltip content={(
                                                    <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                                        <div><strong>Public:</strong> Readable to everyone.</div>
                                                        <div><strong>Registered:</strong> Readable only to logged-in users.</div>
                                                        <div><strong>Friends:</strong> Readable only to friends on your list.</div>
                                                        <div><strong>Private:</strong> Readable only to you.</div>
                                                    </div>
                                                )}>
                                                    <span className="font-nerdfont text-sm"></span>
                                                </Tooltip>
                                            </label>

                                            <TypeableDropdownInput
                                                value={
                                                    data?.readVisibility?.charAt(0)?.toUpperCase() + data?.readVisibility?.slice(1)?.toLowerCase()
                                                }
                                                options={[
                                                    { id: "public", name: "Public" },
                                                    { id: "registered", name: "Registered" },
                                                    { id: "friends", name: "Friends" },
                                                    { id: "private", name: "Private" },
                                                ]}
                                                placeholder="Select Option"
                                                typeable={false}
                                                onChange={(option) =>
                                                    handleFieldChange(
                                                        "readVisibility",
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
                                        <div className="flex flex-col gap-1 mt-1 w-full flex-1">
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
                                                    { id: "default", name: "Default" },
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
                                    <CharacterCard
                                        key={JSON.stringify(previewData)}
                                        // @ts-ignore
                                        data={previewData}
                                        isPreview={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center min-h-[500px] h-full w-full p-4 overflow-hidden">
                        <div className="flex items-center justify-center w-full max-w-[340px]">
                            <CharacterCard
                                key={JSON.stringify(previewData)}
                                // @ts-ignore
                                data={previewData}
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>

                {(() => {
                    const hasChanges = Object.keys(getChangedData(data, initialData as GetDraftCharacterItemType)).length > 0;

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

EditCharacterModal.displayName = "EditCharacterModal";
export default EditCharacterModal;
