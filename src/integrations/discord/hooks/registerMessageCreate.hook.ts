import { discord } from "../instances.js";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default function registerMessageCreate() {
    discord.on("messageCreate", async (message) => {
        // Call something here
    });
}
