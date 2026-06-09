import { useEffect, useState } from "react";
import { toast, Toast } from "../scripts/toast.js";
import { AnimatePresence, motion } from "framer-motion";

type ToastUI = Toast & {
    visible: boolean;
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastUI[]>([]);

    useEffect(() => {
        const unsubscribe = toast.subscribe((t) => {
            const id = t.id;

            setToasts((prev) => [...prev, { ...t, visible: true }]);

            setTimeout(() => {
                setToasts((prev) =>
                    prev.map((x) =>
                        x.id === id ? { ...x, visible: false } : x
                    )
                );
            }, t.duration);

            setTimeout(() => {
                setToasts((prev) => prev.filter((x) => x.id !== id));
            }, t.duration + 300);
        });

        return unsubscribe;
    }, []);

    return (
        <div className="toast toast-top toast-center space-y-2 z-99999">
            <AnimatePresence>
                {toasts.map((t) => (
                    <motion.div
                        key={t.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className={`
                            alert
                            ${t.type === "info"
                                ? "bg-base-200 border-base-300"
                                : `bg-${t.type} border-${t.type}`}
                            origin-center
                        `}
                    >
                        {t.icon && (<span className="flex items-center justify-center w-4 text-lg font-nerdfont leading-none shrink-0">{t.icon}</span>)}
                        <span>{t.message}</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}