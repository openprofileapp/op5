# Todo

move ids from id.gen() to snowflake.gen()
add OpenProfile staff badge (maybe replace moderator and admin as a badge desc)
update app.css to update domain with config sync
use font-mono class for console, not font-nerdfont
add search history
make the icon a circle or rounded rectangle
add unlisted profile options
instead of update tabs for all profiles, only those you liked will show a dot
instead of verification per profile, it will be project based
when hovering mentions, display an overview
on profile click display popup, not visit url; copy html for url visit
fix mention aura sharp snapback after 70 seconds

MAKE AN INITIALS AVATAR GENERATION SCRIPT ON ASSET CREATION (LIKE GMAIL)
const words = name.trim().split(" ");

const initials =
    words.length === 1
        ? words[0].slice(0, 2).toUpperCase()
        : words
                .map(word => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();

[blacklisted urls]
premium
marketplace
account
user
search
legal
browse
home
terms
tos
terms-of-service
privacy
privacy-policy
login
register
invite

[RECCOMMENDATIONS]
/admin
/mod
/moderation
/mod-tools
/dashboard
/system
/status
/health
/metrics
/logs
/debug
/console
/control
/panel

/login
/logout
/signin
/signup
/register
/auth
/oauth
/sso
/verify
/verification
/activate
/activation
/reset-password
/forgot-password
/change-password
/two-factor
/2fa
/session

/account
/account/settings
/account/security
/account/profile
/account/billing
/account/notifications
/account/devices
/account/activity
/account/privacy

/home
/explore
/browse
/discover
/search
/trending
/popular
/recent
/feed
/following
/recommendations

/legal
/terms
/terms-of-service
/tos
/privacy
/privacy-policy
/cookies
/gdpr
/agreements

/help
/support
/contact
/feedback
/report
/report-content
/docs
/documentation
/changelog
/faq

/premium
/upgrade
/subscribe
/billing
/checkout
/marketplace
/shop
/orders
/invoices

/api
/api/v1
/api/v2
/graphql
/rest
/internal
/webhook
/hooks
/events

/assets
/static
/media
/uploads
/files
/cdn
/images
/videos

/system/*
/admin/*
/mod/*
/api/*
/account/*

https://openprofile.app/j9studios/projects
https://openprofile.app/dragonights/character/eclipse
https://openprofile.app/dragonights/collection/team-dragonight

Add pre-defined top categories