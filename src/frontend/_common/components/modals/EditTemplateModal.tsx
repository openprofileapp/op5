/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { apiBaseUrl } from "../../scripts/domains.js";
import { toast } from "../../scripts/toast.js";
import { recommendedTags } from "../../scripts/tags.js";
import TagInput from "../TagInput.js";
import TemplateCard from "../TemplateCard.js";
import { GetTemplateItemType } from "../../../../_common/types/template/template.type.js";
import { useModals } from "../../hooks/ModalContext.hook.js";

export interface EditTemplateModalRef {
    open: (
        incomingData: GetTemplateItemType,
        onSave?: (updatedData: GetTemplateItemType) => void
    ) => Promise<GetTemplateItemType | null>;
    close: () => void;
}

const EditTemplateModal = forwardRef<EditTemplateModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const { 
        publishModal,
        unpublishModal
    } = useModals();
    
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const onSaveRef = useRef<((updatedData: GetTemplateItemType) => void) | null>(null);

    const [data, setData] = useState<GetTemplateItemType | null>(null);
    const [initialData, setInitialData] = useState<GetTemplateItemType | null>(null);

    const [isSaving, setIsSaving] = useState<boolean>(false);

    const [activeTab, setActiveTab] = useState("overview");

    const resetState = () => {
        setData(null);
        setInitialData(null);
        setActiveTab("overview");
    };

    useImperativeHandle(ref, () => ({
        // @ts-ignore
        open: (
            incomingData: GetTemplateItemType,
            onSave?: (updatedData: GetTemplateItemType) => void
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

    const handleFieldChange = <K extends keyof GetTemplateItemType>(
        field: K,
        value: GetTemplateItemType[K]
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
        data: GetTemplateItemType,
        initialData: GetTemplateItemType
    ) {
        const result: Partial<GetTemplateItemType> = {};

        const cleanData = omitId(data);
        const cleanInitial = omitId(initialData);

        for (const k in cleanData) {
            const key = k as keyof GetTemplateItemType;

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
            const response = await fetch(`${apiBaseUrl}/v3/templates/update/${data?.id}`, {
                credentials: "include",
                method: "POST", 
                headers: { "Content-Type": "application/json" }, 
                body: JSON.stringify({ 
                    data: getChangedData(
                        data as GetTemplateItemType, 
                        initialData as GetTemplateItemType
                    ) 
                })
            });

            const responseData = await response.json();

            if (response.ok) {
                if (onSaveRef.current) {
                    onSaveRef?.current(data as GetTemplateItemType);
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

    const handlePublish = () => {
        if (!data) return;

        publishModal.open(
            // @ts-ignore
            data,
            { type: "template" }
        );
    };

    const handleUnpublish = () => {
        if (!data) return;

        unpublishModal.open(
            // @ts-ignore
            data,
            { type: "template" }
        );
    };

    if (!isTranslationReady || !data) return null;

    const previewData: GetTemplateItemType = {
        ...data
    };

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
                    Edit Template
                </h3>

                <div className="flex flex-col md:flex-row">
                    <div className="w-full">
                        <div className="relative md:right-3 tabs tabs-border flex w-full">
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
                                className={`md:hidden tab bg-base-200 flex-1 ${
                                    activeTab === "preview" ? "tab-active" : ""
                                }`}
                                onClick={() => setActiveTab("preview")}
                            >
                                Preview
                            </button>
                        </div>

                        <div className="border-base-300 pt-3 md:pr-6 rounded-b overflow-x-hidden overflow-y-auto h-108">
                            {activeTab === "overview" && (
                                <fieldset className="fieldset w-full">
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
                                        value={data?.tags as unknown as string}
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

                            {activeTab === "preview" && (
                                <div className="md:hidden">
                                    <TemplateCard
                                        key={JSON.stringify(previewData)}
                                        data={previewData}
                                        isPreview={true}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:flex items-center justify-center min-h-[500px] h-full w-full p-4 overflow-hidden">
                        <div className="flex items-center justify-center w-full max-w-[340px]">
                            <TemplateCard
                                key={JSON.stringify(previewData)}
                                data={previewData}
                                isPreview={true}
                            />
                        </div>
                    </div>
                </div>

                {(() => {
                    const hasChanges = Object.keys(getChangedData(data, initialData as GetTemplateItemType)).length > 0;

                    return (
                        <>
                            <div className="flex items-center gap-2 sm:gap-3 flex-row w-full pt-4 z-10 shrink-0">
                                <button
                                    type="button"
                                    disabled={hasChanges}
                                    className="btn btn-success flex-1"
                                    onClick={() => {
                                        handlePublish();
                                    }}
                                >
                                    Publish {hasChanges ? "(save changes first)" : ""}
                                </button>

                                {/* @ts-ignore */}
                                {data?.isPublished && (
                                    <button
                                        type="button"
                                        disabled={hasChanges}
                                        className="btn bg-base-300 flex-1"
                                        onClick={() => {
                                            handleUnpublish();
                                        }}
                                    >
                                        Unpublish {hasChanges ? "(save changes first)" : ""}
                                    </button>
                                )}
                            </div>
                            
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
                        </>
                    );
                })()}
            </div>
        </dialog>
    );
});

EditTemplateModal.displayName = "EditTemplateModal";
export default EditTemplateModal;
