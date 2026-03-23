const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');
const { CAT_JAM_ARRAY } = require('../../config.js');

module.exports = {
    name: 'catjam',
    description: 'A catjam that jams to the beat.',
    data: new SlashCommandBuilder()
        .setName('catjam')
        .setDescription('A catjam that jams to the beat.')
        .addIntegerOption(option => 
            option.setName('bpm')
                .setDescription('Beats per minute')
                .setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let output = (Math.round((input) / 5)) * 5;
        let link;
        if (!args.length) {
            link = CAT_JAM_ARRAY[12];
        }
        else if (output < 60) {
            link = CAT_JAM_ARRAY[0];
        }
        else if (output > 180) {
            link = CAT_JAM_ARRAY[24];
        }
        else {
            link = CAT_JAM_ARRAY[(output - 60) / 5];
        }
        return await messageReturn({ input: link, type: 'link', filename: 'catjam.gif' });
    },
    async executeSlash(interaction) {
        let bpm = interaction.options.getInteger('bpm');
        let args = bpm ? [bpm] : [];
        // We need to adapt messageReturn to handle interactions as well, 
        // or mock the message object for now.
        // Actually, let's just use execute with a mocked message for simplicity 
        // if we want to reuse logic, but better to refactor execute to be agnostic.
        
        // For now, I'll keep them somewhat separate but shared logic.
        let output = bpm ? (Math.round((bpm) / 5)) * 5 : 0;
        let link;
        if (!bpm) {
            link = CAT_JAM_ARRAY[12];
        }
        else if (output < 60) {
            link = CAT_JAM_ARRAY[0];
        }
        else if (output > 180) {
            link = CAT_JAM_ARRAY[24];
        }
        else {
            link = CAT_JAM_ARRAY[(output - 60) / 5];
        }
        
        // Mocking message for messageReturn
        globalData.message = {
            author: interaction.user,
            guild: interaction.guild,
            channel: interaction.channel,
            delete: () => {}, // slash commands don't delete original message this way
            reference: null,
            attachments: new Map()
        };
        
        // In slash commands, we usually use interaction.reply.
        // I should refactor messageReturn to handle both.
        return await messageReturn({ input: link, type: 'link', filename: 'catjam.gif' });
    }
};
