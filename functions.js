const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const fs = require(`fs`);
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const Canvas = require('canvas');
const SizeOf = require('image-size');

import { globalData } from './CatJamsUtilities.js';
/*
  _____    _____    _____   __  __              _____   __     __
 |  __ \  |  __ \  |_   _| |  \/  |     /\     |  __ \  \ \   / /
 | |__) | | |__) |   | |   | \  / |    /  \    | |__) |  \ \_/ /
 |  ___/  |  _  /    | |   | |\/| |   / /\ \   |  _  /    \   /
 | |      | | \ \   _| |_  | |  | |  / ____ \  | | \ \     | |
 |_|      |_|  \_\ |_____| |_|  |_| /_/    \_\ |_|  \_\    |_|
*/
//-----------------------
// FILE-SCRAPER
//-----------------------
async function fileScraper() {
  console.log('fileScraper');
  let message = globalData.message;
  if (message.attachments.size) {
    var Attachment = message.attachments.last();
    var attachedFileURL = Attachment.url.toString();
    return attachedFileURL;
  }
  else {
    var exitForLoop = false;
    for (let i = 2; i < 25; i++) {
      if (exitForLoop) {return;}
      var scraperURL = message.channel.messages.fetch({ limit: i }).then(async messageList => {
        let messageListLastAttachment = messageList.last().attachments;
        if (messageListLastAttachment.size) {
          var Attachment = await messageList.last().attachments.first();
          var attachedFileURL = Attachment.url;
          exitForLoop = true;
          return attachedFileURL;
        }
      })
      var attachedFileURL = await scraperURL.then();
      if (attachedFileURL !== undefined) {
        return attachedFileURL;
      }
    }
  }
}
//-----------------------
// DOWNLOAD
//-----------------------
function download(fileURL, fileDir){
  console.log('download');
  request.get(fileURL).pipe(fs.createWriteStream(fileDir));
}
//-----------------------
// CANVAS-INITIALIZE
//-----------------------
async function canvasInitialize(canvasWidth, canvasHeight, backgroundImage, pngArgs){
  console.log('canvasInitialize');
  //can be given specific arguments, otherwise uses global ones
  let args = globalData.args;
  if (pngArgs !== undefined) {
    args = pngArgs
  }
  var canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
  globalData.canvas = canvas;
  var context = canvas.getContext('2d');
  globalData.context = context;

  var background = await Canvas.loadImage(backgroundImage);
  if (args.includes('png')) {
    return;
  }
  else {
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    return;
  }
}
/*
   _____    _____              _        ______            ______   _____   _______
  / ____|  / ____|     /\     | |      |  ____|          |  ____| |_   _| |__   __|
 | (___   | |         /  \    | |      | |__     ______  | |__      | |      | |
  \___ \  | |        / /\ \   | |      |  __|   |______| |  __|     | |      | |
  ____) | | |____   / ____ \  | |____  | |____           | |       _| |_     | |
 |_____/   \_____| /_/    \_\ |______| |______|          |_|      |_____|    |_|
*/
async function canvasScaleFit(fileDir, boxWidth, boxHeight){
  console.log('canvasScaleFit');
  let canvas = globalData.canvas;
  let context = globalData.context;
  let memeSize = await SizeOf(fileDir)
  if (boxWidth === undefined || boxHeight === undefined) {
    var boxWidth = canvas.width;
    var boxHeight = canvas.height;
  }
  let memeRatio = memeSize.width / memeSize.height;
  //wider than canvas, fit width
  if (memeRatio >= (boxWidth / boxHeight)) {
    let scalingRatio = memeSize.width / boxWidth;
    var scaledHeight = memeSize.height / scalingRatio;
    var scaledWidth = boxWidth;
    var xAxis = 0;
    var yAxis = (Math.abs(boxHeight - scaledHeight)) / 2;
  }
  //taller than canvas, fit height
  else if (memeRatio < (boxWidth / boxHeight)) {
    let scalingRatio = memeSize.height / boxHeight;
    var scaledHeight = boxHeight;
    var scaledWidth = memeSize.width / scalingRatio;
    var xAxis = (Math.abs(boxWidth - scaledWidth)) / 2;
    var yAxis = 0;
  }
  globalData.scaledWidth = scaledWidth;
  globalData.scaledHeight = scaledHeight;
  globalData.xAxis = xAxis;
  globalData.yAxis = yAxis;
  return;
}
/*
   _____    _____              _        ______            ______   _____   _        _
  / ____|  / ____|     /\     | |      |  ____|          |  ____| |_   _| | |      | |
 | (___   | |         /  \    | |      | |__     ______  | |__      | |   | |      | |
  \___ \  | |        / /\ \   | |      |  __|   |______| |  __|     | |   | |      | |
  ____) | | |____   / ____ \  | |____  | |____           | |       _| |_  | |____  | |____
 |_____/   \_____| /_/    \_\ |______| |______|          |_|      |_____| |______| |______|
*/
async function canvasScaleFill(fileName, internalWidth, internalHeight, centerX, centerY){
  console.log('canvasScaleFill');
  let canvas = globalData.canvas;
  let context = globalData.context;
  var memeSize = await SizeOf('./images/templates/buffer/' + fileName);
  //wider than dimensions, fill to height
  if ((memeSize.width / memeSize.height) >= (internalWidth / internalHeight)) {
    var scalingRatio = memeSize.height / internalHeight;
    if (scalingRatio < 1) {
      scalingRatio = Math.pow(scalingRatio, -1);
    }
    var scaledWidth = memeSize.width * scalingRatio;
    var scaledHeight = internalHeight;
    var xAxis = centerX - (scaledWidth / 2);
    var yAxis = centerY - (internalHeight / 2);
  }
  //taller than dimensions, fill to width
  else if ((memeSize.width / memeSize.height) < (internalWidth / internalHeight)) {
    var scalingRatio = memeSize.width / internalWidth;
    if (scalingRatio < 1) {
      scalingRatio = Math.pow(scalingRatio, -1);
    }
    var scaledWidth = internalWidth;
    var scaledHeight = memeSize.height * scalingRatio;
    var xAxis = centerX - (internalWidth / 2);
    var yAxis = centerY - (scaledHeight / 2);
  }
  globalData.scaledWidth = scaledWidth;
  globalData.scaledHeight = scaledHeight;
  globalData.xAxis = xAxis;
  globalData.yAxis = yAxis;
  return;
}
/*
  _____   __  __    _____             _____              _   _  __      __              _____
 |_   _| |  \/  |  / ____|           / ____|     /\     | \ | | \ \    / /     /\      / ____|
   | |   | \  / | | |  __   ______  | |         /  \    |  \| |  \ \  / /     /  \    | (___
   | |   | |\/| | | | |_ | |______| | |        / /\ \   | . ` |   \ \/ /     / /\ \    \___ \
  _| |_  | |  | | | |__| |          | |____   / ____ \  | |\  |    \  /     / ____ \   ____) |
 |_____| |_|  |_|  \_____|           \_____| /_/    \_\ |_| \_|     \/     /_/    \_\ |_____/
*/
//-----------------------
// SUMMARY:
// calculates the canvas size for a canvas based on an image (equal to image if suitable, based on parameters it can be found to wide or too tall)
//-----------------------
// ARGUMENTS (that aren't self-explanatory):
// widestRatio, tallestRatio - the maximum allowed (width / height) or (height / width) respectively
// wideDims, tallDims - if the image is too wide (wideDims) or too tall (tallDims), these dimensions are used instead
// scaleLength - what size the final image should be scaled to (height or width)
// scaleAxis - 'height' or 'width' depending on what scaleLength represents
// (above 2 arguments can be left undefined for no scaling)
//-----------------------
async function imageToCanvas(imageDims, widestRatio, tallestRatio, wideDims, tallDims, scaleLength, scaleAxis) {
  console.log('imageToCanvas');
  let imageWidth = imageDims[0];
  let imageHeight = imageDims[1];
  let wideWidth = wideDims[0];
  let wideHeight = wideDims[1];
  let tallWidth = tallDims[0];
  let tallHeight = tallDims[1];

  let width = imageWidth;
  let height = imageHeight;
  let imgEval = '';
  // if too wide, height scaled to the "wide" dimensions (width is fit to edges)
  if (imageWidth / imageHeight > widestRatio) {
    imgEval = 'wide';
    height = (imageWidth / wideWidth) * wideHeight;
  } // if too tall, width scaled to the "tall" dimensions (height is fit to edges)
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
  globalData.imgCanvasX = width * scaleFactor;
  globalData.imgCanvasY = height * scaleFactor;
  globalData.imgCanvasEval = imgEval;
}
/*
  _______   ______  __   __  _______                       _____     _____    _____
 |__   __| |  ____| \ \ / / |__   __|              /\     |  __ \   / ____|  / ____|
    | |    | |__     \ V /     | |     ______     /  \    | |__) | | |  __  | (___
    | |    |  __|     > <      | |    |______|   / /\ \   |  _  /  | | |_ |  \___ \
    | |    | |____   / . \     | |              / ____ \  | | \ \  | |__| |  ____) |
    |_|    |______| /_/ \_\    |_|             /_/    \_\ |_|  \_\  \_____| |_____/
*/
function textArgs() {
  let message = globalData.message;
  let prefix = globalData.prefix;
  let strings = message.content.slice(prefix.length).trim().split('"');
  let inputs = [];
  for (var i = 0; i < strings.length; i++) {
    if (i % 2 != 0) {
      inputs.push(strings[i])
    }
  }
  let args = strings[strings.length - 1].trim().split(' ');
  globalData.textInputs = inputs
  globalData.argsText = args
}
/*
  _______   ______  __   __  _______            _    _              _   _   _____    _        ______   _____
 |__   __| |  ____| \ \ / / |__   __|          | |  | |     /\     | \ | | |  __ \  | |      |  ____| |  __ \
    | |    | |__     \ V /     | |     ______  | |__| |    /  \    |  \| | | |  | | | |      | |__    | |__) |
    | |    |  __|     > <      | |    |______| |  __  |   / /\ \   | . ` | | |  | | | |      |  __|   |  _  /
    | |    | |____   / . \     | |             | |  | |  / ____ \  | |\  | | |__| | | |____  | |____  | | \ \
    |_|    |______| /_/ \_\    |_|             |_|  |_| /_/    \_\ |_| \_| |_____/  |______| |______| |_|  \_\
*/
//-----------------------
// SUMMARY:
// fits text into the given dimensions, keeping size as large as possible, and outputs the size, lines, and their positions
//-----------------------
// ARGUMENTS (that aren't self-explanatory):
// style - bold, italic, etc., must be in form 'bold ' with the space since I am lazy
// byLine - if true, treats maxHeight as number of lines instead of pixels
// spacing - amount of extra space between lines (as a fraction of the line height)
// maxHeight - set to 0 for no max height
// yAlign - 'top' or 'bottom' to have text positioned down from or up from baseY respectively (any other value or no value for alignment centered to baseY)
//-----------------------
function textHandler(text, font, style, maxSize, minSize, maxWidth, maxHeight, byLine, spacing, baseX, baseY, yAlign, xAlign) {
  console.log('textHandler');
  let context = globalData.context;
  //we need to be able to change the max width
  let maxWidthDyn = maxWidth;
  //-----------------------
  // OUTER LOOP
  //-----------------------
  //iterates through range of font sizes from max to min, breaking out when a valid size is reached
  for (var n = maxSize; n >= minSize; n--) {
    context.font = style + `${n}px ` + font;
    //height below and above the baseline (0 and 1 respectively)
    var heights = [context.measureText(text).actualBoundingBoxDescent, context.measureText(text).actualBoundingBoxAscent];
    var height = heights[0] + heights[1];
    //-----------------------
    // CHECK IF VALID
    //-----------------------
    //finds theoretical smallest number of lines for this font size, if larger than allowed maximum, continues to next size
    let best = 1;
    let totalWidth = context.measureText(text).width;
    let spaceWidth = context.measureText(' ').width;
    while (((totalWidth - (best-1)*spaceWidth) / best) >= maxWidthDyn) {
      best += 1;
    }
    if (!byLine) {
      var maxLines = Math.floor(maxHeight / (height + (height * spacing)));
    } else {
      var maxLines = maxHeight;
    }

    if (best > maxLines && maxLines != 0 && n > minSize) { continue; }
    //-----------------------
    // WORD SPLITTING
    //-----------------------
    //if a word is too long (longer than the max width), it's split into smaller words until they all fit
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
        cutWord = word.substring(baseLength,length);
        //if the cut down word is short enough, then save it, and move on to the part of the word left behind
        //(repeat until the remaining part is short enough)
        if (context.measureText(cutWord).width <= maxWidthDyn) {
          split = true;
          indexes.push(i);
          splitWords.push(cutWord);
          baseLength = length;
          length = word.length;
          cutWord = word.substring(baseLength,length);
        }
      }
      //push done here since the last word portion causes entire loop to terminate
      if (split == true) {
        //console.log('SPLIT')
        indexes.push(i);
        splitWords.push(cutWord);
      }
    }
    //if all the spillovers are only 1-fold (only need to be split once), shirnk text size instead
    let uniqueIndexes = indexes.filter((index, i, array) => array.indexOf(index) === i)
    if (indexes.length > uniqueIndexes.length && n > minSize) { continue; }
    //goes through the split up words and their indexes, deleting the original word and putting these in their place
    if (indexes.length != 0) {
      for (var i = indexes.length - 1; i >= 0; i--) {
        let index = indexes[i];
        //deletes word at index, but only if it hasn't been deleted in a previous loop
        if (indexes[i+1] != index && i != indexes.length) {
          words.splice(index,1);
        }
        //the actual insertion part (no clue how this even works lol)
        words.splice.apply(words, [index,0].concat(splitWords[i]));
      }
    }
    //-----------------------
    // CHECK IF VALID 2
    //-----------------------
    //checking again since word splitting slightly changes the total width
    //(checked before splitting to avoid wasted time on the lengthy split process)
    best = 1;
    totalWidth = context.measureText(words.join(' ')).width;
    while (((totalWidth - (best-1)*spaceWidth) / best) >= maxWidthDyn) {
      best += 1;
    }
    if (best > maxLines && maxLines != 0) {
      //since this is the last check, if there is no smaller size to continue to, the max width itself is expanded until it theoretically fits
      if (n > minSize) { continue; }
      else {
        while (((totalWidth - spaceWidth*(maxLines-1)) / maxLines) > maxWidthDyn) {
          maxWidthDyn += n * 0.8;
        }
      }
    }
    //setup for the inner loop
    var lines = [];
    let line = words[0];
    //-----------------------
    // INNER LOOP
    //-----------------------
    //iterates through each word, checking if it can be added the the line, and if not creating a new line
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
    //final push since it isn't done in loop, and the size declared globally
    lines.push(line);
    var size = n;
    //-----------------------
    // CONTINGENCY
    //-----------------------
    //since the calculations at the start were theoretical, there are often too many lines
    //this requires either moving to the next size, or expanding the width even more
    if (lines.length > maxLines && maxLines != 0) {
      //console.log('OOPS!')
      if (n > minSize) { continue; }
      else {
        //loop is held at min size until contingency check passes
        maxWidthDyn += n * 0.8;
        n += 1;
        continue;
      }
    }
    break;
  }
  //-----------------------
  // ESTABLISHING VALUES
  //-----------------------
  let lineNum = lines.length;
  let widths = [];
  for (var i = 0; i < lineNum; i++) {
    widths.push(context.measureText(lines[i]).width);
  }
  //-----------------------
  // X POSITIONS
  //-----------------------
  //write comments later
  let xPos = [];
  if (xAlign == 'left') {
    for (var lineWidth of widths) {
      xPos.push(baseX);
    }
  }
  else if (xAlign == 'right') {
    for (var lineWidth of widths) {
      xPos.push(baseX - lineWidth);
    }
  } else {
    for (var lineWidth of widths) {
      xPos.push(baseX - (lineWidth / 2));
    }
  }
  //-----------------------
  // Y POSITIONS
  //-----------------------
  //for spacing: spacing put between all lines, and half a spacing put before and after (spacing # = line #)
  //(also note that text is drawn from the baseline)
  let space = height * spacing;
  let yPos = [];
  //for top align, start with half-space and above baseline height (heights[1])
  //then move down by space and full height every line after that
  if (yAlign == 'top') {
    yPos = [baseY + (space / 2) + heights[1]];
    for (var i = 1; i < lineNum; i++) {
      yPos.push(yPos[i-1] + space + height);
    }
  //for bottom align, start with half-space and below baseline height (heights[0])
  //then move up by space and full height every line after that
  } else if (yAlign == 'bottom') {
    yPos = [baseY - (space / 2) - heights[0]];
    for (var i = 1; i < lineNum; i++) {
      yPos.push(yPos[i-1] - height - space);
    }
    //positions reversed since here they're calculated bottom to top
    yPos.reverse();
  //for center align, convert the center value to a top value then do top align
  } else {
    let topY = baseY - (((height + space) * lineNum) / 2);
    yPos = [topY + (space / 2) + heights[1]];
    for (var i = 1; i < lineNum; i++) {
      yPos.push(yPos[i-1] + space + height);
    }
  }
  //-----------------------
  // FINAL VALUES
  //-----------------------
  globalData.textLines = lines;
  globalData.textX = xPos;
  globalData.textY = yPos;
  globalData.textSize = size;
  globalData.textHeight = (height + space) * lineNum;
  globalData.baselineTextHeight = heights[1]
}

module.exports = { fileScraper, download, canvasInitialize, canvasScaleFit, canvasScaleFill, imageToCanvas, textArgs, textHandler };
