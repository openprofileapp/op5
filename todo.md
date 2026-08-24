# Todo
CREATE STATUS PAGE UPTIME; PING EVERY MINUTE AND USE RESPONSE TIME TO DETERMINE // SAVE TO STATUS AND CREATE A NEW DB SET // https://status.openprofile.app/update

MOVE ALL INTERACTIONS FAVS INTO A FAV COLLECTION "My Favorites"
MOVE CHARACTER LICENSE INTO THE LICENSE TABLE
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

// database.check("profiles", "profiles/backups/01/profiles");
// database.check("profiles", "profiles/backups/01/fields");
// database.check("profiles", "profiles/backups/01/values");

// Generation library
database.connect("library");
database.check("library", "library/ghost");
database.check("library", "library/first_name");

// database.connect("blacklists");
// database.connect("experiments");

database.connect("moderation");
database.check("moderation", "moderation/reports");
database.check("moderation", "moderation/cases");

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

REMOVE ALL CHECKS DUE TO ALTER-TABLE NOT SUPPORTING THEM; use code validation instead
   visibility TEXT NOT NULL DEFAULT 'public'
        CHECK (visibility IN ('public', 'followers', 'friends', 'unlisted', 'private', 'hidden')),

        ON SERVER RESTART; ENSURE ALL CONNECTED SESSIONS ARE SET TO 0

AAUTH BACKEND / GET METHODS SERVICE LINE ~18
// DEV NOTE: Load this once per session call and save in req.i18n
const i18n = await I18nService.load(
    { 
        localesPath: "/public/locales", 
        locale: "en", 
        defaultLocale: config.metadata.locale 
    }
);
ENSURE THAT CALLING AN API REVALIDATES SESSONS

if (window.user) {
    function urlB64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(async registration => {
                console.log('Service Worker registered');

                const permission = await Notification.requestPermission();
                if (permission !== 'granted') {
                    console.log('Notification permission denied.');
                    return;
                }

                let subscription = await registration.pushManager.getSubscription();

                if (!subscription) {
                    const publicKey = window.vapid;
                    subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: urlB64ToUint8Array(publicKey),
                    });
                    console.log('User is subscribed:', subscription);
                } else {
                    console.log('Already subscribed:', subscription);
                }

                try {
                    const response = await fetch(`${routes.auth}/v2/push`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(subscription),
                        credentials: 'include'
                    });

                    if (!response.ok) {
                        const text = await response.text();
                        throw new Error(`Push subscription failed: ${response.status} ${text}`);
                    }

                    const data = await response.json();
                    console.log('Subscription sent successfully:', data);

                } catch (error) {
                    console.error('Error sending subscription:', error);

                    // Unsubscribe only if sending fails
                    if (subscription) {
                        try {
                            await subscription.unsubscribe();
                            console.log('Unsubscribed due to error.');
                            subscription = null;
                        } catch (unsubscribeError) {
                            console.error('Error unsubscribing:', unsubscribeError);
                        }
                    }
                }
            })
            .catch(err => console.error('Service Worker registration failed:', err));
    } else {
        console.warn('Push messaging is not supported in this browser.');
    }
} else {
    console.warn('Login to access push notifications');
}

// let pwa_prompt;

// window.addEventListener("beforeinstallprompt", (event) => {
//     // Prevent the default behavior of showing the banner
//     event.preventDefault();
//     pwa_prompt = event;
// 
//     //console.log("Install prompt available");
// 
//     // Automatically trigger the install prompt
//     setTimeout(() => {
//         if (pwa_prompt) {
//             // Show the install prompt automatically
//             pwa_prompt.prompt();
//             pwa_prompt.userChoice.then((choiceResult) => {
//                 if (choiceResult.outcome === "accepted") {
//                     //console.log("User accepted PWA install");
//                 } else {
//                     //console.log("User dismissed PWA install");
//                 }
//                 // Reset pwa prompt to prevent multiple prompts
//                 pwa_prompt = null; 
//             });
//         }
//     }, 2000); // Delay the prompt for 2 seconds
// });

// // Register the service worker
// navigator.serviceWorker.register(`{{routes.release}}/sw.js`).then((registration) => {
//     //console.log("Service Worker registered:", registration);
// }).catch((error) => {
//     //console.error("Service Worker registration failed:", error);
//     setTimeout(() => {
//         //console.log("Retrying Service Worker registration...");
//         navigator.serviceWorker.register(`{{routes.release}}/sw.js`);
//     }, 2000);
// });

