const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');

module.exports = {
    name: 'kill',
    description: 'Developer kill command.',
    data: new SlashCommandBuilder()
        .setName('kill')
        .setDescription('Developer kill command.'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        console.log('Kill command received. Shutting down...');
        process.exit(0);
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        await interaction.editReply('Shutting down...');
        process.exit(0);
    }
};
