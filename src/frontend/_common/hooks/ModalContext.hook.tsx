/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    createContext,
    createElement,
    useContext,
    useMemo,
    useRef,
    type ReactNode,
} from "react";

import NotificationsModal from "../components/modals/NotificationsModal.js";
import MuteModal from "../components/modals/MuteModal.js";
import RestrictModal from "../components/modals/RestrictModal.js";
import BlockModal from "../components/modals/BlockModal.js";
import ReportModal from "../components/modals/ReportModal.js";
import BugReportModal from "../components/modals/BugReportModal.js";
import TrashModal from "../components/modals/TrashModal.js";
import ShareModal from "../components/modals/ShareModal.js";
import CharacterModal from "../components/modals/CharacterModal.js";
import EditUserProfileModal from "../components/modals/EditUserProfileModal.js";
import DeleteModal from "../components/modals/DeleteModal.js";
import DatasetEditorModal from "../components/modals/DataEditorModal.js";
import SaveFailedModal from "../../studio/components/modals/SaveFailedModal.js";
import NewFieldModal from "../../studio/components/modals/NewFieldModal.js";
import NewBlockModal from "../../studio/components/modals/NewBlockModal.js";
import UploadMediaModal from "../../studio/components/modals/UploadMediaModal.js";
import EditFieldModal from "../../studio/components/modals/EditFieldModal.js";
import EditCategoryModal from "../../studio/components/modals/EditCategoryModal.js";
import EditBlockModal from "../../studio/components/modals/EditBlockModal.js";
import PublishModal from "../../studio/components/modals/PublishModal.js";
import UnpublishModal from "../../studio/components/modals/UnpublishModal.js";
import EditTemplateModal from "../components/modals/EditTemplateModal.js";
import EditCharacterModal from "../components/modals/EditCharacterModal.js";
import FeedbackModal from "../components/modals/FeedbackModal.js";
import SubscribeModal from "../components/modals/SubscribeModal.js";
import UnsubscribeModal from "../components/modals/UnsubscribeModal.js";
import WithdrawModal from "../components/modals/WithdrawModal.js";

const modals = {
    notificationsModal: NotificationsModal,
    muteModal: MuteModal,
    restrictModal: RestrictModal,
    blockModal: BlockModal,
    reportModal: ReportModal,
    bugReportModal: BugReportModal,
    trashModal: TrashModal,
    shareModal: ShareModal,
    characterModal: CharacterModal,
    editUserProfileModal: EditUserProfileModal,
    deleteModal: DeleteModal,
    dataEditorModal: DatasetEditorModal,
    saveFailedModal: SaveFailedModal,
    newFieldModal: NewFieldModal,
    newBlockModal: NewBlockModal,
    uploadMediaModal: UploadMediaModal,
    editFieldModal: EditFieldModal,
    editCategoryModal: EditCategoryModal,
    editBlockModal: EditBlockModal,
    publishModal: PublishModal,
    unpublishModal: UnpublishModal,
    editTemplateModal: EditTemplateModal,
    editCharacterModal: EditCharacterModal,
    feedbackModal: FeedbackModal,
    subscribeModal: SubscribeModal,
    unsubscribeModal: UnsubscribeModal,
    withdrawModal: WithdrawModal,
} as const;

type ModalKey = keyof typeof modals;

type ModalHandle = {
    open: (...args: any[]) => unknown;
    close: () => void;
};

type ModalControls = Record<ModalKey, ModalHandle>;

const ModalContext = createContext<ModalControls | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
    const refs = useRef<Partial<Record<ModalKey, ModalHandle>>>({});

    const value = useMemo<ModalControls>(() => {
        const controls = {} as ModalControls;

        for (const key of Object.keys(modals) as ModalKey[]) {
            controls[key] = {
                open: (...args: any[]) => refs.current[key]?.open(...args),
                close: () => refs.current[key]?.close(),
            };
        }

        return controls;
    }, []);

    return (
        <ModalContext.Provider value={value}>
            {/* eslint-disable-next-line react-hooks/refs */}
            {Object.entries(modals).map(([key, Component]) =>
                createElement(Component as any, {
                    key,
                    ref: (instance: ModalHandle | null) => {
                        if (instance) {
                            refs.current[key as ModalKey] = instance;
                        } else {
                            delete refs.current[key as ModalKey];
                        }
                    },
                })
            )}

            {children}
        </ModalContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useModals(): ModalControls {
    const context = useContext(ModalContext);

    if (!context) {
        throw new Error("useModals must be used within a ModalProvider");
    }

    return context;
}
