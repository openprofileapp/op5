import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import HCaptcha from "@hcaptcha/react-hcaptcha";

import { 
    CaptchaResult,
    registerCaptchaHandler,
    unregisterCaptchaHandler
} from "../../scripts/captchaService.js";

export default function CaptchaPortal({ siteKey }: { siteKey: string }) {
    const { t, ready: isTranslationReady } = useTranslation();

    const [open, setOpen] = useState(false);
    const [closing, setClosing] = useState(false);

    const resolver = useRef<((v: CaptchaResult) => void) | null>(null);
    const rejecter = useRef<(() => void) | null>(null);
    const finished = useRef(false);

    useEffect(() => {
        registerCaptchaHandler(() => {
            setOpen(true);
            finished.current = false;

            return new Promise<CaptchaResult>((resolve, reject) => {
                resolver.current = resolve;
                rejecter.current = reject;
            });
        });

        return () => {
            unregisterCaptchaHandler();
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

    if (!isTranslationReady || !open) return null;

    return createPortal(
        <div className="modal modal-open z-9999">
            <div className="modal-backdrop" onClick={close} />

            <div
                className="modal-box w-fit"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="absolute right-0 top-0 m-5 text-2xl font-nerdfont cursor-pointer"
                    onClick={close}
                >
                    
                </button>

                <h3 className="font-nerdfont text-6xl text-center mb-4">
                    󰚩
                </h3>

                <h3 className="font-bold text-2xl text-center pb-8">
                    {t("components.modals.captchaHeader")}
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
