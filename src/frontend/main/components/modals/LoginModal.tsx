import { useState } from "react";
import { useTranslation } from "react-i18next";

import { 
    loginWithApple,
    loginWithDiscord, 
    loginWithFacebook, 
    loginWithGitHub, 
    loginWithGoogle, 
    loginWithMicrosoft,
    loginWithReddit,
    loginWithX
} from "../../scripts/oauth2.js";

export default function LoginModal() {
    const { t, ready } = useTranslation();

    if (!ready) return null;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [loading, setLoading] = useState<string | null>(null);

    return (
        <dialog id="login" className="modal">
            <div className="modal-box">
                <form method="dialog">
                    <button className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"></button>
                </form>
                <h3 className="font-bold text-2xl text-center">Login / Register</h3>
                <p className="pb-5 py-4 text-sub text-sm text-center">Become a next generation author with OpenProfile!</p>
                
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

                <p className="pt-2 text-sub text-sm">Select a third-party account provider to register with:</p>

                <div className="pt-2 flex gap-2 flex-row relative">
                    {/* Google */}
                    <button 
                        className="btn h-12 w-12 flex-1 bg-white font-normal text-black border-white tooltip tooltip-top" 
                        data-tip="Google"
                        onClick={() => {
                            setLoading("google");
                            loginWithGoogle();
                        }}
                    >
                        <div className={`${loading === "google" ? "loading" : ""}`}>
                            <svg className={`${loading === "google" ? "hidden" : ""}`} height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        </div>
                    </button>

                    {/* Microsoft */}
                    <button 
                        className="btn btn-disabled hidden h-12 w-12 flex-1 bg-white font-normal text-black border-white tooltip tooltip-top" 
                        data-tip="Microsoft"
                        onClick={() => {
                            setLoading("microsoft");
                            loginWithMicrosoft();
                        }}
                    >
                        <div className={`${loading === "microsoft" ? "loading" : ""}`}>
                            <svg height="30" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M96 96H247V247H96" fill="#f24f23"></path><path d="M265 96V247H416V96" fill="#7eba03"></path><path d="M96 265H247V416H96" fill="#3ca4ef"></path><path d="M265 265H416V416H265" fill="#f9ba00"></path></svg>
                        </div>
                    </button>

                    {/* Apple */}
                    <button 
                        className="btn btn-disabled hidden h-12 w-12 flex-1 bg-white font-normal text-black border-white tooltip tooltip-top" 
                        data-tip="Apple"
                        onClick={() => {
                            setLoading("apple");
                            loginWithApple();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "apple" ? "loading" : ""}`}>
                            
                        </div>
                    </button>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    {/* X */}
                    <button 
                        className="btn h-12 w-12 flex-1 bg-black font-normal text-white border-[var(--color-base-300)] tooltip tooltip-top" 
                        data-tip="X"
                        onClick={() => {
                            setLoading("x");
                            loginWithX();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "x" ? "loading" : ""}`}>
                            
                        </div>
                    </button>

                    {/* Facebook */}
                    <button
                        className="btn btn-disabled hidden h-12 w-12 flex-1 font-normal bg-[#1A77F2] text-white border-[#1A77F2] tooltip tooltip-top"
                        data-tip="Facebook"
                        onClick={() => {
                            setLoading("facebook");
                            loginWithFacebook();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "facebook" ? "loading" : ""}`}>
                            
                        </div>
                    </button>

                    {/* Reddit */}
                    <button
                        className="btn btn-disabled hidden h-12 w-12 flex-1 font-normal bg-[#FF4500] text-white border-[#FF4500] tooltip tooltip-top"
                        data-tip="Reddit"
                        onClick={() => {
                            setLoading("reddit");
                            loginWithReddit();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "reddit" ? "loading" : ""}`}>
                            
                        </div>
                    </button>

                    {/* Discord */}
                    <button
                        className="btn h-12 w-12 flex-1 font-normal bg-[#5865F2] text-white border-[#5865F2] tooltip tooltip-top"
                        data-tip="Discord"
                        onClick={() => {
                            setLoading("discord");
                            loginWithDiscord();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "discord" ? "loading" : ""}`}>
                            
                        </div>
                    </button>
                    
                    {/* Bluesky */}
                    <button 
                        className="btn btn-disabled hidden h-12 w-12 flex-1 font-normal bg-[#1185FE] text-white border-[#1185FE] tooltip tooltip-top" 
                        data-tip="BlueSky"
                        onClick={() => {
                            setLoading("bluesky");
                        }}
                    >
                        <div className={`${loading === "bluesky" ? "loading" : ""}`}>
                            <svg height="24" fill="#ffffff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.202 2.857C7.954 4.922 10.913 9.11 12 11.358c1.087-2.247 4.046-6.436 6.798-8.501C20.783 1.366 24 .213 24 3.883c0 .732-.42 6.156-.667 7.037-.856 3.061-3.978 3.842-6.755 3.37 4.854.826 6.089 3.562 3.422 6.299-5.065 5.196-7.28-1.304-7.847-2.97-.104-.305-.152-.448-.153-.327 0-.121-.05.022-.153.327-.568 1.666-2.782 8.166-7.847 2.97-2.667-2.737-1.432-5.473 3.422-6.3-2.777.473-5.899-.308-6.755-3.369C.42 10.04 0 4.615 0 3.883c0-3.67 3.217-2.517 5.202-1.026"/></svg>
                        </div>
                    </button>

                    {/* GitHub */}
                    <button 
                        className="btn h-12 w-12 flex-1 font-normal bg-[#6e5494] text-white border-[#6e5494] tooltip tooltip-top" 
                        data-tip="GitHub"
                        onClick={() => {
                            setLoading("github");
                            loginWithGitHub();
                        }}
                    >
                        <div className={`text-2xl font-nerdfont ${loading === "github" ? "loading" : ""}`}>
                            󰊤
                        </div>
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
        
    );
}

// On each button press, send a call to "https://auth.openprofile.app/login/SERVICE" which is seperare from "https://auth.openprofile.app/connect/SERVICE"; login DOES call connect function at the end
// The call will send them to an external page to complete auth
// On call back, display a connecting page animation with a ping like (oct.ink)
// On completion, redirect to the home page or what were they were going to visit using "?redirect=URI"