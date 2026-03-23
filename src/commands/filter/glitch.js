const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize } = require('../../utils/canvas.js');
const SizeOf = require('image-size');
const glitch = require('glitch-canvas');

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
        let buffer = canvas.toBuffer();
        let glitchedBuffer = await glitch({ 
            amount: 0, 
            seed: Math.floor(Math.random() * 101), 
            iterations: Math.floor(Math.random() * 16 + 10), 
            quality: 60 
        }).fromBuffer(buffer).toBuffer();
        
        return await messageReturn({ input: glitchedBuffer, type: 'attach', filename: 'glitch.png' });
    }
};
