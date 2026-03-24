const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, glitchImage, drawImage } = require('../../utils/canvas.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'glitch',
    description: 'Glitches your image.',
    aliases: ['corrupt'],
    data: new SlashCommandBuilder()
        .setName('glitch')
        .setDescription('Glitches your image.'),
    async execute(message, args) {
        return await this.run(message);
    },
    async executeSlash(interaction) {
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let fileDir = './files/buffer/filterBuffer.png';
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) {
            return await messageReturn({ input: "No file found :(", type: 'text' });
        }
        
        try {
            await download(fileURL, fileDir);
        } catch (e) {
            return await messageReturn({ input: `Download failed: ${e.message}`, type: 'text' });
        }
        
        let imageSize;
        try {
            imageSize = await SizeOf(fileDir);
        } catch (e) {
            return await messageReturn({ input: "Could not determine image size. The file may be corrupted.", type: 'text' });
        }
        
        await canvasInitialize([imageSize.width, imageSize.height], 'png');
        await drawImage(fileDir, [0, 0], [0, 0], [imageSize.width, imageSize.height]);
        
        let canvas = globalData.canvas;
        let glitchedBuffer;
        
        try {
            glitchedBuffer = await glitchImage(canvas, { 
                seed: Math.floor(Math.random() * 101), 
                iterations: Math.floor(Math.random() * 16 + 10), 
                quality: 60 
            });
        } catch (e) {
            return await messageReturn({ input: "Failed to glitch image.", type: 'text' });
        }
        
        return await messageReturn({ input: glitchedBuffer, type: 'attach', filename: 'glitch.png' });
    }
};