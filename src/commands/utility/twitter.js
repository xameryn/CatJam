const { SlashCommandBuilder } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper } = require('../../utils/discord.js');
const { getTime } = require('../../utils/misc.js');

module.exports = {
    name: 'twitter',
    aliases: ['twt'],
    description: 'Convert a Twitter video link into a more consistent embed.',
    data: new SlashCommandBuilder()
        .setName('twitter')
        .setDescription('Convert a Twitter video link into a more consistent embed.'),
    async execute(message, args) {
        let start = getTime();
        let originalURL = await generalScraper('twitter');
        let lastMessage = globalData.targetMessage;
        
        if (lastMessage == undefined) return await messageReturn({ input: "No Twitter link found :(", type: 'text' });
        
        let nickName;
        if (lastMessage.member === null) {
            let member = await lastMessage.guild.members.fetch(lastMessage.author.id).catch(console.error);
            nickName = member.displayName;
        } else {
            nickName = lastMessage.member.displayName;
        }
        
        let messageContent = lastMessage.content.split('https://');
        originalURL = 'https://' + messageContent[1];
        let splitURL = originalURL.split('/');
        
        if (splitURL[2] == 'twitter.com' || splitURL[2] == 'x.com') {
            splitURL[2] = 'vxtwitter.com';
            let joinedURL = splitURL.join('/');
            let tokenSplitURL = joinedURL.split('?');
            joinedURL = tokenSplitURL[0];
            
            await message.delete().catch(() => null);
            await lastMessage.delete().catch(() => null);
            
            console.log('twitter - ' + getTime(start).toString() + 'ms');
            return message.channel.send("Tweet was sent by: **" + nickName + "\n**" + messageContent[0] + "\n" + joinedURL);
        } else {
            return await messageReturn({ input: "This is not a twitter link.", type: 'text' });
        }
    },
    async executeSlash(interaction) {
        globalData.message = interaction;
        // In slash commands, we can't easily delete someone else's message unless we have permissions, 
        // and we can't delete the slash command interaction message if we want to reply.
        // Actually, this command is better as a prefix command since it deletes messages.
        // But I'll implement it anyway.
        let originalURL = await generalScraper('twitter');
        let lastMessage = globalData.targetMessage;
        
        if (lastMessage == undefined) return await interaction.editReply("No Twitter link found :(");
        
        let nickName;
        if (lastMessage.member === null) {
            let member = await lastMessage.guild.members.fetch(lastMessage.author.id).catch(() => null);
            nickName = member ? member.displayName : lastMessage.author.username;
        } else {
            nickName = lastMessage.member.displayName;
        }
        
        let messageContent = lastMessage.content.split('https://');
        originalURL = 'https://' + messageContent[1];
        let splitURL = originalURL.split('/');
        
        if (splitURL[2] == 'twitter.com' || splitURL[2] == 'x.com') {
            splitURL[2] = 'vxtwitter.com';
            let joinedURL = splitURL.join('/');
            let tokenSplitURL = joinedURL.split('?');
            joinedURL = tokenSplitURL[0];
            
            await lastMessage.delete().catch(() => null);
            return interaction.editReply("Tweet was sent by: **" + nickName + "\n**" + (messageContent[0] || "") + "\n" + joinedURL);
        } else {
            return await interaction.editReply("This is not a twitter link.");
        }
    }
};
