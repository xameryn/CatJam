const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, glitchImage } = require('../../utils/canvas.js');
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
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        
        await canvasInitialize([imageSize.width, imageSize.height], fileDir);
        
        let canvas = globalData.canvas;
        
        let glitchedBuffer = await glitchImage(canvas, { 
            seed: Math.floor(Math.random() * 101), 
            iterations: Math.floor(Math.random() * 16 + 10), 
            quality: 60 
        });
        
        return await messageReturn({ input: glitchedBuffer, type: 'attach', filename: 'glitch.png' });
    }
};
