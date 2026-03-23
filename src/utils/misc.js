const fs = require('fs-extra');
const { globalData } = require('../state.js');

function getTime(startTime) {
    const time = new Date();
    if (startTime == undefined) {
        return time.getTime();
    }
    else {
        return time.getTime() - startTime;
    }
}

async function wait(time) {
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(time);
}

function createFolders() {
    const folders = [
        './files/buffer',
        './files/archive',
        './files/reminders',
        './files/buffer/conversionDownload',
        './files/buffer/emojiDownload'
    ];
    folders.forEach(folder => {
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    });
}

async function arcName(name) {
    let newName = name.replaceAll(' ', '').replaceAll("'", '').toLowerCase();
    if (newName == '' || newName == undefined) {
        newName = '-';
    }
    return newName;
}

async function textArgs(maxInputs = 1, input) {
    let command = globalData.command;
    let messageContent = globalData.message.content;
    let prefix = globalData.prefix;
    if (input) {
        messageContent = prefix + command + ' ' + input;
    }
    let content = ' ' + messageContent.slice(prefix.length + command.length + 1).trim() + ' ';
    while (content.includes('“') || content.includes('”')) {
        content = content.replace('“', '"');
        content = content.replace('”', '"');
    }
    let strings = [];
    let targets = [' "', '" ', " '", "' ", ' '];
    let indexArrays = [[], [], [], [], []];
    for (var i = 0; i < 5; i++) {
        let index = 0;
        let targetIndex = content.indexOf(targets[i], index);
        while (targetIndex != -1) {
            if (i == 0 || i == 2) {
                indexArrays[i].push(targetIndex + 1);
            }
            else {
                indexArrays[i].push(targetIndex);
            }
            index = targetIndex + 1;
            targetIndex = content.indexOf(targets[i], index);
        }
        if (i == 4) {
            indexArrays[i].splice(-1, 1);
        }
    }
    let quotesExist = false;
    while ((indexArrays[0].length > 0 && indexArrays[1].length > 0) || (indexArrays[2].length > 0 && indexArrays[3].length > 0)) {
        quotesExist = true;
        let startIndex = Math.min(
            indexArrays[0].length > 0 ? Math.min(...indexArrays[0]) : Infinity,
            indexArrays[2].length > 0 ? Math.min(...indexArrays[2]) : Infinity
        );
        let endIndex = content.indexOf('" ', startIndex);
        if (content[startIndex] == "'") {
            endIndex = content.indexOf("' ", startIndex);
        }
        for (var i = 0; i < 4; i++) {
            indexArrays[i] = indexArrays[i].filter(val => val > endIndex);
        }
        let priorSpaces = indexArrays[4].filter(val => val < startIndex);
        if (priorSpaces.length > 1) {
            let spaceSplits = content.slice(indexArrays[4][0], startIndex).trim().split(' ');
            spaceSplits.forEach(string => strings.push(string));
        }
        indexArrays[4] = indexArrays[4].filter(val => val > endIndex);
        strings.push(content.slice(startIndex + 1, endIndex));
    }
    if (indexArrays[4].length > 0 || !quotesExist) {
        let spaceSplits;
        if (quotesExist) {
            spaceSplits = content.slice(indexArrays[4][0]).trim().split(' ');
        }
        else {
            spaceSplits = content.trim().split(' ');
        }
        spaceSplits.forEach(string => strings.push(string));
    }

    let argsText = [''];
    if (strings.length > maxInputs) {
        if (!quotesExist) {
            strings = [strings.join(' ')];
        }
        else {
            argsText = strings.splice(maxInputs);
        }
    }
    globalData.textInputs = strings;
    globalData.argsText = argsText;
    return;
}

module.exports = { getTime, wait, createFolders, arcName, textArgs };
