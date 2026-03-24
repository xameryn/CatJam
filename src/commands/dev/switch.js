const { SlashCommandBuilder } = require('discord.js');
const SizeOf = require('image-size');
const { DEV_ID_ARRAY } = require('../../config.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize } = require('../../utils/canvas.js');
const { globalData } = require('../../state.js');

module.exports = {
    name: 'switch',
    description: 'Developer switch command (image manipulation test).',
    data: new SlashCommandBuilder()
        .setName('switch')
        .setDescription('Developer switch command (image manipulation test).'),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        
        let fileDir = './files/buffer/switchBuffer.png';
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) return await messageReturn({ input: "No file found :(", type: 'text' });
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        
        let canvasRes = [imageSize.width * 0.1, imageSize.height * 0.1];
        await canvasInitialize(canvasRes, fileDir);
        
        canvasRes = [imageSize.width, imageSize.height];
        await canvasInitialize(canvasRes, fileDir);
        
        return await messageReturn({ input: await globalData.canvas.toBuffer(), type: 'attach', filename: 'switch.png' });
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        globalData.message = interaction;
        return await this.execute(interaction, []);
    }
};
