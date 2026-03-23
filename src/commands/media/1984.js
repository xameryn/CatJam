const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: '1984',
    description: 'Two possible GIFs depicting 1984.',
    data: new SlashCommandBuilder()
        .setName('1984')
        .setDescription('Two possible GIFs depicting 1984.'),
    async execute(message, args) {
        let link;
        if ((Math.floor(Math.random() * 11)) >= 5) {
            link = 'https://i.imgur.com/59QZNLa.gif';
        }
        else {
            link = 'https://i.imgur.com/wInH3ud.gif';
        }
        return await messageReturn({ input: link, type: 'link', filename: '1984.gif' });
    },
    async executeSlash(interaction) {
        let link;
        if ((Math.floor(Math.random() * 11)) >= 5) {
            link = 'https://i.imgur.com/59QZNLa.gif';
        }
        else {
            link = 'https://i.imgur.com/wInH3ud.gif';
        }
        globalData.message = interaction;
        return await messageReturn({ input: link, type: 'link', filename: '1984.gif' });
    }
};
