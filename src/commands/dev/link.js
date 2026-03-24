const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');
const { generalScraper } = require('../../utils/discord.js');
const { globalData } = require('../../state.js');

module.exports = {
    name: 'link',
    aliases: ['lk'],
    description: 'Developer link scraper test command.',
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('Developer link scraper test command.'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        let link = await generalScraper('file');
        console.log('$link link: ' + link);
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        globalData.message = interaction;
        let link = await generalScraper('file');
        await interaction.editReply(`Link found: ${link || 'none'}`);
    }
};
