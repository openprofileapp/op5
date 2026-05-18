import { useTranslation } from "react-i18next";

export default function LoginModal() {
    const { ready } = useTranslation();

    if (!ready) return null;

    return (
        <dialog id="login" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">Register an Account</h3>
                <p className="pb-5 py-4 text-sm text-center">Become a next generation author with OpenProfile!</p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>
                        <div>
                            Create, share, and build your universe with a secure cross-platform cloud storage.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            
                        </div>
                        <div>
                            Follow updates, interact with authors, and build a library of your favorite characters.
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <div className="w-4 flex items-center justify-center text-xl font-nerdfont shrink-0">
                            󰉋
                        </div>
                        <div>
                            Bring your team and collaborate on shaping original characters for personal and commercial projects.
                        </div>
                    </div>
                </div>

                {/* Replace these with textless buttons */}
                <div className="pt-4 flex gap-4 flex-col relative">
                    <button className="btn bg-white text-black border-[#e5e5e5]">
                        <div className="absolute left-4 text-2xl font-nerdfont"></div>
                        Login with Google
                    </button>

                    <button className="btn bg-[#5865F2] text-white border-[#5865F2]">
                        <div className="absolute left-4 text-2xl font-nerdfont"></div>
                        Login with Discord
                    </button>
                    
                    <button className="btn bg-[#6e5494] text-white border-[#6e5494]">
                        <div className="absolute left-4 text-2xl font-nerdfont">󰊤</div>
                        Login with GitHub
                    </button>
                </div>     
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
}