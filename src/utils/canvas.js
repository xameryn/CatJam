const Canvas = require('canvas');
const fs = require('fs-extra');
const SizeOf = require('image-size');
const emojiRegex = require('emoji-regex');
const { globalData } = require('../state.js');
const { getTime } = require('./misc.js');
const { getEmoji, findEmoji } = require('./emoji.js');

async function canvasInitialize(canvasDims, background) {
    let start = getTime();
    let canvas = Canvas.createCanvas(canvasDims[0], canvasDims[1]);
    globalData.canvas = canvas;
    let context = canvas.getContext('2d');
    globalData.context = context;

    let backgroundImage;
    if (background == 'black') {
        backgroundImage = await Canvas.loadImage('./files/templates/blackBox.jpg');
    }
    else if (background == 'white') {
        backgroundImage = await Canvas.loadImage('./files/templates/whiteBox.jpg');
    }
    else if (background == 'png' || background == undefined) {
        console.log('canvasInitialize - ' + getTime(start).toString() + 'ms');
        return;
    }
    else {
        backgroundImage = await Canvas.loadImage(background);
    }
    context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    console.log('canvasInitialize - ' + getTime(start).toString() + 'ms');
    return;
}

async function imageToCanvas(funcArgs) {
    let { imageDims, widestRatio, tallestRatio, wideDims, tallDims, scaleLength, scaleAxis } = funcArgs;
    let imageWidth = imageDims[0];
    let imageHeight = imageDims[1];
    let wideWidth = wideDims[0];
    let wideHeight = wideDims[1];
    let tallWidth = tallDims[0];
    let tallHeight = tallDims[1];

    let width = imageWidth;
    let height = imageHeight;
    let imgEval = '';

    if (imageWidth / imageHeight > widestRatio) {
        imgEval = 'wide';
        height = (imageWidth / wideWidth) * wideHeight;
    }
    else if (imageHeight / imageWidth > tallestRatio) {
        imgEval = 'tall';
        width = (imageHeight / tallHeight) * tallWidth;
    }

    let scaleFactor = 1;
    if (scaleAxis == 'height') {
        scaleFactor = scaleLength / height;
    }
    else if (scaleAxis == 'width') {
        scaleFactor = scaleLength / width;
    }
    globalData.imgCanvasDims = [width * scaleFactor, height * scaleFactor];
    globalData.imgCanvasEval = imgEval;
    return;
}

async function scaleImage(imageDims, scaleType, scaleDims) {
    let canvas = globalData.canvas;
    if (scaleDims == undefined) {
        scaleDims = [canvas.width, canvas.height];
    }
    let width = imageDims[0];
    let height = imageDims[1];
    let imageRatio = height / width;
    let imageBool = height > width;

    let scaleDim = scaleDims;
    let scaleWidth, scaleHeight;
    if (typeof scaleDims == 'object') {
        scaleWidth = scaleDims[0];
        scaleHeight = scaleDims[1];
        let scaleRatio = scaleHeight / scaleWidth;

        if (scaleType == 'fit') {
            if (imageRatio > scaleRatio) {
                scaleDim = scaleHeight;
                imageBool = true;
            }
            else {
                scaleDim = scaleWidth;
                imageBool = false;
            }
        }
        else if (scaleType == 'fill') {
            if (imageRatio > scaleRatio) {
                scaleDim = scaleWidth;
                imageBool = false;
            }
            else {
                scaleDim = scaleHeight;
                imageBool = true;
            }
        }
    }
    else if (scaleType == 'up') {
        imageBool = !imageBool;
    }

    let newWidth;
    let newHeight;
    if (imageBool) {
        newWidth = (scaleDim / height) * width;
        newHeight = scaleDim;
    }
    else {
        newHeight = (scaleDim / width) * height;
        newWidth = scaleDim;
    }
    if (scaleWidth != undefined && scaleHeight != undefined) {
        globalData.scaledPos = [(scaleWidth - newWidth) / 2, (scaleHeight - newHeight) / 2];
    }
    globalData.scaledDims = [newWidth, newHeight];
    return;
}

async function drawImage(fileDir, offsets = [0, 0], imagePos, imageDims) {
    let start = getTime();
    let context = globalData.context;
    if (imagePos == undefined) {
        imagePos = globalData.scaledPos;
        imageDims = globalData.scaledDims;
    }
    else if (imageDims == undefined) {
        let imageSize = await SizeOf(fileDir);
        imageDims = [imageSize.width, imageSize.height];
    }
    let image = await Canvas.loadImage(fileDir);
    context.drawImage(image, imagePos[0] + offsets[0], imagePos[1] + offsets[1], imageDims[0], imageDims[1]);
    console.log('drawImage - ' + getTime(start).toString() + 'ms');
    return;
}

