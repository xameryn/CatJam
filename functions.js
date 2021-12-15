const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs-extra')
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const Canvas = require('canvas');
const SizeOf = require('image-size');

import { globalData } from './main.js';
/* FILE-SCRAPER
-----------------------*/
async function fileScraper() {
  let start = getTime();
  let message = globalData.message;
  var scraperURL = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => ((m.embeds.length > 0 && (m.embeds[0].type == 'image' || m.embeds[0].type == 'video' || m.embeds[0].type == 'gifv')) || m.attachments.size > 0)).first();

  if (lastMessage == undefined) {
    return undefined;
  }

  if (message.reference != undefined) {
    let replyMessage =  await message.channel.messages.fetch(message.reference.messageID);
    if ((replyMessage.embeds.length > 0 && (replyMessage.embeds[0].type == 'image' || replyMessage.embeds[0].type == 'video' || replyMessage.embeds[0].type == 'gifv')) || replyMessage.attachments.size > 0) {
      lastMessage = replyMessage
    }
  }

  if (lastMessage.attachments.size > 0) {
    let url = lastMessage.attachments.first().url;
    return url;
  }

  if (lastMessage.embeds.length > 0) {
    let url = lastMessage.embeds[0].url;
    if (await url.includes('tenor.com/view')) { //If a Tenor link
      url = url + ".gif"; //Add .gif file type
    }
    return url;
  }
  });
  var attachedFileURL = await scraperURL.then();
  let outputURL = attachedFileURL;
  console.log('fileScraper - ' + getTime(start).toString() + 'ms');
  return outputURL;
}
async function imageScraper() {
  let start = getTime();
  let message = globalData.message;
  let atc = null;
  let emb = null;
  var scraperURL = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) =>
  (atc = m.attachments.first(), emb = m.embeds, ((m.attachments.size > 0) && (atc != undefined) && ((atc.url.includes('.png')) || (atc.url.includes('.jpg')) || (atc.url.includes('.bmp')) || (atc.url.includes('.jpeg')) || (atc.url.includes('.jfif')) || (atc.url.includes('.tiff')) || (atc.url.includes('.webp')))) || (emb.length > 0 && (emb[0].type == 'image')))).first();

  if (lastMessage == undefined) {
    return undefined;
  }

  if (message.reference != undefined) {
    let replyMessage =  await message.channel.messages.fetch(message.reference.messageID);
    let replyATC = replyMessage.attachments.first()
    if (((replyMessage.attachments.size > 0) && (replyATC != undefined) && ((replyATC.url.includes('.png')) || (replyATC.url.includes('.jpg')) || (replyATC.url.includes('.bmp')) || (replyATC.url.includes('.jpeg')) || (replyATC.url.includes('.jfif')) || (replyATC.url.includes('.tiff')) || (replyATC.url.includes('.webp')))) || (replyMessage.embeds.length > 0 && (replyMessage.embeds[0].type == 'image'))) {
      lastMessage = replyMessage
    }
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
  console.log('imageScraper - ' + getTime(start).toString() + 'ms');
  return outputURL;
}
async function linkScraper() {
  let start = getTime();
  let message = globalData.message;
  var websiteMessage = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) => ((m.embeds.length > 0 && (m.embeds[0].type == 'rich') && (m.embeds[0].url.includes('twitter.com'))))).first();
  return lastMessage;
});
console.log('linkScraper - ' + getTime(start).toString() + 'ms');
return websiteMessage;
}
async function uploadLimitCheck(fileDir) {
  let start = getTime();
  const statz = fs.statSync(fileDir);
  const fileSizeInBytes = statz.size;
  if (fileSizeInBytes > 8000000) {
    console.log(fileSizeInBytes);
    console.log('uploadLimitCheck - ' + getTime(start).toString() + 'ms');
    return true;
  }
  else {
    console.log('uploadLimitCheck - ' + getTime(start).toString() + 'ms');
    return false;
  }
}
/* DOWNLOAD
-----------------------*/
async function download(fileURL, fileDir){
  let start = getTime();
  if (await fileURL == undefined || fileDir == undefined) { //Prevents a download if the provided URL or directory is undefined
    console.log('download - ' + getTime(start).toString() + 'ms');
    return;
  }
  else {
    /*if (await fs.existsSync(fileDir) == true) { //Deletes the provided dir if it is already downloaded
      fs.unlinkSync(fileDir);
      console.log("Deletes the provided dir");
    }*/
    await request.get(fileURL).pipe(fs.createWriteStream(fileDir)); //Downloads URL in directory
    console.log('download - ' + getTime(start).toString() + 'ms');
    await downloadCheck(fileDir);
    return;
  }
}
async function downloadCheck(fileDir){ //Checks if the download is complete before moving on
  let start = getTime();
  while (await fs.existsSync(fileDir) == false) { //Checks if the downloaded file exists
    await wait(25);
  }
  while (await fs.statSync(fileDir).size == 0) { //Checks if the downloaded file is larger than 0 bytes
    await wait(25);
  }
  await wait(400); // :3
  console.log('downloadCheck - ' + getTime(start).toString() + 'ms');
  return;
}
async function typeCheck(fileURL){ //Checks the file type of the URL
  let start = getTime();
  let fileTypeArray = await fileURL.split('.'); //Splits URL at every '.'
  let suffix = await fileTypeArray.pop(); //Takes the last split part (the file type)
  if (await suffix.includes('?')) {
    suffix = await suffix.split('?');
    await suffix.pop();
  }
  if (suffix.length > 5) {
    return undefined;
  }
  console.log('typeCheck - ' + getTime(start).toString() + 'ms');
  return suffix;
}
async function sendFile(fileURL, fileDir){
  let start = getTime();
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
  console.log('sendFile - ' + getTime(start).toString() + 'ms')
  return message.channel.send(attachment);
}
/* CANVAS
-----------------------*/
async function canvasInitialize(canvasWidth, canvasHeight, backgroundImage, pngArgs){
  let start = getTime();
  //can be given specific arguments, otherwise uses global ones
  let args = globalData.args;
  if (pngArgs !== undefined) {
    args = pngArgs;
  }
  var canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
  globalData.canvas = canvas;
  var context = canvas.getContext('2d');
  globalData.context = context;

  var background = await Canvas.loadImage(backgroundImage);
  if (args.includes('png')) {
    console.log('canvasInitialize - ' + getTime(start).toString() + 'ms');
    return;
  }
  else {
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    console.log('canvasInitialize - ' + getTime(start).toString() + 'ms');
    return;
  }
}
// SCALE-FIT
async function canvasScaleFit(fileDir, boxWidth, boxHeight){
  let start = getTime();
  let canvas = globalData.canvas;
  let context = globalData.context;
  let memeSize = await SizeOf(fileDir);
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
  console.log('canvasScaleFit - ' + getTime(start).toString() + 'ms');
  return;
}
// SCALE-FILL
async function canvasScaleFill(fileName, internalWidth, internalHeight, centerX, centerY){
  let start = getTime();
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
  console.log('canvasScaleFill - ' + getTime(start).toString() + 'ms');
  return;
}
// IMAGE-CANVAS
async function imageToCanvas(imageDims, widestRatio, tallestRatio, wideDims, tallDims, scaleLength, scaleAxis) {
  let start = getTime();
  // widestRatio, tallestRatio - the maximum allowed (width / height) or (height / width) respectively
  // wideDims, tallDims - if the image is too wide (wideDims) or too tall (tallDims), these dimensions are used instead
  // scaleLength - what size the final image should be scaled to (height or width)
  // scaleAxis - 'height' or 'width' depending on what scaleLength represents
  // (above 2 arguments can be left undefined for no scaling)
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
  console.log('imageToCanvas - ' + getTime(start).toString() + 'ms');
  return;
}
/* USER-DATA
-----------------------*/
async function userData(action, tag, arg) {
  let start = getTime();
  //action - 'get' to get preferences and store them in globalData, 'set' to change a preference
  //tag - preference to change
  //arg - thing to set preference to
  let user = globalData.authorID;
  let doc = fs.readFileSync('user-data.json', 'utf8');
  let lines = doc.split('\r\n');
  //-----------------------
  // GET
  //-----------------------
  if (action == 'get') {
    //goes through lines, if id matches, sets values using that line
    for (var i = 0; i < lines.length; i++) {
      let line = JSON.parse(lines[i]);
      if (line.id == user) {
        globalData.pointBG = line.pointBG;
        globalData.posterBG = line.posterBG;
        globalData.posterTXT = line.posterTXT;
        globalData.authorIndex = i;
        console.log('userData - ' + getTime(start).toString() + 'ms');
        return;
      }
    }
    //will only be run if no id found (since if it was found function returns), sets values to defaults and adds new line
    globalData.pointBG = 'black';
    globalData.posterBG = 'white';
    globalData.posterTXT = 'big';
    globalData.authorIndex = lines.length - 1;
    lines.push(`{"id":"${user}","pointBG":"black","posterBG":"white","posterTXT":"big"}`);
  }
  //-----------------------
  // SET
  //-----------------------
  //depending on tag and args, changes the data of the given line, and creates message to be sent
  else if (action == 'set') {
    let data = JSON.parse(lines[globalData.authorIndex]);
    globalData.toggledMSG = `Couldn't set that preference... :Ɛ`;
    //background changes
    if (arg == 'white' || arg == 'black' || arg == 'png') {
      if (tag == 'point') {
        data.pointBG = arg;
      }
      else if (tag == 'poster') {
        data.posterBG = arg;
      }
      if (tag == 'point' || tag == 'poster') {
        globalData.toggledMSG = 'Preferences for `' + `${tag}` + '` background set to ' + `**${arg}**` + '! :3';
      }
    }
    //poster text change
    else if (tag == 'poster' && (arg == 'big' || arg == 'small')) {
      data.posterTXT = arg;
      globalData.toggledMSG = 'Preferences for `' + `${tag}` + '` text priority set to ' + `**${arg}**` + '! :3';
    }
    //reset to default
    else if (tag == 'reset') {
      data = JSON.parse(`{"id":"${user}","pointBG":"black","posterBG":"white","posterTXT":"big"}`);
      globalData.toggledMSG = `Preferences reset! :3`;
    }
    lines[globalData.authorIndex] = JSON.stringify(data);
  }
  //-----------------------
  // DATA UPDATE
  //-----------------------
  //updates the doc to match the lines here
  //(runs for set and if no id found in get)
  let output = lines[0];
  if (lines.length != 1) {
    output += '\r\n';
    for (var i = 1; i < lines.length - 1; i++) {
      output += lines[i] + '\r\n';
    }
    output += lines[lines.length - 1];
  }
  fs.writeFileSync('user-data.json', output, 'utf8');
  console.log('userData - ' + getTime(start).toString() + 'ms');
  return;
}
/* TEXT-ARGS
-----------------------*/
async function textArgs() {
  let start = getTime();
  let message = globalData.message;
  let prefix = globalData.prefix;
  let content = message.content.slice(prefix.length).trim();
  console.log(content)
  while (content.includes('“') || content.includes('”')) {
    content = content.replace('“','"');
    content = content.replace('”','"');
  }
  let strings;
  if (content.indexOf("'") == -1) {
    strings = content.split('"')
  }
  else if (content.indexOf('"') == -1) {
    strings = content.split("'")
  }
  else {
    if (content.indexOf("'") > content.indexOf('"')) {
      strings = content.split('"')
    }
    else {
      strings = content.split("'")
    }
  }
  console.log(strings)
  let inputs = [];
  //odd indexes are the areas enclosed by strings, so they are what's retrieved
  for (var i = 0; i < strings.length; i++) {
    if (i % 2 != 0) {
      inputs.push(strings[i]);
    }
  }
  //if no quotes are found, uses individual args as the strings (so stuff like "$meme text1 text2" will work with no quotes)
  if (strings.length == 1) {
    inputs = globalData.args;
  }
  //args are set as everything after the last quotes (split into array by spaces), useful to distinguish text content from actual args
  let argsText = strings[strings.length - 1].trim().split(' ');
  globalData.textInputs = inputs;
  globalData.argsText = argsText;
  console.log('textArgs - ' + getTime(start).toString() + 'ms');
  return;
}
/* TEXT-HANDLER
-----------------------*/
async function textHandler(text, font, style, maxSize, minSize, maxWidth, maxHeight, byLine, spacing, baseX, baseY, yAlign, xAlign) {
  let start = getTime();
  // style - bold, italic, etc., must be in form 'bold ' with the space since I am lazy
  // maxHeight - set to 0 for no max height
  // byLine - if true, treats maxHeight as number of lines instead of pixels
  // spacing - amount of extra space between lines (as a fraction of the line height)
  // yAlign - 'top' or 'bottom' to have text positioned down from or up from baseY respectively (any other value or no value for alignment will center on baseY)
  // xAlign - 'left' or 'right' to have text positioned right from or left from baseX respectively (any other value or no value for alignment will center on baseX)
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
        indexes.push(i);
        splitWords.push(cutWord);
      }
    }
    //if all the spillovers are only 1-fold (only need to be split once), shrink text size instead
    let uniqueIndexes = indexes.filter((index, i, array) => array.indexOf(index) === i);
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
  globalData.baselineTextHeight = heights[1];
  console.log('textHandler - ' + getTime(start).toString() + 'ms');
  return;
}
/* TIME
-----------------------*/
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
/* DEBUG
-----------------------*/
async function infoScraper() {
  let start = getTime();
  let message = globalData.message;
  var scraperINFO = message.channel.messages.fetch({ limit: 2 }).then(async messageList => {
    let messageListLastAttachment = messageList.last();
    //console.log(messageListLastAttachment);
    console.log(messageListLastAttachment);
    let tenorURL = messageListLastAttachment.embeds[0].type;
    //console.log(tenorURL);
    console.log('infoScraper - ' + getTime(start).toString() + 'ms');
    return messageListLastAttachment;
  })
  var information = await scraperINFO.then();
  console.log('infoScraper - ' + getTime(start).toString() + 'ms');
  return;
}

module.exports = { fileScraper, download, canvasInitialize, canvasScaleFit, canvasScaleFill, imageToCanvas,
                  textHandler, getTime, wait, typeCheck, infoScraper, uploadLimitCheck, sendFile, linkScraper,
                  userData, textArgs, imageScraper};
