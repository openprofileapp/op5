/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, useEffect } from "react";

import { toast } from "../../scripts/toast.js";
import { TypeableDropdownInput } from "../TypeableDropdownInput.js";
import { GetAssetType } from "../../../../_common/types/asset.type.js";
import { apiBaseUrl } from "../../scripts/domains.js";
import { Tooltip } from "../Tooltip.js";
import getModerationReason from "../../../../_common/helpers/getModerationReason.js";
import { ModerationReasonType } from "../../../../_common/types/moderation.type.js";

export interface ModerateModalRef {
    open: (data: GetAssetType) => void;
    close: () => void;
}

const ModerateModal = forwardRef<ModerateModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetAssetType>();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [reason, setReason] = useState<string>("");
    const [reasonData, setReasonData] = useState<ModerationReasonType | undefined>(undefined);
    const [note, setNote] = useState<string>("");

    const resetState = () => {
        setData(undefined);
        setReason("");
        setReasonData(undefined);
        setNote("");
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data) => {
            setData(data);

            // @ts-ignore
            setReasonData(getModerationReason(reason || "unknown"));

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

    useEffect(() => {
        // @ts-ignore
        setReasonData(getModerationReason(reason || "unknown"));
    }, [reason]);

    if (!isTranslationReady || !data) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal overflow-visible"
        >
            <div className="modal-box overflow-visible">
                <form method="dialog">
                    <button 
                        type="button" 
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>
                
                <h3 className="font-bold text-2xl text-center">
                    Moderate {data.displayName || data.id}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {/* @ts-ignore */}
                    ID: {data.id}{data?.owner?.id && ` - Owner ID: ${data?.owner?.id}`}
                </p>
                
                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Actions should be honest, accurate, free from bias or distortion, and made in good faith.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Check OpenProfile's Terms of Service or ask an administrator when uncertain about an action.
                        </div>
                    </div>
                </div>

                <div className="flex flex-col">
                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        <label className="label flex gap-2">
                            Reason

                            <Tooltip content={(
                                <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                    Actions are pre-defined and will escalate based on account history. Loss of permissions, account suspension, or warning expirations happen automatically.
                                </div>
                            )}>
                                <span className="font-nerdfont text-sm"></span>
                            </Tooltip>
                        </label>
                        <TypeableDropdownInput
                            options={[
                                { id: "ABUSIVE_BEHAVIOR", name: "Abusive Behavior" },
                                { id: "SPAM_CONTENT", name: "Spam Content" },
                                { id: "MALICIOUS_CONTENT", name: "Malicious Content" },
                                { id: "EXPLICIT_CONTENT", name: "Explicit Content" },
                                { id: "MISSING_MATURE_WARNING", name: "Missing Mature Warning" },
                                { id: "MISSING_SENSITIVE_WARNING", name: "Missing Sensitive Warning" },
                                { id: "DMCA_TAKEDOWN", name: "DMCA Takedown" },
                                { id: "PLATFORM_MISUSE", name: "Platform Misuse" },
                                { id: "PLATFORM_MANIPULATION", name: "Platform Manipulation" },
                                { id: "BAN_EVASION", name: "Ban Evasion" },
                                { id: "PRIVACY_VIOLATION", name: "Privacy Violation" },
                                { id: "IMPERSONATION", name: "Impersonation" },
                                { id: "AI_GENERATED_CONTENT", name: "AI-Generated Content" },
                                { id: "FILTER_BYPASS", name: "Filter Bypass" },
                            ]}
                            placeholder="What is the reason for this moderation?"
                            typeable={false}
                            onChange={(value) => setReason(value as string)}
                        />
                    </legend>

                    {reasonData?.name !== "Unknown" && (
                        <div className="text-xs border border-base-300 rounded text-sub p-2">
                            <span className="bg-accent text-white rounded-xs px-1">{reasonData?.severity}</span> {reasonData?.description}
                        </div>
                    )}

                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        <label className="label flex gap-2">
                            Moderator Note

                            <Tooltip content={(
                                <div className="flex flex-col gap-2 tooltip-content bg-base-200 text-xs text-left border border-base-300 rounded shadow-2xl">
                                    This note will be shared with the actioned user. Do not include personal information or notes meant for internal eyes only.
                                </div>
                            )}>
                                <span className="font-nerdfont text-sm"></span>
                            </Tooltip>
                        </label>
                        <textarea
                            className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                            id={`report-description`}
                            placeholder="Help the actioned user understand what they did wrong and how to prevent it in the future. (optional)"
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                            onChange={(event) => setNote(event.target.value)}
                        />
                    </legend>
                </div>

                <div className="pt-4 mb-5 flex gap-2 flex-row relative">
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={async () => {
                            setIsLoading(true);

                            const response = await fetch(
                                `${apiBaseUrl}/v3/moderate`,
                                { 
                                    credentials: "include", 
                                    method: "POST", 
                                    headers: {"Content-Type": "application/json"}, 
                                    body: JSON.stringify({ 
                                        targetId: data.id, 
                                        reason, 
                                        note
                                    })
                                }
                            );

                            const json = await response.json();

                            if (response.ok) {
                                setIsLoading(false);

                                handleClose();

                                toast.show(
                                    "Action submitted", 
                                    { icon: "", type: "success" }
                                );

                                window.location.reload();
                            } else {
                                setIsLoading(false);

                                toast.show(
                                    `${t("words.FailedTo")} submit action on ${data.displayName || data.id}`,
                                    {
                                        subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                                        type: "error",
                                    }
                                );
                            }
                        }}
                    >
                        <div className="font-nerdfont leading-none absolute left-4 text-lg">
                            
                        </div>

                        <span className={`${isLoading ? "loading" : ""}`}>
                            Submit Action
                        </span>
                    </button>
                </div>

                <span className="flex justify-center text-sub text-xs">
                    All actions unappealable for the time being. You remain anonymous.
                </span>
            </div>
        </dialog>
    );
});

ModerateModal.displayName = "ModerateModal";
export default ModerateModal;
