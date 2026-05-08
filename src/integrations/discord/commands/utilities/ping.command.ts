import { SlashCommandBuilder, ChatInputCommandInteraction, ButtonInteraction, PermissionFlagsBits } from "discord.js";
import { Stopwatch } from "@sapphire/stopwatch";

import { config } from "../../../../../app.config.js";

const before = {
    flags: 32768,
    allowedMentions: { parse: [], users: [], roles: [] },
    components: [
        {
            type: 17,
            components: [
                {
                    type: 10,
                    content: `Pinging...`
                }
            ]
        }
    ]
}

function after(sw: Stopwatch) {
    return {
        flags: 32768,
        allowedMentions: { parse: [], users: [], roles: [] },
        components: [
            {
                type: 17,
                components: [
                    {
                        type: 10,
                        content: `${sw.toString()}`
                    },
                    {
                    "type": 1,
                    "components": [
                            {
                                "style": 2,
                                "type": 2,
                                "label": "Ping",
                                "custom_id": "ping"
                            }
                        ]
                    }
                ]
            }
        ]
    }
}

export default {
    enabled: config.integrations.discord.modules.utilities,

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Displays the latency")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    ,

    async execute(interaction: ChatInputCommandInteraction) {
        const sw = new Stopwatch();
        sw.start();

        await interaction.reply(before);

        sw.stop();

        await interaction.editReply(after(sw));
    },

    async button(interaction: ButtonInteraction) {
        switch (interaction.customId) {

            case "ping": {
                const sw = new Stopwatch();

                await interaction.update(before);

                sw.stop();

                await interaction.editReply(after(sw));
                break;
            }
        }
    }
};