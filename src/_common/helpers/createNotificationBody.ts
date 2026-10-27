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
            return "{TARGET} reached {COUNT} chats"
        case "READS_MILESTONE":
            return "{TARGET} reached {COUNT} reads"
        case "SHARES_MILESTONE":
            return "{TARGET} reached {COUNT} shares"
        case "VIEWS_MILESTONE":
            return "{TARGET} reached {COUNT} views"
        case "ADD_TO_COLLECTION":
            return "{SOURCE} added {TARGET} to {COLLECTION}"
        case "PUBLISHED_CHARACTER":
            return "{SOURCE} published {TARGET}"
        case "UPDATED_CHARACTER":
            return "{SOURCE} updated {TARGET}"
        case "REPORT_CREATED":
            return "Thanks for your report"
        case "LOGIN":
            return "Unauthorized login attempt from {LOCATION} has been blocked"
        case "ACCOUNT_VERIFIED":
            return "Your account has been verified"
        case "PARTNER_PROGRAM":
            return "Your application to join the partner program has been accepted"
        case "GIFTED_PREMIUM":
            return "{SOURCE} gifted you {COUNT} premium"
        case "ASSIGNED_STAFF":
            return "Your account has been marked as a staff of OpenProfile"
        case "EARNED_AWARD":
            return "You earned the {AWARD} award"
        default:
            return null
    }
}
