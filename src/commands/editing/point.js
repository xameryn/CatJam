const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { canvasInitialize, imageToCanvas, scaleImage, drawImage } = require('../../utils/canvas.js');
const SizeOf = require('image-size');

module.exports = {
    name: 'point',
    description: 'Two respectable gentlemen pointing at something of interest.',
    data: new SlashCommandBuilder()
        .setName('point')
        .setDescription('Two respectable gentlemen pointing at something of interest.')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of gentlemen')
                .setRequired(false)
                .addChoices(
                    { name: 'Default', value: 'default' },
                    { name: 'Colonist', value: 'colonist' },
                    { name: 'Real', value: 'real' },
                    { name: 'Mythbusters', value: 'myth' },
                    { name: 'Catholic', value: 'catholic' },
                    { name: 'Hearthian', value: 'hearthian' },
                    { name: 'Guilty Gear', value: 'guiltygear' },
                )),
    async execute(message, args) {
        globalData.argsText = args;
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let type = interaction.options.getString('type') || 'default';
        globalData.argsText = [type];
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let command = 'point';
        let bgOption = globalData.userData.pointBG;
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

        let smallImage = false;
        if (imageSize.height == 100 || imageSize.width == 100) {
            smallImage = true;
            globalData.imgCanvasDims = [640, 506];
        }
        else {
            await imageToCanvas({ imageDims: imageDims, widestRatio: 2, tallestRatio: 1, wideDims: [1920, 1518], tallDims: [1920, 1518] });
        }
        let canvasDims = globalData.imgCanvasDims;

        await canvasInitialize(canvasDims, bgOption);
        let canvas = globalData.canvas;
        let context = globalData.context;
        let canvasWidth = canvasDims[0];
        let canvasHeight = canvasDims[1];

        if (smallImage) {
            let xAxis = (Math.abs(canvasWidth - imageSize.width) / 2) - 35;
            let yAxis = (Math.abs(canvasHeight - imageSize.height) / 2) - 70;
            await drawImage(fileDir, [0, 0], [xAxis, yAxis], imageDims);
        }
        else {
            await scaleImage(imageDims, 'fit', canvasDims);
            if (globalData.imgCanvasEval == 'wide') {
                globalData.scaledPos[1] = globalData.scaledPos[1] / 2;
            }
            await drawImage(fileDir);
        }

        let pointImage1 = './files/templates/pointing/pointing1.png';
        let pointImage2 = './files/templates/pointing/pointing2.png';
        let explosionImage;

        if (argsText.includes('colonist')) {
            pointImage1 = './files/templates/pointing/pointingColonist1.png';
            pointImage2 = './files/templates/pointing/pointingColonist2.png';
        } else if (argsText.includes('real')) {
            pointImage1 = './files/templates/pointing/pointingReal1.png';
            pointImage2 = './files/templates/pointing/pointingReal2.png';
        } else if (argsText.includes('myth') || argsText.includes('mythbusters')) {
            pointImage1 = './files/templates/pointing/pointingMyth1.png';
            pointImage2 = './files/templates/pointing/pointingMyth2.png';
            explosionImage = './files/templates/pointing/pointingMythExplosion.png';
        } else if (argsText.includes('catholic')) {
            pointImage1 = './files/templates/pointing/pointingCatholic1.png';
            pointImage2 = './files/templates/pointing/pointingCatholic2.png';
        } else if (argsText.includes('hearthian')) {
            pointImage1 = './files/templates/pointing/pointingHearthian1.png';
            pointImage2 = './files/templates/pointing/pointingHearthian2.png';
        } else if (argsText.includes('gg') || argsText.includes('guiltygear')) {
            pointImage1 = './files/templates/pointing/pointingGuiltyGear1.png';
            pointImage2 = './files/templates/pointing/pointingGuiltyGear2.png';
        }

        await scaleImage([864, 1518], 'fit', canvasDims);
        let scaledWidth1 = globalData.scaledDims[0];
        await scaleImage([1056, 1518], 'fit', canvasDims);
        let scaledWidth2 = globalData.scaledDims[0];
        let scaledHeightP = globalData.scaledDims[1];
        let xAxis2 = Math.abs(canvasWidth - scaledWidth2);

        if (explosionImage != undefined) {
            let scaledHeightE = 673 * (scaledHeightP / 1518);
            let scaledWidthE = 578 * (((scaledWidth1 + scaledWidth2) / 2) / 960);
            await drawImage(explosionImage, [0, 0], [(canvasWidth / 2 - scaledWidthE / 2), (canvasHeight / 2 - scaledHeightE / 2)], [scaledWidthE, scaledHeightE]);
        }
        await drawImage(pointImage2, [0, 0], [xAxis2, 0], [scaledWidth2, scaledHeightP]);
        await drawImage(pointImage1, [0, 0], [0, 0], [scaledWidth1, scaledHeightP]);

        return await messageReturn({ input: canvas.toBuffer(), type: 'attach', filename: `point.png`, transformative: false });
    }
};
