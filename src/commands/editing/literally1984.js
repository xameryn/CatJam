const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, scaleImage, drawImage, textHandler, drawText } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'literally1984',
    description: 'For when it is literally 1984.',
    aliases: ['l1984'],
    data: new SlashCommandBuilder()
        .setName('literally1984')
        .setDescription('For when it is literally 1984.')
        .addStringOption(option => option.setName('text').setDescription('Text input').setRequired(false)),
    async execute(message, args) {
        await textArgs(1);
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let text = interaction.options.getString('text') || '';
        globalData.textInputs = [text];
        globalData.argsText = [];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = 'literally1984';
        let inputs = globalData.textInputs;
        let textScrape = false;

        if (inputs[0] == '') {
            let fileDir = `./files/buffer/${command}Buffer.png`;
            let fileURL = await generalScraper('image');
            if (fileURL == undefined) {
                if (messageOrInteraction.reference != undefined) {
                    textScrape = true;
                }
                else {
                    // If no image and no text, it might be better to just fail or use a default image.
                    // The original logic had return await messageReturn({input: "No file found :(", type:'text'})
                    // but if it's literally1984, maybe it should just send the template?
                    // Actually, let's follow original logic.
                    if (inputs[0] == '') return await messageReturn({ input: "No file found :(", type: 'text' });
                }
            }
            if (!textScrape && fileURL) {
                await download(fileURL, fileDir);
                var imageSize = await SizeOf(fileDir);
                var imageDims = [imageSize.width, imageSize.height];
            }
        }

        if (textScrape) {
            let replyMessage = await messageOrInteraction.channel.messages.fetch(messageOrInteraction.reference.messageId);
            inputs[0] = replyMessage.content;
        }

        let canvasDims = [1440, 1036];
        let bgOption = './files/templates/literally1984.jpg';
        await canvasInitialize(canvasDims, bgOption);
        let canvas = globalData.canvas;
        let context = globalData.context;

        if (inputs[0] != '') {
            await textHandler({ text: inputs[0], font: 'sans-serif', maxSize: 175, maxWidth: 699, maxHeight: 242, baseX: 455.5, baseY: 150 });
            context.fillStyle = '#000000';
            await drawText();
        }
        else {
            await scaleImage(imageDims, 'fit', [699, 242]);
            await drawImage(`./files/buffer/${command}Buffer.png`, [106, 29]);
        }

        return await messageReturn({ input: await canvas.toBuffer(), type: 'attach', filename: `literally1984.png`, transformative: false });
    }
};
