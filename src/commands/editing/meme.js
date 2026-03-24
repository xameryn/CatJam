const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, imageToCanvas, scaleImage, drawImage, textHandler, drawText } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'meme',
    description: 'Classic top text, bottom text, and middle text.',
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription('Classic top text, bottom text, and middle text.')
        .addStringOption(option => option.setName('top').setDescription('Top text').setRequired(false))
        .addStringOption(option => option.setName('bottom').setDescription('Bottom text').setRequired(false))
        .addStringOption(option => option.setName('middle').setDescription('Middle text').setRequired(false)),
    async execute(message, args) {
        await textArgs(3);
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let top = interaction.options.getString('top');
        let bottom = interaction.options.getString('bottom');
        let middle = interaction.options.getString('middle');
        
        let inputs = [];
        if (top) inputs.push(top);
        if (middle) inputs.push(middle);
        if (bottom) inputs.push(bottom);
        
        // Match legacy logic where 2 inputs mean top and bottom
        if (top && bottom && !middle) {
             globalData.textInputs = [top, bottom];
        } else {
             globalData.textInputs = inputs;
        }

        globalData.argsText = [];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = 'meme';
        let inputs = globalData.textInputs;

        let fileDir = `./files/buffer/${command}Buffer.png`;
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) {
            return await messageReturn({ input: "No file found :(", type: 'text' });
        }
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        let imageDims = [imageSize.width, imageSize.height];

        if (imageSize.height > 1500 || imageSize.width > 1500) {
            await scaleImage(imageDims, 'down', 1500);
            let scaledDims = globalData.scaledDims;
            imageSize.width = scaledDims[0];
            imageSize.height = scaledDims[1];
        }
        if (imageSize.height < 100 || imageSize.width < 100) {
            await scaleImage(imageDims, 'up', 100);
            let scaledDims = globalData.scaledDims;
            imageSize.width = scaledDims[0];
            imageSize.height = scaledDims[1];
        }
        imageDims = [imageSize.width, imageSize.height];

        await imageToCanvas({ imageDims: imageDims, widestRatio: 3, tallestRatio: 3, wideDims: [imageSize.width, (imageSize.width / 3)], tallDims: [(imageSize.height / 3), imageSize.height] });
        let canvasDims = globalData.imgCanvasDims;

        await canvasInitialize(canvasDims, 'png');
        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvasDims[0];
        let canvasHeight = canvasDims[1];

        await scaleImage(imageDims, 'fit', canvasDims);
        await drawImage(fileDir);
        context.fillStyle = '#ffffff';
        context.strokeStyle = '#000000';
        context.lineJoin = 'round';

        let max;
        let memeInput;
        if (inputs.length <= 1) {
            max = canvasHeight / 4;
            if (inputs[0] != '' && inputs[0] != undefined) {
                memeInput = [inputs[0], undefined, undefined];
            }
            else {
                memeInput = ['top text', undefined, 'bottom text'];
            }
        }
        else if (inputs.length == 2) {
            max = canvasHeight / 4;
            memeInput = [inputs[0], undefined, inputs[1]];
        }
        else {
            max = canvasHeight / 5;
            memeInput = inputs;
        }

        if (memeInput[0] !== undefined) {
            await textHandler({ text: memeInput[0].toUpperCase(), font: 'Impact', maxSize: max, maxWidth: (0.95 * canvasWidth), maxHeight: max, baseX: (canvasWidth / 2), baseY: (0.01 * canvasHeight), yAlign: 'top' });
            context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
            await drawText([0, 0], 1, true);
        }
        if (memeInput[1] !== undefined) {
            await textHandler({ text: memeInput[1].toUpperCase(), font: 'Impact', maxSize: max, maxWidth: (0.95 * canvasWidth), maxHeight: max, baseX: (canvasWidth / 2), baseY: (canvasHeight / 2) });
            context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
            await drawText([0, 0], 1, true);
        }
        if (memeInput[2] !== undefined) {
            await textHandler({ text: memeInput[2].toUpperCase(), font: 'Impact', maxSize: max, maxWidth: (0.95 * canvasWidth), maxHeight: max, baseX: (canvasWidth / 2), baseY: (0.99 * canvasHeight), yAlign: 'bottom' });
            context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
            await drawText([0, 0], 1, true);
        }

        return await messageReturn({ input: await canvas.toBuffer(), type: 'attach', filename: `meme.png`, transformative: false });
    }
};
