const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs-extra');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'dadon',
    description: 'Sends one of over 200 images of Don-chan.',
    data: new SlashCommandBuilder()
        .setName('dadon')
        .setDescription('Sends one of over 200 images of Don-chan.')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Specific image number')
                .setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let dir = './files/dadon';
        let fileNumber = fs.readdirSync(dir).length;
        let imageNum = Math.floor(Math.random() * fileNumber) + 1;
        if (!isNaN(input) && input <= fileNumber && input > 0) {
            imageNum = input;
        }
        let joinedArray = `${dir}/dadon (${imageNum}).png`;
        return await messageReturn({ input: joinedArray, type: 'attach' });
    },
    async executeSlash(interaction) {
        let input = interaction.options.getInteger('number');
        let dir = './files/dadon';
        let fileNumber = fs.readdirSync(dir).length;
        let imageNum = Math.floor(Math.random() * fileNumber) + 1;
        if (input && input <= fileNumber && input > 0) {
            imageNum = input;
        }
        let joinedArray = `${dir}/dadon (${imageNum}).png`;
        globalData.message = interaction;
        return await messageReturn({ input: joinedArray, type: 'attach' });
    }
};
