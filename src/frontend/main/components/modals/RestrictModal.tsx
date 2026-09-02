import { useTranslation } from "react-i18next";
import { toast } from "../../../_common/scripts/toast.js";

type Props = {
    userId: string;
    displayName: string;
    isStaff: boolean
};

export default function RestrictModal({ 
    userId,
    displayName,
    isStaff = false
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;

    return (
        <dialog id="restrict" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">
                    {t("components.modals.restrict.title")} {displayName}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {displayName} {t("components.modals.limit.subtext")}
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
                    {displayName} {t("components.modals.limit.subtextTwo")}
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
                            (document.getElementById("restrict") as HTMLDialogElement)?.close();
                            (document.getElementById("block") as HTMLDialogElement)?.show();
                        }}
                    >
                        {t("components.modals.restrict.notEnough")}
                    </button>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button 
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            (document.getElementById("restrict") as HTMLDialogElement)?.close();
                        }}
                    >
                        {t("components.modals.close")}
                    </button>

                    {/* Display loading class while awaiting API */}
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            (document.getElementById("restrict") as HTMLDialogElement)?.close();
                            toast.show(
                                `${t("components.modals.restrict.result")} ${displayName}`, 
                                { icon: "", type: "error" }
                            );
                        }}
                    >
                        {t("components.modals.restrict.title")} {displayName}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
