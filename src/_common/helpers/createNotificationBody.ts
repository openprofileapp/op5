import { NotificationNameType } from "../types/notification.type.js";

export default function createNotificationBody(type: NotificationNameType): string | null {
    switch(type) {
        case "WEBPUSH_SUBSCRIBE":
            return "You subscribed to push notifications"
        case "NEW_LIKE":
            return "{SOURCE} liked {TARGET}"
        case "NEW_FOLLOW":
            return "{SOURCE} followed {TARGET}"
        case "NEW_MESSAGE":
            return "{SOURCE} sent {TARGET} a message"
        case "FRIEND_REQUEST_SENT":
            return "{SOURCE} sent {TARGET} a friend request"
        case "FRIEND_REQUEST_ACCEPTED":
            return "{SOURCE} accepted {TARGET} friend request"
        case "CHATS_MILESTONE":
            return "{SOURCE} reached {COUNT} chats"
        case "FOLLOWS_MILESTONE":
            return "{SOURCE} reached {COUNT} follows"
        case "LIKES_MILESTONE":
            return "{SOURCE} reached {COUNT} likes"
        case "READS_MILESTONE":
            return "{SOURCE} reached {COUNT} reads"
        case "SHARES_MILESTONE":
            return "{SOURCE} reached {COUNT} shares"
        case "VIEWS_MILESTONE":
            return "{SOURCE} reached {COUNT} views"
        case "ADD_TO_COLLECTION":
            return "{SOURCE} added {TARGET} to \"{COLLECTION}\" collection"
        default:
            return null
    }
}
