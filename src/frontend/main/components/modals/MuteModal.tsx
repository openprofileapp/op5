import { useTranslation } from "react-i18next";
import { toast } from "../../../_common/scripts/toast.js";

type Props = {
    userId: string;
    displayName: string;
    isStaff: boolean
};

export default function MuteModal({ 
    userId,
    displayName,
    isStaff
}: Props) {
    const { t, ready: isTranslationReady } = useTranslation();

    if (!isTranslationReady) return null;

    return (
        <dialog id="mute" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">
                    {t("components.modals.mute.title")} {displayName}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {t("components.modals.mute.subtext")} {displayName}:
                </p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                // checked={false}
                                onChange={(e) => {
                                    // CALL HERE
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.mute.rowOneTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.mute.rowOneSubtext")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                // checked={false}
                                onChange={(e) => {
                                    // CALL HERE
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
                                // checked={false}
                                onChange={(e) => {
                                    // CALL HERE
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
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            (document.getElementById("mute") as HTMLDialogElement)?.close();
                        }}
                    >
                        {t("components.modals.close")}
                    </button>

                    {/* Display loading class while awaiting API */}
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            (document.getElementById("mute") as HTMLDialogElement)?.close();
                            toast.show(
                                `${t("components.modals.mute.result")} ${displayName}`, 
                                { icon: "󰂛", type: "error" }
                            );
                        }}
                    >
                        {t("components.modals.mute.title")} {displayName}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}
