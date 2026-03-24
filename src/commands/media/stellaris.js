const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');
const { STELLARIS_ARRAY } = require('../../config.js');

module.exports = {
    name: 'stellaris',
    description: "It's time to play Stellaris.",
    data: new SlashCommandBuilder()
        .setName('stellaris')
        .setDescription("It's time to play Stellaris.")
        .addIntegerOption(option =>
            option.setName('variant')
                .setDescription('Variant of the gif (1-12)')
                .setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let link;
        if (input > 0 && input < 13) {
            link = STELLARIS_ARRAY[input];
        }
        else {
            link = STELLARIS_ARRAY[0];
        }
        return await messageReturn({ input: link, type: 'link', filename: 'stellaris.gif' });
    },
    async executeSlash(interaction) {
        let variant = interaction.options.getInteger('variant');
        let link;
        if (variant > 0 && variant < 13) {
            link = STELLARIS_ARRAY[variant];
        }
        else {
            link = STELLARIS_ARRAY[0];
        }
        globalData.message = interaction;
        return await messageReturn({ input: link, type: 'link', filename: 'stellaris.gif' });
    }
};
