const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, imageToCanvas, scaleImage, drawImage, textHandler, drawText } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'poster',
    description: 'Framed like an early 2000s motivational poster.',
    aliases: ['canvas'],
    data: new SlashCommandBuilder()
        .setName('poster')
        .setDescription('Framed like an early 2000s motivational poster.')
        .addStringOption(option => option.setName('text1').setDescription('Top text').setRequired(false))
        .addStringOption(option => option.setName('text2').setDescription('Bottom text').setRequired(false)),
    async execute(message, args) {
        await textArgs(2);
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let text1 = interaction.options.getString('text1') || '';
        let text2 = interaction.options.getString('text2') || '';
        globalData.textInputs = [text1, text2];
        globalData.argsText = [];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = 'poster';
        let bgOption = globalData.userData.posterBG;
        let inputs = globalData.textInputs;
        let argsText = globalData.argsText;

        if (argsText.includes('black') || (!argsText.includes('white') && !argsText.includes('png') && bgOption == 'black')) {
            bgOption = 'black';
        }
        else if (argsText.includes('white') || (!argsText.includes('png') && bgOption == 'white')) {
            bgOption = 'white';
        }
        else {
            bgOption = 'png';
        }

        let fileDir = `./files/buffer/${command}Buffer.png`;
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) {
            return await messageReturn({ input: "No file found :(", type: 'text' });
        }
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        let imageDims = [imageSize.width, imageSize.height];

        await imageToCanvas({ imageDims: imageDims, widestRatio: 2, tallestRatio: 1.5, wideDims: [1200, 600], tallDims: [400, 600], scaleLength: 600, scaleAxis: 'height' });
        let canvasDims = globalData.imgCanvasDims;

        await canvasInitialize(canvasDims, bgOption);
        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvasDims[0];
        let canvasHeight = canvasDims[1];

        let centerX = (canvasWidth + 200) / 2;
        if (inputs[1] == undefined) {
            inputs[1] = '';
            if (globalData.userData.posterTXT == 'small') {
                inputs[1] = inputs[0];
                inputs[0] = '';
            }
        }
        if (globalData.userData.posterCAPS == true) {
            inputs[0] = inputs[0].toUpperCase();
        }
        let smallSize = 40;
        if (inputs[0] == '' && inputs[1] != '') {
            smallSize = 50;
        }

        await textHandler({ text: inputs[0], font: 'Times New Roman', maxSize: 150, maxWidth: (canvasWidth + 100), maxHeight: 100, baseX: centerX, baseY: 711 + 50, yAlign: 'top' });
        let size1 = globalData.text1.size;
        let textHeight1 = globalData.text1.height;
        await textHandler({ text: inputs[1], font: 'Arial', maxSize: smallSize, maxWidth: (canvasWidth + 100), maxHeight: 3, byLine: true, baseX: centerX, baseY: (711 + 50 + textHeight1 + 30), yAlign: 'top' });
        let size2 = globalData.text2.size;
        let textHeight2 = globalData.text2.height;

        let padding = 89;
        let yOffset2 = 0;
        if (inputs[0] != '' && inputs[1] == '') {
            padding = (50 * 2) + textHeight1;
        }
        else if (inputs[0] == '' && inputs[1] != '') {
            yOffset2 -= 30;
            padding = (50 * 2) + textHeight2;
        }
        else if (inputs[0] != '' && inputs[1] != '') {
            padding = (50 * 2 + 30) + textHeight1 + textHeight2;
        }

        await canvasInitialize([(canvasWidth + 200), (canvasHeight + 111 + padding)], bgOption);
        canvas = globalData.canvas;
        context = globalData.context;
        await scaleImage(imageDims, 'fit', canvasDims);
        await drawImage(fileDir, [100, 100]);

        context.fillStyle = '#000000';
        context.fillRect(0, 0, (canvasWidth + 200), 100);
        context.fillRect(0, 0, 100, (canvasHeight + 111 + padding));
        context.fillRect((canvasWidth + 100), 0, 100, (canvasHeight + 111 + padding));
        context.fillRect(0, (canvasHeight + 100), (canvasWidth + 200), (11 + padding));
        context.strokeStyle = '#ffffff';
        context.lineWidth = 2;
        context.strokeRect(100 - 10, 100 - 10, canvasWidth + 20, canvasHeight + 20);

        context.fillStyle = '#ffffff';
        context.font = `${size1}px Times New Roman`;
        await drawText();
        context.font = `${size2}px Arial`;
        await drawText([0, yOffset2], 2);

        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: `poster.png`, transformative: false });
    }
};
