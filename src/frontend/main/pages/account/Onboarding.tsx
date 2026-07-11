import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import isGateway from "../../../_common/helpers/isGateway.js";

import Metadata from "../../../_common/components/Metadata.js";

export default function Onboarding() {
    const { t, ready } = useTranslation();

    const modalRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (ready && modalRef.current) {
            modalRef.current.showModal();
            (document.activeElement as HTMLElement | null)?.blur();
        }
    }, [ready]);

    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [hasReadTerms, setHasReadTerms] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    useEffect(() => {
        fetch(`https://${isGateway() ? window.location.host : window.config.domains.cdn}${isGateway() ? "/cdn" : ""}/terms-of-service.txt`)
            .then((res) => res.text())
            .then((data) => {
                setText(data);
                setLoading(false);
            })
            .catch(() => {
                setText("Failed to load Terms of Service.");
                setLoading(false);
            });
    }, []);

    const termsRef = useRef<HTMLDivElement>(null);

    const handleTermsScroll = () => {
        const el = termsRef.current;
        if (!el || hasReadTerms) return;

        const isAtBottom =
            el.scrollTop + el.clientHeight >= el.scrollHeight - 5;

        if (isAtBottom) {
            setHasReadTerms(true);
        }
    };

    if (!ready) return null;
    
    return (
        <>
            <Metadata
                title="Onboarding"
                allowIndex="false"
            />
            
            <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
                <dialog className="modal" ref={modalRef}>
                    <div className="modal-box">
                        <h3 className="font-bold text-2xl text-center">Thanks for registering!</h3>
                        <p className="pb-5 py-4 text-sm text-center">To continue, please accept our Terms & Conditions.</p>
                        
                        <div 
                            ref={termsRef}
                            onScroll={handleTermsScroll}
                            className="scrollbar text-xs h-70 overflow-y-auto p-4 mb-4 bg-base-100 border border-base-300 rounded whitespace-pre-wrap leading-relaxed"
                        >
                            {loading ? (
                                <div className="flex flex-col gap-4">
                                    <div className="skeleton h-4 w-32"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-0"></div>
                                    <div className="skeleton h-4 w-64"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                </div>
                            ) : (
                                text
                            )}
                        </div>

                        <fieldset className="flex h-8 items-center fieldset">
                            {hasReadTerms && (
                                <label>
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    />
                                </label>
                            )}

                            <p className={hasReadTerms ? "ml-2" : ""}>
                                {!hasReadTerms
                                    ? "Please scroll to the bottom to accept"
                                    : "I have read and accept the Terms & Conditions"}
                            </p>
                        </fieldset>

                        <div className="pt-4 flex gap-2 flex-row relative">
                            <button 
                                className="btn flex-1 bg-base-300 text-white border-[var(--color-base-300)]" 
                                onClick={() => {
                                    // deleteAccount();
                                }}
                            >
                                Delete Account
                            </button>

                            <button
                                className={`btn ${acceptedTerms ? "" : "btn-disabled"} flex-1 bg-accent text-white border-accent`}
                                disabled={!acceptedTerms}
                                onClick={() => {
                                    // MAKE THE CHECK BOX NOT CLICKABLE UNLESS SCROLL TO BOTTOM
                                    // ON READ, ALLOW CONTINUE
                                    // continue();
                                }}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </dialog>
            </div>
        </>
    );
}