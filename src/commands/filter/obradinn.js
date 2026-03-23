const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize } = require('../../utils/canvas.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'obradinn',
    description: 'Who was this? How did they die?',
    aliases: ['obra', 'dinn'],
    data: new SlashCommandBuilder()
        .setName('obradinn')
        .setDescription('Who was this? How did they die?'),
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

        await canvasInitialize([(250 * imageSize.width / imageSize.height), 250], fileDir);
        
        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        let pixelData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        let pixelDataLength = pixelData.data.length;

        let lumR = [];
        let lumG = [];
        let lumB = [];
        for (var i = 0; i < 256; i++) {
            lumR[i] = i * 0.299;
            lumG[i] = i * 0.587;
            lumB[i] = i * 0.114;
        }

        for (var i = 0; i < pixelDataLength; i += 4) {
            pixelData.data[i] = Math.floor(lumR[pixelData.data[i]] + lumG[pixelData.data[i + 1]] + lumB[pixelData.data[i + 2]]);
        }

        let width = pixelData.width;
        let newPixel, err;
        for (var currentPixel = 0; currentPixel < pixelDataLength; currentPixel += 4) {
            newPixel = pixelData.data[currentPixel] < 200 ? 50 : 230;
            err = Math.floor((pixelData.data[currentPixel] - newPixel) / 8);
            pixelData.data[currentPixel] = newPixel;

            if (currentPixel + 4 < pixelDataLength) pixelData.data[currentPixel + 4] += err;
            if (currentPixel + 8 < pixelDataLength) pixelData.data[currentPixel + 8] += err;
            if (currentPixel + 4 * width - 4 < pixelDataLength) pixelData.data[currentPixel + 4 * width - 4] += err;
            if (currentPixel + 4 * width < pixelDataLength) pixelData.data[currentPixel + 4 * width] += err;
            if (currentPixel + 4 * width + 4 < pixelDataLength) pixelData.data[currentPixel + 4 * width + 4] += err;
            if (currentPixel + 8 * width < pixelDataLength) pixelData.data[currentPixel + 8 * width] += err;

            if (newPixel == 50) {
                pixelData.data[currentPixel + 1] = pixelData.data[currentPixel];
                pixelData.data[currentPixel + 2] = pixelData.data[currentPixel] / 2;
            }
            else {
                pixelData.data[currentPixel + 1] = pixelData.data[currentPixel] * 1.1;
                pixelData.data[currentPixel + 2] = pixelData.data[currentPixel] * 1.1;
            }
        }
        context.putImageData(pixelData, 0, 0);
        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: 'obraDinn.png' });
    }
};
