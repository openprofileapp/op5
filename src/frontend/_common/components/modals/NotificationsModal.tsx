import { useTranslation } from "react-i18next";
import { useState, useRef, useImperativeHandle, forwardRef, Dispatch, SetStateAction } from "react";

import { toast } from "../../scripts/toast.js";
import { GetUserItemType } from "../../../../_common/types/user.type.js";
import { GetPublishedCharacterItemType } from "../../../../_common/types/character.type.js";
import { apiBaseUrl } from "../../scripts/domains.js";

export type SubscriptionsType = {
    isSubscribedToContent: boolean;
    isSubscribedToCollaborationChanges: boolean;
    isSubscribedToNewInteractions: boolean;
    isSubscribedToNewComments: boolean;
    isSubscribedToNewMessages: boolean;
};

export interface NotificationsModalRef {
    open: (
        data: GetUserItemType | GetPublishedCharacterItemType,
        setNotificationSubscriptions: Dispatch<SetStateAction<SubscriptionsType>>
    ) => void;
    close: () => void;
}

const NotificationsModal = forwardRef<NotificationsModalRef>((_, ref) => {
    const { t, ready: isTranslationReady } = useTranslation();

    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const setNotificationSubscriptionsRef = useRef<Dispatch<SetStateAction<SubscriptionsType>> | undefined>(undefined);

    const [data, setData] = useState<GetUserItemType | GetPublishedCharacterItemType>();

    const isOwner = Boolean(
        window.session.userId && (
            window.session.userId === (data as unknown as GetPublishedCharacterItemType)?.owner?.id ||
            window.session.userId === data?.id
        )
    );

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [isContentSelected, setIsContentSelected] = useState<boolean>(false);
    const [isCollaborationSelected, setIsCollaborationSelected] = useState<boolean>(false);
    const [isInteractionsSelected, setIsInteractionsSelected] = useState<boolean>(false);
    const [isCommentsSelected, setIsCommentsSelected] = useState<boolean>(false);
    const [isMessagesSelected, setIsMessagesSelected] = useState<boolean>(false);

    const resetState = () => {
        setData(undefined);
        setNotificationSubscriptionsRef.current = undefined;

        setIsLoading(false);
        setIsContentSelected(false);
        setIsCollaborationSelected(false);
        setIsInteractionsSelected(false);
        setIsCommentsSelected(false);
        setIsMessagesSelected(false);
    };

    useImperativeHandle(ref, () => ({
        open: (data, setNotificationSubscriptions) => {
            setData(data);
            setNotificationSubscriptionsRef.current = setNotificationSubscriptions;

            setIsContentSelected(
                Boolean(data?.notifications?.subscriptions?.isSubscribedToContent)
            );

            setIsCollaborationSelected(
                Boolean(data?.notifications?.subscriptions?.isSubscribedToCollaborationChanges)
            );

            setIsInteractionsSelected(
                Boolean(data?.notifications?.subscriptions?.isSubscribedToNewInteractions)
            );

            setIsCommentsSelected(
                Boolean(data?.notifications?.subscriptions?.isSubscribedToNewComments)
            );

            setIsMessagesSelected(
                Boolean(data?.notifications?.subscriptions?.isSubscribedToNewMessages)
            );

            setTimeout(() => {
                dialogRef.current?.showModal();
            }, 0);
        },
        close: () => {
            dialogRef.current?.close();
            resetState();
        }
    }));

    const handleClose = () => {
        dialogRef.current?.close();
        resetState();
    };

    if (!isTranslationReady || !data) return null;

    return (
        <dialog
            ref={dialogRef}
            className="modal"
        >
            <div className="modal-box">
                <form method="dialog">
                    <button 
                        type="button" 
                        className="cursor-pointer absolute right-0 top-0 m-5 text-2xl font-nerdfont"
                        onClick={handleClose}
                    >
                        
                    </button>
                </form>
            
                <h3 className="font-bold text-2xl text-center">
                    {t("components.modals.notifications.title")}
                </h3>

                <p className="pb-5 py-4 text-sub text-sm text-center">
                    {t("components.modals.notifications.subtext")} {data.displayName}:
                </p>
                
                <div className="flex gap-5 pb-8 pt-4 flex-col">
                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={isContentSelected}
                                onChange={(e) => {
                                    setIsContentSelected(e.target.checked);
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.notifications.rowOneTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.notifications.rowOneSubtext")}
                            </span>
                        </div>
                    </div>

                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={isCollaborationSelected}
                                onChange={(e) => {
                                    setIsCollaborationSelected(e.target.checked);
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.notifications.rowTwoTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.notifications.rowTwoSubtext")}
                            </span>
                        </div>
                    </div>

                    {isOwner && (
                        <div className="flex gap-6 flex-row items-center">
                            <label className="shrink-0">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={isInteractionsSelected}
                                    onChange={(e) => {
                                        setIsInteractionsSelected(e.target.checked);
                                    }}
                                />
                            </label>
                            <div>
                                {t("components.modals.notifications.rowThreeTitle")}

                                <br/>

                                <span className="text-sub text-xs">
                                    {t("components.modals.notifications.rowThreeSubtext")}
                                </span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-6 flex-row items-center">
                        <label className="shrink-0">
                            <input
                                type="checkbox"
                                className="checkbox"
                                checked={isCommentsSelected}
                                onChange={(e) => {
                                    setIsCommentsSelected(e.target.checked);
                                }}
                            />
                        </label>
                        <div>
                            {t("components.modals.notifications.rowFourTitle")}

                            <br/>

                            <span className="text-sub text-xs">
                                {t("components.modals.notifications.rowFourSubtext")}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-2 flex gap-2 flex-row relative">
                    <button
                        className="btn flex-1 bg-accent text-white border-accent"
                        onClick={async () => {
                            setIsLoading(true);

                            const updatedPayload: SubscriptionsType = {
                                isSubscribedToContent: isContentSelected,
                                isSubscribedToCollaborationChanges: isCollaborationSelected,
                                isSubscribedToNewInteractions: isInteractionsSelected,
                                isSubscribedToNewComments: isCommentsSelected,
                                isSubscribedToNewMessages: isMessagesSelected
                            };

                            try {
                                const response = await fetch(
                                    `${apiBaseUrl}/v3/notifications/update/subscriptions/${data.id}`, 
                                    { 
                                        credentials: "include", 
                                        method: "POST", 
                                        headers: { "Content-Type": "application/json" }, 
                                        body: JSON.stringify({
                                            isContentSelected,
                                            isCollaborationSelected,
                                            isCommentsSelected,
                                            isInteractionsSelected,
                                            isMessagesSelected
                                        })
                                    }
                                );

                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                const responseData = await response.json() as any;

                                if (response.ok) {
                                    setNotificationSubscriptionsRef.current?.(updatedPayload);

                                    handleClose();

                                    toast.show(
                                        t("components.modals.notifications.result"), 
                                        { icon: "󰂚", type: "success" }
                                    );
                                } else {
                                    setIsLoading(false);

                                    toast.show(
                                        t("components.modals.notifications.error"), 
                                        { 
                                            subtext: `${responseData.id || ""}${responseData.id ? ": " : ""}${responseData.message}`,
                                            type: "error" 
                                        }
                                    );
                                }
                            } catch (error) {
                                console.error("Failed to post notification:", error);
                            }
                        }}
                    >
                        <div className={`${isLoading ? "loading" : ""}`}>
                            {t("components.modals.save")}
                        </div>
                    </button>
                </div>
            </div>
            <form 
                method="dialog" 
                className="modal-backdrop"
                onClick={handleClose}
            >
                <button type="submit">close</button>
            </form>
        </dialog>
    );
});

NotificationsModal.displayName = "NotificationsModal";
export default NotificationsModal;