async function textHandler(funcArgs) {
    let start = getTime();
    let defaults = { style: '', minSize: 1, byLine: false, spacing: 0.2, xAlign: 'center', yAlign: 'center' };
    funcArgs = { ...defaults, ...funcArgs };
    let { text, font, style, maxSize, minSize, maxWidth, maxHeight, byLine, spacing, baseX, baseY, yAlign, xAlign } = funcArgs;

    let defaultRegex = emojiRegex();
    let customRegex = /<:(\w+):(\d+)>/gmd;
    let animRegex = /<a:(\w+):(\d+)>/gmdi;
    let char = ' ';
    text = text.replace(char, ' ');

    let matches;
    if (text.search(defaultRegex) != -1 || text.search(customRegex) != -1 || text.search(animRegex) != -1) {
        await findEmoji(text);
        matches = globalData.emojiMatch;
        for (var match of matches) {
            if (match[0] != match[3]) {
                text = text.replace(match[3], char);
            }
            else {
                text = text.replace(match[0], char);
            }
        }
    }

    let context = globalData.context;
    let maxWidthDyn = maxWidth;

    let size, lines, heights, height;
    for (var n = maxSize; n >= minSize; n--) {
        context.font = style + `${n}px ` + font;
        heights = [context.measureText(text).actualBoundingBoxDescent, context.measureText(text).actualBoundingBoxAscent];
        if (((heights[0] + heights[1]) <= 1 && text != '') || matches != undefined) {
            heights = [context.measureText('Qq').actualBoundingBoxDescent, context.measureText('Qq').actualBoundingBoxAscent];
        }
        height = heights[0] + heights[1];

        let best = 1;
        let totalWidth = context.measureText(text).width;
        let spaceWidth = context.measureText(' ').width;
        while (((totalWidth - (best - 1) * spaceWidth) / best) >= maxWidthDyn) {
            best += 1;
        }
        let maxLines;
        if (!byLine) {
            maxLines = Math.floor(maxHeight / (height + (height * spacing)));
            if (maxLines == 0) {
                if (n > minSize) { continue; }
                maxLines = 1;
            }
        } else {
            maxLines = maxHeight;
        }
        if (best > maxLines && maxLines != 0) {
            if (n > minSize) { continue; }
            else {
                while (((totalWidth - spaceWidth * (maxLines - 1)) / maxLines) > maxWidthDyn) {
                    maxWidthDyn += n * 0.8;
                }
            }
        }

        let words = text.split(' ');
        let indexes = [];
        let splitWords = [];
        for (var i = 0; i < words.length; i++) {
            let split = false;
            let word = words[i];
            let cutWord = word;
            let length = word.length;
            let baseLength = 0;

            while (context.measureText(cutWord).width > maxWidthDyn) {
                length -= 1;
                cutWord = word.substring(baseLength, length);
                if (context.measureText(cutWord).width <= maxWidthDyn) {
                    split = true;
                    indexes.push(i);
                    splitWords.push(cutWord);
                    baseLength = length;
                    length = word.length;
                    cutWord = word.substring(baseLength, length);
                }
            }
            if (split == true) {
                indexes.push(i);
                splitWords.push(cutWord);
            }
        }
        let counts = {};
        indexes.forEach((x) => { counts[x] = (counts[x] || 0) + 1; });
        let singleSplit = false;
        indexes.forEach((x) => { if (counts[x] == 2) { singleSplit = true; } });
        if (singleSplit && n > minSize) { continue; }

        if (indexes.length != 0) {
            for (var i = indexes.length - 1; i >= 0; i--) {
                let index = indexes[i];
                if (indexes[i + 1] != index && i != indexes.length) {
                    words.splice(index, 1);
                }
                words.splice.apply(words, [index, 0].concat(splitWords[i]));
            }
        }
        lines = [];
        let line = words[0];
        for (var i = 1; i < words.length; i++) {
            let word = words[i];
            let width = context.measureText(line + ' ' + word).width;
            if (width < maxWidthDyn) {
                line += ' ' + word;
            } else {
                lines.push(line);
                line = word;
            }
        }
        lines.push(line);
        size = n;
        if (lines.length > maxLines && maxLines != 0) {
            if (n > minSize) { continue; }
            else {
                maxWidthDyn += n * 0.8;
                n += 1;
                continue;
            }
        }
        break;
    }

    let lineNum = lines.length;
    let widths = [];
    for (var i = 0; i < lineNum; i++) {
        widths.push(context.measureText(lines[i]).width);
    }

    let xPos = [];
    if (xAlign == 'left') {
        for (var lineWidth of widths) { xPos.push(baseX); }
    }
    else if (xAlign == 'right') {
        for (var lineWidth of widths) { xPos.push(baseX - lineWidth); }
    } else {
        for (var lineWidth of widths) { xPos.push(baseX - (lineWidth / 2)); }
    }

    let space = height * spacing;
    let yPos = [];
    if (yAlign == 'top') {
        yPos = [baseY + (space / 2) + heights[1]];
        for (var i = 1; i < lineNum; i++) {
            yPos.push(yPos[i - 1] + space + height);
        }
    } else if (yAlign == 'bottom') {
        yPos = [baseY - (space / 2) - heights[0]];
        for (var i = 1; i < lineNum; i++) {
            yPos.push(yPos[i - 1] - height - space);
        }
        yPos.reverse();
    } else {
        let topY = baseY - (((height + space) * lineNum) / 2);
        yPos = [topY + (space / 2) + heights[1]];
        for (var i = 1; i < lineNum; i++) {
            yPos.push(yPos[i - 1] + space + height);
        }
    }

    let emojiX = [];
    let emojiLine = [];
    let charWidth = context.measureText(char).width;
    let offset = (charWidth - height) / 2;
    for (var i = 0; i < lineNum; i++) {
        let from = 0;
        let index = lines[i].indexOf(char, from);
        while (index != -1) {
            emojiX.push(context.measureText(lines[i].slice(0, index)).width + xPos[i] + offset);
            emojiLine.push(i);
            from = index + 1;
            index = lines[i].indexOf(char, from);
        }
    }
    xPos.forEach((x, index) => { xPos[index] = Math.round(x); });
    yPos.forEach((y, index) => { yPos[index] = Math.round(y); });

    let channel1 = false;
    if (globalData.text1 == undefined || globalData.text1.lines == undefined) {
        channel1 = true;
    }
    let target = channel1 ? 'text1' : 'text2';
    globalData[target] = {
        lines,
        pos: [xPos, yPos],
        size,
        height: (height + space) * lineNum,
        lineHeight: height,
        baselineHeight: heights[1],
        emoji: matches,
        emojiPos: [emojiX, heights[1] + (heights[0] / 2)],
        emojiLines: emojiLine
    };
    console.log('textHandler - ' + getTime(start).toString() + 'ms');
    return;
}

