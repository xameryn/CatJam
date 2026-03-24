const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs-extra');
const archiver = require('archiver');
const emojiRegex = require('emoji-regex');
const apng2gif = require('apng2gif');
const { globalData } = require('../../state.js');
const { messageReturn, download } = require('../../utils/discord.js');
const { getEmoji } = require('../../utils/emoji.js');
const { wait } = require('../../utils/misc.js');

module.exports = {
    name: 'avatar',
    aliases: ['get', 'avy', 'ava', 'pfp'],
    description: 'Get avatars or emoji in picture format.',
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Get avatars or emoji in picture format.')
        .addUserOption(option => option.setName('user').setDescription('User to get avatar from').setRequired(false))
        .addStringOption(option => option.setName('input').setDescription('Username, ID, or Emoji').setRequired(false))
        .addBooleanOption(option => option.setName('global').setDescription('Get global avatar instead of server avatar').setRequired(false)),
    async execute(message, args) {
        return await this.run(message);
    },
    async executeSlash(interaction) {
        globalData.message = interaction;
        globalData.args = [];
        let user = interaction.options.getUser('user');
        let input = interaction.options.getString('input');
        let isGlobal = interaction.options.getBoolean('global');
        
        if (user) {
            globalData.args.push(`<@${user.id}>`);
        } else if (input) {
            globalData.args.push(input);
        }
        if (isGlobal) globalData.args.push('global');
        
        return await this.run(interaction);
    },
    async run(messageOrInteraction) {
        let message = messageOrInteraction.isInteraction ? {
            author: messageOrInteraction.user,
            guild: messageOrInteraction.guild,
            channel: messageOrInteraction.channel,
            mentions: { users: new Map(), members: new Map() },
            reference: null,
            stickers: new Map(),
            content: globalData.args.join(' '),
            delete: async () => {}
        } : messageOrInteraction;
        
        let errorMsg = "Couldn't find an avatar, emoji, or sticker from that input.";
        let guildAvy = true;
        let fullInput = globalData.args.join(' ');
        let args = globalData.args;
        
        if (args.includes('global') || args.includes('g')) {
            guildAvy = false;
            fullInput = (' ' + fullInput).replaceAll(' global', '').replaceAll(' g', '').trim();
        }
        
        let input = args[0];
        let reply = false;
        let replyMessage = message;
        if (message.reference != undefined) {
            replyMessage = await message.channel.messages.fetch(message.reference.messageId);
            input = replyMessage.content;
            fullInput = input;
            reply = true;
        }
        
        let fileDir = './files/buffer/getBuffer.png';
        let dRegex = emojiRegex();
        let customRegex = /<:\w+:(\d+)>/gmd;
        let animRegex = /<a:\w+:(\d+)>/gmd;
        let foundEmoji = false;
        let link;
        
        if (replyMessage.stickers && replyMessage.stickers.size > 0 && (input === undefined || reply)) {
            let sticker = replyMessage.stickers.first();
            if (sticker.format == 1) {
                link = sticker.url;
            } else if (sticker.format == 2) {
                await download(sticker.url, fileDir);
                apng2gif.sync(fileDir, './files/buffer/' + sticker.id.toString() + '.gif');
                fileDir = './files/buffer/' + sticker.id.toString() + '.gif';
            } else {
                await download(sticker.url, './files/buffer/' + sticker.id.toString() + '.json');
                fileDir = './files/buffer/' + sticker.id.toString() + '.json';
            }
        }
        else if (input === undefined && !reply) {
            if (guildAvy && message.guild) {
                let guildUser = await message.guild.members.fetch(message.author.id).catch(() => null);
                if (guildUser) {
                    link = guildUser.displayAvatarURL({ extension: 'png', size: 1024 });
                    fileDir = './files/buffer/' + message.author.id.toString() + '.png';
                } else {
                    return await messageReturn({ input: errorMsg, type: 'text', title: "Bad Input!" });
                }
            } else {
                link = message.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
                fileDir = './files/buffer/' + message.author.id.toString() + '.png';
            }
        }
        else if (message.mentions && message.mentions.users && message.mentions.users.size > 0 && !reply) {
            let user = message.mentions.users.first();
            if (guildAvy && message.guild) {
                let member = await message.guild.members.fetch(user.id).catch(() => null);
                link = member ? member.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true }) : user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
                fileDir = './files/buffer/' + user.id.toString() + '.png';
            } else {
                link = user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
                fileDir = './files/buffer/' + user.id.toString() + '.png';
            }
        }
        else if ((input == 'server' || input == 's') && message.guild && message.guild.iconURL() != null && !reply) {
            link = message.guild.iconURL({ extension: 'png', size: 1024, dynamic: true });
            fileDir = './files/buffer/' + message.guild.id.toString() + '.png';
        }
        else if ((input == 'emojis' || input == 'emoji') && !reply && message.guild) {
            let serverEmoji = message.guild.emojis.cache;
            let emoji = '';
            serverEmoji.forEach(e => {
                emoji += e.animated ? `<${e.identifier}>` : `<:${e.identifier}>`;
            });
            if (emoji == '') return await messageReturn({ input: errorMsg, type: 'text', title: "Bad Input!" });
            await getEmoji(emoji);
            foundEmoji = true;
        }
        else if ((fullInput.search(dRegex) != -1 || fullInput.search(customRegex) != -1 || fullInput.search(animRegex) != -1)) {
            await getEmoji(fullInput);
            foundEmoji = true;
        }
        else if (!isNaN(input) && input.length >= 17 && !reply) {
            const client = messageOrInteraction.client;
            let user = await client.users.fetch(input).catch(() => null);
            let guildUser = message.guild ? await message.guild.members.fetch(input).catch(() => null) : null;
            fileDir = './files/buffer/' + input.toString() + '.png';
            if (guildUser && guildAvy) {
                link = guildUser.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
            } else if (user) {
                link = user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
            } else {
                return await messageReturn({ input: errorMsg, type: 'text', title: "Bad Input!" });
            }
        }
        else if (!reply && message.guild) {
            let index = fullInput.indexOf('#');
            let nameInput = index != -1 ? fullInput.slice(0, index).trim() : fullInput;
            let member = await message.guild.members.fetch({ query: nameInput, limit: 1 }).catch(() => null);
            if (member && member.first()) {
                let firstMember = member.first();
                if (guildAvy) {
                    link = firstMember.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
                    fileDir = './files/buffer/' + firstMember.id.toString() + '.png';
                } else {
                    link = firstMember.user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
                    fileDir = './files/buffer/' + firstMember.id.toString() + '.png';
                }
            } else {
                return await messageReturn({ input: errorMsg, type: 'text', title: "Bad Input!" });
            }
        } else {
            link = replyMessage.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
            fileDir = './files/buffer/' + replyMessage.author.id.toString() + '.png';
        }
        
        if (foundEmoji) {
            if (globalData.emojiStatus == 'invalid') return await messageReturn({ input: errorMsg, type: 'text', title: "Bad Input!" });
            else if (globalData.emojiStatus == 'single') {
                let files = fs.readdirSync('./files/buffer/emojiDownload');
                fileDir = './files/buffer/emojiDownload/' + files[0];
            } else {
                let archive = archiver('zip');
                let output = fs.createWriteStream('./files/buffer/emojis.zip');
                archive.pipe(output);
                await archive.directory('./files/buffer/emojiDownload/', false).finalize();
                while (!fs.existsSync('./files/buffer/emojis.zip')) {
                    await wait(25);
                }
                fileDir = './files/buffer/emojis.zip';
            }
        } else if (link != undefined) {
            if (link.includes('.gif')) {
                fileDir = fileDir.replace('.png', '.gif');
            }
            await download(link, fileDir);
        }
        
        return await messageReturn({ input: fileDir, type: 'attach' });
    }
};
