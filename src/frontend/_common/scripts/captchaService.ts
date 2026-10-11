export type CaptchaResult = { token: string };

let externalOpen: (() => Promise<CaptchaResult>) | null = null;

export function registerCaptchaHandler(handler: () => Promise<CaptchaResult>) {
    externalOpen = handler;
}

export function unregisterCaptchaHandler() {
    externalOpen = null;
}

export function showCaptcha(): Promise<CaptchaResult> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!window.config.isProduction) return { token: true };

    if (!externalOpen) throw new Error("CaptchaPortal not mounted");
    return externalOpen();
}
