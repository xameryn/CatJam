const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const sharp = require('sharp');
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const emojiRegex = require('emoji-regex');
const fs = require('fs-extra')
const request = require('request');
const Canvas = require('canvas');
const SizeOf = require('image-size');
const emojiDict = require("emoji-dictionary");

import { globalData } from './main.js';
import { catJamArrayStorage, stellarisArrayStorage, imageTypes, videoTypes, audioTypes, textTypes } from './arrays.js';

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
async function fileLinkScraper() {
  let start = getTime();
  let message = globalData.message;
  var scraperURL = message.channel.messages.fetch().then(async messageList => {
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter((m) =>
  (m.attachments.size > 0) || (m.embeds.length > 0)).first();

  if (message.reference != undefined) {
    let replyMessage =  await message.channel.messages.fetch(message.reference.messageID);
    if ((replyMessage.attachments.size > 0) || (replyMessage.embeds.length > 0)) {
      lastMessage = replyMessage;
    }
  }

  if (lastMessage == undefined) {
    return undefined;
  }

  if (lastMessage.attachments.size > 0) {
    let url = await lastMessage.attachments.first().url;
    return url;
  }

  else if (lastMessage.embeds.length > 0) {
    let url = await lastMessage.embeds[0].url;
    return url;
  }
  });
  var attachedFileURL = await scraperURL.then();
  let outputURL = attachedFileURL;
  console.log('fileLinkScraper - ' + getTime(start).toString() + 'ms');
  return outputURL;
}
function uploadLimitCheck(fileDir) {
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
async function download(fileURL, fileDir){
  let start = getTime();
  if (await fileURL == undefined || fileDir == undefined) { //Prevents a download if the provided URL or directory is undefined
    console.log('download - ' + getTime(start).toString() + 'ms');
    return;
  }
  else {
    //downloads URL in directory
    let write = fs.createWriteStream(fileDir);
    request.get(fileURL).pipe(write);
    //waits until download is finished
    let finished = false;
    write.on('finish', () => {
      finished = true
    });
    while (!finished) {
      await wait(25);
    }
    console.log('download - ' + getTime(start).toString() + 'ms');
    return;
  }
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
async function canvasScaleFill(fileDir, internalWidth, internalHeight, centerX, centerY){
  let start = getTime();
  var memeSize = await SizeOf(fileDir);
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
async function scaleDims(imageDims, scaledDim) {
  //scales the largest dimension down to scaledDim
  let start = getTime();
  let width = imageDims[0];
  let height = imageDims[1];
  let newWidth;
  let newHeight;
  if (height > width) {
    newWidth = (scaledDim / height) * width;
    newHeight = scaledDim;
  }
  else {
    newHeight = (scaledDim / width) * height;
    newWidth = scaledDim;
  }
  console.log('scaleDims - ' + getTime(start).toString() + 'ms');
  return [newWidth, newHeight];
}
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
async function findEmoji(emojiString) {
  let start = getTime();
  let defaultRegex = emojiRegex();
  let customRegex = /<:(\w+):(\d+)>/gmd;
  let animRegex = /<a:(\w+):(\d+)>/gmd;
  let matches = [];
  //guide to match: [(unicode emoji/emoji id), (index within string), (name), (name used in discord), (is animated boolean)]
  //default emoji
  for (var match of emojiString.matchAll(defaultRegex)) {
    matches.push([match[0], match.index, emojiDict.getName(match[0]), match[0], false]);
  }
  //custom (and animated) emoji
  for (var match of emojiString.matchAll(customRegex)) {
    matches.push([match[2], match.index, match[1], match[0], false]);
  }
  for (var match of emojiString.matchAll(animRegex)) {
    matches.push([match[2], match.index, match[1], match[0], true]);
  }
  //matches sorted so first in the string come first
  matches.sort((a,b) => {return a[1] - b[1];});
  globalData.emojiMatch = matches;
  console.log('findEmoji - ' + getTime(start).toString() + 'ms');
  return;
}
async function getEmoji(emoji) {
  let start = getTime();
  let defaultRegex = emojiRegex();
  globalData.emojiStatus = 'invalid'
  if (emoji != undefined) {
    findEmoji(emoji);
  }
  let matches = globalData.emojiMatch;
  if (matches == undefined) {
    console.log('getEmoji - ' + getTime(start).toString() + 'ms');
    return;
  }
  //-----------------------
  // LOOP
  //-----------------------
  for (var i = 0; i < matches.length; i++) {
    let ident = matches[i][0];
    let fileName = encodeURI(matches[i][2]);
    //-----------------------
    // DEFAULT EMOJI
    //-----------------------
    if (ident.search(defaultRegex) != -1) {
      let names = [ident.codePointAt(0).toString(16)];
      let p = 1;
      while (ident.codePointAt(p) != undefined) {
        if (ident.codePointAt(p).toString(16)[0] != 'd') {
          names.push(ident.codePointAt(p).toString(16));
        }
        p += 1;
      }
      //compiles points into file name
      let name = names[0];
      let nameTrunc = names[0]
      for (var n = 1; n < names.length; n++) {
        if (names[n] != 'fe0f') {
          nameTrunc += '-' + names[n];
        }
        name += '-' + names[n];
      }
      //tries to find matching emoji in archive
      let image;
      if (fs.existsSync('./files/emoji/' + name + '.png')) {
        image = fs.readFileSync('./files/emoji/' + name + '.png');
      }
      else if (fs.existsSync('./files/emoji/' + nameTrunc + '.png')) {
        image = fs.readFileSync('./files/emoji/' + nameTrunc + '.png');
      }
      else {
        console.log('Unicode error!')
        console.log('getEmoji - ' + getTime(start).toString() + 'ms');
        return;
      }
      fileName = await fileNameVerify(fileName, './files/buffer/emojiDownload/', '.png');
      fs.writeFileSync('./files/buffer/emojiDownload/' + fileName + '.png', image);
    }
    //-----------------------
    // CUSTOM EMOJI
    //-----------------------
    else {
      //animated check
      let ext;
      if (matches[i][4]) {
        ext = '.gif';
      }
      else {
        ext = '.png';
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
async function drawEmoji(useArgs = false, yPos, emojiX, emojiY, emojiLines, emojiArray, lineHeight, offX, offY) {
  let start = getTime();
  // arguments:
  // emojiArray is globalData emojiMatch
  // all others are args from textHandler
  // last 2 are custom offsets for x and y pos
  let context = globalData.context;
  if (!useArgs) {
    yPos = globalData.textY
    emojiX = globalData.emojiX;
    emojiY = globalData.emojiY;
    emojiLines = globalData.emojiLines;
    emojiArray = globalData.emojiMatch;
    lineHeight = globalData.lineTextHeight;
    offX = 0
    offY = 0
  }
  else {
    globalData.emojiMatch = emojiArray
  }

  if (emojiArray == undefined) {
    return;
  }
  await getEmoji();
  let emoji;
  let nameArray = [];
  for (var i = 0; i < emojiArray.length; i++) {
    //accounts for duplicate names
    let name = await fileNameVerify(encodeURI(emojiArray[i][2]));
    if (!nameArray.includes(name)) {
      nameArray.push(name);
    }
    else {
      let repeat = 0;
      while (nameArray.includes(name + repeat.toString())) {
        repeat += 1;
      }
    } 
    //actual emoji drawing
    emoji = await Canvas.loadImage('./files/buffer/emojiDownload/' + name + '.png');
    context.drawImage(emoji, emojiX[i] + offX, (yPos[emojiLines[i]] - emojiY + offY), lineHeight, lineHeight);
  } 
  fs.emptyDirSync('./files/buffer/emojiDownload/');
  console.log('drawEmoji - ' + getTime(start).toString() + 'ms');
  return;
}
async function textArgs() {
  let start = getTime();
  let message = globalData.message;
  let prefix = globalData.prefix;
  let content = message.content.slice(prefix.length).trim();
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
async function textHandler(text, font, style, maxSize, minSize, maxWidth, maxHeight, byLine, spacing, baseX, baseY, yAlign, xAlign) {
  let start = getTime();
  // style - bold, italic, etc., must be in form 'bold ' with the space since I am lazy
  // maxHeight - set to 0 for no max height
  // byLine - if true, treats maxHeight as number of lines instead of pixels
  // spacing - amount of extra space between lines (as a fraction of the line height)
  // yAlign - 'top' or 'bottom' to have text positioned down from or up from baseY respectively (any other value or no value for alignment will center on baseY)
  // xAlign - 'left' or 'right' to have text positioned right from or left from baseX respectively (any other value or no value for alignment will center on baseX)

  //let text = input
  //-----------------------
  // EMOJI PART 1
  //-----------------------
  //replaces emojis with invisible character to be drawn over later
  let defaultRegex = emojiRegex();
  let customRegex = /<:\w+:(\d+)>/gmd;
  let animRegex = /<a:\w+:(\d+)>/gmd;
  let char = ' ';
  text = text.replace(char, ' ');
  if (text.search(defaultRegex) != -1 || customRegex.test(text) || animRegex.test(text)) {
    await findEmoji(text);
    var matches = globalData.emojiMatch;
    for (var match of matches) {
      if (match[0] != match[3]) {
        text = text.replace(match[3], char);
      }
      else {
        text = text.replace(match[0], char);
      }
    }
  }
  //-----------------------
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
    if (((heights[0] + heights[1]) <= 1 && text != '') || matches != undefined) {
      heights = [context.measureText('Qq').actualBoundingBoxDescent, context.measureText('Qq').actualBoundingBoxAscent];
    }
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
    if (best > maxLines && maxLines != 0) {
      //since this is the last check, if there is no smaller size to continue to, the max width itself is expanded until it theoretically fits
      if (n > minSize) { continue; }
      else {
        while (((totalWidth - spaceWidth*(maxLines-1)) / maxLines) > maxWidthDyn) {
          maxWidthDyn += n * 0.8;
        }
      }
    }
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
    let counts = {};
    indexes.forEach((x) => {
      counts[x] = (counts[x] || 0) + 1;
    });
    let singleSplit = false;
    indexes.forEach((x) => {
      if (counts[x] == 2) {
        singleSplit = true;
      }
    });
    if (singleSplit && n > minSize) { continue; }

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
  // EMOJI PART 2
  //-----------------------
  let emojiX = [];
  let emojiLine = [];
  let charWidth = context.measureText(char).width
  let offset = (charWidth - height) / 2;
  for (var i = 0; i < lineNum; i++) {
    let from = 0;
    let index = lines[i].indexOf(char, from);
    while (index != -1) {
      emojiX.push(context.measureText(lines[i].slice(0,index)).width + xPos[i] + offset);
      emojiLine.push(i);
      from = index + 1;
      index = lines[i].indexOf(char, from);
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
  globalData.lineTextHeight = height;
  globalData.baselineTextHeight = heights[1];
  globalData.emojiX = emojiX;
  globalData.emojiY = heights[1] + (heights[0] / 2);
  globalData.emojiLines = emojiLine;
  console.log('textHandler - ' + getTime(start).toString() + 'ms');
  return;
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
async function infoScraper() {
  let start = getTime();
  let message = globalData.message;
  var scraperINFO = message.channel.messages.fetch({ limit: 2 }).then(async messageList => {

    message.delete();

    let messageListLastAttachment = await messageList.last();

    //let test = messageListLastAttachment.attachments.first();
    //console.log(test);

    //let url = await messageListLastAttachment.attachments.first().url;
    //let link = await messageListLastAttachment.embeds[0].url;

    let url = undefined;
    
    if (messageListLastAttachment.attachments.first() != undefined) {
      url = await messageListLastAttachment.attachments.first().url;
    }
    else if (messageListLastAttachment.embeds[0] != undefined) {
      url = await messageListLastAttachment.embeds[0].url;
    }

    console.log(url);

    console.log('infoScraper - ' + getTime(start).toString() + 'ms');
    return messageListLastAttachment;
  })
  var information = await scraperINFO.then();
  console.log('infoScraper - ' + getTime(start).toString() + 'ms');
  return;
}
function fileExtension(url) {
  return url.split(/[#?]/)[0].split('.').pop().trim().toLowerCase();
}
function fileType(extension) {
  if (imageTypes.includes(extension)) {return 'image';}
  else if (videoTypes.includes(extension)) {return 'video';}
  else if (audioTypes.includes(extension)) {return 'audio';}
  else if (textTypes.includes(extension)) {return 'text';}
  else {return 'link';}
}
function createFolders() { //Creates an empty folder if it is not there, as Github doesn't allow commits of empty folders. Add a case for all future empty folders
  if (!fs.existsSync('./files/buffer')) {
    fs.mkdirSync('./files/buffer')
  }
  if (!fs.existsSync('./files/archive')) {
    fs.mkdirSync('./files/archive')
  }
  if (!fs.existsSync('./files/reminders')) {
    fs.mkdirSync('./files/reminders')
  }
  if (!fs.existsSync('./files/buffer/conversionDownload')) {
    fs.mkdirSync('./files/buffer/conversionDownload')
  }
  if (!fs.existsSync('./files/buffer/emojiDownload')) {
    fs.mkdirSync('./files/buffer/emojiDownload')
  }
}
async function fileNameVerify(string, filePath, extension) {
  let charRegex = /[\\/:\*\?"<>\|]+/g; // \ / : * ? " < > |
  let nameRegex = /^(aux|nul|prn|con|lpt[1-9]|com[1-9])(\.|$)/i;
  string = string.replaceAll(charRegex, '-');
  if (nameRegex.test(string)) {
    string = '-'
  }
  if (filePath != undefined && fs.existsSync(filePath + string + extension)) {
    let repeat = 0
    while (fs.existsSync(filePath + string + repeat.toString() + extension)) {
      repeat += 1;
    }
  }
  return string;
}

module.exports = { fileScraper, download, canvasInitialize, canvasScaleFit, canvasScaleFill, imageToCanvas,
                  textHandler, getTime, wait, typeCheck, infoScraper, uploadLimitCheck, sendFile, linkScraper,
                  userData, textArgs, imageScraper, createFolders, findEmoji, getEmoji, fileNameVerify, scaleDims, 
                  drawEmoji, fileLinkScraper, fileExtension, fileType };
