const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs-extra');
const exifr = require('exifr');
const Canvas = require('skia-canvas');
const SizeOf = require('image-size');
const PNG = require("pngjs").PNG;
const { globalData } = require('../state.js');
const { getTime } = require('./misc.js');
const { fileTypeFunc, fileNameVerify, uploadLimitCheck } = require('./file.js');
const path = require('path');

async function download(fileURL, fileDir) {
    let start = getTime();
    if (!fileURL || !fileDir) {
        console.log('download - ' + getTime(start).toString() + 'ms');
        return;
    }

    fs.ensureDirSync(path.dirname(fileDir));

    const response = await fetch(fileURL);
    if (!response.ok) throw new Error(`Failed to fetch ${fileURL}: ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(fileDir, buffer);

    let dirArray = fileDir.split('.');
    if (dirArray[dirArray.length - 1] === 'png') {
        let metadata = await exifr.parse(fileDir, { chunked: false }).then(output => {
            if (output) {
                return [output.ProfileName, output.Orientation];
            }
            return ['', ''];
        }).catch(console.error);

        if (metadata) {
            if (metadata[0] === 'kCGColorSpaceDisplayP3') {
                let data = fs.readFileSync(fileDir);
                let png = PNG.sync.read(data);
                let buffer = PNG.sync.write(png);
                fs.writeFileSync(fileDir, buffer);
            }

            if (metadata[1] && metadata[1] !== '' && metadata[1] !== 'Horizontal (normal)') {
                let imageSize = await SizeOf(fileDir);
                let orient = metadata[1];
                let angle = '180';

                const { canvasInitialize } = require('./canvas.js');

                if (orient.includes('CW')) {
                    await canvasInitialize([imageSize.height, imageSize.width]);
                    angle = orient.slice(-6, -3).trim();
                } else {
                    await canvasInitialize([imageSize.width, imageSize.height]);
                }

                let canvas = globalData.canvas;
                let context = globalData.context;
                let image = await Canvas.loadImage(fileDir);

                if (orient.includes('Mirror horizontal') && !orient.includes('CW')) {
                    context.scale(-1, 1);
                    context.translate(-canvas.width, 0);
                } else if (orient.includes('Mirror vertical') || (orient.includes('Mirror horizontal') && orient.includes('CW'))) {
                    context.scale(1, -1);
                    context.translate(0, -canvas.height);
                }

                if (orient.includes('rotate') || orient.includes('Rotate')) {
                    let displace = [canvas.width, canvas.height];
                    if (angle === '90') {
                        displace[1] = 0;
                    }
                    if (angle === '270') {
                        displace[0] = 0;
                    }
                    context.translate(displace[0], displace[1]);
                    context.rotate(Math.PI * parseInt(angle) / 180);
                }

                context.drawImage(image, 0, 0, imageSize.width, imageSize.height);
                fs.writeFileSync(fileDir, await canvas.toBuffer('png'));
            }
        }
    }

    console.log('download - ' + getTime(start).toString() + 'ms');
}

async function generalScraper(scrapeType) {
    try {
        let start = getTime();
        let message = globalData.message;
        let searchParams = undefined;

        if (scrapeType === undefined) { scrapeType = 'link'; }

        if (scrapeType === 'image') {
            searchParams = (m) => {
                if (!m || !m.attachments || !m.embeds) return false;
                let atc = m.attachments.first();
                let emb = m.embeds;
                return ((m.attachments.size > 0) && (atc != undefined) &&
                    ((atc.url.includes('.png')) ||
                        (atc.url.includes('.jpg')) ||
                        (atc.url.includes('.bmp')) ||
                        (atc.url.includes('.jpeg')) ||
                        (atc.url.includes('.jfif')) ||
                        (atc.url.includes('.tiff')))) ||
                    (emb.length > 0 &&
                        (emb[0].data.type == 'image' ||
                            (emb[0].data.type == 'rich' && emb[0].data.image != undefined)));
            };
        }
        else if (scrapeType === 'file') {
            searchParams = (m) => ((m.embeds.length > 0 && (m.embeds[0].data.type == 'image' || m.embeds[0].data.type == 'video' || m.embeds[0].data.type == 'gifv' || (m.embeds[0].data.type == 'rich' && m.embeds[0].data.image != undefined))) || m.attachments.size > 0);
        }
        else if (scrapeType === 'twitter') {
            searchParams = (m) => (((m.embeds.length > 0) && (m.embeds[0].data.type === 'rich') && (m.embeds[0].data.url != null) && (m.embeds[0].data.url.includes('twitter.com') || m.embeds[0].data.url.includes('x.com'))) || ((m.content.includes('https://twitter.com/') || m.content.includes('https://x.com/')) && m.content.includes('/status/')));
        }

        let lastMessage = await message.channel.messages.fetch().then(async messageList => {
            let filtered = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter(searchParams).first();

            if (message.reference != undefined) {
                let replyMessage = await message.channel.messages.fetch(message.reference.messageId);
                if (searchParams(replyMessage)) {
                    filtered = replyMessage;
                }
            }
            return filtered;
        });

        globalData.targetMessage = await lastMessage;

        if (lastMessage == undefined) {
            return undefined;
        }

        if (scrapeType == 'twitter' && lastMessage.embeds.length == 0) {
            return lastMessage.content;
        }

        if (lastMessage.attachments.size > 0) {
            return lastMessage.attachments.first().url;
        }

        else if (lastMessage.embeds.length > 0) {
            if (scrapeType == 'twitter') {
                return lastMessage.embeds[0].data.url;
            }
            else if (lastMessage.embeds[0].data.type == 'rich' && lastMessage.embeds[0].data.image != undefined) {
                return lastMessage.embeds[0].data.image.url;
            }
            else {
                return lastMessage.embeds[0].data.url;
            }
        }
    } catch (error) {
        console.error('Error in generalScraper:', error);
        return undefined;
    }
}

async function sendFile(fileURL, fileDir) {
    let start = getTime();
    let message = globalData.message;
    if (await uploadLimitCheck(fileDir)) {
        console.log("over 8 mb");
        if (await fileURL.includes('tenor.com/view') || fileURL.includes('.gif')) {
            fileURL = await fileURL.split('.');
            fileURL.pop();
            fileURL = await fileURL.join('.');
        }
        console.log("embed");
        return message.channel.send({ content: fileURL });
    }
    var attachment = new AttachmentBuilder(fileDir);
    console.log('sendFile - ' + getTime(start).toString() + 'ms');
    return message.channel.send({ files: [attachment] });
}

async function infoScraper() {
    let start = getTime();
    let message = globalData.message;
    let messageListLastAttachment = await message.channel.messages.fetch({ limit: 2 }).then(async messageList => {
        message.delete();
        return messageList.last();
    });

    let url = undefined;
    if (messageListLastAttachment.attachments.first() != undefined) {
        url = await messageListLastAttachment.attachments.first().url;
    }
    else if (messageListLastAttachment.embeds[0] != undefined) {
        url = await messageListLastAttachment.embeds[0].images[1];
    }

    console.log(url);
    console.log('infoScraper - ' + getTime(start).toString() + 'ms');
    return messageListLastAttachment;
}

function canManageMessages(msg) {
    return msg.member.permissionsIn(msg.channel).has('MANAGE_MESSAGES');
}

async function messageReturn(funcArgs) {
    let messageOptions;
    let message = globalData.message;
    let targetMessage = globalData.targetMessage;

    let start = getTime();
    let input = funcArgs.input;
    let type = funcArgs.type ? funcArgs.type : 'raw';
    let filename = funcArgs.filename ? funcArgs.filename : '';

    let link = false;
    if (type == 'link') {
        type = 'attach';
        link = true;
    }
    let title = funcArgs.title ? funcArgs.title : null;
    let thumbnail = funcArgs.thumbnail ? funcArgs.thumbnail : null;
    let components = funcArgs.components;
    let desc = funcArgs.desc ? funcArgs.desc : null;
    let author = funcArgs.author ? funcArgs.author : null;
    let url = funcArgs.url ? funcArgs.url : null;
    let commandDisplay = funcArgs.commandDisplay ? funcArgs.commandDisplay : globalData.globalPrefix + globalData.trueCommand;

    let transformative = true;
    if (funcArgs.transformative === false) {
        transformative = false;
    }

    let refID;
    if (message.reference != undefined) {
        refID = message.reference.messageId;
    }

    let caller;
    if (message.guild) {
        caller = await message.guild.members.fetch(message.author.id).catch(() => null);
    }
    let username = caller ? caller.displayName : (message.author ? message.author.username : 'Unknown');
    let avatarURL = caller ? caller.displayAvatarURL({ extension: 'png', size: 256, dynamic: true }) : (message.author ? message.author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true }) : null);

    if (type == 'text') {
        if (title == null) {
            title = input;
            input = null;
        }
        let embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle(title)
            .setURL(url)
            .setAuthor(author)
            .setFooter({ text: username + ' : ' + commandDisplay, iconURL: avatarURL })
            .setDescription(input)
            .setThumbnail(thumbnail);
        messageOptions = { embeds: [embed] };

        if (message.delete && (message.attachments.size == 0 || !transformative)) {
            await message.delete().catch(() => null);
        }
    }

    else if (type == 'attach') {
        if (filename == '') {
            filename = input.split('/').pop();
        }
        let name = await fileNameVerify(filename);
        name = name.replaceAll(' ', '_').replaceAll(/[~\(\)\!'&@\$\+\,;\=#\[\]\{\}\^%]+/g, '');
        let regex = /[^_\.]/;
        if (!regex.test(name) || name == '') {
            name = '-';
        }

        let attachment = new AttachmentBuilder(input, { name: name });
        let image = null;
        if (fileTypeFunc(name.split('.').pop()) == 'image' || fileTypeFunc(name.split('.').pop()) == 'gif') {
            if (link) {
                image = input;
            }
            else {
                image = 'attachment://' + name;
            }
        }
        let embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle(title)
            .setURL(url)
            .setAuthor(author)
            .setFooter({ text: username + ' : ' + commandDisplay, iconURL: avatarURL })
            .setImage(image)
            .setDescription(desc);
        messageOptions = { embeds: [embed] };

        if (!link) {
            messageOptions.files = [attachment];
        }

        if (message.delete && (message.attachments.size == 0 || !transformative)) {
            await message.delete().catch(() => null);
        }
        var noReply = false;
        if (!transformative && targetMessage != undefined) {
            let lastMessage = await message.channel.messages.fetch({ limit: 1 }).then(async messages => {
                return messages.first();
            }).catch(() => null);
            if (lastMessage && lastMessage.id == targetMessage.id && targetMessage.author.id == (caller ? caller.id : message.author.id) && targetMessage.content == '') {
                noReply = true;
                await targetMessage.delete().catch(() => null);
            }
        }
    }
    else if (typeof input == 'string') {
        messageOptions = { content: input };
    }
    else {
        messageOptions = input;
    }
    if (components != undefined) {
        messageOptions.components = components;
    }

    if (message.replied || message.deferred) { // Handle Interactions
        await message.editReply(messageOptions);
    }
    else if (targetMessage != undefined && (message.id != targetMessage.id && !noReply)) {
        messageOptions.allowedMentions = { repliedUser: false };
        await targetMessage.reply(messageOptions).catch(() => message.channel.send(messageOptions));
    }
    else if (refID != undefined) {
        messageOptions.allowedMentions = { repliedUser: false };
        let refMessage = await message.channel.messages.fetch(refID).catch(() => null);
        if (refMessage) await refMessage.reply(messageOptions).catch(() => message.channel.send(messageOptions));
        else await message.channel.send(messageOptions);
    }
    else if (message.reply && !message.deleted) {
         await message.reply(messageOptions).catch(() => message.channel.send(messageOptions));
    }
    else {
        await message.channel.send(messageOptions);
    }
    fs.emptyDirSync('./files/buffer/emojiDownload/');
    if (fs.existsSync('./files/buffer/emojis.zip') == true) {
        fs.unlinkSync('./files/buffer/emojis.zip');
    }
    return getTime(start);
}

module.exports = { download, generalScraper, sendFile, infoScraper, canManageMessages, messageReturn };
