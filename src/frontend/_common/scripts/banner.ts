export type BannerType = "info" | "success" | "error" | "warning";

export interface BannerButton {
    label: string;
    onClick: () => void;
}

export interface BannerCloseAction {
    onClick: () => void;
}

export interface Banner {
    id: number;
    message: string;
    subtext?: string;
    type: BannerType;
    button?: BannerButton;
    closeAction?: BannerCloseAction;
    dismissible?: boolean;
}

type BannerListener = (banners: Banner[]) => void;

let listeners: BannerListener[] = [];
let banners: Banner[] = [];

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
            type?: BannerType;
            button?: BannerButton;
            closeAction?: BannerCloseAction;
            dismissible?: boolean;
        } = {}
    ): number => {
        const id = Date.now();
        const b: Banner = { id, message, subtext, type, button, closeAction, dismissible };

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
