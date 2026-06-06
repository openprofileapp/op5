# Todo
release a self-host version
add the remaining pages
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
add fav film genre field
add fav music producer field
add text formatting on all fields (.md support)
if a value contains a date, have a mention/href which redirects to a specific timeline link/page
When assigning fields to specific authors, mark on it somewhere: "Assigned to @USERNAME"
add input editing statues: "incomplete", "in progress", "completed"
add cool/warm options to skin tones
-- seperate promoted with a expiraion
-- separate score
-- score INTEGER DEFAULT 0,
-- promoted INTEGER DEFAULT 0,
add visual represntation of certain values (eg: cool skin displays an image of cool skin or smth)
make a code 503 page that is blank with 503 in the midde and a live user count?
IN-HOUSE ARTIST DOES HUNDREDS OF UNIQUE MIX/MATCHES TO HAVE A CHARACTER IMAGE GENERATOR BASED ON THE VALUES
block auth links from being seen in browser without an external call

make an admin panel
when support assign subscriptions, the user WILL need to accept it for it to go active
add a login page (/login)
Store the theme in client session for guest and account for registered
have the alice character showing tips and stuff
in settings, have a place to view hidden/not interested assets
discord activity application
if a country require a block, revoke "VIEW" permission
add google ads when reading profiles 
if owner of profile doesn't have premium, but they invite someone to help manage it who has premium, that user can apply premium stuff to that profile
make a funny error codes or smth in relation to OpenProfile
if a keyword is blocked, tell author they can't use that
have a percentage completion on the profiles public when visiting
add ratelimit

add subowner to profiles
eg: owner = project; subowner = user (ONLY ON PROJECTS)
enable rightclick to corrent spelling errors
memories have a visibility as well
asset memories can be a good place to share film snippets and comic pages while tagging the profiles inside; showing back a part of their adventure with a notification on top
add request verification button
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

Update privacy policy to retain moderational history and email if any even under deletion request: moderational history, emails, phones (if added), IP addresses, user id

Added support_note: The idea is, if they email support, this note can be read by the support members and updated at any time eg: "user doesn't understand <TEXT>", "user is toxic to support", "user has many valid reports of others, could make a good moderator"

accounts using the name of a verified author will need to find a new username to be verified

when using an invite, display the invite data in the embed eg: "Partner invited you to join OpenProfile! Get a month free of premium on join."

add a unique green scheme for bug hunters

Clicking card will show a popup before reading it showing more information, same info shown when visiting the lander page

alice's accont can't be logged-into
ensure all types end with Type at the end of the var, fix all
prevent bots from creating a lot of profiles without a verification; anti-AI

if a profile is "in-progress" and no update has been done for 30 days, update it to "incomplete"
add a visibility called "visible" (moderator force visibility public)
have a blacklist function on the backend to check for blacklisted words on all profile saves

have a copylink option in the share popup

rename trusted artist to trusted illustrator

if not logged in, for all things needing an account, display the login popup

Profile percentage is determined based on profile pages/fields unfilled/filled

Create `status.openprofile.app` using the status database then fetch and display the median of last 1000 calls on page load

add backlisted emails and phonenumbers to automod database (already removed from reg sql)

add updates from GitHub prompts on updates