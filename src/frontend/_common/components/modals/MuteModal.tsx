import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef } from "react";

import { toast } from "../../scripts/toast.js";
import { GetUserItemType } from "../../../../_common/types/user.type.js";

export interface MuteModalRef {
    open: (data: GetUserItemType) => void;
    close: () => void;
}

const MuteModal = forwardRef<MuteModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const [data, setData] = useState<GetUserItemType>();

    const [isInteractionSelected, setIsInteractionSelected] = useState<boolean>(false);
    const [isMessageSelected, setIsMessageSelected] = useState<boolean>(false);

    const resetState = () => {
        setData(undefined);

        setIsInteractionSelected(false);
        setIsMessageSelected(false);
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
                    {t("components.modals.mute.title")} {data.displayName}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {t("components.modals.mute.subtext")} {data.displayName}:
                </p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={isInteractionSelected}
                                onChange={(e) => {
                                    setIsInteractionSelected(e.target.checked);
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.mute.rowTwoTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.mute.rowTwoSubtext")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={isMessageSelected}
                                onChange={(e) => {
                                    setIsMessageSelected(e.target.checked);
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.mute.rowThreeTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.mute.rowThreeSubtext")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            handleClose();

                            // DEVELOPER NEEDED: Setup interaction (via hook) and loading

                            toast.show(
                                `${t("components.modals.mute.result")} ${data.displayName}`, 
                                { icon: "󰂛", type: "error" }
                            );
                        }}
                    >
                        {t("components.modals.mute.title")} {data.displayName}
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

MuteModal.displayName = "MuteModal";
export default MuteModal;
