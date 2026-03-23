const fs = require('fs-extra');
const { IMAGE_TYPES, VIDEO_TYPES, AUDIO_TYPES, TEXT_TYPES } = require('../config.js');

function fileExtension(url) {
    return url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
}

function fileTypeFunc(extension) {
    if (IMAGE_TYPES.includes(extension)) { return 'image'; }
    else if (VIDEO_TYPES.includes(extension)) { return 'video'; }
    else if (extension == 'gif') { return 'gif'; }
    else if (AUDIO_TYPES.includes(extension)) { return 'audio'; }
    else if (TEXT_TYPES.includes(extension)) { return 'text'; }
    else { return 'link'; }
}

function uploadLimitCheck(fileDir, size = 8000000) {
    const statz = fs.statSync(fileDir);
    const fileSizeInBytes = statz.size;
    return fileSizeInBytes > size;
}

async function typeCheck(fileURL) {
    let fileTypeArray = await fileURL.split('.');
    let suffix = await fileTypeArray.pop();
    if (await suffix.includes('?')) {
        suffix = await suffix.split('?');
        await suffix.pop();
    }
    if (suffix.length > 5) {
        return undefined;
    }
    return suffix;
}

async function fileNameVerify(string, filePath, extension) {
    let charRegex = /[\\/:\*\?"<>\|]+/g; // \ / : * ? " < > |
    let nameRegex = /^(aux|nul|prn|con|lpt[1-9]|com[1-9])(\.|$)/i;
    string = string.replaceAll(charRegex, '-');
    if (string.search(nameRegex) != -1) {
        string = '-';
    }
    if (filePath != undefined && fs.existsSync(filePath + string + extension)) {
        let repeat = 0;
        while (fs.existsSync(filePath + string + repeat.toString() + extension)) {
            repeat += 1;
        }
        string += repeat.toString();
    }
    return string;
}

module.exports = { fileExtension, fileTypeFunc, uploadLimitCheck, typeCheck, fileNameVerify };
