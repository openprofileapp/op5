export type CaptchaResult = { token: string };

let externalOpen: (() => Promise<CaptchaResult>) | null = null;

export function registerCaptchaHandler(handler: () => Promise<CaptchaResult>) {
    externalOpen = handler;
}

export function unregisterCaptchaHandler() {
    externalOpen = null;
}

export function showCaptcha(): Promise<CaptchaResult> {
    if (!externalOpen) throw new Error("CaptchaPortal not mounted");
    return externalOpen();
}