async function drawText(offsets = [0, 0], channel = 1, stroke = false) {
    let context = globalData.context;
    let target = channel == 1 ? 'text1' : 'text2';
    let { lines, pos, lineHeight, emoji: emojiArray, emojiPos, emojiLines } = globalData[target];

    for (let i = 0; i < lines.length; i++) {
        if (stroke) {
            context.strokeText(lines[i], pos[0][i] + offsets[0], pos[1][i] + offsets[1]);
        }
        context.fillText(lines[i], pos[0][i] + offsets[0], pos[1][i] + offsets[1]);
    }

    if (emojiArray != undefined) {
        globalData.emojiMatch = emojiArray;
        await getEmoji();
        let nameArray = [];
        const { fileNameVerify } = require('./file.js');
        for (var i = 0; i < emojiArray.length; i++) {
            let name = await fileNameVerify(encodeURI(emojiArray[i][2]));
            if (!nameArray.includes(name)) {
                nameArray.push(name);
            }
            else if (emojiArray[i][0] != emojiArray[i][3]) {
                let repeat = 0;
                while (nameArray.includes(name + repeat.toString())) {
                    repeat += 1;
                }
                name += repeat.toString();
                nameArray.push(name);
            }
            if (emojiArray[i][4]) {
                name += '.gif';
            }
            else {
                name += '.png';
            }
            let fileDir = './files/buffer/emojiDownload/' + name;
            let emojiWidth = lineHeight;
            let emojiHeight = lineHeight;
            let emojiSize = await SizeOf(fileDir);
            if (emojiSize.width != emojiSize.height) {
                if (emojiSize.width > emojiSize.height) {
                    emojiHeight = (emojiSize.height / emojiSize.width) * lineHeight;
                    offsets[1] += (lineHeight - emojiHeight) / 2;
                }
                else {
                    emojiWidth = (emojiSize.width / emojiSize.height) * lineHeight;
                    offsets[0] += (lineHeight - emojiWidth) / 2;
                }
            }
            let emoji = await Canvas.loadImage(fileDir);
            context.drawImage(emoji, emojiPos[0][i] + offsets[0], (pos[1][emojiLines[i]] - emojiPos[1] + offsets[1]), emojiWidth, emojiHeight);
            offsets[0] -= (lineHeight - emojiWidth) / 2;
            offsets[1] -= (lineHeight - emojiHeight) / 2;
        }
        fs.emptyDirSync('./files/buffer/emojiDownload/');
    }
    globalData[target] = {};
    return;
}

module.exports = { canvasInitialize, imageToCanvas, scaleImage, drawImage, textHandler, drawText };
