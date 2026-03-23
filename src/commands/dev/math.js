const { SlashCommandBuilder } = require('discord.js');
const { DEV_ID_ARRAY } = require('../../config.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'math',
    aliases: ['m'],
    description: 'Developer math command.',
    data: new SlashCommandBuilder()
        .setName('math')
        .setDescription('Developer math command.')
        .addStringOption(option => option.setName('expression').setDescription('Math expression to evaluate').setRequired(true)),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        
        let prefix = require('../../config.js').GLOBAL_PREFIX;
        let fullMessage = message.content;
        let command = this.name;
        
        let tempMessage;
        let returnMessage = 0.0;

        let parts = fullMessage
            .replace(command, "")
            .replace(prefix, "")
            .trim()
            .split(" ");

        for (let i = 0; i < parts.length; i++) {
            let expr = parts[i];
            if (expr.includes('+')) {
                tempMessage = expr.split('+');
                returnMessage = parseFloat(tempMessage[0]) + parseFloat(tempMessage[1]);
            }
            else if (expr.includes('-')) {
                tempMessage = expr.split('-');
                returnMessage = parseFloat(tempMessage[0]) - parseFloat(tempMessage[1]);
            }
            else if (expr.includes('*')) {
                tempMessage = expr.split('*');
                returnMessage = parseFloat(tempMessage[0]) * parseFloat(tempMessage[1]);
            }
            else if (expr.includes('/')) {
                tempMessage = expr.split('/');
                returnMessage = parseFloat(tempMessage[0]) / parseFloat(tempMessage[1]);
            }
            else if (expr.includes('^')) {
                tempMessage = expr.split('^');
                returnMessage = Math.pow(parseFloat(tempMessage[0]), parseFloat(tempMessage[1]));
            }
            else if (expr.includes('d')) {
                tempMessage = expr.split('d');
                let count = tempMessage[0] === '' ? 1 : parseFloat(tempMessage[0]);
                let sides = parseFloat(tempMessage[1]);
                returnMessage = 0;
                for (let j = 0; j < count; j++) {
                    returnMessage += Math.floor(Math.random() * sides) + 1;
                }
            }
            else {
                returnMessage = 'NaN';
            }

            await messageReturn({ input: returnMessage.toString(), type: 'text', title: expr });
        }
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        // Simplified for slash: only evaluates one expression
        let expr = interaction.options.getString('expression');
        let returnMessage = 0.0;
        let tempMessage;

        if (expr.includes('+')) {
            tempMessage = expr.split('+');
            returnMessage = parseFloat(tempMessage[0]) + parseFloat(tempMessage[1]);
        }
        else if (expr.includes('-')) {
            tempMessage = expr.split('-');
            returnMessage = parseFloat(tempMessage[0]) - parseFloat(tempMessage[1]);
        }
        else if (expr.includes('*')) {
            tempMessage = expr.split('*');
            returnMessage = parseFloat(tempMessage[0]) * parseFloat(tempMessage[1]);
        }
        else if (expr.includes('/')) {
            tempMessage = expr.split('/');
            returnMessage = parseFloat(tempMessage[0]) / parseFloat(tempMessage[1]);
        }
        else if (expr.includes('^')) {
            tempMessage = expr.split('^');
            returnMessage = Math.pow(parseFloat(tempMessage[0]), parseFloat(tempMessage[1]));
        }
        else if (expr.includes('d')) {
            tempMessage = expr.split('d');
            let count = tempMessage[0] === '' ? 1 : parseFloat(tempMessage[0]);
            let sides = parseFloat(tempMessage[1]);
            returnMessage = 0;
            for (let j = 0; j < count; j++) {
                returnMessage += Math.floor(Math.random() * sides) + 1;
            }
        } else {
            returnMessage = 'NaN';
        }

        await interaction.editReply({ content: `Result for ${expr}: ${returnMessage}` });
    }
};
