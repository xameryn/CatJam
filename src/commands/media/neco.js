const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs-extra');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'neco',
    aliases: ['necoarc', 'neco-arc'],
    description: 'Sends one of over 100 images of Neco Arc.',
    data: new SlashCommandBuilder()
        .setName('neco')
        .setDescription('Sends one of over 100 images of Neco Arc.')
        .addIntegerOption(option =>
            option.setName('number')
                .setDescription('Specific image number')
                .setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let dir = './files/neco';
        let fileNumber = fs.readdirSync(dir).length;
        let imageNum = Math.floor(Math.random() * fileNumber) + 1;
        if (!isNaN(input) && input <= fileNumber && input > 0) {
            imageNum = input;
        }
        let joinedArray = `${dir}/neco (${imageNum}).png`;
        return await messageReturn({ input: joinedArray, type: 'attach' });
    },
    async executeSlash(interaction) {
        let input = interaction.options.getInteger('number');
        let dir = './files/neco';
        let fileNumber = fs.readdirSync(dir).length;
        let imageNum = Math.floor(Math.random() * fileNumber) + 1;
        if (input && input <= fileNumber && input > 0) {
            imageNum = input;
        }
        let joinedArray = `${dir}/neco (${imageNum}).png`;
        globalData.message = interaction;
        return await messageReturn({ input: joinedArray, type: 'attach' });
    }
};
