const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs-extra');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

let fileNumber = 0;
try {
    fileNumber = fs.readdirSync('./files/dadon').length;
} catch (e) {
    console.error("Dadon directory not found.");
}

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
        return await this.run(message, args[0]);
    },
    async executeSlash(interaction) {
        let input = interaction.options.getInteger('number');
        globalData.message = interaction;
        return await this.run(interaction, input);
    },
    async run(messageOrInteraction, input) {
        let dir = './files/dadon';
        let imageNum = Math.floor(Math.random() * fileNumber) + 1;
        if (input && !isNaN(input) && input <= fileNumber && input > 0) {
            imageNum = input;
        }
        let joinedArray = `${dir}/dadon (${imageNum}).png`;
        return await messageReturn({ input: joinedArray, type: 'attach' });
    }
};
