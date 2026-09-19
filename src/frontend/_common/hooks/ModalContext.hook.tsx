import { createContext, useContext, useRef, ReactNode, useMemo } from "react";

import NotificationsModal, { NotificationsModalRef } from "../components/modals/NotificationsModal.js";
import MuteModal, { MuteModalRef } from "../components/modals/MuteModal.js";
import RestrictModal, { RestrictModalRef } from "../components/modals/RestrictModal.js";
import BlockModal, { BlockModalRef } from "../components/modals/BlockModal.js";
import ReportModal, { ReportModalRef } from "../components/modals/ReportModal.js";
import TrashModal, { TrashModalRef } from "../components/modals/TrashModal.js";
import ShareModal, { ShareModalRef } from "../components/modals/ShareModal.js";
import CharacterModal, { CharacterModalRef } from "../components/modals/CharacterModal.js";
import EditUserProfileModal, { EditUserProfileModalRef } from "../components/modals/EditUserProfileModal.js";
import { GetUserItemType } from "../../../_common/types/user.type.js";
import DeleteModal, { DeleteModalRef } from "../components/modals/DeleteModal.js";
import DatasetEditorModal, { DataEditorModalRef } from "../components/modals/DataEditorModal.js";

interface ModalContextType {
    notificationsModal: {
        open: (...args: Parameters<NotificationsModalRef["open"]>) => ReturnType<NotificationsModalRef["open"]>;
        close: () => void;
    };
    muteModal: {
        open: (...args: Parameters<MuteModalRef["open"]>) => ReturnType<MuteModalRef["open"]>;
        close: () => void;
    };
    restrictModal: {
        open: (...args: Parameters<RestrictModalRef["open"]>) => ReturnType<RestrictModalRef["open"]>;
        close: () => void;
    };
    blockModal: {
        open: (...args: Parameters<BlockModalRef["open"]>) => ReturnType<BlockModalRef["open"]>;
        close: () => void;
    };
    reportModal: {
        open: (...args: Parameters<ReportModalRef["open"]>) => ReturnType<ReportModalRef["open"]>;
        close: () => void;
    };
    trashModal: {
        open: (...args: Parameters<TrashModalRef["open"]>) => ReturnType<TrashModalRef["open"]>;
        close: () => void;
    };
    deleteModal: {
        open: (...args: Parameters<DeleteModalRef["open"]>) => ReturnType<DeleteModalRef["open"]>;
        close: () => void;
    };
    shareModal: {
        open: (...args: Parameters<ShareModalRef["open"]>) => ReturnType<ShareModalRef["open"]>;
        close: () => void;
    };
    characterModal: {
        open: (...args: Parameters<CharacterModalRef["open"]>) => ReturnType<CharacterModalRef["open"]>;
        close: () => void;
    };
    editUserProfileModal: {
        open: (data: GetUserItemType, onSave?: (updatedData: GetUserItemType) => void) => Promise<GetUserItemType | null | undefined>;
        close: () => void;
    };
    dataEditorModal: {
        open: (...args: Parameters<DataEditorModalRef["open"]>) => ReturnType<DataEditorModalRef["open"]>;
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
    const trashModalRef = useRef<TrashModalRef>(null);
    const deleteModalRef = useRef<DeleteModalRef>(null);
    const shareModalRef = useRef<ShareModalRef>(null);
    const characterModalRef = useRef<CharacterModalRef>(null);
    const editUserProfileModalRef = useRef<EditUserProfileModalRef>(null);
    const dataEditorModalRef = useRef<DataEditorModalRef>(null);

    const value = useMemo(
        () => ({
            notificationsModal: {
                open: (...args: Parameters<NotificationsModalRef["open"]>) => {
                    return notificationsModalRef.current?.open(...args);
                },
                close: () => {
                    notificationsModalRef.current?.close();
                },
            },
            muteModal: {
                open: (...args: Parameters<MuteModalRef["open"]>) => {
                    return muteModalRef.current?.open(...args);
                },
                close: () => {
                    muteModalRef.current?.close();
                },
            },
            restrictModal: {
                open: (...args: Parameters<RestrictModalRef["open"]>) => {
                    return restrictModalRef.current?.open(...args);
                },
                close: () => {
                    restrictModalRef.current?.close();
                },
            },
            blockModal: {
                open: (...args: Parameters<BlockModalRef["open"]>) => {
                    return blockModalRef.current?.open(...args);
                },
                close: () => {
                    blockModalRef.current?.close();
                },
            },
            reportModal: {
                open: (...args: Parameters<ReportModalRef["open"]>) => {
                    return reportModalRef.current?.open(...args);
                },
                close: () => {
                    reportModalRef.current?.close();
                },
            },
            trashModal: {
                open: (...args: Parameters<TrashModalRef["open"]>) => {
                    return trashModalRef.current?.open(...args);
                },
                close: () => {
                    trashModalRef.current?.close();
                },
            },
            deleteModal: {
                open: (...args: Parameters<DeleteModalRef["open"]>) => {
                    return deleteModalRef.current?.open(...args);
                },
                close: () => {
                    deleteModalRef.current?.close();
                },
            },
            shareModal: {
                open: (...args: Parameters<ShareModalRef["open"]>) => {
                    return shareModalRef.current?.open(...args);
                },
                close: () => {
                    shareModalRef.current?.close();
                },
            },
            characterModal: {
                open: (...args: Parameters<CharacterModalRef["open"]>) => {
                    return characterModalRef.current?.open(...args);
                },
                close: () => {
                    characterModalRef.current?.close();
                },
            },
            editUserProfileModal: {
                open: async (data: GetUserItemType, onSave?: (updatedData: GetUserItemType) => void) => {
                    return editUserProfileModalRef.current?.open(data, onSave);
                },
                close: () => {
                    editUserProfileModalRef.current?.close();
                },
            },
            dataEditorModal: {
                open: (...args: Parameters<DataEditorModalRef["open"]>) => {
                    return dataEditorModalRef.current?.open(...args);
                },
                close: () => {
                    dataEditorModalRef.current?.close();
                },
            }
        }),
        []
    );

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <ModalContext.Provider value={value}>
            <NotificationsModal ref={notificationsModalRef} />
            <MuteModal ref={muteModalRef} />
            <RestrictModal ref={restrictModalRef} />
            <BlockModal ref={blockModalRef} />
            <ReportModal ref={reportModalRef} />
            <TrashModal ref={trashModalRef} />
            <DeleteModal ref={deleteModalRef} />
            <ShareModal ref={shareModalRef} />
            <CharacterModal ref={characterModalRef} />
            <EditUserProfileModal ref={editUserProfileModalRef} />
            <DatasetEditorModal ref={dataEditorModalRef} />

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
