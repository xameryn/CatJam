const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const systeminfo = require('systeminformation');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'server',
    aliases: ['srv'],
    description: 'In case you were wondering how the server was doing.',
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('In case you were wondering how the server was doing.'),
    async execute(message, args) {
        return await this.run(message);
    },
    async executeSlash(interaction) {
        globalData.message = interaction;
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let cpuSpeed = await systeminfo.cpuCurrentSpeed();
        let memInfo = await systeminfo.mem();
        
        let author = messageOrInteraction.isInteraction ? messageOrInteraction.user : messageOrInteraction.author;
        let member = messageOrInteraction.member;
        let username = member ? member.displayName : author.username;
        let p = globalData.globalPrefix || '';

        let embed = new EmbedBuilder()
            .setTitle("Server PC Status")
            .setColor(0x686868)
            .setDescription("CPU Speed: " + cpuSpeed.avg + "GHz\nMemory Used: " + (Math.round((memInfo.used / 1073741824) * 10) / 10) + "GB / " + (Math.round((memInfo.total / 1073741824) * 10) / 10) + "GB")
            .setFooter({ text: username + ' : ' + p + 'server', iconURL: author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true }) });
            
        if (messageOrInteraction.delete) await messageOrInteraction.delete().catch(() => null);
        
        return await messageReturn({ input: { embeds: [embed] } });
    }
};
