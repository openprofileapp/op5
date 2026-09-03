import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../../_common/scripts/toast.js";
import { GetUserItemType } from "../../../../_common/types/user.type.js";
import { useModals } from "../../../_common/hooks/ModalContext.hook.js";

export interface RestrictModalRef {
    open: (data: GetUserItemType) => void;
    close: () => void;
}

const RestrictModal = forwardRef<RestrictModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const { blockModal } = useModals();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetUserItemType>();
    const [isStaff, setIsStaff] = useState<boolean>(false);

    const resetState = () => {
        setData(undefined);
        setIsStaff(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data) => {
            setData(data);
            setIsStaff(data.badges?.some(badge => badge.type === "STAFF"))

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
            className="modal"
        >
            <div className="modal-box">
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
                    {t("components.modals.restrict.title")} {data.displayName}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {data.displayName} {t("components.modals.limit.subtext")}
                </p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            {t("components.modals.restrict.rowOneTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.restrict.rowOneSubtext")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󱙍
                        </div>

                        <div>
                            {t("components.modals.limit.messagesTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.limit.messagesSubtext")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            {t("components.modals.restrict.rowThreeTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.restrict.rowThreeSubtext")}
                            </span>
                        </div>
                    </div>
                </div>

                <p className="pb-6 text-sub text-sm text-center">
                    {data.displayName} {t("components.modals.limit.subtextTwo")}
                </p>
                
                <div className="flex gap-5 pb-8 pt-2 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>

                        <div>
                            {t("components.modals.restrict.rowFourTitle")}
                            
                            <br/>
                            
                            <span className="text-sub text-xs">
                                {t("components.modals.restrict.rowFourSubtext")}
                            </span>
                        </div>
                    </div>
                    {isStaff && (
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>

                            <div>
                                {t("components.modals.restrict.rowStaffOneTitle")}

                                <br/>

                                <span className="text-sub text-xs">
                                    {t("components.modals.restrict.rowStaffOneSubtext")}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button 
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            handleClose();

                            blockModal.open(data);
                        }}
                    >
                        {t("components.modals.restrict.notEnough")}
                    </button>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button 
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        {t("components.modals.close")}
                    </button>

                    {/* Display loading class while awaiting API */}
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            handleClose();

                            // DEVELOPER NEEDED: Setup interaction (via hook) and loading

                            toast.show(
                                `${t("components.modals.restrict.result")} ${data.displayName}`, 
                                { icon: "", type: "error" }
                            );
                        }}
                    >
                        {t("components.modals.restrict.title")} {data.displayName}
                    </button>
                </div>
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

RestrictModal.displayName = "RestrictModal";
export default RestrictModal;
