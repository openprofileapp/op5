import { Client, GatewayIntentBits } from "discord.js";

import { 
    Logger,
    Snowflake,
    WebClient
} from "kage-library";

import { config } from "../../../app.config.js"
import DiscordMessage from "../../_common/discord/classes/discordMessage.js";

export const log = new Logger({
    path: "/logs/discord",
    useNerdFonts: config.useNerdFonts,
    saveAllToFile: config.debug.logger.api
});

export const snowflake = new Snowflake(config.generation.epoch, 3);

export const wc = new WebClient({
    crawler: config.crawler,
    useSecureSSL: config.isProduction
});

export const discord = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        // GatewayIntentBits.GuildMembers, 
        // GatewayIntentBits.GuildMessages, 
        // GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

export const discordMessage = new DiscordMessage(
    discord, 
    log,
    config.integrations.discord.guild.id
);
