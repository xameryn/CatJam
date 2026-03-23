const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs-extra');
const fetch = require('node-fetch');
const { globalData } = require('../../state.js');
const { messageReturn, generalScraper, download } = require('../../utils/discord.js');
const { fileNameVerify, fileExtension, fileTypeFunc, uploadLimitCheck } = require('../../utils/file.js');
const { arcName } = require('../../utils/misc.js');
const { findEmoji } = require('../../utils/emoji.js');

module.exports = {
    name: 'archive',
    description: 'Finds the most recent file in chat and adds it to your personal archive!',
    aliases: ['arc', 'a'],
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('Personal archive management.')
        .addStringOption(option => option.setName('name').setDescription('File name to save/get').setRequired(false))
        .addBooleanOption(option => option.setName('list').setDescription('List your archived files').setRequired(false)),
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
        let message = messageOrInteraction.isInteraction ? {
            author: messageOrInteraction.user,
            guild: messageOrInteraction.guild,
            channel: messageOrInteraction.channel,
            content: messageOrInteraction.commandName + ' ' + (globalData.args.join(' ')),
            delete: async () => {},
            attachments: new Map(),
            reference: null
        } : messageOrInteraction;

        let command = 'archive';
        let prefix = globalData.prefix || globalData.globalPrefix;
        let fullInput = globalData.args.join(' ');
        let input = globalData.args[0];

        let customCMD = false;
        if (!(globalData.trueCommand === 'archive' || globalData.trueCommand === 'serverarchive')) {
            customCMD = true;
        }
        let serverArc = false;
        if (globalData.trueCommand === 'serverarchive' || (customCMD && globalData.userData.priorityARC == 'server')) {
            serverArc = true;
        }

        let name;
        if (customCMD) {
            name = message.content.slice(prefix.length).trim();
        } else {
            name = fullInput;
        }

        await findEmoji(name);
        let matches = globalData.emojiMatch;
        for (var match of matches) {
            if (match[3] != match[0]) {
                name = name.replace(match[3], match[2]);
            }
        }
        name = await fileNameVerify(name);
        let compareName = await arcName(name);
        let id;
        let title;
        let listThumb = null;

        if (serverArc) {
            id = message.guild.id;
            title = 'Server Archived File List';
            if (message.guild.iconURL() != null) {
                listThumb = message.guild.iconURL({ extension: 'png', size: 1024, dynamic: true });
            }
        } else {
            id = message.author.id;
            title = 'User Archived File List';
            listThumb = (message.author || messageOrInteraction.user).displayAvatarURL({ extension: 'png', size: 1024, dynamic: true });
        }

        if (!fs.existsSync(`./files/archive/${id}.json`)) {
            fs.writeFileSync(`./files/archive/${id}.json`, '[]');
        }
        let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
        let archiveList = JSON.parse(importJSON);
        archiveList = archiveList.filter(el => el != null);

        if ((fullInput === 'list' || fullInput === 'l') && !customCMD) {
            let imageList = [], videoList = [], gifList = [], audioList = [], textList = [], otherList = [];
            for (let i = 0; i < archiveList.length; i++) {
                let fileType = archiveList[i].type;
                if (fileType === 'link') {
                    fileType = await fileTypeFunc(archiveList[i].extension);
                }
                if (fileType === 'image') imageList.push(' ' + archiveList[i].name);
                else if (fileType === 'video') videoList.push(' ' + archiveList[i].name);
                else if (fileType === 'gif' || (archiveList[i].link.includes('https://tenor.com/') && archiveList[i].link.includes('-gif-'))) gifList.push(' ' + archiveList[i].name);
                else if (fileType === 'audio') audioList.push(' ' + archiveList[i].name);
                else if (fileType === 'text') textList.push(' ' + archiveList[i].name);
                else if (fileType === 'link') otherList.push(' ' + archiveList[i].name);
            }

            let desc = '';
            if (imageList.length > 0) desc += '**Images:** \n' + imageList + '\n\n';
            if (videoList.length > 0) desc += '**Videos:** \n' + videoList + '\n\n';
            if (gifList.length > 0) desc += '**GIFs:** \n' + gifList + '\n\n';
            if (audioList.length > 0) desc += '**Audio:** \n' + audioList + '\n\n';
            if (textList.length > 0) desc += '**Text:** \n' + textList + '\n\n';
            if (otherList.length > 0) desc += '**Other:** \n' + otherList + '\n\n\n';

            return await messageReturn({ input: desc, type: 'text', title: title, thumbnail: listThumb, commandDisplay: prefix + command + ' list' });
        }
        else if (input === undefined && !customCMD) {
            return await messageReturn({ input: 'Please include a file name.', type: 'text' });
        }
        else {
            let fileExists = false;
            let arrayPosition;
            for (let i = 0; i < archiveList.length; i++) {
                if (await arcName(archiveList[i].name) === compareName) {
                    fileExists = true;
                    arrayPosition = i;
                    break;
                }
            }

            if (!fileExists && customCMD) {
                id = serverArc ? message.author.id : message.guild.id;
                if (!fs.existsSync(`./files/archive/${id}.json`)) fs.writeFileSync(`./files/archive/${id}.json`, '[]');
                importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
                archiveList = JSON.parse(importJSON).filter(el => el != null);
                for (let i = 0; i < archiveList.length; i++) {
                    if (await arcName(archiveList[i].name) === compareName) {
                        fileExists = true;
                        arrayPosition = i;
                        break;
                    }
                }
            }

            if (!fileExists && !customCMD) {
                let link = await generalScraper('file');
                if (link === undefined) return await messageReturn({ input: 'Not a valid embed.', type: 'text' });
                
                if (link.includes('https://tenor.com/') && link.includes('-gif-')) {
                    let response = await fetch(link);
                    let rawHTML = await response.text();
                    let pos1 = rawHTML.indexOf('"https://media.tenor.com/');
                    let pos2 = rawHTML.indexOf('.gif"', pos1);
                    link = rawHTML.substring(pos1 + 1, pos2 + 4);
                }
                let extension = await fileExtension(link);
                let fileType = await fileTypeFunc(extension);
                let textType = fileType == 'link' ? 'Link' : 'File';

                if (fileType == 'image' || fileType == 'gif') {
                    let archiveBuffer = './files/buffer/' + name + '.' + extension;
                    await download(link, archiveBuffer);
                    if (uploadLimitCheck(archiveBuffer, 50000000)) fileType = 'link';
                }

                let archive = { name: name, link: link, extension: extension, type: fileType };
                archiveList.push(archive);
                fs.writeFileSync(`./files/archive/${id}.json`, JSON.stringify(archiveList));

                return await messageReturn({ input: textType + ' saved as "' + name + '"', type: 'text', thumbnail: (fileType == 'image' || fileType == 'gif') ? link : null });
            }
            else if (fileExists) {
                let file = archiveList[arrayPosition];
                let fileType = file.type;
                let typeLink = fileType == 'link';
                let link = file.link;
                let extension = typeLink ? undefined : file.extension;

                let messageType;
                let archiveBuffer;

                if ((fileType == 'image' || fileType == 'gif') && !(link.includes('https://media.tenor.com/'))) {
                    archiveBuffer = link;
                    messageType = 'link';
                } else {
                    archiveBuffer = './files/buffer/' + name + '.' + (extension || 'png');
                    if (!typeLink) {
                        await download(link, archiveBuffer);
                        messageType = 'attach';
                        if (uploadLimitCheck(archiveBuffer)) {
                            archiveBuffer = link;
                            messageType = link.includes('https://media.tenor.com/') ? 'link' : 'raw';
                        }
                    } else {
                        archiveBuffer = link;
                        messageType = 'raw';
                    }
                }

                if (!customCMD) {
                    let row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder().setCustomId('arc ' + (message.author ? message.author.id : messageOrInteraction.user.id) + ' delete ' + compareName + ' ' + id).setLabel('Delete').setStyle(ButtonStyle.Danger),
                        new ButtonBuilder().setCustomId('arc ' + (message.author ? message.author.id : messageOrInteraction.user.id) + ' rename ' + compareName + ' ' + id).setLabel('Rename').setStyle(ButtonStyle.Primary)
                    );
                    return await messageReturn({ input: archiveBuffer, type: messageType, filename: name + '.' + (extension || ''), components: [row] });
                } else {
                    return await messageReturn({ input: archiveBuffer, type: messageType, filename: name + '.' + (extension || ''), commandDisplay: prefix + name });
                }
            }
        }
    }
};
