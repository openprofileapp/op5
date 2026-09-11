import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useBlocker } from "react-router-dom";

export function useUnsavedChangesWarning(shouldBlock: boolean) {
    const { t, ready: isTranslationReady } = useTranslation();
    
    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
        shouldBlock && currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (!isTranslationReady) return;

        if (blocker.state === "blocked") {
            const confirmLeave = window.confirm(
                t("responses.unsavedChanges")
            );

            if (confirmLeave) {
                blocker.proceed();
            } else {
                blocker.reset();
            }
        }
    }, [blocker, isTranslationReady, t]);

    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldBlock) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [shouldBlock]);
}
