OpenProfile is a free original character database and collaboration platform made by and for writers. This is its official Node package for displaying  profiles on external applications. Currently under development! Public bots are not yet available.

https://openprofile.app


```js
// Import module
import op5 from "openprofile"

// Login to OpenProfile (using bot)
const client = await op5.login(YOUR_CLIENT_ID, YOUR_CLIENT_TOKEN);
console.log("Logged in with", client.bot.name);

// Get an authorized profile
const profile = await client.profiles.get(YOUR_PROFILE_ID, { read: true });
if (profile) {
    console.log(`Profile is ${profile.display_name || profile.id}`);
} else {
    console.error(`Profile is not authorized or not found`)
}

// Values are only provided when read is true
if (profile?.values) {
    console.log(`${profile.display_name || profile.id}'s birthdate is ${profile.values("birth_date").text}`);
} else {
    console.error(`Read must be true to access values: await client.profiles.get("${profile.id}", { read: true }) `)
}
```
