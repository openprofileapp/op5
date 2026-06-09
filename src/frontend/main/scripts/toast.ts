export type ToastType = "info" | "success" | "error" | "warning";

export interface Toast {
    id: number;
    message: string;
    icon: string;
    type: ToastType;
    duration: number;
}

type Listener = (toast: Toast) => void;

let listeners: Listener[] = [];

/**
 * Imperative toast API.
 *
 * Allows triggering UI toasts from anywhere in the app:
 *
 * @example
 * ```ts
 * import { toast } from "./toast";
 *
 * toast.show("Saved successfully", { type: "success", icon: "" });
 * toast.show("Something went wrong", { type: "error", duration: 5000 });
 * ```
 */
export const toast = {
    /**
     * Show a toast notification.
     *
     * @param message - Text to display
     * @param icon - NerdFont icon to display
     * @param type - Visual style ("info" | "success" | "error" | "warning")
     * @param duration - Auto dismiss time in ms (default: 3000)
     * @returns id of the created toast
     */
    show: (
        message: string,
        {
            icon = "",
            type = "info",
            duration = 3000,
        }: {
            icon?: string;
            type?: ToastType;
            duration?: number;
        } = {}
    ): number => {
        const id = Date.now();

        const t: Toast = { id, message, icon, type, duration };

        listeners.forEach((l) => l(t));

        return id;
    },

    /**
     * Subscribe to toast events.
     *
     * @param fn - Callback fired whenever a toast is shown
     * @returns unsubscribe function
     *
     * @example
     * ```ts
     * const unsubscribe = toast.subscribe((t) => {
     *   console.log(t.message);
     * });
     *
     * unsubscribe();
     * ```
     */
    subscribe: (fn: Listener): (() => void) => {
        listeners.push(fn);

        return () => {
            listeners = listeners.filter((l) => l !== fn);
        };
    },
};