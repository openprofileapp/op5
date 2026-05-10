import { useTranslation } from "react-i18next";
import { Metadata } from "../../_common/components/Metadata.js";
import Navbar from "../components/Navbar.js";

export default function Home() {
    const { t, ready } = useTranslation();

    if (!ready) return null;
    
    return (
        <>  
            <Metadata />
            
            <Navbar dest="/about" />

            <div className="hero bg-base-200 h-150">
                <div className="hero-content text-center px-4 md:px-16">
                    <div>
                        <h1 className="text-4xl font-bold">
                            Your 
                            <span className="ml-3 text-rotate duration-6000">
                                <span>
                                    <span>Characters</span>
                                    <span>Universes</span>
                                    <span>Worlds</span>
                                </span>
                            </span>
                            . All in one place.
                        </h1>
                        <p className="py-6">
                            OpenProfile is a free collaborative platform to create and share original characters using an advanced template and a public database.
                        </p>
                        <p className="pb-6 text-xs italic">
                            The most advanced character profile in the world — created by writers for writers!
                        </p>
                        <div className="flex justify-center gap-3">
                            <button className="btn btn-primary p-6" onClick={()=>document.getElementById("account-login").showModal()}>Get Started</button>
                            <button className="btn btn-outline btn-primary p-6">Browse Characters</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-16">
                <div className="text-lg pb-5">Popular Characters</div>
                
                <div className="flex gap-4 overflow-x-auto">
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px] relative">
                        <img className="absolute top-1/2 left-1/2 w-25 object-cover opacity-8 -translate-x-1/2 -translate-y-1/2"
                            src={`https://${window.config.domains.cdn}${window.config.metadata.assets.logo}`}
                        />
                    </div>
                </div>
            </div>

            {/* Move this out of this file as component */}
            <dialog id="account-login" className="modal">
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

                    <div className="pt-4 flex gap-4 flex-col relative">
                        <button className="btn bg-white font-normal text-base text-black border-[#e5e5e5]">
                            <div className="absolute left-4 text-2xl font-nerdfont"></div>
                            Login with Google
                        </button>

                        <button className="btn bg-[#5865F2] font-normal text-base text-white border-[#5865F2]">
                            <div className="absolute left-4 text-2xl font-nerdfont"></div>
                            Login with Discord
                        </button>
                        
                        <button className="btn bg-[#6e5494] font-normal text-base text-white border-[#6e5494]">
                            <div className="absolute left-4 text-2xl font-nerdfont">󰊤</div>
                            Login with GitHub
                        </button>
                    </div>     
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}