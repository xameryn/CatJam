const { Client, Intents, MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require(`fs`);
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const Canvas = require('canvas');
const SizeOf = require('image-size');

import { globalData } from './CatJamsUtilities.js';

// FILE-SCRAPER
async function fileScraper() {
  console.log('fileScraper');
  let message = globalData.message;
  var scraperURL = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => ((m.embeds.length > 0 && (m.embeds[0].type == 'image' || m.embeds[0].type == 'video' || m.embeds[0].type == 'gifv')) || m.attachments.size > 0)).first();
  if (lastMessage == undefined) {
    return undefined;
  }

  if (lastMessage.attachments.size > 0) {
    let url = lastMessage.attachments.first().url;
    return url;
  }

  if (lastMessage.embeds.length > 0) {
    let url = lastMessage.embeds[0].url;
    if (await url.includes('tenor.com/view')) { //If a Tenor link
      url = url + ".gif" //Add .gif file type
    }
    return url;
  }
  });
  var attachedFileURL = await scraperURL.then();
  let outputURL = attachedFileURL;
  return outputURL;
}
async function imageScraper() {
  console.log('imageScraper');
  let message = globalData.message;
  let atc = null
  let emb = null
  var scraperURL = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) =>
  (atc = m.attachments.first(), emb = m.embeds, ((m.attachments.size > 0) && (atc != undefined) && ((atc.url.includes('.png')) || (atc.url.includes('.jpg')) || (atc.url.includes('.bmp')))) || (emb.length > 0 && (emb[0].type == 'image')))).first();
  if (lastMessage == undefined) {
    return undefined;
  }

  if (lastMessage.attachments.size > 0) {
    let url = lastMessage.attachments.first().url;
    return url;
  }

  if (lastMessage.embeds.length > 0) {
    let url = lastMessage.embeds[0].url;
    return url;
  }
  });
  var attachedFileURL = await scraperURL.then();
  let outputURL = attachedFileURL;
  //console.log(outputURL);
  return outputURL;
}
async function linkScraper() {
  console.log('linkScraper');
  let message = globalData.message;
  var websiteMessage = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => ((m.embeds.length > 0 && (m.embeds[0].type == 'rich') && (m.embeds[0].url.includes('twitter.com'))))).first();
  return lastMessage;
});
return websiteMessage;
}
async function uploadLimitCheck(fileDir) {
  const statz = fs.statSync(fileDir);
  const fileSizeInBytes = statz.size;
  if (fileSizeInBytes > 8000000) {
    console.log(fileSizeInBytes);
    return true;
  }
  else {
    return false;
  }
}
// DOWNLOAD
async function download(fileURL, fileDir){
  console.log('download');
  if (await fileURL == undefined || fileDir == undefined) { //Prevents a download if the provided URL or directory is undefined
    return;
  }
  else {
    if (await fs.existsSync(fileDir) == true) {fs.unlinkSync(fileDir)} //Deletes the provided dir if it is already downloaded
    await request.get(fileURL).pipe(fs.createWriteStream(fileDir)); //Downloads URL in directory
    await downloadCheck(fileDir)
    return;
  }
}
async function downloadCheck(fileDir){ //Checks if the download is complete before moving on
  while (await fs.existsSync(fileDir) == false) { //Checks if the downloaded file exists
    await wait(25)
  }
  while (await fs.statSync(fileDir).size == 0) { //Checks if the downloaded file is larger than 0 bytes
    await wait(25)
  }
  await wait(250) // :3
  return;
}
async function typeCheck(fileURL){ //Checks the file type of the URL
  if (fileURL != await undefined) {
    fileURL = await fileURL.toString()
    let fileTypeArray = await fileURL.split('.'); //Splits URL at every '.'
    let suffix = await fileTypeArray.pop(); //Takes the last split part (the file type)
    if (await suffix.includes('?')) {
      suffix = await suffix.split('?');
      await suffix.pop();
    }
    return suffix;
  }
}
async function sendFile(fileURL, fileDir){
  let message = globalData.message;
  if (await uploadLimitCheck(fileDir)) { //If gif is over 8MB, embeds as link
    console.log("over 8 mb");
    if (await fileURL.includes('tenor.com/view') || fileURL.includes('.gif')) { //Fuck you Tenor
      console.log(fileURL);
      fileURL = await fileURL.split('.'); //Splits URL at every '.'
                fileURL.pop(); //Removes file type (.gif)
      fileURL = await fileURL.join('.'); //Joins URL at every '.'
    }
    console.log("embed");
    return message.channel.send(fileURL);
  }
  var attachment = await new MessageAttachment(fileDir);
  return message.channel.send(attachment);
}
// CANVAS-INITIALIZE
async function canvasInitialize(canvasWidth, canvasHeight, backgroundImage, modifier1, modifier2){
  console.log('canvasInitialize');
  var canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
  globalData.canvas = canvas;
  var context = canvas.getContext('2d');
  globalData.context = context;
  var background = await Canvas.loadImage(backgroundImage);
  if (modifier1 == 'png' || modifier2 == 'png') {
    return;
  }
  else {
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    return;
  }
}
// SCALE-FIT
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
// SCALE-FILL
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
//TEXT-FUNCS
async function textAddition(font, stroke, fill, inputString, textBoxCenterX, textBoxCenterY, textBoxWidth, textBoxHeight, upperCaseBool) {
  let canvas = globalData.canvas
  let context = globalData.context
  let textInput = inputString[1]
  if (textInput == undefined) {
    textInput = 'insert meme here'
  }
  if (upperCaseBool == true) {
    textInput = textInput.toUpperCase();
  }


  console.log('Text Width')
  console.log(getTextWidth(textInput, font))
  console.log('Text Height')
  console.log(getTextHeight(textInput, font))

  let splitFont = font.split('px');

  /*for () {
    context.font.replace(/\d+px/, (parseInt(context.font.match(/\d+px/)) - 2) + "px")
  }*/

  let joinedFont = splitFont.join('px');

  context.font = font;
  context.fillStyle = fill;

  let textX = textBoxCenterX - ((getTextWidth(textInput, font)) / 2)
  //let textY = textBoxCenterY - ((getTextHeight(textInput, font)) / 2)
  context.fillText(textInput, textX, textBoxCenterY + 25);
}
function getTextWidth(text, font = getCanvasFontSize()) {
  let canvas = globalData.canvas
  let context = globalData.context
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}
function getTextHeight(text, font = getCanvasFontSize()) {
   let canvas = globalData.canvas
   let context = globalData.context
   context.font = font;
   const metrics = context.measureText(text);
   return metrics.Height;
}
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
}
function getTime(startTime) {
  const time = new Date();
  if (startTime == undefined) {
    let startTime = time.getTime();
    return startTime;
  }
  else {
    let endTime = time.getTime() - startTime;
    return endTime;
  }
}
async function wait(time) {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  await delay(time);
}
// DEBUG:
async function infoScraper() {
  //console.log('infoScraper');
  let message = globalData.message;
  var scraperINFO = message.channel.messages.fetch({ limit: 2 }).then(async messageList => {
    let messageListLastAttachment = messageList.last();
    //console.log(messageListLastAttachment);
    console.log(messageListLastAttachment);
    let tenorURL = messageListLastAttachment.embeds[0].type;
    //console.log(tenorURL);
    return messageListLastAttachment;
  })
  var information = await scraperINFO.then();
  return;
}

module.exports = { fileScraper, download, canvasInitialize, canvasScaleFit, canvasScaleFill, imageToCanvas,
                  textAddition, getTextWidth, getTextHeight, textHandler, getTime, wait, typeCheck, infoScraper,
                  uploadLimitCheck, sendFile, linkScraper, imageScraper };
