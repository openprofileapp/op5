import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, Dispatch, SetStateAction } from "react";

import { GetUserItemType } from "../../../../_common/types/user.type.js";
import { useModals } from "../../hooks/ModalContext.hook.js";
import { useInteractions } from "../../hooks/useInteractions.hook.js";

export interface InteractionOptions {
    isBlocked?: boolean;
    isBlockInteractionLoading?: boolean;
    setIsBlocked?: Dispatch<SetStateAction<boolean>>;
    setIsBlockInteractionLoading?: (loading: boolean) => void;
    isRestricted?: boolean;
    isRestrictInteractionLoading?: boolean;
    setIsRestricted?: Dispatch<SetStateAction<boolean>>;
    setIsRestrictInteractionLoading?: (loading: boolean) => void;
}

export interface RestrictModalRef {
    open: (data: GetUserItemType, options?: InteractionOptions) => void;
    close: () => void;
}

const RestrictModal = forwardRef<RestrictModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();
    const { handleRestrictInteraction } = useInteractions();
    const { blockModal } = useModals();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetUserItemType>();
    const [isStaff, setIsStaff] = useState<boolean>(false);

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [handlers, setHandlers] = useState<InteractionOptions>({});

    const resetState = () => {
        setData(undefined);
        setIsStaff(false);
        setHandlers({});
    };

    useImperativeHandle(ref, () => ({
        open: (userData, options = {}) => {
            setData(userData);
            setIsStaff(Boolean(userData.badges?.some(badge => badge.type === "STAFF")));
            setHandlers(options);

            requestAnimationFrame(() => {
                dialogRef.current?.showModal();
            });
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

    if (!isTranslationReady) return null;

    return (
        <dialog 
            ref={dialogRef} 
            className="modal"
        >
            {data && (
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
                        {handlers.isRestricted 
                            ? t("words.Unrestrict")
                            : t("words.Restrict")
                        } {data.displayName}
                    </h3>

                    <p className="pb-5 py-4 text-sub text-sm text-center">
                        {data.displayName} {handlers.isRestricted 
                            ? t("components.modals.limit.subtextTopTwo")
                            : t("components.modals.limit.subtextTopOne")
                        }
                    </p>
                    
                    <div className="flex gap-5 pb-8 pt-4 flex-col">
                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>

                            <div>
                                {t("components.modals.restrict.rowOneTitle")}

                                <br/>

                                {!handlers.isRestricted && (
                                    <span className="text-sub text-xs">
                                        {t("components.modals.restrict.rowOneSubtext")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                󱙍
                            </div>

                            <div>
                                {t("components.modals.limit.messagesTitle")}

                                <br/>

                                {!handlers.isRestricted && (
                                    <span className="text-sub text-xs">
                                        {t("components.modals.limit.messagesSubtext")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-6 flex-row items-center">
                            <div className="w-6 flex items-center justify-center text-xl font-nerdfont shrink-0">
                                
                            </div>

                            <div>
                                {t("components.modals.restrict.rowThreeTitle")}

                                <br/>

                                {!handlers.isRestricted && (
                                    <span className="text-sub text-xs">
                                        {t("components.modals.restrict.rowThreeSubtext")}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {!handlers.isRestricted && (
                        <>
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
                                    type="button"
                                    className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                                    onClick={() => {
                                        handleClose();
                                        blockModal.open(data, handlers);
                                    }}
                                >
                                    {t("components.modals.restrict.notEnough")}
                                </button>
                            </div>
                        </>
                    )}

                    <div className="pt-2 flex gap-2 flex-row relative">
                        <button 
                            type="button"
                            className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                            onClick={handleClose}
                        >
                            {t("components.modals.close")}
                        </button>

                        <button
                            type="button"
                            className="btn flex-1 bg-accent text-white border-accent"
                            disabled={Boolean(handlers.isRestrictInteractionLoading)}
                            onClick={async () => {
                                setIsLoading(true);

                                if (!handlers.setIsRestricted || !handlers.setIsRestrictInteractionLoading) return;

                                const result = await handleRestrictInteraction(
                                    data,
                                    Boolean(handlers.isRestricted),
                                    Boolean(handlers.isRestrictInteractionLoading),
                                    handlers.setIsRestricted,
                                    handlers.setIsRestrictInteractionLoading
                                );

                                if (result) {
                                    handleClose();
                                    setIsLoading(false);
                                }
                            }}
                        >
                            <div className={`${isLoading ? "loading" : ""}`}>
                                {handlers.isRestricted 
                                    ? t("words.Unrestrict")
                                    : t("words.Restrict")
                                } {data.displayName}
                            </div>
                        </button>
                    </div>
                </div>
            )}
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
