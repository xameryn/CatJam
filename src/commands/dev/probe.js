const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');
const { infoScraper } = require('../../utils/discord.js');
const { globalData } = require('../../state.js');

module.exports = {
    name: 'probe',
    aliases: ['prb'],
    description: 'Developer probe command.',
    data: new SlashCommandBuilder()
        .setName('probe')
        .setDescription('Developer probe command.'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        await infoScraper();
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        globalData.message = interaction;
        await infoScraper();
        await interaction.editReply("Probed (check console)");
    }
};
