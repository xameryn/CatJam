const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');
const { wait } = require('../../utils/misc.js');

module.exports = {
    name: 'flip',
    aliases: ['coin', 'toss'],
    description: 'Flip a coin of any weight!',
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('Flip a coin of any weight!')
        .addNumberOption(option => 
            option.setName('odds')
                .setDescription('Probability of success (0.0 to 1.0)')
                .setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let odds = args.length ? parseFloat(input) : 0.5;
        
        let attachment = new AttachmentBuilder('https://i.imgur.com/xzE6qF4.gif');
        const msg = await message.channel.send({ files: [attachment] });
        await wait(2100);
        await msg.delete().catch(() => null);
        
        let displayInput = args.length ? ' ' + input : '';
        if (odds > Math.random()) {
            return await messageReturn({ input: "Success! / Heads / Yes", type: 'text', commandDisplay: 'flip' + displayInput });
        } else {
            return await messageReturn({ input: "Failure! / Tails / No", type: 'text', commandDisplay: 'flip' + displayInput });
        }
    },
    async executeSlash(interaction) {
        let odds = interaction.options.getNumber('odds') ?? 0.5;
        globalData.message = interaction;
        
        let attachment = new AttachmentBuilder('https://i.imgur.com/xzE6qF4.gif');
        await interaction.editReply({ files: [attachment] });
        await wait(2100);
        
        let displayInput = odds !== 0.5 ? ' ' + odds : '';
        if (odds > Math.random()) {
            return await messageReturn({ input: "Success! / Heads / Yes", type: 'text', commandDisplay: 'flip' + displayInput });
        } else {
            return await messageReturn({ input: "Failure! / Tails / No", type: 'text', commandDisplay: 'flip' + displayInput });
        }
    }
};
