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
import DeleteModal, { DeleteModalRef } from "../components/modals/DeleteModal.js";
import DatasetEditorModal, { DataEditorModalRef } from "../components/modals/DataEditorModal.js";
import SaveFailedModal, { SaveFailedModalRef } from "../../studio/components/modals/SaveFailedModal.js";
import NewFieldModal, { NewFieldModalRef } from "../../studio/components/modals/NewFieldModal.js";
import NewBlockModal, { NewBlockModalRef } from "../../studio/components/modals/NewBlockModal.js";
import UploadMediaModal, { UploadMediaModalRef } from "../../studio/components/modals/UploadMediaModal.js";
import EditFieldModal, { EditFieldModalRef } from "../../studio/components/modals/EditFieldModal.js";

interface ModalContextType {
    notificationsModal: {
        open: (...args: Parameters<NotificationsModalRef["open"]>) => ReturnType<NotificationsModalRef["open"]> | undefined;
        close: () => void;
    };
    muteModal: {
        open: (...args: Parameters<MuteModalRef["open"]>) => ReturnType<MuteModalRef["open"]> | undefined;
        close: () => void;
    };
    restrictModal: {
        open: (...args: Parameters<RestrictModalRef["open"]>) => ReturnType<RestrictModalRef["open"]> | undefined;
        close: () => void;
    };
    blockModal: {
        open: (...args: Parameters<BlockModalRef["open"]>) => ReturnType<BlockModalRef["open"]> | undefined;
        close: () => void;
    };
    reportModal: {
        open: (...args: Parameters<ReportModalRef["open"]>) => ReturnType<ReportModalRef["open"]> | undefined;
        close: () => void;
    };
    trashModal: {
        open: (...args: Parameters<TrashModalRef["open"]>) => ReturnType<TrashModalRef["open"]> | undefined;
        close: () => void;
    };
    deleteModal: {
        open: (...args: Parameters<DeleteModalRef["open"]>) => ReturnType<DeleteModalRef["open"]> | undefined;
        close: () => void;
    };
    shareModal: {
        open: (...args: Parameters<ShareModalRef["open"]>) => ReturnType<ShareModalRef["open"]> | undefined;
        close: () => void;
    };
    characterModal: {
        open: (...args: Parameters<CharacterModalRef["open"]>) => ReturnType<CharacterModalRef["open"]> | undefined;
        close: () => void;
    };
    editUserProfileModal: {
        open: (...args: Parameters<EditUserProfileModalRef["open"]>) => ReturnType<EditUserProfileModalRef["open"]> | undefined;
        close: () => void;
    };
    dataEditorModal: {
        open: (...args: Parameters<DataEditorModalRef["open"]>) => ReturnType<DataEditorModalRef["open"]> | undefined;
        close: () => void;
    };
    saveFailedModal: {
        open: (...args: Parameters<SaveFailedModalRef["open"]>) => ReturnType<SaveFailedModalRef["open"]> | undefined;
        close: () => void;
    };
    newFieldModal: {
        open: (...args: Parameters<NewFieldModalRef["open"]>) => ReturnType<NewFieldModalRef["open"]> | undefined;
        close: () => void;
    };
    newBlockModal: {
        open: (...args: Parameters<NewBlockModalRef["open"]>) => ReturnType<NewBlockModalRef["open"]> | undefined;
        close: () => void;
    };
    uploadMediaModal: {
        open: (...args: Parameters<UploadMediaModalRef["open"]>) => ReturnType<UploadMediaModalRef["open"]> | undefined;
        close: () => void;
    };
    editFieldModal: {
        open: (...args: Parameters<EditFieldModalRef["open"]>) => ReturnType<EditFieldModalRef["open"]> | undefined;
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
    const saveFailedModalRef = useRef<SaveFailedModalRef>(null);
    const newFieldModalRef = useRef<NewFieldModalRef>(null);
    const newBlockModalRef = useRef<NewBlockModalRef>(null);
    const uploadMediaModalRef = useRef<UploadMediaModalRef>(null);
    const editFieldModalRef = useRef<EditFieldModalRef>(null);

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
                open: (...args: Parameters<EditUserProfileModalRef["open"]>) => {
                    return editUserProfileModalRef.current?.open(...args);
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
            },
            saveFailedModal: {
                open: (...args: Parameters<SaveFailedModalRef["open"]>) => {
                    return saveFailedModalRef.current?.open(...args);
                },
                close: () => {
                    saveFailedModalRef.current?.close();
                },
            },
            newFieldModal: {
                open: (...args: Parameters<NewFieldModalRef["open"]>) => {
                    return newFieldModalRef.current?.open(...args);
                },
                close: () => {
                    newFieldModalRef.current?.close();
                },
            },
            newBlockModal: {
                open: (...args: Parameters<NewBlockModalRef["open"]>) => {
                    return newBlockModalRef.current?.open(...args);
                },
                close: () => {
                    newBlockModalRef.current?.close();
                },
            },
            uploadMediaModal: {
                open: (...args: Parameters<UploadMediaModalRef["open"]>) => {
                    return uploadMediaModalRef.current?.open(...args);
                },
                close: () => {
                    uploadMediaModalRef.current?.close();
                },
            },
            editFieldModal: {
                open: (...args: Parameters<EditFieldModalRef["open"]>) => {
                    return editFieldModalRef.current?.open(...args);
                },
                close: () => {
                    editFieldModalRef.current?.close();
                },
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
            <TrashModal ref={trashModalRef} />
            <DeleteModal ref={deleteModalRef} />
            <ShareModal ref={shareModalRef} />
            <CharacterModal ref={characterModalRef} />
            <EditUserProfileModal ref={editUserProfileModalRef} />
            <DatasetEditorModal ref={dataEditorModalRef} />
            <SaveFailedModal ref={saveFailedModalRef} />
            <NewFieldModal ref={newFieldModalRef} />
            <NewBlockModal ref={newBlockModalRef} />
            <UploadMediaModal ref={uploadMediaModalRef} />
            <EditFieldModal ref={editFieldModalRef} />

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
