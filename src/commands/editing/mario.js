const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, scaleImage, drawImage, textHandler, drawText } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'mario',
    description: "I can't believe they cast them as Mario.",
    data: new SlashCommandBuilder()
        .setName('mario')
        .setDescription("I can't believe they cast them as Mario.")
        .addStringOption(option => option.setName('text').setDescription('Text input').setRequired(true)),
    async execute(message, args) {
        await textArgs(1);
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let text = interaction.options.getString('text');
        globalData.textInputs = [text];
        globalData.argsText = [];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = 'mario';
        let inputs = globalData.textInputs;

        let fileDir = `./files/buffer/${command}Buffer.png`;
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) {
            return await messageReturn({ input: "No file found :(", type: 'text' });
        }
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        let imageDims = [imageSize.width, imageSize.height];

        let canvasDims = [1920, 1080];
        await canvasInitialize(canvasDims, 'png');
        let canvas = globalData.canvas;
        let context = globalData.context;

        await scaleImage(imageDims, 'fill', [730, 973]);
        await drawImage(fileDir, [595, 53]);
        await drawImage('./files/templates/mario.png', [0, 0], [0, 0], canvasDims);

        await textHandler({ text: inputs[0].toUpperCase(), font: 'Trebuchet MS', style: 'bold ', maxSize: 75, maxWidth: 526, maxHeight: 1, byLine: true, spacing: 0, baseX: 275, baseY: 897, xAlign: 'left' });
        context.fillStyle = '#ffffff';
        if (globalData.emojiMatch != undefined) {
            await drawText([0, 0.1 * globalData.text1.baselineHeight]);
        }
        else {
            await drawText();
        }

        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: `mario.png`, transformative: false });
    }
};
