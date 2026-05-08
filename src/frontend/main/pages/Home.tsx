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
                <div className="hero-content text-center px-16">
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
                            <button className="btn btn-primary">Get Started</button>
                            <button className="btn btn-outline btn-primary">Browse Characters</button>
                        </div>
                    </div>
                </div>
            </div>

            <div className=" px-16">
                <div className="text-lg pb-5">Popular Characters</div>
                
                <div className="flex gap-4 overflow-x-auto">
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                    <div className="skeleton shrink-0 h-[400px] w-[221px]"></div>
                </div>
            </div>
        </>
    );
}