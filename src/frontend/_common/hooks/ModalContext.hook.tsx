import { createContext, useContext, useRef, ReactNode, useMemo } from "react";

import MuteModal, { MuteModalRef } from "../../main/components/modals/MuteModal.js";
import RestrictModal, { RestrictModalRef } from "../../main/components/modals/RestrictModal.js";
import BlockModal, { BlockModalRef } from "../../main/components/modals/BlockModal.js";
import ReportModal, { ReportModalRef } from "../../main/components/modals/ReportModal.js";
import ShareModal, { ShareModalRef } from "../../main/components/modals/ShareModal.js";
import CharacterModal, { CharacterModalRef } from "../../main/components/modals/CharacterModal.js";

interface ModalContextType {
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
    const characterModalRef = useRef<CharacterModalRef>(null);
    const blockModalRef = useRef<BlockModalRef>(null);
    const restrictModalRef = useRef<RestrictModalRef>(null);
    const muteModalRef = useRef<MuteModalRef>(null);
    const reportModalRef = useRef<ReportModalRef>(null);
    const shareModalRef = useRef<ShareModalRef>(null);

    const value = useMemo(
        () => ({
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
