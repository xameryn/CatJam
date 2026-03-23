const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, sendFile, download } = require('../../utils/discord.js');
const { typeCheck } = require('../../utils/file.js');

module.exports = {
    name: 'starpic',
    aliases: ['sp'],
    description: 'Reposts an image with a star reaction.',
    data: new SlashCommandBuilder()
        .setName('starpic')
        .setDescription('Reposts an image with a star reaction.'),
    async execute(message, args) {
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) return await messageReturn({ input: "No file found :(", type: 'text' });
        
        let fileType = await typeCheck(fileURL);
        if (fileType == undefined) return await messageReturn({ input: "Bad embed :(", type: 'text' });
        
        let fileDir = './files/buffer/starBuffer.' + fileType;
        await download(fileURL, fileDir);
        await message.delete().catch(() => null);
        
        const starMessage = await sendFile(fileURL, fileDir);
        await starMessage.react("⭐");
    },
    async executeSlash(interaction) {
        globalData.message = interaction;
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) return await interaction.editReply("No file found :(");
        
        let fileType = await typeCheck(fileURL);
        if (fileType == undefined) return await interaction.editReply("Bad embed :(");
        
        let fileDir = './files/buffer/starBuffer.' + fileType;
        await download(fileURL, fileDir);
        
        const starMessage = await sendFile(fileURL, fileDir);
        await starMessage.react("⭐");
        await interaction.editReply("Image reposted!");
    }
};
