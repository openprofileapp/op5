import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from "discord.js";

import syncRoles from "../helpers/syncRoles.js";

export default {
    data: new SlashCommandBuilder()
        .setName("sync")
        .setDescription("Syncs premium role")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    ,

    async execute(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply();

        await interaction.editReply({
            flags: 32768,
            allowedMentions: { parse: [], users: [], roles: [] },
            "components": [
                {
                "type": 17,
                "components": [
                        {
                            "type": 10,
                            "content": "Syncing all premium roles...\n\n-# This may take a few minutes."
                        }
                    ]
                }
            ]
        })

        await syncRoles();

        await interaction.followUp({
            flags: 32768,
            allowedMentions: { parse: [], users: [], roles: [] },
            "components": [
                {
                "type": 17,
                "components": [
                        {
                            "type": 10,
                            "content": "Finished syncing premium role!"
                        }
                    ]
                }
            ]
        });
    }
};
