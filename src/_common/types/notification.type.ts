import { AwardNameType } from "./award.type.js";
import { GeoIpType } from "./geoIp.type.js";
import { WhatIsType } from "./whatIs.type.js";

export type NotificationNameType = 
    | "WEBPUSH_SUBSCRIBE"
    | "NEW_LIKE"
    | "NEW_FOLLOW"
    | "NEW_MESSAGE"
    | "FRIEND_REQUEST_SENT"
    | "FRIEND_REQUEST_ACCEPTED"
    | "CHATS_MILESTONE"
    | "READS_MILESTONE"
    | "SHARES_MILESTONE"
    | "VIEWS_MILESTONE"
    | "ACCOUNT_VERIFIED"
    | "PARTNER_PROGRAM"
    | "PARTNER_CODE_USED"
    | "GIFTED_PREMIUM"
    | "ADD_TO_COLLECTION"
    | "PUBLISHED_CHARACTER"
    | "REPORT_CREATED"
    | "UPDATED_CHARACTER"
    | "LOGIN"
    | "ASSIGNED_STAFF"
    | "EARNED_AWARD"
;

type NotificationDataType = {
    source?: WhatIsType;
    target?: WhatIsType;
    count?: number;
    geoIp?: GeoIpType;
    collection?: WhatIsType;
    award?: AwardNameType
}

export type NotificationInboxType = {
    userId: string;
    type: NotificationNameType;
    data: NotificationDataType;
    isRead: boolean;
    readDate: string;
    sentDate: string;
}

export type GetNotificationInboxType = {
    items: NotificationInboxType[];
    count: number;
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
