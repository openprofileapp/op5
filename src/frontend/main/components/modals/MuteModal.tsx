import { useTranslation } from "react-i18next";
import { toast } from "../../scripts/toast.js";

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
    const { t, ready } = useTranslation();

    if (!ready) return null;

    return (
        <dialog id="mute" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">Mute {displayName}</h3>
                <p className="pb-5 py-4 text-sub text-sm text-center">You will not get notifed when {displayName}:</p>
                
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
                            Publishes new or updates existing content.
                            <br/>
                            <span className="text-sub text-xs">This does not prevent content from appearing on your feed.</span>
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
                            Interacts or comments on your publications.
                            <br/>
                            <span className="text-sub text-xs">This will not remove new or existing comments.</span>
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
                            Sends you private messages.
                            <br/>
                            <span className="text-sub text-xs">You will still recieve notifications for shared group chats.</span>
                        </div>
                    </div>

                    {/*<div className="flex gap-6 flex-row items-center">
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
                            Follows you or sends you friend requests.
                            <br/>
                            <span className="text-sub text-xs">This does not block friend requests from being sent.</span>
                        </div>
                    </div>*/}
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button 
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            (document.getElementById("mute") as HTMLDialogElement)?.close();
                        }}
                    >
                        Close
                    </button>

                    {/* Display loading class while awaiting API */}
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            (document.getElementById("mute") as HTMLDialogElement)?.close();
                            toast.show(`You muted ${displayName}`, { icon: "󰂛", type: "error" });
                        }}
                    >
                        Mute {displayName}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        
    );
}