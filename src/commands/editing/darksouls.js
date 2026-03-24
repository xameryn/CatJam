const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, textHandler, drawText, drawImage, scaleImage } = require('../../utils/canvas.js');
const { textArgs } = require('../../utils/misc.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'healthbar',
    description: 'Dark Souls boss healthbar.',
    aliases: ['hb', 'health'],
    data: new SlashCommandBuilder()
        .setName('healthbar')
        .setDescription('Dark Souls boss healthbar.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ds')
                .setDescription('Dark Souls boss healthbar with name.')
                .addStringOption(option => option.setName('name').setDescription('Boss name').setRequired(true)))
                .addSubcommand(subcommand =>
            subcommand
                .setName('er')
                .setDescription('Elden Ring boss healthbar with name.')
                .addStringOption(option => option.setName('name').setDescription('Boss name').setRequired(true))),
    async execute(message, args) {
        if (args[0] === 'ds' || args[0] === 'er') {
            await textArgs(1, args.slice(1).join(' '));
            globalData.trueSubcommand = args[0];
        } else {
             return await messageReturn({ input: "Please specify a rollslop game (`ds` or `er`)", type: 'text' });
        }
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let subcommand = interaction.options.getSubcommand();
        globalData.trueSubcommand = subcommand;
        if (subcommand === 'health') {
            let name = interaction.options.getString('name');
            globalData.textInputs = [name];
        }
        globalData.argsText = [];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let subcommand = globalData.trueSubcommand;
        let command = 'healthbar';
        let bossName = globalData.textInputs[0];
        
        let fileDir = `./files/buffer/${command}Buffer.png`;
        let fileURL = await generalScraper('image');
        if (fileURL == undefined) {
            return await messageReturn({ input: "No file found :(", type: 'text' });
        }
        await download(fileURL, fileDir);
        let imageSize = await SizeOf(fileDir);
        let imageDims = [imageSize.width, imageSize.height];

        await canvasInitialize(imageDims, 'png');
        let canvas = globalData.canvas;
        let context = globalData.context;

        await scaleImage(imageDims, 'fit', imageDims);
        await drawImage(fileDir);

        let healthbarPath = `./files/templates/darksouls/health/${subcommand}.png`;
        let healthbarSize = await SizeOf(healthbarPath);

        let hbWidth = imageDims[0] * 0.9;
        let hbHeight = (healthbarSize.height / healthbarSize.width) * hbWidth;
        let hbX = imageDims[0] * 0.05;
        let hbY = (imageDims[1] * 0.95) - hbHeight;

        await drawImage(healthbarPath, [0, 0], [hbX, hbY], [hbWidth, hbHeight]);

        let fontName = 'Adobe Garamond'; 

        await textHandler({ 
            text: bossName, 
            font: fontName, 
            metrics: 'HXg',
            maxSize: hbHeight * 0.5, 
            maxWidth: hbWidth * 0.8, 
            maxHeight: hbHeight, 
            baseX: hbX + (hbWidth * 0.08), 
            baseY: hbY + (hbHeight * 0.48), 
            xAlign: 'left', 
            yAlign: 'bottom' 
        });
        
        context.fillStyle = '#ffffff';
        context.shadowColor = 'rgba(0, 0, 0, 0.9)';
        context.shadowBlur = 12;
        context.shadowOffsetX = 4;
        context.shadowOffsetY = 4;

        await drawText();

        return await messageReturn({ input: await canvas.toBuffer(), type: 'attach', filename: `darksouls_health.png`, transformative: false });
    }
};
