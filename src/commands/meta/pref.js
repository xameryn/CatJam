const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');
const { userData } = require('../../utils/user.js');

module.exports = {
    name: 'pref',
    aliases: ['preferences', 'prefs'],
    description: 'Alter the default behaviour of various commands (And prefixes).',
    data: new SlashCommandBuilder()
        .setName('pref')
        .setDescription('Alter the default behaviour of various commands (And prefixes).')
        .addStringOption(option => option.setName('command').setDescription('Command to change').setRequired(false))
        .addStringOption(option => option.setName('setting').setDescription('Setting to change').setRequired(false))
        .addStringOption(option => option.setName('value').setDescription('New value for the setting').setRequired(false)),
    async execute(message, args) {
        let input = args[0];
        let input2 = args[1] || '';
        let input3 = args[2] || '';
        
        if (input != undefined) {
            await userData('set', input.toLowerCase(), input2.toLowerCase(), input3.toLowerCase());
            return await messageReturn({ input: `${globalData.toggledMSG}`, type: 'text' });
        } else {
            return await this.showPrefs(message);
        }
    },
    async executeSlash(interaction) {
        let command = interaction.options.getString('command');
        let setting = interaction.options.getString('setting') || '';
        let value = interaction.options.getString('value') || '';
        
        globalData.message = interaction;
        
        if (command) {
            await userData('set', command.toLowerCase(), setting.toLowerCase(), value.toLowerCase());
            return await messageReturn({ input: `${globalData.toggledMSG}`, type: 'text' });
        } else {
            return await this.showPrefs(interaction);
        }
    },
    async showPrefs(messageOrInteraction) {
        let author = messageOrInteraction.isInteraction ? messageOrInteraction.user : messageOrInteraction.author;
        let thumb = author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
        let p = globalData.prefix || globalData.globalPrefix;
        
        let embed = new EmbedBuilder()
            .setTitle("Your Preferences")
            .setColor(0x686868)
            .addFields(
                { name: '⠀\n' + 'point : background : `' + `${globalData.userData.pointBG}` + '`', value: "background used if transparency is present" },
                { name: 'poster : background : `' + `${globalData.userData.posterBG}` + '`', value: "background used if transparency is present" },
                { name: 'poster : text : `' + `${globalData.userData.posterTXT}` + '`', value: "which type of text displays with 1 argument" },
                { name: 'poster : caps : `' + `${globalData.userData.posterCAPS}` + '`', value: "capitalization of the larger text" },
                { name: 'archive : customCMD : `' + `${globalData.userData.customCMD}` + '`', value: "unknown commands send archived files of the same name" },
                { name: 'archive : priority : `' + `${globalData.userData.priorityARC}` + '`', value: "archive which takes priority for custom commands" },
                { name: 'archive : delete : `' + `${globalData.userData.deleteArchiveMessage}` + '`', value: 'whether to delete your archive message' },
                { name: 'prefix : custom : `' + `${globalData.userData.prefixC}` + '`', value: "custom prefix for all commands" },
                { name: 'prefix : default : `' + `${globalData.userData.prefixD}` + '`', value: 'whether default prefix is still used\n(also toggled by pinging the bot with the word "prefix")\n⠀' }
            )
            .setFooter({ text: 'Usage: ' + p + 'pref [command] [setting] [value]\ne.g. ' + p + 'pref point background png\n"reset" can be used as a command or value to restore defaults' })
            .setThumbnail(thumb);
            
        return await messageReturn({ input: { embeds: [embed] } });
    }
};