const definitions = {
    // Metadata
    change_log: {
        type: 0,
        name: "Change Log",
        category: "metadata",
        placeholder: "What is new about {{name}}?",
        help: "OpenProfile doesn't have a native change log system yet. For the time being, use this field so returning followers can know what changed."
    },

    // Name
    full_name: {
        type: 1,
        name: "Full Name",
        category: "name",
        placeholder: "What is {{name's}} full name?",
        help: "Be sure to include {{pronouns-third}} prefixes and suffixes if any."
    },
    first_name: {
        type: 3,
        name: "First Name",
        category: "name",
        placeholder: "What is {{name's}} first name?",
        help: "While optional, first names should generally describe {{name}} in some way based on it meaning."
    },
    middle_name: {
        type: 3,
        name: "Middle Name",
        category: "name",
        placeholder: "What is {{name's}} middle name?",
        help: "Middle names aren''t always required and are more often used for realism or an alternate calling. If so, a middle name should generally describe {{name}} in the view or likings of the person who assigned {{name}} the name such as {{pronouns-third}} parent or guardian."
    },
    last_name: {
        type: 3,
        name: "Last Name",
        category: "name",
        placeholder: "What is {{name's}} last name?",
        help: "While optional, last names could be used to tell a lot about {{name}} interests or values based on the name ancestral association. A last name is typically inherited from {{name}} father."
    },
    nickname: {
        type: 1,
        name: "Nickname",
        category: "name",
        placeholder: "What is {{name's}} nickname?",
        help: "Nicknames are meant to be fun lighthearted alternative callings for {{name}} often created by {{pronouns-third}} friends and family. Sometimes even enemies or other acquaintances may come up with nicknames for {{name}} with negative intent."
    },
    alias: {
        type: 1,
        name: "Alias",
        category: "name",
        placeholder: "What is {{name's}} alias?",
        help: "If any, aliases are alternative names usually for cyberspace or business purposes for separating {{pronouns-second}}self from {{pronouns-third}} real identity to remain anonymous. These can include personal self-made titles and public callings in which {{name}} made {{pronouns-third}} own."
    },
    alter_ego: {
        type: 1,
        name: "Alter Ego",
        category: "name",
        placeholder: "What is {{name's}} alter ego?",
        help: "Alter egos are alternate personalities that {{name}} possesses and becomes during certain situations. Alter egos are commonly used for characters with secret heroic or villainic identities."
    },
    prefix: {
        type: 3,
        name: "Prefix",
        category: "name",
        placeholder: "What is {{name's}} prefix?",
        help: "If {{name}} is worldly notable then it likely {{pronouns-first}} might have a prefix or prefix based title apart from citizen standards. Prefixes are typically given by members of a higher ranking order than {{pronouns-second}} for special ceremonies or accomplishments."
    },
    suffix: {
        type: 3,
        name: "Suffix",
        category: "name",
        placeholder: "What is {{name's}} suffix?",
        help: "Suffixes are commonly known to be inherited from family trees, but can also be earned in military service and other professions."
    },
    pronouns: {
        type: 3,
        name: "Pronouns",
        category: "name",
        placeholder: "What are {{name's}} pronouns?",
        help: "Pronouns are the way {{name}} is reffered to in a third person view.\n\nTo properly render the pronouns in the help text, follow the format: they/them/their -> first/second/third. Only the first set of pronouns will be used."
    },
    former_name: {
        type: 1,
        name: "Former Name",
        category: "name",
        placeholder: "What was {{name's}} former name?",
        help: "Reasons for a former name may be due to a once active alias or nickname {{name}} was once known by. A former name can be useful for characters who changed {{pronouns-third}} path in life and needed to let go the person {{pronouns-first}} once were."
    },
    name_origin: {
        type: 1,
        name: "Name Origin",
        category: "name",
        placeholder: "What is the origin behind {{name's}} name?",
        help: "Is it from a specific region or hold a special tale to it? Who gave it to {{pronouns-second}} or whom did {{pronouns-first}} inherit it from? Any reason when and why {{name}} got the name? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    personal_thoughts_name: {
        type: 1,
        name: "Personal Thoughts",
        category: "name",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} names and pronouns?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} names or would {{pronouns-first}} rather have had different ones? Does having the names affect {{pronouns-third}} life in any certain way? Do the names remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} names with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Apart from what {{pronouns-first}} are meant to do, does {{name}} use any of {{pronouns-third}} names to help {{pronouns-second}} in everyday life? Is {{name's}} even aware of {{pronouns-third}} name? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Astral
    birth_date: {
        type: 3,
        name: "Birth Date",
        category: "astral",
        placeholder: "What is {{name's}} birth date?",
        help: "The date of birth or creation should be when {{name}} first appeared or was to the least considered 'born' in the world {{name}} originates from. If possible, include the time of birth."
    },
    living_status: {
        type: 3,
        name: "Living Status",
        category: "astral",
        placeholder: "What is {{name's}} living status?",
        help: "<u>Alive</u>\n{{name}} is alive and has no additional attributes.\n\n<u>Deceased</u>\n{{name}} is deceased and has no additional attributes.\n\n<u>Undead</u>\n{{name}} might have previously died and now is an undead (zombie, skeleton, vampire, etc.) and could be affected negatively by daylight among other properties.\n\n<u>Ghost</u>\n{{name}} has previously died and now is a ghost. Ghosts or related entities might not have a physical form, but typically possess abilities to pass walls and move rapidly.\n\n<u>Sleeping</u>\n{{name}} is alive, but in deep hibernation and may or may not have additional attributes."
    },
    death_date: {
        type: 3,
        name: "Death Date",
        category: "astral",
        placeholder: "What is {{name's}} death date?",
        help: "The date of death or destruction should be when {{name}} last appeared or was considered 'deceased' in the world {{name}} originates from. If possible, include the time of death."
    },
    birthstone: {
        type: 3,
        name: "Birthstone",
        category: "astral",
        placeholder: "What is {{name's}} birthstone?",
        help: "Birthstones are typically determined based on the month {{name}} was born.\n\n[Detailed month and gemstone descriptions]"
    },
    age: {
        type: 3,
        name: "Age",
        category: "astral",
        placeholder: "What is {{name's}} age?",
        help: "The age is determined by the difference between the birth year and the year of which the story timeline takes place."
    },
    birth_flower: {
        type: 3,
        name: "Birth Flower",
        category: "astral",
        placeholder: "What is {{name's}} birth flower?",
        help: "Birth flowers are typically determined based on the month {{name}} was born.\n\n[Detailed month and flower descriptions]"
    },
    zodiac_sign: {
        type: 3,
        name: "Zodiac Sign",
        category: "astral",
        placeholder: "What is {{name's}} zodiac sign?",
        help: "Zodiac signs are typically determined based on the days of certain months in which {{name}} was born.\n\n[Detailed zodiac descriptions]"
    },
    elemental_sign: {
        type: 3,
        name: "Elemental Sign",
        category: "astral",
        placeholder: "What is {{name's}} elemental sign?",
        help: "Elemental signs are typically determined based on {{name}} zodiac sign.\n\n[Fire, Earth, Air, Water descriptions]"
    },
    chinese_sign: {
        type: 3,
        name: "Chinese Sign",
        category: "astral",
        placeholder: "What is {{name's}} Chinese sign?",
        help: "Chinese signs are typically determined by {{name}} birth year.\n\n[Detailed Chinese zodiac descriptions]"
    },
    birth_event: {
        type: 1,
        name: "Birth Event",
        category: "astral",
        placeholder: "What happened during {{name}} birth event?",
        help: "Describe the scene and location of where {{name}} was born. What was {{name's}} state of mind at the moment of this event? Use the five Ws (who, what, when, where, why)."
    },
    death_event: {
        type: 1,
        name: "Death Event",
        category: "astral",
        placeholder: "What happened during {{name}} death event?",
        help: "Describe the scene and location of where {{name}} died. What was {{name's}} state of mind at the moment of this event? Use the five Ws (who, what, when, where, why)."
    },
    personal_thoughts_astrology: {
        type: 1,
        name: "Personal Thoughts",
        category: "astral",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} astrology details and events?",
        help: "Do {{pronouns-first}} like the details or events or would {{pronouns-first}} prefer different ones? Does being connected to these details affect {{pronouns-third}} life? Do {{pronouns-first}} remember anything special about {{pronouns-second}}? Are {{pronouns-first}} comfortable sharing or prefer secrecy? Use the five Ws (who, what, when, where, why)."
    },

    // Physical
    body_height: {
        type: 3,
        name: "Body Height",
        category: "physical",
        placeholder: "What is {{name's}} body height?",
        help: "The body height should be primarily calculated from head to feet and not include any sort of wearables or extra features such as horns or antennas. Be sure to include any units of measurement you are using so it can be easily translated. It recommended to use both feet (ft.) and centimeters (cm.) for a universal understanding."
    },
    body_length: {
        type: 3,
        name: "Body Length",
        category: "physical",
        placeholder: "What is {{name's}} body length?",
        help: "The body length should be primarily calculated from side to side and not include any sort of wearables or extra features such as spikes or wings. Be sure to include any units of measurement you are using so it can be easily translated. It recommended to use both feet (ft.) and centimeters (cm.) for a universal understanding."
    },
    body_width: {
        type: 3,
        name: "Body Width",
        category: "physical",
        placeholder: "What is {{name's}} body width?",
        help: "The body width should be primarily calculated from front to back and not include any sort of wearables or extra features such as spikes or tails. Be sure to include any units of measurement you are using so it can be easily translated. It recommended to use both feet (ft.) and centimeters (cm.) for a universal understanding."
    },
    body_type: {
        type: 3,
        name: "Biological Body Type",
        category: "physical",
        placeholder: "What is {{name's}} body type?",
        help: "The body type describes {{name}} biological defaults set by genetics. This does not reflect current fitness, muscle mass, or conditioning.\n\n <u>Endomorph</u>\nEndomorphs are the most common body types and tend to have larger bone structures and a higher percentage of body fat.\n\n<u>Mesomorph</u>\nMesomorph body types are naturally muscular and have an average sized bone structure.\n\n<u>Ectomorph</u>\nEctomorphs have a light body build, slightly muscular development, and little body fat."
    },
    body_build: {
        type: 3,
        name: "Current Body Build",
        category: "physical",
        placeholder: "What is {{name's}} body build?",
        help: "The body build reflects {{name}} current fitness, muscle mass, or conditioning.\n\n <u>Slim</u>\nLean with low body fat and minimal muscle mass.\n\n<u>Average</u>\nBalanced proportions without strong emphasis.\n\n<u>Athletic</u>\nFit and toned with visible muscle definition.\n\n<u>Muscular</u>\nHigh muscle mass and strong physique.\n\n<u>Stocky</u>\nCompact and thick build with solid mass.\n\n<u>Curvy</u>\nFuller shape with pronounced curves."
    },
    body_mass: {
        type: 3,
        name: "Body Mass",
        category: "physical",
        placeholder: "What is {{name's}} body mass?",
        help: "Body mass index (BMI) is calculated based on {{name}} weight and height. To calculate BMI, multiply {{pronouns-third}} weight in pounds by 703. Save this result then convert {{pronouns-third}} height to square inches and divide it by that saved result. The final outcome is {{name's}} BMI. A BMI of 18.5 to 24.9 is considered healthy, above 25.0 is overweight, and past 30.0 can lead to health complications."
    },
    species: {
        type: 2,
        name: "Species",
        category: "physical",
        placeholder: "What is {{name's}} species?",
        help: "{{pronouns-first}} could be a human, elf, type of alien, hybrid of creatures, or even something totally unique. Include the scientific name if necessary."
    },
    body_weight: {
        type: 3,
        name: "Body Weight",
        category: "physical",
        placeholder: "What is {{name's}} body weight?",
        help: "The body weight should be calculated without including any sort of wearables. Be sure to include any units of measurement you are using so it can be easily translated. It recommended to use both pounds (lb.) and kilograms (kg.) for a universal understanding."
    },
    gender: {
        type: 3,
        name: "Gender",
        category: "physical",
        placeholder: "What is {{name's}} gender?",
        help: " {{name}} gender at birth. If {{name}} is transgendered, specify by what."
    },
    ethnicity: {
        type: 3,
        name: "Ethnicity",
        category: "physical",
        placeholder: "What is {{name's}} ethnicity?",
        help: "For humans, common ethnicities include Caucasians, Africans, Asians, Hispanics, and Natives."
    },
    body_color: {
        type: 3,
        name: "Body Color",
        category: "physical",
        placeholder: "What is {{name's}} body color?",
        help: "Body colors are typically determined by the outer face of the body. Body colors could include patterns like stripes or spots and other interesting visuals. This box is mainly for common color names and hex '#000000' or rgb '0,0,0' values if any."
    },
    physical_appearance: {
        type: 1,
        name: "Physical Appearance",
        category: "physical",
        placeholder: "What does {{name}} physical appearance look like?",
        help: "Describe {{name}} physical appearance without including any non-permanent wearables. Include skin, fur, scales, face, hair, eyes, nose, ears, mouth, teeth, tongue, body structure, horns, wings, spikes, tails, scars, tattoos, piercings, prosthetics, or internal features if relevant."
    },
    personal_thoughts_physical_appearance: {
        type: 1,
        name: "Personal Thoughts",
        category: "physical",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} physical appearance?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} appearance or wish it was different? Does it affect {{pronouns-third}} life in any way? Do {{pronouns-first}} remember anything about it? Are {{pronouns-first}} comfortable sharing or prefer secrecy? Does {{name}} use any features in daily life? Try to be descriptive and include the five Ws (who, what, when, where, why)."
    },

    // Supernatural
    gained_super_ability_date: {
        type: 3,
        name: "Gained Ability Date",
        category: "supernatural",
        placeholder: "When did {{name}} get {{pronouns-third}} ability?",
        help: "The date of first signs or 'activation' should be when {{name}} first felt something was different about {{pronouns-second}} or when {{pronouns-first}} learned {{pronouns-first}} had an ability. The date should be the date the ability was first found in {{pronouns-second}}, not the date of diagnosis. If possible, include the time of when this happened."
    },
    super_ability_status: {
        type: 3,
        name: "Ability Status",
        category: "supernatural",
        placeholder: "What is {{name's}} ability status?",
        help: "<u>Active</u>\nThe ability is active and can be used at any given time so long as the circumstances are met.\n\n<u>Deactivated</u>\nThe ability has been deactivated and can no longer be used.\n\n<u>Damaged</u>\nThe ability, its source, and/or {{name}} has been damaged and while the ability is still usable, it struggles and doesn't always function properly.\n\n<u>Sleeping</u>\nThe ability is activated, but in hibernation and not currently usable."
    },
    lost_super_ability_date: {
        type: 3,
        name: "Lost Ability Date",
        category: "supernatural",
        placeholder: "When did {{name}} lose {{pronouns-third}} ability?",
        help: "The date of last signs or 'deactivation' should be when {{name}} first felt something was different about {{pronouns-second}} or when {{pronouns-first}} learned {{pronouns-first}} lost {{pronouns-third}} ability. The date should be the date the ability was lost, not date of diagnosis. If possible, include the time of when this happened."
    },
    super_ability_name: {
        type: 3,
        name: "Ability Name",
        category: "supernatural",
        placeholder: "What is {{name's}} ability name?",
        help: "Include the scientific name if necessary."
    },
    super_ability_faction: {
        type: 3,
        name: "Ability Faction",
        category: "supernatural",
        placeholder: "What is {{name's}} ability faction?",
        help: "<u>Light</u>\nThe ability is considered positive energy and is typically used by heroes with good intentions.\n\n<u>Half</u>\nThe ability is considered of both positive and negative energies and is typically used by either heroes or villains regardless of intentions.\n\n<u>Dark</u>\nThe ability is considered negative energy and is typically used by villains with evil intentions. Dark abilities are typically stronger in nature than light abilities, especially in defense.\n\n<u>Unknown</u>\nThe ability is unknown and could be from either energy side or be very unstable."
    },
    super_ability_class: {
        type: 3,
        name: "Ability Class",
        category: "supernatural",
        placeholder: "What is {{name's}} ability class?",
        help: "<u>Air</u> - The ability is associated with the air element.\n<u>Earth</u> - The ability is associated with the earth element.\n<u>Fire</u> - The ability is associated with the fire element.\n<u>Water</u> - The ability is associated with the water element.\n<u>Darkness</u> - The ability is associated with the darkness element.\n<u>Electricity</u> - The ability is associated with the electricity element.\n<u>Energy</u> - The ability is associated with the energy element.\n<u>Ice</u> - The ability is associated with the ice element.\n<u>Light</u> - The ability is associated with the light element.\n<u>Weather</u> - The ability is associated with the weather element.\n<u>Other</u> - The ability is associated with no elements."
    },
    super_ability_booster: {
        type: 3,
        name: "Ability Booster",
        category: "supernatural",
        placeholder: "What is {{name's}} ability booster?",
        help: "An ability booster should be something that causes the ability power to increase. An ability booster could be a specific location, item, person, energy, and/or specific word spoken by the wielder or someone else."
    },
    super_ability_source: {
        type: 3,
        name: "Ability Source",
        category: "supernatural",
        placeholder: "What is {{name's}} ability source?",
        help: "An ability source is something that causes the ability to exist. An ability source could be a specific location, item, person, or energy."
    },
    super_ability_weakness: {
        type: 3,
        name: "Ability Weakness",
        category: "supernatural",
        placeholder: "What is {{name's}} ability weakness?",
        help: "An ability weakness should be something that causes the ability power to decrease. An ability weakness could be a specific location, item, person, energy, and/or specific word spoken by the wielder or someone else."
    },
    super_ability_description: {
        type: 1,
        name: "Ability Description",
        category: "supernatural",
        placeholder: "What is {{name's}} ability description?",
        help: "How is the ability generally used? What is the ability power level and what special moves are available to {{name}}? Describe the ability booster and weakness. What causes them and what are {{pronouns-third}} effects on {{name}}? What about the ability power source and ability status? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why)."
    },
    super_ability_diagnosis_event: {
        type: 1,
        name: "Ability Diagnosis Event",
        category: "supernatural",
        placeholder: "What happened during {{name}} ability diagnosis?",
        help: "Describe the scene and location of where the diagnosis happened. What was {{name's}} state of mind at the moment of this event? Who or what diagnosed {{name}}? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    super_ability_prone: {
        type: 1,
        name: "Ability Prone",
        category: "supernatural",
        placeholder: "What ability is {{name}} prone too?",
        help: "Describe the ability and why they are prone to it. It could be conistant or conditional such as being affected by a location, person, item, existing ability, or genetics. Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    super_ability_immune: {
        type: 1,
        name: "Ability Immune",
        category: "supernatural",
        placeholder: "What ability is {{name}} immune too?",
        help: "Describe the ability and why they are prone to it. It could be conistant or conditional such as being affected by a location, person, item, existing ability, or genetics. Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    personal_thoughts_super_ability: {
        type: 1,
        name: "Personal Thoughts",
        category: "supernatural",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} ability?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} ability and details or would {{pronouns-first}} rather have had a different one? Does {{pronouns-third}} ability or details affect {{pronouns-third}} life in any way? Do {{pronouns-third}} ability or details remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} ability or details with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} ability to help in everyday life? Is {{name's}} even aware {{pronouns-first}} have abilities or know of {{pronouns-third}} special moves? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },

    // Personality
    primary_personality_trait_1: {
        type: 3,
        name: "Primary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} primary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    secondary_personality_trait_1: {
        type: 3,
        name: "Secondary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} secondary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    tertiary_personality_trait_1: {
        type: 3,
        name: "Tertiary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} tertiary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    primary_personality_trait_2: {
        type: 3,
        name: "Primary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} primary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    secondary_personality_trait_2: {
        type: 3,
        name: "Secondary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} secondary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    tertiary_personality_trait_2: {
        type: 3,
        name: "Tertiary Personality Trait",
        category: "personality",
        placeholder: "What is {{name's}} tertiary trait?",
        help: "A personality trait should define how a person generally acts in life and situations."
    },
    personal_thoughts_personality_trait: {
        type: 1,
        name: "Personal Thoughts",
        category: "personality",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} personality trait?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} personality trait or would {{pronouns-first}} rather have a different one? Does {{pronouns-third}} personality trait affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} personality trait remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} personality trait with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} personality trait to help in everyday life? Is {{name's}} aware of some of {{pronouns-third}} personality traits? Try to be as descriptive as possible and remember the usage of the five Ws (who, what, when, where, and why)."
    },
    topic_knowledge_1: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    topic_knowledge_2: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    topic_knowledge_3: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    topic_knowledge_4: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    topic_knowledge_5: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    topic_knowledge_6: {
        type: 3,
        name: "Topic Knowledge",
        category: "personality",
        placeholder: "What topic does {{name}} know well?",
        help: "That topic could be a skill such as fixing things, a talent such as art, or something {{pronouns-first}} studied for a long time such as a language."
    },
    personal_thoughts_knowledge: {
        type: 1,
        name: "Personal Thoughts",
        category: "personality",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} knowledge?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} knowledge or would {{pronouns-first}} rather have a different one? Does {{pronouns-third}} knowledge affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} knowledge remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} knowledge with others or would {{pronouns-first}} rather keep it secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} knowledge to help in everyday life? Is {{name's}} aware of {{pronouns-third}} knowledge? Try to be as descriptive as possible and remember the usage of the five Ws (who, what, when, where, and why)."
    },
    hobby_1: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    hobby_2: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    hobby_3: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    hobby_4: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    hobby_5: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    hobby_6: {
        type: 3,
        name: "Hobby",
        category: "personality",
        placeholder: "What is {{name's}} hobby?",
        help: "The hobby should be something {{pronouns-first}} do frequently in {{pronouns-third}} spare time and enjoy doing it."
    },
    personal_thoughts_hobby: {
        type: 1,
        name: "Personal Thoughts",
        category: "personality",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} hobby?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} hobby or would {{pronouns-first}} rather have a different one? Does {{pronouns-third}} hobby affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} hobby remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} hobby with others or would {{pronouns-first}} rather keep it secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} hobby to help in everyday life? Is {{name's}} aware of {{pronouns-third}} knowledge? Try to be as descriptive as possible and remember the usage of the five Ws (who, what, when, where, and why)."
    },

    // Choice
    habit_1: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    habit_2: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    habit_3: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    habit_4: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    habit_5: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    habit_6: {
        type: 3,
        name: "Habit",
        category: "choice",
        placeholder: "What is {{name's}} habit?",
        help: "A habit should be a subconscious behavioral pattern that {{name}} does frequently. The habit can be either good or bad."
    },
    personal_thoughts_habit: {
        type: 1,
        name: "Personal Thoughts",
        category: "choice",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} habit?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} habit or would {{pronouns-first}} rather have had a different one? Does {{pronouns-third}} habit affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} habit remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} habit with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} habit to help in everyday life? Is {{name's}} aware of some of {{pronouns-third}} habits? Try to be as descriptive as possible and remember the five Ws (who, what, when, where, and why)."
    },
    addiction_1: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    addiction_2: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    addiction_3: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    addiction_4: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    addiction_5: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    addiction_6: {
        type: 3,
        name: "Addiction",
        category: "choice",
        placeholder: "What addiction does {{name}} have?",
        help: "Addictions are typically something bad {{name}} does, either for {{pronouns-third}} health or others around {{pronouns-second}}."
    },
    personal_thoughts_addiction: {
        type: 1,
        name: "Personal Thoughts",
        category: "choice",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} addiction?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} addiction or would {{pronouns-first}} rather have had a different one? Does {{pronouns-third}} addiction affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} addiction remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} addiction with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} addiction to help in everyday life? Is {{name's}} aware of {{pronouns-third}} addiction? Try to be as descriptive as possible and remember the five Ws (who, what, when, where, and why)."
    },
    regret_1: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    regret_2: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    regret_3: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    regret_4: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    regret_5: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    regret_6: {
        type: 3,
        name: "Regret",
        category: "choice",
        placeholder: "What is {{name's}} regret?",
        help: "A regret should be something {{pronouns-first}} once did or didn't do, but now wish {{pronouns-first}} could have done something while {{pronouns-first}} had the chance."
    },
    personal_thoughts_regret: {
        type: 1,
        name: "Personal Thoughts",
        category: "choice",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} regret?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} regret or would {{pronouns-first}} rather have had a different one? Does {{pronouns-third}} regret affect {{pronouns-third}} life in any certain way? Does {{pronouns-third}} regret remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} regret with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} regret to help in everyday life? Is {{name's}} aware of {{pronouns-third}} regret? Try to be as descriptive as possible and remember the five Ws (who, what, when, where, and why)."
    },

    // Likeness
    love_1: {
        type: 3,
        name: "Love +900",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_2: {
        type: 3,
        name: "Love +800",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_3: {
        type: 3,
        name: "Love +700",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_4: {
        type: 3,
        name: "Love +600",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_5: {
        type: 3,
        name: "Love +500",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_6: {
        type: 3,
        name: "Love +400",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_7: {
        type: 3,
        name: "Love +300",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_8: {
        type: 3,
        name: "Love +200",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    love_9: {
        type: 3,
        name: "Love +100",
        category: "likeness",
        placeholder: "What does {{name}} love?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_1: {
        type: 3,
        name: "Like +90",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_2: {
        type: 3,
        name: "Like +80",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_3: {
        type: 3,
        name: "Like +70",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_4: {
        type: 3,
        name: "Like +60",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_5: {
        type: 3,
        name: "Like +50",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_6: {
        type: 3,
        name: "Like +40",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_7: {
        type: 3,
        name: "Like +30",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_8: {
        type: 3,
        name: "Like +20",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    like_9: {
        type: 3,
        name: "Like +10",
        category: "likeness",
        placeholder: "What does {{name}} like?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_1: {
        type: 3,
        name: "Dislike -10",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_2: {
        type: 3,
        name: "Dislike -20",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },

    dislike_3: {
        type: 3,
        name: "Dislike -30",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_4: {
        type: 3,
        name: "Dislike -40",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_5: {
        type: 3,
        name: "Dislike -50",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_6: {
        type: 3,
        name: "Dislike -60",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_7: {
        type: 3,
        name: "Dislike -70",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_8: {
        type: 3,
        name: "Dislike -80",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    dislike_9: {
        type: 3,
        name: "Dislike -90",
        category: "likeness",
        placeholder: "What does {{name}} dislike?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_1: {
        type: 3,
        name: "Hate -100",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_1: {
        type: 3,
        name: "hate -100",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_2: {
        type: 3,
        name: "hate -200",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_3: {
        type: 3,
        name: "hate -300",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_4: {
        type: 3,
        name: "hate -400",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_5: {
        type: 3,
        name: "hate -500",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_6: {
        type: 3,
        name: "hate -600",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_7: {
        type: 3,
        name: "hate -700",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_8: {
        type: 3,
        name: "hate -800",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    hate_9: {
        type: 3,
        name: "Hate -900",
        category: "likeness",
        placeholder: "What does {{name}} hate?",
        help: "This is based on a rateable scale from love to hate where the highest most left option is most loved and the lowest most right option is the most hated option."
    },
    personal_thoughts_likeness_scale: {
        type: 1,
        name: "Personal Thoughts",
        category: "likeness",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} likeness scale?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} likeness scale or would {{pronouns-first}} rather have had different one? Does {{pronouns-third}} likeness scale affects {{pronouns-third}} life in any certain way? Do {{pronouns-third}} likeness scale remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} likeness scale with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Apart from what {{pronouns-first}} are meant to do, does {{name}} uses {{pronouns-third}} likeness scale to help {{pronouns-second}} in everyday life? Is {{name's}} even aware of {{pronouns-third}} likeness scale? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },


    // Favorites
    favorite_1: {
        type: 3,
        name: "Favorite Book/Author",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_2: {
        type: 3,
        name: "Favorite Movie/Actor",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_3: {
        type: 3,
        name: "Favorite TV Series/Channel",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_4: {
        type: 3,
        name: "Favorite Film Director/Producer",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_5: {
        type: 3,
        name: "Favorite Public Figure/Influencer",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_6: {
        type: 3,
        name: "Favorite Content Creator/Streamer",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_7: {
        type: 3,
        name: "Favorite People (family, friends, neighbors)",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_8: {
        type: 3,
        name: "Favorite People (co-workers, doctors, etc.)",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_9: {
        type: 3,
        name: "Favorite Animal/Creature",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_10: {
        type: 3,
        name: "Favorite Fictional Character",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_11: {
        type: 3,
        name: "Favorite Supernatural Ability",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_12: {
        type: 3,
        name: "Favorite Weapon/Tool",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_13: {
        type: 3,
        name: "Favorite Streaming/Media Platform",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_14: {
        type: 3,
        name: "Favorite Music/Genre",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_15: {
        type: 3,
        name: "Favorite Band/Vocalist",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_16: {
        type: 3,
        name: "Favorite Instrument/DAW",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_17: {
        type: 3,
        name: "Favorite Artist/Animator",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_18: {
        type: 3,
        name: "Favorite Painting/Workpiece",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_19: {
        type: 3,
        name: "Favorite Store/eStore",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_20: {
        type: 3,
        name: "Favorite Clothing/Style",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_21: {
        type: 3,
        name: "Favorite Gadget/Device",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_22: {
        type: 3,
        name: "Favorite Social Media Platform",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_23: {
        type: 3,
        name: "Favorite Gaming Platform",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_24: {
        type: 3,
        name: "Favorite Video Game/Game",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_25: {
        type: 3,
        name: "Favorite Sport/Team",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_26: {
        type: 3,
        name: "Favorite Company/Organization",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_27: {
        type: 3,
        name: "Favorite Job/Free Position",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_28: {
        type: 3,
        name: "Favorite Country/Location",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_29: {
        type: 3,
        name: "Favorite Place to Eat/Drink",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_30: {
        type: 3,
        name: "Favorite Food/Beverage",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_31: {
        type: 3,
        name: "Favorite Scent/Flavor/Texture",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_32: {
        type: 3,
        name: "Favorite Season/Weather",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_33: {
        type: 3,
        name: "Favorite Holiday/Event",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_34: {
        type: 3,
        name: "Favorite Era/Year/Month/Day/Time of Day",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_35: {
        type: 3,
        name: "Favorite Memory",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_36: {
        type: 3,
        name: "Favorite Toy/Object",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_37: {
        type: 3,
        name: "Favorite Natural/Celestial Object",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_38: {
        type: 3,
        name: "Favorite Vehicle/House Style",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_39: {
        type: 3,
        name: "Favorite Topic/Subject",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_40: {
        type: 3,
        name: "Favorite Quote/Saying",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_41: {
        type: 3,
        name: "Favorite Word/Number/Color",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_42: {
        type: 3,
        name: "Favorite Feeling/Sensation",
        category: "favorites",
        placeholder: "What is {{name's}} favorite?",
        help: "The favorite should be something {{name}} loves in this topic above all else and tends to frequently mention that thing. There can be multiple favorites."
    },
    favorite_personal_thoughts: {
        type: 1,
        name: "Personal Thoughts",
        category: "favorites",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} favorites?",
        help: "Do {{pronouns-first}} favorite {{pronouns-third}} favorites or would {{pronouns-first}} rather have had different ones? Do {{pronouns-third}} favorites affect {{pronouns-third}} life in any certain way? Do {{pronouns-third}} favorites remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} favorites with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} favorites to help in everyday life? Is {{name's}} aware of {{pronouns-third}} favorites? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Beliefs
    beliefs_religion: {
        type: 1,
        name: "Religious Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} religious beliefs?",
        help: "Do {{pronouns-first}} believe in any gods or higher entities? Do {{pronouns-first}} believe in an afterlife or supernatural beings? What religious activities do {{pronouns-first}} actively partake, if any? What are {{name's}} personal thoughts towards {{pronouns-third}} religion? Do {{pronouns-first}} like {{pronouns-third}} religion or would {{pronouns-first}} rather convert to another? Does {{pronouns-third}} religion affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} religion with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    beliefs_political: {
        type: 1,
        name: "Political Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} political beliefs?",
        help: "Do {{pronouns-first}} support any specific parties or political representatives? What political activities do {{pronouns-first}} actively partake, if any? What are {{name's}} personal thoughts towards {{pronouns-third}} political views? Do {{pronouns-first}} like {{pronouns-third}} political stance or would {{pronouns-first}} rather move to another? Does {{pronouns-third}} political views affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} political views with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    beliefs_equal_rights: {
        type: 1,
        name: "Equal Rights Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} equal rights beliefs?",
        help: "Do {{pronouns-first}} support discrimination towards specific groups or believe some are entitled to superior rights over others? What are {{name's}} personal thoughts towards {{pronouns-third}} equal rights beliefs? Do {{pronouns-first}} like {{pronouns-third}} equal rights beliefs or would {{pronouns-first}} rather change {{pronouns-second}}? Does {{pronouns-third}} equal rights beliefs affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} equal rights beliefs with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    beliefs_spirituality: {
        type: 1,
        name: "Spiritual Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} spiritual beliefs?",
        help: "Do {{pronouns-first}} believe {{pronouns-third}} existence and life events all have a bigger meaning or purpose? Do {{pronouns-first}} believe in an afterlife or supernatural beings? What spiritual activities do {{pronouns-first}} actively partake, if any? What are {{name's}} personal thoughts towards {{pronouns-third}} spiritual beliefs? Do {{pronouns-first}} like {{pronouns-third}} spiritual beliefs or would {{pronouns-first}} rather change {{pronouns-second}}? Does {{pronouns-third}} spiritual beliefs or practices affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} spiritual beliefs with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    beliefs_superstition: {
        type: 1,
        name: "Superstitious Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} superstitious beliefs?",
        help: "Do {{pronouns-first}} believe in mystical activities such as tarot reading, crystal balls, palm reading, fortune telling, or even witchcraft? Do {{pronouns-first}} believe that astrology such as zodiac signs or the positions of certain stars can affect one's life? What superstitious activities do {{pronouns-first}} actively partake, if any? What are {{name's}} personal thoughts towards {{pronouns-third}} superstitious beliefs? Do {{pronouns-first}} like {{pronouns-third}} superstitious beliefs or would {{pronouns-first}} rather change {{pronouns-second}}? Does {{pronouns-third}} superstitious beliefs or practices affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} superstitious beliefs with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    beliefs_otherworldly: {
        type: 1,
        name: "Otherworldly Beliefs",
        category: "beliefs",
        placeholder: "What is {{name's}} otherworldly beliefs?",
        help: "Do {{pronouns-first}} believe in mythical creatures such as dragons, fairies, unicorns, or griffins? Do {{pronouns-first}} believe in folklore creatures such as vampires, werewolves, zombies, or other supernatural beings? What about extraterrestrial beings beyond {{pronouns-third}} known worlds? What are {{name's}} personal thoughts towards {{pronouns-third}} otherworldly beliefs? Do {{pronouns-first}} like {{pronouns-third}} otherworldly beliefs or would {{pronouns-first}} rather change {{pronouns-second}}? Does {{pronouns-third}} otherworldly beliefs affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} otherworldly beliefs with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Interactions
    social_preference: {
        type: 3,
        name: "Social Preference",
        category: "interactions",
        placeholder: "What is {{name's}} social preference?",
        help: "<u>Introvert</u><br>{{name}} tends to prefer being alone in private spaces or with a small group of closer friends and enjoys deep conversations.<br><br><u>Ambivert</u><br>{{name}} is the bridge between introverts and extroverts, enjoying both small talks and meaningful conversations with any size group.<br><br><u>Extrovert</u><br>{{name}} tends to prefer being socially active with a larger group of friends and enjoys small talks."
    },
    social_view: {
        type: 3,
        name: "Social View",
        category: "interactions",
        placeholder: "What is {{name's}} social view?",
        help: "<u>Conservative</u><br>{{name}} embraces traditional values and is cautious of change as it may alter these traditional values.<br><br><u>Moderate</u><br>{{name}} supports change, but also wishes to preserve traditional values at the same time.<br><br><u>Progressive</u><br>{{name}} embraces change as it may lead to a better way of life."
    },
    social_role: {
        type: 3,
        name: "Social Role",
        category: "interactions",
        placeholder: "What is {{name's}} social role?",
        help: "<u>Talker</u><br>{{name}} tends to talk a lot, but not listen much to others and often interrupts the conversation to share something.<br><br><u>Engaged</u><br>{{name}} tends to be engaging in conversations, giving everyone a chance to be heard.<br><br><u>Listener</u><br>{{name}} tends to be rather silent and listens to everything said in the conversation in fine detail."
    },
    voice_sound: {
        type: 3,
        name: "Voice Spectrum",
        category: "interactions",
        placeholder: "What is {{name's}} voice spectrum?",
        help: "Example: 65 dB (180 Hz)<br><br><u>Volume</u><br>What is {{name's}} normal voice volume in decibels (dB)? A human during a typical conversation have a voice loudness of about 60-70 dB. However, if your character has a softer (50-59 dB) or harder (71-80 dB) voice, these values could vary pretty quickly in different situations. If your character is a unique creature type, you may need to research what would be a balanced vocal loudness for this species then proceed to decide for this character based on {{pronouns-third}} species and personality.<br><br><u>Pitch</u><br>What is {{name's}} normal voice pitch in hertz (Hz)? Common human male voice pitch generally ranges from 85 Hz to 180 Hz and human female voice pitch being from 165 Hz to 255 Hz. Human children, regardless of gender, generally ranges from 250 Hz to 300 Hz. If your character is a unique creature type, you may need to research what would be a balanced pitch for this species then proceed to decide for this character based on {{pronouns-third}} species, gender, and age."
    },
    voice_speed: {
        type: 3,
        name: "Speech Rate",
        category: "interactions",
        placeholder: "What is {{name's}} speech rate?",
        help: "What is {{name's}} normal speech rate in words per minute (WPM)? Someone with a lower speech rate may vary around 110-130 WPM while someone with a higher speech rate may vary around 160-200+ WPM. Average humans have a conversational speech rate of around 120-150 WPM. If your character is a unique creature type, you may need to research what would be a balanced speech rate for this species then proceed to decide for this character based on {{pronouns-third}} species and thought process."
    },
    voice_accent: {
        type: 3,
        name: "Accent",
        category: "interactions",
        placeholder: "What is {{name's}} accent?",
        help: "Accents are typically based on certain regions of the world where {{name}} has lived a large amount of {{pronouns-third}} life and likely adopted the way of communication and saying things since {{pronouns-first}} were a child."
    },
    walk_speed: {
        type: 3,
        name: "Walk Speed",
        category: "interactions",
        placeholder: "What is {{name's}} walking speed?",
        help: "This can be described qualitatively or quantitatively. A slow walker may move at a relaxed or cautious pace, while an average walker maintains a steady, natural rhythm. Faster walkers may stride with urgency or confidence. If {{name}} is a unique creature or species, consider {{pronouns-third}} anatomy, environment, and energy levels when deciding on a balanced walking speed."
    },
    walk_style: {
        type: 3,
        name: "Walk Style",
        category: "interactions",
        placeholder: "What is {{name's}} walking style?",
        help: "Walking style reflects {{name}} personality, physical condition, and background. This may include traits such as confident, heavy-footed, graceful, cautious, limping, swaggering, sneaky, or rigid. Consider how {{name}} posture, mood, culture, or past experiences influence the way {{pronouns-first}} move."
    },
    dominant_limb: {
        type: 3,
        name: "Dominant Limb ",
        category: "interactions",
        placeholder: "What is {{name's}} dominant limb?",
        help: "The dominant limb is the hand, foot, arm, leg, or tentacle often preffered when handling daily activities. Include the type of limb for clear reading."
    },
    postures: {
        type: 1,
        name: "Postures",
        category: "interactions",
        placeholder: "How does {{name}} posture {{pronouns-second}}self?",
        help: "Is {{pronouns-third}} posture consistant or are there various based on certain scenarios? What are {{name's}} personal thoughts towards {{pronouns-third}} postures? Do {{pronouns-first}} like {{pronouns-third}} postures or would {{pronouns-first}} rather improve on {{pronouns-second}}? Does {{pronouns-third}} postures affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing certain postures with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    common_behaviors: {
        type: 1,
        name: "Common Behaviors",
        category: "interactions",
        placeholder: "What are some of {{name}} common behaviors?",
        help: "Do {{pronouns-first}} have any frequent postures or gestures? What about motor or vocal tics and other involuntary movements? Do {{pronouns-first}} have any frequent speech patterns or facial expressions? What are {{name's}} personal thoughts towards {{pronouns-third}} behaviors? Do {{pronouns-first}} like {{pronouns-third}} behaviors or would {{pronouns-first}} rather improve on {{pronouns-second}}? Does {{pronouns-third}} behaviors affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing certain behaviors with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    persistent_decisions: {
        type: 1,
        name: "Decisions Persistency",
        category: "interactions",
        placeholder: "What is {{name's}} decisions persistency?",
        help: "How frequently do {{pronouns-first}} change decisions, if at all? Can {{pronouns-third}} decisions be easily altered through manipulation or influence? Do certain decisions have stronger persistency than others? What are {{name's}} personal thoughts towards {{pronouns-third}} decisions persistency? Do {{pronouns-first}} like {{pronouns-third}} decisions persistency or would {{pronouns-first}} rather improve on {{pronouns-second}}? Does {{pronouns-third}} decisions persistency affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing certain decisions persistency with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    attention_span: {
        type: 1,
        name: "Attention Span",
        category: "interactions",
        placeholder: "What is {{name's}} attention span?",
        help: "How well can {{pronouns-first}} stay focused on a specific conversation or topic? Do certain topics contribute towards a greater attention span than others? What do {{pronouns-first}} usually do when {{pronouns-third}} attention isn’t on the current conversation or topic? What are {{name's}} personal thoughts towards {{pronouns-third}} attention span? Do {{pronouns-first}} like {{pronouns-third}} attention span or would {{pronouns-first}} rather improve on it? Does {{pronouns-third}} attention span affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing certain attention spans with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    etiquette: {
        type: 1,
        name: "Etiquette",
        category: "interactions",
        placeholder: "What is {{name's}} etiquette?",
        help: "Are {{pronouns-first}} mannerful during conversations and respect others opinions? Do {{pronouns-first}} usually swear or use vulgar speech? Do {{pronouns-first}} acknowledge people surroundings and show consideration for others? Do certain topics contribute towards a greater etiquette than others? What are {{name's}} personal thoughts towards {{pronouns-third}} etiquette? Do {{pronouns-first}} like {{pronouns-third}} etiquette or would {{pronouns-first}} rather improve on it? Does {{pronouns-third}} etiquette affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} etiquette with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    conflict_resolution: {
        type: 1,
        name: "Conflict Resolution",
        category: "interactions",
        placeholder: "How does {{name}} resolve conflicts?",
        help: "Do {{pronouns-first}} quickly try to get a grip of the situation, make it worse, or just run away from it? If {{pronouns-first}} manage to get control of it, how do {{pronouns-first}} resolve it in a way that makes the majority of people agreeable? If {{pronouns-first}} intentionally make it worse, in what manner do {{pronouns-first}} do that? If {{pronouns-first}} run away, what do {{pronouns-first}} typically do immediately after? Do certain conflicts have different reactions or do {{pronouns-first}} react that way in most or all situations? What are {{name's}} personal thoughts towards {{pronouns-third}} conflict resolution skills? Do {{pronouns-first}} like {{pronouns-third}} conflict resolution skills or would {{pronouns-first}} rather improve on {{pronouns-second}}? Does {{pronouns-third}} conflict resolution skills affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} conflict resolution skills with others or would {{pronouns-first}} rather keep {{pronouns-second}} in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    mindset: {
        type: 1,
        name: "Mindset",
        category: "interactions",
        placeholder: "What is {{name's}} mindset?",
        help: "How do {{pronouns-first}} view {{pronouns-second}}self and what status do {{pronouns-first}} aim to uphold? How does {{pronouns-third}} mindset affect {{pronouns-third}} personality? What are {{name's}} personal thoughts towards {{pronouns-third}} mindset? Do {{pronouns-first}} like {{pronouns-third}} mindset or would {{pronouns-first}} rather change it? Does {{pronouns-third}} mindset affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} mindset with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    punctuality: {
        type: 1,
        name: "Punctuality",
        category: "interactions",
        placeholder: "What is {{name's}} punctuality?",
        help: "How well do {{pronouns-first}} manage time and keep {{pronouns-third}} scheduled deadlines? Are there any specific reasons for {{pronouns-second}} to break {{pronouns-third}} deadlines and schedules? What are {{name's}} personal thoughts towards {{pronouns-third}} punctuality? Do {{pronouns-first}} like {{pronouns-third}} punctuality or would {{pronouns-first}} rather improve on it? Does {{pronouns-third}} punctuality affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} punctuality with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    physical_contact: {
        type: 1,
        name: "Physical Contact",
        category: "interactions",
        placeholder: "Does {{name}} enjoy physical contact?",
        help: "Under what conditions do {{pronouns-first}} authorize physical contact? Are {{pronouns-first}} more comfortable with physical contact from certain types of people? Are there certain parts of {{pronouns-third}} body where {{pronouns-first}} are more comfortable with physical contact? What are {{name's}} personal thoughts towards {{pronouns-third}} physical contact comfortability? Do {{pronouns-first}} like {{pronouns-third}} physical contact comfortability or would {{pronouns-first}} rather improve on it? Does {{pronouns-third}} physical contact comfortability affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} physical contact comfortability with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    dressing_style: {
        type: 1,
        name: "Dressing Style",
        category: "interactions",
        placeholder: "How does {{name}} typically dress?",
        help: "Do {{pronouns-first}} have a specific style or era preference? Do {{pronouns-first}} enjoy wearing certain types of clothing more often than others? What are {{name's}} personal thoughts towards {{pronouns-third}} dressing style? Do {{pronouns-first}} like {{pronouns-third}} dressing style or would {{pronouns-first}} rather change it? Does {{pronouns-third}} dressing style affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} dressing style with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    accessories: {
        type: 1,
        name: "Accessories",
        category: "interactions",
        placeholder: "Does {{name}} wear accessories?",
        help: "If so, what kind of accessories (jewelry, devices, weapons, etc.) do {{pronouns-first}} wear? Is there any specific purpose behind why {{pronouns-first}} wear {{pronouns-second}}? Do {{pronouns-first}} have a specific style or era preference towards {{pronouns-third}} accessories? Do {{pronouns-first}} enjoy wearing certain types of accessories more often than others? What are {{name's}} personal thoughts towards {{pronouns-third}} accessories? Do {{pronouns-first}} like {{pronouns-third}} accessories or would {{pronouns-first}} rather change it? Does {{pronouns-third}} accessories affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} accessories with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    daily_routine: {
        type: 1,
        name: "Daily Routine",
        category: "interactions",
        placeholder: "What does {{name}} typically do during a daily routine?",
        help: "What is {{pronouns-third}} schedule like? What do {{pronouns-first}} do at specific time frames? Is {{pronouns-third}} routine consistent or change a bit every day? How long have {{pronouns-first}} had this routine going for? What are {{name's}} personal thoughts towards {{pronouns-third}} daily routine? Do {{pronouns-first}} like {{pronouns-third}} daily routine or would {{pronouns-first}} rather improve on it? Does {{pronouns-third}} daily routine affect {{pronouns-third}} life in any certain way? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} daily routine with others or would {{pronouns-first}} rather keep it in secrecy? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Reactions
    reactions_death: {
        type: 1,
        name: "Death Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with death?",
        help: "How does death in general affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of deaths and how does it compare to {{pronouns-third}} reaction to the death of a loved one, a friend, a pet, or even a stranger, or when either deals with death? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the news? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_pain: {
        type: 1,
        name: "Pain Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with pain?",
        help: "How does pain in general affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of pain (physical, mental, emotional) and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger deals with pain? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the fact {{pronouns-first}} are hurting? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_breakups: {
        type: 1,
        name: "Breakup Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with relationship breakups?",
        help: "How does breakups in general affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of breakups (friend, date, marriage, family) and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger deals with breakups? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the fact {{pronouns-third}} relationship broke? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_phobias: {
        type: 1,
        name: "Phobia Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with phobias?",
        help: "What phobias does {{name}} have? How does it affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of phobias and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger deals with phobias? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or {{pronouns-third}} phobias? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_trauma: {
        type: 1,
        name: "Trauma Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with traumas?",
        help: "What traumas does {{name}} have? How does it affects {{name}} and makes {{pronouns-second}} feel, and what are the triggers? Does {{name}} react differently to various types of traumas and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger deals with traumas? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or {{pronouns-third}} traumas and triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_news: {
        type: 1,
        name: "News Reactions",
        category: "reactions",
        placeholder: "How does {{name}} reacts and copes with news?",
        help: "How does recieving news in general affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of news (good or bad) and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger recieves news? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the news? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    reactions_additional: {
        type: 1,
        name: "Additional Reactions",
        category: "reactions",
        placeholder: "What else does {{name}} reacts and copes with?",
        help: "How does {{REACTION}} in general affects {{name}} and makes {{pronouns-second}} feel? Does {{name}} react differently to various types of {{REACTION}} and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger deals with {{REACTION}}? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or {{REACTION}}? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Emotional
    trigger_affectionate: {
        type: 4,
        name: "Affection Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel affectionate?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_amazed: {
        type: 4,
        name: "Amazement Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel amazed?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_angry: {
        type: 4,
        name: "Anger Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel angry?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_annoyed: {
        type: 4,
        name: "Annoyance Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel annoyed?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_anxiety: {
        type: 4,
        name: "Anxiety Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel anxious?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_ashamed: {
        type: 4,
        name: "Shame Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel ashamed?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_bored: {
        type: 4,
        name: "Boredom Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel bored?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_calm: {
        type: 4,
        name: "Calmness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel calm?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_comfortable: {
        type: 4,
        name: "Comfort Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel comfortable?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_confused: {
        type: 4,
        name: "Confusion Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel confused?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_curious: {
        type: 4,
        name: "Curiosity Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel curious?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_determined: {
        type: 4,
        name: "Determination Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel determined?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_disgusted: {
        type: 4,
        name: "Disgust Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel disgusted?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_embarrassed: {
        type: 4,
        name: "Embarrassment Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel embarrassed?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_excited: {
        type: 4,
        name: "Excitement Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel excited?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_frustrated: {
        type: 4,
        name: "Frustration Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel frustrated?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_guilty: {
        type: 4,
        name: "Guilt Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel guilty?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_happy: {
        type: 4,
        name: "Happiness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel happy?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_hopeful: {
        type: 4,
        name: "Hope Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel hopeful?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_hurt: {
        type: 4,
        name: "Hurt Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel hurt?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_insecure: {
        type: 4,
        name: "Insecurity Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel insecure?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_jealous: {
        type: 4,
        name: "Jealousy Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel jealous?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_lonely: {
        type: 4,
        name: "Loneliness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel lonely?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_lost: {
        type: 4,
        name: "Lost Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel lost?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_loved: {
        type: 4,
        name: "Love Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel loved?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_nervous: {
        type: 4,
        name: "Nervousness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel nervous?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_overwhelmed: {
        type: 4,
        name: "Overwhelm Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel overwhelmed?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_proud: {
        type: 4,
        name: "Pride Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel proud?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_relieved: {
        type: 4,
        name: "Relief Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel relieved?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_resentful: {
        type: 4,
        name: "Resentment Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel resentful?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_sad: {
        type: 4,
        name: "Sadness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel sad?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_scared: {
        type: 4,
        name: "Fear Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel scared?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_self_conscious: {
        type: 4,
        name: "Self-Consciousness Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel self-conscious?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_shocked: {
        type: 4,
        name: "Shock Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel shocked?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_stupid: {
        type: 4,
        name: "Feeling Stupid Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel stupid?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_surprised: {
        type: 4,
        name: "Surprise Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel surprised?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_trapped: {
        type: 4,
        name: "Trapped Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel trapped?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_uncomfortable: {
        type: 4,
        name: "Discomfort Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel uncomfortable?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_worried: {
        type: 4,
        name: "Worry Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel worried?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    trigger_additional: {
        type: 1,
        name: "Additional Triggers",
        category: "emotional",
        placeholder: "What makes {{name}} feel {{EMOTION}}?",
        help: "This thing, person, situation, or place should be a consistant emotional trigger. If its not, explain further and provide the conditions necessary for a trigger. How does {{name}} react to this emotion and how does it compare to {{pronouns-third}} reaction when a loved one, a friend, a pet, or even a stranger experiences it? Do {{pronouns-first}} wish {{pronouns-first}} could have a different reaction or way of coping? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} reaction, coping mechanisms, and/or the emotion at hand and its triggers? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },
    emotional_management: {
        type: 1,
        name: "Emotional Management",
        category: "emotional",
        placeholder: "How well does {{name}} manage {{pronouns-third}} emotions?",
        help: "Is {{name's}} emotionally strong and stable or weak and unstable?. How does {{name}} generally manage showing or hiding emotions and how does it compare when a loved one, a friend, a pet, or even a stranger shows emotions? Do {{pronouns-first}} wish {{pronouns-first}} could have different ways of management? Are {{pronouns-first}} comfortable with people knowing about {{pronouns-third}} emotions in general and {{pronouns-third}} overall management? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why) when needed."
    },

    // Health
    genetic_type: {
        type: 2,
        name: "Genetic Type",
        category: "health",
        placeholder: "What is {{name's}} genetic type?",
        help: "Genetic type describes {{name's}} overall DNA profile, including baseline genetic stability and the presence of any known mutations. This reflects inherited and developmental traits, not acquired conditions. A direct identifier can be provided and/or a broad type from the list below. \n\n<u>Normal</u>\nNo notable genetic deviations beyond normal variation.\n\n<u>Variant Genome</u>\nMinor genetic differences that may influence physical traits, metabolism, or resistance, without major functional changes.\n\n<u>Stable Mutation</u>\nA confirmed genetic mutation that alters biological traits in a consistent and non-degenerative way.\n\n<u>Unstable Mutation</u>\nA mutation that causes irregular or progressive changes, potentially affecting health or physiology over time.\n\n<u>Engineered / Altered DNA</u>\nGenetic structure modified intentionally through artificial or experimental means.\n\n<u>Unknown</u>\nGenetic profile has not been analyzed or is not fully understood."
    },
    blood_type: {
        type: 3,
        name: "Blood Type",
        category: "health",
        placeholder: "What is {{name's}} blood type?",
        help: "Blood type refers to {{name}} inherited blood group, determined by genetics. Blood types are classified by the ABO system and Rh factor.\n\n<u>O+</u>\n~35% of the population.\n\n<u>O-</u>\n~13% of the population.\n\n<u>A+</u>\n~30% of the population.\n\n<u>A-</u>\n~8% of the population.\n\n<u>B+</u>\n~8% of the population.\n\n<u>B-</u>\n~2% of the population.\n\n<u>AB+</u>\n~2% of the population.\n\n<u>AB-</u>\n~1% of the population."
    },
    gained_health_condition_date: {
        type: 3,
        name: "Gained Condition Date",
        category: "health",
        placeholder: "When did {{name}} get {{pronouns-third}} condition?",
        help: "The date of first signs or symptoms should be when {{name}} first felt something was different about {{pronouns-second}} or when {{pronouns-first}} learned {{pronouns-first}} had an condition. The date should be the date the condition was first found in {{pronouns-second}}, not the date of diagnosis. If possible, include the time of when this happened."
    },
    health_condition_status: {
        type: 3,
        name: "Condition Status",
        category: "health",
        placeholder: "What is {{name's}} condition status?",
        help: "<u>On-going</u>\nThe condition is on-going and is affecting {{name}} so long as the circumstances are met.\n\n<u>Recovered</u>\nThe condition has been recovered from and no longer an issue.\n\n<u>Chronic</u>\nThe condition is on-going, long-term or life-long, and isn't expected to cause death anytime soon or at all.\n\n<u>Terminal</u>\nThe condition is on-going, uncureable, and expected to lead to death shortly.\n\n<u>Sleeping</u>\nThe condition is on-going, but in hibernation and not currently affecting {{name}}."
    },
    lost_health_condition_date: {
        type: 3,
        name: "Recovered Condition Date",
        category: "health",
        placeholder: "When did {{name}} recover from {{pronouns-third}} condition?",
        help: "The date of last signs or lack of symptoms should be when {{name}} first felt something was different about {{pronouns-second}} or when {{pronouns-first}} learned {{pronouns-first}} lost {{pronouns-third}} condition. The date should be the date the condition was recovered from, not date of diagnosis. If possible, include the time of when this happened."
    },
    health_condition_name: {
        type: 3,
        name: "Condition Name",
        category: "health",
        placeholder: "What is {{name's}} condition name?",
        help: "Include the scientific name if necessary."
    },
    health_condition_category: {
        type: 3,
        name: "Condition Category",
        category: "health",
        placeholder: "What is {{name}}'s condition category?",
        help: "<u>Cardiovascular</u>\nConditions affecting the heart and blood vessels (e.g., hypertension, heart failure).\n\n<u>Respiratory</u>\nConditions affecting the lungs and airways (e.g., asthma, COPD).\n\n<u>Neurological</u>\nConditions affecting the brain, nerves, or spinal cord (e.g., epilepsy, stroke).\n\n<u>Musculoskeletal</u>\nConditions affecting bones, joints, or muscles (e.g., arthritis, fractures).\n\n<u>Gastrointestinal</u>\nConditions affecting the stomach, intestines, liver, or digestive system (e.g., gastritis, hepatitis).\n\n<u>Endocrine / Metabolic</u>\nConditions affecting hormones or metabolism (e.g., diabetes, thyroid disorders).\n\n<u>Renal / Urinary</u>\nConditions affecting kidneys or urinary system (e.g., chronic kidney disease).\n\n<u>Hematologic / Immunologic</u>\nConditions affecting blood or the immune system (e.g., anemia, lupus).\n\n<u>Dermatologic</u>\nConditions affecting skin, hair, or nails (e.g., psoriasis, eczema).\n\n<u>Psychiatric / Mental Health</u>\nConditions affecting mood, cognition, or behavior (e.g., depression, schizophrenia).\n\n<u>Infectious / Communicable</u>\nConditions caused by pathogens (e.g., influenza, tuberculosis).\n\n<u>Oncologic</u>\nConditions involving tumors or cancers (e.g., breast cancer, leukemia)."
    },
    health_condition_booster: {
        type: 3,
        name: "Condition Booster",
        category: "health",
        placeholder: "What is {{name's}} condition booster?",
        help: "A condition booster should be something that causes the condition to worsen. A condition booster could be a specific location, item, person, food, genetics, or someone else."
    },
    health_condition_source: {
        type: 2,
        name: "Condition Source",
        category: "health",
        placeholder: "What is {{name's}} condition source?",
        help: "A condition source is something that causes the condition to exist. A condition source could be a specific location, item, person, or genetics."
    },
    health_condition_weakness: {
        type: 3,
        name: "Condition Weakness",
        category: "health",
        placeholder: "What is {{name's}} condition weakness?",
        help: "A condition weakness should be something that causes the condition to improve. A condition weakness could be a specific location, item, person, food, genetics, or someone else."
    },
    health_condition_description: {
        type: 1,
        name: "Condition Description",
        category: "health",
        placeholder: "What is {{name's}} condition description?",
        help: "What does is the condition generally does? What is the condition stage and how does it affect {{name}}? Describe the condition booster and weakness. What causes them and what are {{pronouns-third}} effects on {{name}}? What about the condition source and condition status? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, and why)."
    },
    health_condition_diagnosis_event: {
        type: 1,
        name: "Condition Diagnosis Event",
        category: "health",
        placeholder: "What happened during {{name}} condition diagnosis?",
        help: "Describe the scene and location of where the diagnosis happened. What was {{name's}} state of mind at the moment of this event? Who or what diagnosed {{name}}? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    health_condition_prone: {
        type: 1,
        name: "Condition Prone",
        category: "health",
        placeholder: "What condition is {{name}} prone too?",
        help: "Describe the condition and why they are prone to it. It could be conistant or conditional such as being affected by a location, person, item, existing condition, or genetics. Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    health_condition_immune: {
        type: 1,
        name: "Condition Immune",
        category: "health",
        placeholder: "What condition is {{name}} immune too?",
        help: "Describe the condition and why they are prone to it. It could be conistant or conditional such as being affected by a location, person, item, existing condition, or genetics. Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
    personal_thoughts_health_condition: {
        type: 1,
        name: "Personal Thoughts",
        category: "health",
        placeholder: "What are {{name's}} personal thoughts towards {{pronouns-third}} condition?",
        help: "Do {{pronouns-first}} like {{pronouns-third}} condition and details or would {{pronouns-first}} rather have had a different one? Does {{pronouns-third}} condition or details affect {{pronouns-third}} life in any way? Do {{pronouns-third}} condition or details remind {{pronouns-second}} of anything? Are {{pronouns-first}} comfortable sharing {{pronouns-third}} condition or details with others or would {{pronouns-first}} rather keep {{pronouns-second}} secret? Apart from what {{pronouns-first}} are meant to do, does {{name}} use {{pronouns-third}} condition to help in everyday life? Is {{name's}} even aware {{pronouns-first}} has health issues or know of the effects? Try to be the most descriptive possible and remember the usage of the five Ws (who, what, when, where, why)."
    },
}
