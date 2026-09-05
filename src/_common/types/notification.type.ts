export type NotificationNameType = 
    | "WEBPUSH_SUBSCRIBE"
    | "NEW_LIKE"
    | "NEW_FOLLOW"
    | "NEW_MESSAGE"
    | "FRIEND_REQUEST_SENT"
    | "FRIEND_REQUEST_ACCEPTED"
    | "CHATS_MILESTONE"
    | "FOLLOWS_MILESTONE"
    | "LIKES_MILESTONE"
    | "READS_MILESTONE"
    | "SHARES_MILESTONE"
    | "VIEWS_MILESTONE"
    | "VERIFIED_REGISTRATION"
    | "PARTNER_REGISTRATION"
    | "VERIFIED_PARTNER_REGISTRATION"
    | "LIFETIME_PREMIUM_REGISTRATION"
    | "PREMIUM_REGISTRATION"
    | "PRECURSOR_REGISTRATION"
    | "PARTNER_CODE_USED"
    | "ADD_TO_COLLECTION"
;

export type NotificationInboxType = {
    userId: string;
    type: string;
    data: object;
    isRead: boolean;
    readDate: string;
    sentDate: string;
}

export type NotificationSubscriptionType = {
    source: string;
    target: string;
    isSubscribedToContent: boolean;
    isSubscribedToCollaborationChanges: boolean;
    isSubscribedToNewComments: boolean;
    isSubscribedToNewInteractions: boolean;
    isSubscribedToNewMessages: boolean;
}

export type NotificationMuteType = {
    source: string;
    target: string;
    duration: number;
    isIndefinite: boolean;
    date: string;
}

export type GetNotificationSubscriptionType = Omit<
    NotificationSubscriptionType, 
    "source" | "target"
>

export type GetNotificationMuteType = Omit<
    NotificationMuteType, 
    "source" | "target"
>

export type GetNotificationCollection = {
    subscriptions: GetNotificationSubscriptionType;
    mute: GetNotificationMuteType;
}
