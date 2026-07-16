import { createPortal } from "react-dom";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useEffect, useState, useRef } from "react";

type CaptchaResult = { token: string };

let externalOpen: (() => Promise<CaptchaResult>) | null = null;

// eslint-disable-next-line react-refresh/only-export-components
export function showCaptcha(): Promise<CaptchaResult> {
    if (!externalOpen) throw new Error("CaptchaPortal not mounted");
    return externalOpen();
}

export default function CaptchaPortal({
    siteKey,
}: {
    siteKey: string;
}) {
    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);

    const resolver = useRef<((v: CaptchaResult) => void) | null>(null);
    const rejecter = useRef<(() => void) | null>(null);
    const finished = useRef(false);

    useEffect(() => {
        externalOpen = () => {
            setOpen(true);
            finished.current = false;

            return new Promise<CaptchaResult>((resolve, reject) => {
                resolver.current = resolve;
                rejecter.current = reject;
            });
        };

        return () => {
            externalOpen = null;
        };
    }, []);

    const close = () => {
        if (finished.current) return;

        finished.current = true;

        setClosing(true);

        setTimeout(() => {
            setClosing(false);
            setOpen(false);

            rejecter.current?.();
            resolver.current = null;
            rejecter.current = null;
        }, 180);
    };

    const resolve = (token: string) => {
        if (finished.current) return;

        finished.current = true;

        resolver.current?.({ token });
        resolver.current = null;
        rejecter.current = null;

        setOpen(false);
    };

    if (!open) return null;

    return createPortal(
        <div className="modal modal-open">
            <div className="modal-backdrop bg-black/09" onClick={close} />

            <div
                className={`modal-box w-fit p-8 relative origin-center transition-all duration-200 ease-out ${
                    closing
                        ? "opacity-0 scale-95 translate-y-2"
                        : "opacity-100 scale-100 translate-y-0"
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer"
                    onClick={close}
                >
                    
                </button>

                <h3 className="font-nerdfont text-6xl text-center mb-4">󰚩</h3>
                <h3 className="font-bold text-2xl text-center pb-8">
                    Are you a robot?
                </h3>

                <div className="flex justify-center">
                    {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                    {/* @ts-ignore */}
                    <HCaptcha
                        sitekey={siteKey}
                        theme="dark"
                        onVerify={resolve}
                        onExpire={close}
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}