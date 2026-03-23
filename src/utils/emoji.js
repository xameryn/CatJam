const fs = require('fs-extra');
const emojiRegex = require('emoji-regex');
const nEmoji = require('node-emoji');

const { globalData } = require('../state.js');
const { getTime } = require('./misc.js');

async function findEmoji(emojiString) {
    let start = getTime();
    let defaultRegex = emojiRegex();
    let customRegex = /<:(\w+):(\d+)>/gmd;
    let animRegex = /<a:(\w+):(\d+)>/gmdi;
    let matches = [];
    for (var match of emojiString.matchAll(defaultRegex)) {
        matches.push([match[0], match.index, nEmoji.find(match[0]) ? nEmoji.find(match[0]).key : undefined, match[0], false]);
    }
    for (var match of emojiString.matchAll(customRegex)) {
        matches.push([match[2], match.index, match[1], match[0], false]);
    }
    for (var match of emojiString.matchAll(animRegex)) {
        matches.push([match[2], match.index, match[1], match[0], true]);
    }
    matches.sort((a, b) => { return a[1] - b[1]; });
    globalData.emojiMatch = matches;
    console.log('findEmoji - ' + getTime(start).toString() + 'ms');
    return;
}

async function getEmoji(emoji) {
    let start = getTime();
    let defaultRegex = emojiRegex();
    globalData.emojiStatus = 'invalid';
    if (emoji != undefined) {
        await findEmoji(emoji);
    }
    let matches = globalData.emojiMatch;
    if (matches == undefined) {
        console.log('getEmoji - ' + getTime(start).toString() + 'ms');
        return;
    }

    const { fileNameVerify } = require('./file.js');
    const { download } = require('./discord.js');

    for (var i = 0; i < matches.length; i++) {
        let ident = matches[i][0];
        let fileName = encodeURI(matches[i][2]);
        if (ident.search(defaultRegex) != -1) {
            let names = [ident.codePointAt(0).toString(16)];
            let p = 1;
            while (ident.codePointAt(p) != undefined) {
                if (ident.codePointAt(p).toString(16)[0] != 'd') {
                    names.push(ident.codePointAt(p).toString(16));
                }
                p += 1;
            }
            let name = names[0];
            let nameTrunc = names[0];
            for (var n = 1; n < names.length; n++) {
                if (names[n] != 'fe0f') {
                    nameTrunc += '-' + names[n];
                }
                name += '-' + names[n];
            }
            let image;
            if (fs.existsSync('./files/emoji/' + name + '.png')) {
                image = fs.readFileSync('./files/emoji/' + name + '.png');
            }
            else if (fs.existsSync('./files/emoji/' + nameTrunc + '.png')) {
                image = fs.readFileSync('./files/emoji/' + nameTrunc + '.png');
            }
            else {
                console.log('Unicode error!');
                continue;
            }
            fileName = await fileNameVerify(fileName, './files/buffer/emojiDownload/', '.png');
            fs.writeFileSync('./files/buffer/emojiDownload/' + fileName + '.png', image);
        }
        else {
            let ext = matches[i][4] ? '.gif' : '.png';
            let names = [''];
            if (fs.existsSync('./files/buffer/emojiDownload/')) {
                names = fs.readdirSync('./files/buffer/emojiDownload/');
                names.forEach((n, index) => {
                    names[index] = n.slice(0, -4);
                });
            }
            if (names.includes(fileName)) {
                let repeat = 0;
                while (names.includes(fileName + repeat.toString())) {
                    repeat += 1;
                }
                fileName += repeat.toString();
            }
            fileName = await fileNameVerify(fileName, './files/buffer/emojiDownload/', ext);
            await download('https://cdn.discordapp.com/emojis/' + ident + ext + '?size=1024', './files/buffer/emojiDownload/' + fileName + ext);
        }
    }
    if (matches.length == 1) {
        globalData.emojiStatus = 'single';
    }
    else {
        globalData.emojiStatus = 'multiple';
    }
    console.log('getEmoji - ' + getTime(start).toString() + 'ms');
    return;
}

module.exports = { findEmoji, getEmoji };
