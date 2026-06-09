import { useTranslation } from "react-i18next";
import { toast } from "../../scripts/toast.js";

type Props = {
    userId: string;
    displayName: string;
};

export default function BlockModal({ 
    userId, 
    displayName 
}: Props) {
    const { t, ready } = useTranslation();

    if (!ready) return null;

    return (
        <dialog id="block" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">Block {displayName}</h3>
                <p className="pb-5 py-4 text-sub text-sm text-center">{displayName} will not be able to:</p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>
                        <div>
                            View or interact with your account or pubications.
                            <br/>
                            <span className="text-sub text-xs">This will remove existing interactions and friend connections.</span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󱙍
                        </div>
                        <div>
                            Send you private messages.
                            <br/>
                            <span className="text-sub text-xs">Existing conversations can still be read.</span>
                        </div>
                    </div>
                </div>

                <p className="pb-6 text-sub text-sm text-center">{displayName} may still be able to:</p>
                
                <div className="flex gap-5 pb-8 pt-2 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󰈈
                        </div>
                        <div>
                            View your account or pubications logged out
                            <br/>
                            <span className="text-sub text-xs">Set your account to "private" or "friends" to revoke this.</span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button 
                        className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                        onClick={() => {
                            (document.getElementById("block") as HTMLDialogElement)?.close();
                        }}
                    >
                        Close
                    </button>

                    {/* Display loading class while awaiting API */}
                    <button
                        className={`btn flex-1 bg-accent text-white border-accent`}
                        onClick={() => {
                            (document.getElementById("block") as HTMLDialogElement)?.close();
                            toast.show(`You blocked ${displayName}`, { icon: "", type: "error" });
                        }}
                    >
                        Block {displayName}
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        
    );
}