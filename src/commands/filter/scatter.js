const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, scaleImage } = require('../../utils/canvas.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'scatter',
    description: 'Randomizes the colours in an image.',
    data: new SlashCommandBuilder()
        .setName('scatter')
        .setDescription('Randomizes the colours in an image.'),
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

        if (imageSize.width > 400 || imageSize.height > 400) {
            await scaleImage([imageSize.width, imageSize.height], 'down', 400);
            let dims = globalData.scaledDims;
            await canvasInitialize(dims, fileDir);
        }
        else {
            await canvasInitialize([imageSize.width, imageSize.height], fileDir);
        }

        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvas.width;
        let canvasHeight = canvas.height;

        let pixelData = context.getImageData(0, 0, canvasWidth, canvasHeight);
        let pixelDataLength = pixelData.data.length;

        for (var i = 0; i < pixelDataLength; i++) {
            pixelData.data[i] = Math.round(pixelData.data[i] / 5) * 5;
        }

        let colours = [`${pixelData.data[0]} ${pixelData.data[1]} ${pixelData.data[2]}`];
        for (var i = 0; i < pixelDataLength; i += 4) {
            let rgb = `${pixelData.data[i]} ${pixelData.data[i + 1]} ${pixelData.data[i + 2]}`;
            if (colours.includes(rgb)) { continue; }
            colours.push(rgb);
        }

        let newColours = [];
        for (var i = 0; i < colours.length; i++) {
            let randRGB = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
            newColours.push(randRGB);
        }

        for (var i = 0; i < pixelDataLength; i += 4) {
            let rgb = `${pixelData.data[i]} ${pixelData.data[i + 1]} ${pixelData.data[i + 2]}`;
            let index = colours.indexOf(rgb);
            if (index != -1) {
                let newColour = newColours[index];
                pixelData.data[i] = newColour[0];
                pixelData.data[i + 1] = newColour[1];
                pixelData.data[i + 2] = newColour[2];
            }
        }

        context.putImageData(pixelData, 0, 0);
        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: 'scatter.png' });
    }
};
