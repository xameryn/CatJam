const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs-extra');

const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { fileNameVerify, fileExtension, fileTypeFunc, uploadLimitCheck } = require('../../utils/file.js');
const { arcName } = require('../../utils/misc.js');
const { findEmoji } = require('../../utils/emoji.js');

module.exports = {
    name: 'serverarchive',
    description: "Finds the most recent file in chat and adds it to this server's archive!",
    aliases: ['serverarc', 'sarc', 'sa'],
    data: new SlashCommandBuilder()
        .setName('serverarchive')
        .setDescription("Finds the most recent file in chat and adds it to this server's archive!")
        .addStringOption(option => option.setName('name').setDescription('File name to save/get').setRequired(false))
        .addBooleanOption(option => option.setName('list').setDescription("List the server's archived files").setRequired(false)),
    async execute(message, args) {
        return await this.run(message);
    },
    async executeSlash(interaction) {
        let name = interaction.options.getString('name');
        let list = interaction.options.getBoolean('list');
        
        if (list) {
            globalData.args = ['list'];
        } else if (name) {
            globalData.args = [name];
        } else {
            globalData.args = [];
        }
        
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        const archive = require('./archive.js');
        return await archive.run(messageOrInteraction);
    }
};
