const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, imageToCanvas, scaleImage, drawImage, textHandler, drawText } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'stuff',
    description: 'He is stuff.',
    aliases: ['stuffimage', 'stuffimg', 'stuffi'],
    data: new SlashCommandBuilder()
        .setName('stuff')
        .setDescription('He is stuff.')
        .addStringOption(option => option.setName('text').setDescription('Text input').setRequired(false))
        .addBooleanOption(option => option.setName('image').setDescription('Use as stuffimage?').setRequired(false)),
    async execute(message, args) {
        await textArgs(1);
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let text = interaction.options.getString('text') || '';
        let isImage = interaction.options.getBoolean('image') || false;
        globalData.textInputs = [text];
        globalData.argsText = [];
        if (isImage) {
            globalData.trueCommand = 'stuffimage';
        } else {
            globalData.trueCommand = 'stuff';
        }
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = globalData.trueCommand;
        let inputs = globalData.textInputs;

        let imageDims = [0, 0];
        let fileDir = `./files/buffer/${command}Buffer.png`;

        if (command == 'stuffimage') {
            let fileURL = await generalScraper('image');
            if (fileURL == undefined) {
                return await messageReturn({ input: "No file found :(", type: 'text' });
            }
            await download(fileURL, fileDir);
            let imageSize = await SizeOf(fileDir);
            imageDims = [imageSize.width, imageSize.height];
        }

        if (inputs[0] == '' && messageOrInteraction.reference != undefined) {
            let replyMessage = await messageOrInteraction.channel.messages.fetch(messageOrInteraction.reference.messageId);
            inputs[0] = replyMessage.content;
        }

        let canvasDims;
        let bgOption = './files/templates/eggshellBox.jpg';

        if (command == 'stuffimage') {
            var stuffWidth = (1533 - 920) / (3 - 1) * imageDims[0] / imageDims[1] + 613.5;
            if (stuffWidth > 1533) stuffWidth = 1533;
            else if (stuffWidth < 920) stuffWidth = 920;

            await imageToCanvas({ imageDims: imageDims, widestRatio: 3, tallestRatio: 1, wideDims: [1533, 511], tallDims: [920, 920], scaleLength: stuffWidth, scaleAxis: 'width' });
            globalData.imgCanvasDims[1] += 511;
            canvasDims = globalData.imgCanvasDims;
        } else {
            canvasDims = [1226, 511];
        }

        await canvasInitialize(canvasDims, bgOption);
        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvasDims[0];
        let canvasHeight = canvasDims[1];

        let adjustedHeight = canvasHeight - 511;
        if (command == 'stuffimage') {
            await scaleImage(imageDims, 'fit', [canvasWidth, adjustedHeight]);
            await drawImage(fileDir);
        }
        await drawImage('./files/templates/stuff.png', [0, 0], [0, adjustedHeight]);

        let textWidth = canvasWidth - 602 - 50;
        await textHandler({ text: inputs[0], font: 'arial', style: 'bold ', maxSize: 100, maxWidth: textWidth, maxHeight: 450, baseX: (textWidth / 2 + 602 + 25), baseY: 255.5 });
        context.fillStyle = '#000000';
        await drawText([0, adjustedHeight]);

        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: `${command}.png`, transformative: false });
    }
};
