import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../scripts/toast.js";
import { TypeableDropdownInput } from "../TypeableDropdownInput.js";
import { CheckboxInput } from "../CheckboxInput.js";
import { apiBaseUrl } from "../../scripts/domains.js";

export interface BugReportModalRef {
    open: () => void;
    close: () => void;
}

const BugReportModal = forwardRef<BugReportModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [type, setType] = useState<string>("");
    const [errorId, setErrorId] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [reproductionSteps, setReproductionSteps] = useState<string>("");
    const [expectedResults, setExpectedResults] = useState<string>("");
    const [actualResults, setActualResults] = useState<string>("");
    const [affectsStable, setAffectsStable] = useState<boolean>(false);
    const [affectsNightly, setAffectsNightly] = useState<boolean>(false);

    const resetState = () => {
        setType("");
        setErrorId("");
        setDescription("");
        setReproductionSteps("");
        setExpectedResults("");
        setActualResults("");
        setAffectsStable(false);
        setAffectsNightly(false);
        setIsLoading(false);
    };

    useImperativeHandle(ref, () => ({
        open: () => {
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

    const userAgent = navigator.userAgent;

    const isClientError = 
        type === "ui"
        || type === "localization"
        || type === "performance"
        || type === "accessibility"
    ;

    const DescriptionInput = isClientError ? "textarea" : "input";

    if (!isTranslationReady) return null;

    return (
        <dialog
            ref={dialogRef}
            className="modal overflow-hidden"
        >
            <div className="modal-box flex max-h-[90dvh] flex-col overflow-hidden">
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
                    {t("components.modals.report.title")} Bug
                </h3>

                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            Open a new tab to test the issue. Closing this form will discard your progress.
                        </div>
                    </div>
                </div>

                <div className={`min-h-0 w-119 flex-1 ${isClientError ? "overflow-y-hidden" : "overflow-y-auto"} overflow-x-hidden pr-3`}>
                    <div className="flex flex-col">
                        <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                            {t("components.modals.report.type")}
                            <TypeableDropdownInput
                                options={[
                                    { id: "ui", name: "Visual Bug" },
                                    { id: "error", name: "Error Response" },
                                    { id: "functionality", name: "Broken Functionality" },
                                    { id: "localization", name: "Incorrect Translation & Typo" },
                                    { id: "performance", name: "Performance & Lag" },
                                    { id: "crash", name: "Client Crash" },
                                    { id: "accessibility", name: "Accessibility" },
                                    { id: "other", name: "Other" }
                                ]}
                                value={type}
                                placeholder={t("components.modals.report.placeholder")}
                                typeable={false}
                                onChange={(value) => setType(value as string)}
                            />
                        </legend>

                        {!isClientError && (
                            <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                                Error ID (optional)
                                <input
                                    className="input bg-base-100 border border-base-300 w-full text-sm z-2"
                                    id={`report-description`}
                                    placeholder="Paste the UUID from an error toast, if available."
                                    spellCheck={false}
                                    autoCorrect="off"
                                    autoCapitalize="off"
                                    disabled={!type}
                                    onChange={(event) => setErrorId(event.target.value)}
                                />
                            </legend>
                        )}

                        <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                            Description
                            <DescriptionInput
                                className={isClientError ? "textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2" : "input bg-base-100 border border-base-300 w-full text-sm z-2"}
                                id={`report-description`}
                                placeholder={isClientError ? "Describe the issue in as much detail as possible." : "Briefly describe the issue."}
                                spellCheck={false}
                                autoCorrect="off"
                                autoCapitalize="off"
                                disabled={!type}
                                onChange={(event) => setDescription(event.target.value)}
                            />
                        </legend>

                        {!isClientError && (
                            <>
                                <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                                    Reproduction Steps
                                    <textarea
                                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                                        id={`report-description`}
                                        placeholder="What are the steps to reproduce the issue? Include as much detail as possible. If you cannot reproduce it, then it is not a valid report."
                                        spellCheck={false}
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        disabled={!type}
                                        onChange={(event) => setReproductionSteps(event.target.value)}
                                    />
                                </legend>

                                <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                                    Expected Results
                                    <textarea
                                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                                        id={`report-description`}
                                        placeholder="What did you expect to happen when following the reproduction steps?"
                                        spellCheck={false}
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        disabled={!type}
                                        onChange={(event) => setExpectedResults(event.target.value)}
                                    />
                                </legend>

                                <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                                    Actual Results
                                    <textarea
                                        className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                                        id={`report-description`}
                                        placeholder="What happened when you followed the reproduction steps?"
                                        spellCheck={false}
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        disabled={!type}
                                        onChange={(event) => setActualResults(event.target.value)}
                                    />
                                </legend>
                            </>
                        )}

                        <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                            Affected Versions
                            <div className="flex gap-2 w-full">
                                <CheckboxInput
                                    label="Stable"
                                    checked={affectsStable}
                                    disabled={!type}
                                    onChange={(checked) => setAffectsStable(checked as unknown as boolean)}
                                />

                                <CheckboxInput
                                    label="Nightly"
                                    checked={affectsNightly}
                                    disabled={!type}
                                    onChange={(checked) => setAffectsNightly(checked as unknown as boolean)}
                                />
                            </div>
                        </legend>
                    </div>
                </div>

                <div className="shrink-0">
                    <div className="pt-4 mb-5 flex gap-2 flex-row relative">
                        <button
                            className={`btn flex-1 bg-accent text-white border-accent`}
                            onClick={async () => {
                                setIsLoading(true);

                                const response = await fetch(
                                    `${apiBaseUrl}/v3/report/bug`, 
                                    { 
                                        credentials: "include", 
                                        method: "POST", 
                                        headers: {"Content-Type": "application/json"}, 
                                        body: JSON.stringify({ 
                                            type, 
                                            errorId, 
                                            description, 
                                            reproductionSteps, 
                                            expectedResults, 
                                            actualResults, 
                                            affectsStable, 
                                            affectsNightly 
                                        })
                                    }
                                );

                                const json = await response.json();

                                if (response.ok) {
                                    setIsLoading(false);
                                    
                                    handleClose();

                                    toast.show(
                                        `${t("components.modals.report.result")}`, 
                                        { icon: "", type: "success" }
                                    );
                                } else {
                                    setIsLoading(false);

                                    toast.show(
                                        `${t("words.FailedTo")} submit bug report`,
                                        {
                                            subtext: `${json.id || ""}${json.id ? ": " : ""}${json.message}`,
                                            type: "error",
                                        }
                                    );
                                }
                            }}
                        >
                            <span className={`${isLoading ? "loading" : ""}`}>
                                {t("components.modals.report.submit")}
                            </span>
                        </button>
                    </div>

                    <span className="flex justify-center text-sub text-xs">
                        {userAgent}
                    </span>
                </div>
            </div>
        </dialog>
    );
});

BugReportModal.displayName = "BugReportModal";
export default BugReportModal;
