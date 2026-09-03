import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../../_common/scripts/toast.js";
import { TypeableDropdownInput } from "../../../_common/components/TypeableDropdownInput.js";
import { GetUserItemType } from "../../../../_common/types/user.type.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";

export interface ReportModalRef {
    open: (data: GetUserItemType | GetPublishedCharacterItemType) => void;
    close: () => void;
}

const ReportModal = forwardRef<ReportModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetUserItemType | GetPublishedCharacterItemType>();

    const resetState = () => {
        setData(undefined);
    };

    useImperativeHandle(ref, () => ({
        open: (data) => {
            setData(data);

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
                    {t("components.modals.report.title")} {data.displayName}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    ID: {data.id}
                </p>
                
                <div className="flex gap-5 pb-4 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            {t("components.modals.report.rowTitle")}
                        </div>
                    </div>                    
                </div>

                <div className="flex flex-col gap-2">
                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        {t("components.modals.report.type")}
                        <TypeableDropdownInput
                            options={[
                                { id: "abuse", name: t("components.modals.report.abuse") },
                                { id: "spam", name: t("components.modals.report.spam") },
                                { id: "inappropriate", name: t("components.modals.report.inappropriate") },
                                { id: "dmca", name: t("components.modals.report.dmca") },
                                { id: "misuse", name: t("components.modals.report.misuse") },
                                { id: "safety", name: t("components.modals.report.safety") },
                                { id: "impersonation", name: t("components.modals.report.impersonation") },
                                { id: "ai", name: t("components.modals.report.ai") },
                                { id: "bug", name: t("components.modals.report.bug") },
                                { id: "other", name: t("components.modals.report.other") }
                            ]}
                            placeholder={t("components.modals.report.placeholder")}
                            typeable={false}
                        />
                    </legend>

                    <legend className="flex flex-col items-start w-full fieldset-legend text-sm font-normal">
                        {t("words.Description")}
                        <textarea
                            className="textarea resize-none bg-base-100 border border-base-300 w-full min-h-10 h-24 text-sm z-2"
                            id={`report-description`}
                            placeholder={t("components.modals.report.description")}
                            spellCheck={false}
                            autoCorrect="off"
                            autoCapitalize="off"
                        />
                    </legend>
                </div>

                <div className="pt-4 mb-5 flex gap-2 flex-row relative">
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            handleClose();

                            // DEVELOPER NEEDED: Setup reports API and loading

                            toast.show(
                                `${t("components.modals.report.result")}`, 
                                { icon: "", type: "success" }
                            );
                        }}
                    >
                        <div className="font-nerdfont leading-none absolute left-4 text-lg">
                            
                        </div>
                        {t("components.modals.report.submit")}
                    </button>
                </div>

                <span className="flex justify-center text-sub text-xs">
                    {t("components.modals.report.footer")}
                </span>
            </div>
            <form 
                method="dialog" 
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

ReportModal.displayName = "ReportModal";
export default ReportModal;
