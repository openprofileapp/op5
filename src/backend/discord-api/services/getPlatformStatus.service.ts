import { formatNumber } from "kage-library";
import { config } from "../../../../app.config.js";
import getEnv from "../../../_common/helpers/getEnv.js";
import { GetInteractionsResult } from "../../../_common/types/interaction.type.js";
import { discord, discordMessage, snowflake, wc } from "../instances.js";
import { DateTime } from "luxon";

type HealthType = {
    [key: string]: {
        [key: string]: {
            url: string
            ok: boolean
            latency: number
        }
    }
}

type UgcType = {
    userCount: number
    publishedCharacterCount: number
    interactions: GetInteractionsResult[]
}

export default async function getPlatformStatusService() {
    if (config.isNightly && config.isProduction) return;

    const health: HealthType = await wc.callAPI(
        `https://${config.domains.status}/check`,
        { auth: `ApiSecret ${getEnv("API_SECRET")}` }
    );

    const auth: { onlineUsers: number } = await wc.callAPI(
        `https://${config.domains.auth}/check`,
        { auth: `ApiSecret ${getEnv("API_SECRET")}` }
    );

    const ugc: UgcType = await wc.callAPI(
        `https://${config.domains.api}/v3/check`,
        { auth: `ApiSecret ${getEnv("API_SECRET")}` }
    );

    const getNetworkIcon = (latency: number) => {
        if (latency < 100) return "<:op_icon_network_full:1557799767877357608>";
        if (latency < 200) return "<:op_icon_network_strong:1557799788420800642>";
        if (latency < 300) return "<:op_icon_network_fair:1557799808121700454>";
        return "<:op_icon_network_weak:1557799836647030844>";
    };

    const getServerName = (url: string) => {
        const d = config.domains;

        switch (url
            .replaceAll("https://", "")
            .replaceAll("nightly.", "")
            .replaceAll("/health", "")
        ) {
            case d.main.replaceAll("nightly.", ""): return "Database";
            case d.studio.replaceAll("nightly.", ""): return "Studio";
            case d.auth.replaceAll("nightly.", ""): return "Authentication";
            case d.api.replaceAll("nightly.", ""): return "API";
            case d.cdn.replaceAll("nightly.", ""): return "CDN";
            case d.support.replaceAll("nightly.", ""): return "Support Portal";
            case d.console.replaceAll("nightly.", ""): return "Console";
            case d.gateway.replaceAll("nightly.", ""): return "Gateway";
            case d.shortlink.replaceAll("nightly.", ""): return "Shortlink";
            case d.discord_api.replaceAll("nightly.", ""): return "Discord Notifications";
            default: return "Unknown";
        }
    };

    const payload = {
        flags: 32768,
        components: [
            {
                type: 17,
                components: [
                    ...(!config.isProduction ? [
                        {
                            type: 10,
                            content: `-# This was sent from a nightly build using backup data.`
                        },
                        {
                            type: 14,
                            spacing: 1
                        }
                    ] : []),
                    {
                        type: 10,
                        content: `## OpenProfile \`${config.metadata.version.full}\``
                    },
                    {
                        type: 10,
                        content: `<:op_icon_users:1557815247988068393> **${auth.onlineUsers}/${config.limits.softConnectedSessions}** Online Users`
                    },
                    {
                        type: 14,
                        spacing: 1
                    },
                    {
                        type: 10,
                        content: Object.values(health.stable)
                            .map(server =>
                                `${server.ok 
                                    ? getNetworkIcon(server.latency) 
                                    : "<:op_icon_network_none:1557799856305610833>"
                                }` +
                                " " +
                                `${getServerName(server.url)}` +
                                " " +
                                `\`${server.ok ? `${server.latency}ms` : "OFFLINE"}\``
                            )
                            .join("\n")
                    },
                    {
                        type: 14,
                        spacing: 1
                    },
                    {
                        type: 10,
                        content: Object.values(health.nightly)
                            .map(server =>
                                `${server.ok 
                                    ? getNetworkIcon(server.latency) 
                                    : "<:op_icon_network_none:1557799856305610833>"
                                }` +
                                " " +
                                `Nightly ${getServerName(server.url)}` + 
                                " " +
                                `\`${server.ok ? `${server.latency}ms` : "OFFLINE"}\``
                            )
                            .join("\n")
                    },
                    {
                        type: 14,
                        spacing: 1
                    },
                    {
                        type: 1,
                        components: [
                            {
                                style: 2,
                                type: 2,
                                label: `${formatNumber(ugc.userCount).string} Registered Users`,
                                flow: {
                                    actions: []
                                },
                                custom_id: snowflake.gen()
                            },
                            {
                                style: 2,
                                type: 2,
                                label: `${formatNumber(ugc.publishedCharacterCount).string} Published Characters`,
                                flow: {
                                    actions: []
                                },
                                custom_id: snowflake.gen()
                            }
                        ]
                    },
                    {
                        type: 1,
                        components: [
                            ...Object.entries(ugc.interactions).map(([name, interaction]) => ({
                                style: 2,
                                type: 2,
                                label: `${formatNumber(interaction.count).string} ${name.charAt(0).toUpperCase()}${name.slice(1)}`,
                                flow: {
                                    actions: []
                                },
                                custom_id: snowflake.gen()
                            }))
                        ]
                    },
                    {
                        type: 14,
                        spacing: 1
                    },
                    {
                        type: 10,
                        content: `-# Last refreshed <t:${Math.floor(DateTime.now().toSeconds())}:R>`
                    }
                ]
            }
        ]
    }

    const channelId = config.isProduction 
        ? config.integrations.discord.channels.status 
        : config.integrations.discord.channels.commandsDev

    const channel = await discord.channels.fetch(channelId);

    if (!channel?.isTextBased()) {
        throw new Error(`Channel ${channelId} is not a text-based channel`);
    }

    const messages = await channel.messages.fetch(
        { limit: 100 }
    );

    const latestMessage = messages.first();

    if (latestMessage && latestMessage?.author?.id === discord?.user?.id) {
        await latestMessage.edit(payload);
        return;
    }

    const existingStatusMessage = messages.find(
        message => message.author.id === discord?.user?.id
    );

    if (existingStatusMessage) {
        await existingStatusMessage.delete();
    }


    await discordMessage.send(channelId, payload);
}
