const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs-extra');
const sharp = require('sharp');
const { execSync } = require('child_process');
const { globalData } = require('../state.js');
const { getTime } = require('./misc.js');
const { fileTypeFunc, fileNameVerify, uploadLimitCheck, fileExtension } = require('./file.js');
const { IMAGE_TYPES, VIDEO_TYPES } = require('../config.js');
const path = require('path');

async function download(fileURL, fileDir, maxRes = 1080) {
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
    
    if (buffer.length < 100) {
        throw new Error(`Downloaded file is too small (${buffer.length} bytes) and likely corrupted.`);
    }

    const extension = fileExtension(fileURL);
    const isImage = IMAGE_TYPES.includes(extension);
    const isVideo = VIDEO_TYPES.includes(extension);

    if (!fileDir.toLowerCase().endsWith('.png')) {
        console.warn(`Warning: The target file ${fileDir} does not have a .png extension.`);
    }

    if (isImage) {
        try {
            await sharp(buffer)
                .rotate()
                .resize({
                    width: maxRes,
                    height: maxRes,
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .toColorspace('srgb')
                .toFormat('png')
                .toFile(fileDir);
            console.log(`download (image to png) - ` + getTime(start).toString() + 'ms');
            return;
        } catch (err) {
            console.error('Sharp conversion failed:', err);
        }
    } else if (isVideo) {
        try {
            const tempVideoPath = fileDir + '.temp';
            await fs.writeFile(tempVideoPath, buffer);
            
            const scaleFilter = `scale='if(gt(iw,ih),min(${maxRes},iw),-2)':'if(gt(ih,iw),min(${maxRes},ih),-2)':force_original_aspect_ratio=decrease`;
            
            execSync(`ffmpeg -y -i "${tempVideoPath}" -vf "${scaleFilter}" -frames:v 1 "${fileDir}"`, { stdio: 'ignore' });
            
            await fs.remove(tempVideoPath);
            console.log(`download (video to png) - ` + getTime(start).toString() + 'ms');
            return;
        } catch (err) {
            console.error('FFmpeg conversion failed:', err);
        }
    }
    
    await fs.writeFile(fileDir, buffer);
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
                return ((m.attachments.size > 0) && (atc != undefined) && (IMAGE_TYPES.includes(fileExtension(atc.url)))) || 
                (emb.length > 0 && (emb[0].data.type == 'image' || (emb[0].data.type == 'rich' && emb[0].data.image != undefined)));
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

    let isInteraction = message.isCommand || message.isChatInputCommand || message.isButton || message.isModalSubmit || message.replied !== undefined;

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
    if (!isInteraction && message.reference != undefined) {
        refID = message.reference.messageId;
    }

    let caller = message.member; 
    let userObj = message.author || message.user;

    if (!caller && message.guild) {
        caller = message.guild.members.cache.get(userObj.id);
    }
    
    let username = caller ? (caller.displayName || userObj.username) : userObj.username;
    let avatarURL = (caller && typeof caller.displayAvatarURL === 'function') 
        ? caller.displayAvatarURL({ extension: 'png', size: 256, dynamic: true }) 
        : userObj.displayAvatarURL({ extension: 'png', size: 256, dynamic: true });

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
            .setDescription(input && input.trim().length > 0 ? input : null)
            .setThumbnail(thumbnail);
        messageOptions = { embeds: [embed] };
    }

    else if (type == 'attach') {
        if (filename == '') {
            filename = typeof input === 'string' ? input.split('/').pop() : 'file.png';
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
            .setDescription(desc && desc.trim().length > 0 ? desc : null);
        messageOptions = { embeds: [embed] };

        if (!link) {
            messageOptions.files = [attachment];
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

    let shouldDelete = !isInteraction && message.delete && typeof message.delete === 'function' && (message.attachments?.size == 0 || !transformative);

    if (isInteraction) {
        if (message.replied || message.deferred) {
            await message.editReply(messageOptions);
        } else {
            await message.reply(messageOptions);
        }
    }
    else if (targetMessage != undefined && (message.id != targetMessage.id)) {
        messageOptions.allowedMentions = { repliedUser: false };
        await targetMessage.reply(messageOptions).catch(() => message.channel.send(messageOptions));
    }
    else if (refID != undefined) {
        messageOptions.allowedMentions = { repliedUser: false };
        let refMessage = await message.channel.messages.fetch(refID).catch(() => null);
        if (refMessage) await refMessage.reply(messageOptions).catch(() => message.channel.send(messageOptions));
        else await message.channel.send(messageOptions);
    }
    else if (shouldDelete) { // If we're deleting the command message, don't reply to it. 
        await message.channel.send(messageOptions);
    }
    else if (message.reply && !message.deleted) {
         await message.reply(messageOptions).catch(() => message.channel.send(messageOptions));
    }
    else {
        await message.channel.send(messageOptions);
    }

    if (shouldDelete) { // Execute deletion after sending response
        message.delete().catch(() => null);
    }

    const resultTime = getTime(start);

    // Disk cleanup
    fs.emptyDir('./files/buffer/emojiDownload/').catch(() => null);
    if (fs.existsSync('./files/buffer/emojis.zip')) {
        fs.unlink('./files/buffer/emojis.zip').catch(() => null);
    }

    return resultTime;
}

module.exports = { download, generalScraper, sendFile, infoScraper, canManageMessages, messageReturn };