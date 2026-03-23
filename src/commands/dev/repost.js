const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');
const { messageReturn, download, sendFile } = require('../../utils/discord.js');

module.exports = {
    name: 'repost',
    aliases: ['rp'],
    description: 'Developer repost command.',
    data: new SlashCommandBuilder()
        .setName('repost')
        .setDescription('Developer repost command.'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        
        let fileURL = 'https://twitter.com/i/videos/tweet/1524844800574378003';
        let fileType = 'mp4';
        let fileDir = './files/buffer/testBuffer.' + fileType;

        await download(fileURL, fileDir);
        await sendFile(fileURL, fileDir);
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        return await this.execute(interaction, []);
    }
};
