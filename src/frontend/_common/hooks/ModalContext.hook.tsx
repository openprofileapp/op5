import { createContext, useContext, useRef, ReactNode, useMemo } from "react";

import NotificationsModal, { NotificationsModalRef } from "../components/modals/NotificationsModal.js";
import MuteModal, { MuteModalRef } from "../components/modals/MuteModal.js";
import RestrictModal, { RestrictModalRef } from "../components/modals/RestrictModal.js";
import BlockModal, { BlockModalRef } from "../components/modals/BlockModal.js";
import ReportModal, { ReportModalRef } from "../components/modals/ReportModal.js";
import ShareModal, { ShareModalRef } from "../components/modals/ShareModal.js";
import CharacterModal, { CharacterModalRef } from "../components/modals/CharacterModal.js";

interface ModalContextType {
    notificationsModal: {
        open: (data: Parameters<NotificationsModalRef["open"]>[0]) => void;
        close: () => void;
    };
    muteModal: {
        open: (data: Parameters<MuteModalRef["open"]>[0]) => void;
        close: () => void;
    };
    restrictModal: {
        open: (data: Parameters<RestrictModalRef["open"]>[0]) => void;
        close: () => void;
    };
    blockModal: {
        open: (data: Parameters<BlockModalRef["open"]>[0]) => void;
        close: () => void;
    };
    reportModal: {
        open: (data: Parameters<ReportModalRef["open"]>[0]) => void;
        close: () => void;
    };
    shareModal: {
        open: (data: Parameters<ShareModalRef["open"]>[0]) => void;
        close: () => void;
    };
    characterModal: {
        open: (data: Parameters<CharacterModalRef["open"]>[0]) => void;
        close: () => void;
    };
}

const ModalContext = createContext<ModalContextType | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
    const notificationsModalRef = useRef<NotificationsModalRef>(null);
    const muteModalRef = useRef<MuteModalRef>(null);
    const restrictModalRef = useRef<RestrictModalRef>(null);
    const blockModalRef = useRef<BlockModalRef>(null);
    const reportModalRef = useRef<ReportModalRef>(null);
    const shareModalRef = useRef<ShareModalRef>(null);
    const characterModalRef = useRef<CharacterModalRef>(null);

    const value = useMemo(
        () => ({
            notificationsModal: {
                open: (data: Parameters<NotificationsModalRef["open"]>[0]) => notificationsModalRef.current?.open(data),
                close: () => notificationsModalRef.current?.close(),
            },
            muteModal: {
                open: (data: Parameters<MuteModalRef["open"]>[0]) => muteModalRef.current?.open(data),
                close: () => muteModalRef.current?.close(),
            },
            restrictModal: {
                open: (data: Parameters<RestrictModalRef["open"]>[0]) => restrictModalRef.current?.open(data),
                close: () => restrictModalRef.current?.close(),
            },
            blockModal: {
                open: (data: Parameters<BlockModalRef["open"]>[0]) => blockModalRef.current?.open(data),
                close: () => blockModalRef.current?.close(),
            },
            reportModal: {
                open: (data: Parameters<ReportModalRef["open"]>[0]) => reportModalRef.current?.open(data),
                close: () => reportModalRef.current?.close(),
            },
            shareModal: {
                open: (data: Parameters<ShareModalRef["open"]>[0]) => shareModalRef.current?.open(data),
                close: () => shareModalRef.current?.close(),
            },
            characterModal: {
                open: (data: Parameters<CharacterModalRef["open"]>[0]) => characterModalRef.current?.open(data),
                close: () => characterModalRef.current?.close(),
            }
        }),
        []
    );

    return (
        <ModalContext.Provider value={value}>
            <NotificationsModal ref={notificationsModalRef} />
            <MuteModal ref={muteModalRef} />
            <RestrictModal ref={restrictModalRef} />
            <BlockModal ref={blockModalRef} />
            <ReportModal ref={reportModalRef} />
            <ShareModal ref={shareModalRef} />
            <CharacterModal ref={characterModalRef} />

            {children}
        </ModalContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModals() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }
    return context;
}
