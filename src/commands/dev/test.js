const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');

module.exports = {
    name: 'test',
    aliases: ['t'],
    description: 'Developer test command.',
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('Developer test command.'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        // Test logic here
        console.log('Test command executed');
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        await interaction.editReply('Test command executed (Slash)');
    }
};
