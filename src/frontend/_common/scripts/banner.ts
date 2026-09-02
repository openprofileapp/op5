type BannerNameType = 
    | "info"
    | "success"
    | "error"
    | "warning"
;

export interface BannerButton {
    label: string;
    onClick: () => void;
}

export interface BannerCloseAction {
    onClick: () => void;
}

export type BannerType = {
    id: number;
    message: string;
    subtext?: string;
    type: BannerNameType;
    button?: BannerButton;
    closeAction?: BannerCloseAction;
    dismissible?: boolean;
}

type BannerListener = (banners: BannerType[]) => void;

let listeners: BannerListener[] = [];
let banners: BannerType[] = [];

export const banner = {
    /**
     * Show a top banner notification.
     */
    show: (
        message: string,
        {
            subtext = "",
            type = "info",
            button,
            closeAction,
            dismissible = true,
        }: {
            subtext?: string;
            type?: BannerNameType;
            button?: BannerButton;
            closeAction?: BannerCloseAction;
            dismissible?: boolean;
        } = {}
    ): number => {
        const id = Date.now();
        const b: BannerType = { id, message, subtext, type, button, closeAction, dismissible };

        banners = [...banners, b];
        listeners.forEach((l) => l(banners));

        return id;
    },

    /**
     * Dismiss a specific banner by ID.
     */
    hide: (id: number) => {
        banners = banners.filter((b) => b.id !== id);
        listeners.forEach((l) => l(banners));
    },

    /**
     * Dismiss all banners.
     */
    clear: () => {
        banners = [];
        listeners.forEach((l) => l(banners));
    },

    /**
     * Subscribe to banner updates.
     */
    subscribe: (fn: BannerListener): (() => void) => {
        listeners.push(fn);
        fn(banners);

        return () => {
            listeners = listeners.filter((l) => l !== fn);
        };
    },
};
