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
add trash access to the dashboard
when the account type is user, do not display dashboard of other author tools
only show copy id if developer; developer get tools from both author and publisher
force a popup on registration so person can customize their profile; during customization, profile is set to private until user finishes editing
add a database of collected fanflaires
ability to feature characters
under manage dropdown, when managing badges, say if its hidden by user
if comments are set to "followers", then only followers can see comments and comment

-- seperate promoted with a expiraion
-- separate score

-- score INTEGER DEFAULT 0,
-- promoted INTEGER DEFAULT 0,

make a code 503 page that is blank with 503 in the midde and a live user count?

block auth links from being seen in browser without an external call

when support assign subscriptions, the user WILL need to accept it for it to go active

Store the theme in client session for guest and account for registered

in settings, have a place to view hidden/not interested assets

if a country require a block, revoke "VIEW" permission

if owner of profile doesn't have premium, but they invite someone to help manage it who has premium, that user can apply premium stuff to that profile

if a keyword is blocked, tell author they can't use that

add ratelimit

add subowner to profiles
eg: owner = project; subowner = user (ONLY ON PROJECTS)

memories have a visibility as well
asset memories can be a good place to share film snippets and comic pages while tagging the profiles inside; showing back a part of their adventure with a notification on top

add folders inside projects to sort profile (admins can be assigned to folders)

add gallary per assets and let the publisher select from the gallary to features images on overview

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
developers

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