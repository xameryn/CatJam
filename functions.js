const { Client, Intents, MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const sharp = require('sharp');
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const emojiRegex = require('emoji-regex');
const fs = require('fs-extra')
const request = require('request');
const Canvas = require('canvas');
const SizeOf = require('image-size');
const emojiDict = require("emoji-dictionary");
const exifr = require('exifr');
const PNG = require("pngjs").PNG;

import { globalData } from './main.js';
import { catJamArrayStorage, stellarisArrayStorage, imageTypes, videoTypes, audioTypes, textTypes } from './arrays.js';

async function generalScraper(scrapeType) {
  let start = getTime();
  let message = globalData.message;
  let searchParams = undefined

  if (scrapeType === undefined) {scrapeType = 'link';}

  if (scrapeType === 'link') { //Used for $archive
    searchParams = (m) => (m.attachments.size > 0) || (m.embeds.length > 0);
  }
  else if (scrapeType === 'image') { //Misc Use
    let atc = null;
    let emb = null;
    searchParams = (m) => (atc = m.attachments.first(), emb = m.embeds, ((m.attachments.size > 0) && (atc != undefined) && ((atc.url.includes('.png')) || (atc.url.includes('.jpg')) || (atc.url.includes('.bmp')) || (atc.url.includes('.jpeg')) || (atc.url.includes('.jfif')) || (atc.url.includes('.tiff')) || (atc.url.includes('.webp')))) || (emb.length > 0 && (emb[0].type == 'image')));
  }
  else if (scrapeType === 'file') { //Misc Use
    searchParams = (m) => ((m.embeds.length > 0 && (m.embeds[0].type == 'image' || m.embeds[0].type == 'video' || m.embeds[0].type == 'gifv')) || m.attachments.size > 0);
  }
  else if (scrapeType === 'twitter') { //Used for $twitter
    searchParams = (m) => ((m.embeds.length > 0) && (m.embeds[0].type === 'rich') && (m.embeds[0].url != null) && (m.embeds[0].url.includes('twitter.com')));
  }

  var scraperURL = message.channel.messages.fetch().then(async messageList => { //Message search
  let lastMessage = await messageList.sort((a, b) => b.createdTimestamp - a.createdTimestamp).filter(searchParams).first();

  if (message.reference != undefined) { //If a message is replied to it takes priority
    let replyMessage =  await message.channel.messages.fetch(message.reference.messageID);
    if (searchParams) {
      lastMessage = replyMessage;
    }
  }

  globalData.targetMessage = await lastMessage; //Saves the message it locates

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
  console.log('generalScraper - ' + getTime(start).toString() + 'ms');
  return outputURL;
}
function uploadLimitCheck(fileDir) {
  const statz = fs.statSync(fileDir);
  const fileSizeInBytes = statz.size;
  if (fileSizeInBytes > 8000000) {
    //console.log(fileSizeInBytes);
    return true;
  }
  else {
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
    //checks for cringe metadata, including orientation and colour space
    let dirArray = fileDir.split('.');
    if (dirArray[dirArray.length - 1] == 'png') {
      let metadata = await exifr.parse(fileDir, {chunked: false}).then(output => {
        if (output != undefined) {
          return [output.ProfileName, output.Orientation];
        }
        else {
          return ['',''];
        }
      });
      if (metadata[0] == 'kCGColorSpaceDisplayP3') {//basically just rewrites the file with generic colour space and metadata
        let data = fs.readFileSync(fileDir);
        let png = PNG.sync.read(data);
        let buffer = PNG.sync.write(png);
        fs.writeFileSync(fileDir, buffer);
      }
      //possible orientation metadata: Horizontal (normal), Mirror horizontal and rotate 90 CW, Mirror horizontal and rotate 270 CW, Mirror horizontal, Mirror vertical, Rotate 90 CW, Rotate 180, Rotate 270 CW
      if (metadata[1] != undefined && metadata[1] != '' && metadata[1] != 'Horizontal (normal)') {
        let imageSize = await SizeOf(fileDir);
        let orient = metadata[1];
        let angle = '180';
        //all rotations other than 180 contain CW
        if (orient.includes('CW')) {//these rotations will invert dimensions
          await canvasInitialize([imageSize.height, imageSize.width])
          angle = orient.slice(-6,-3).trim();
        }
        else {
          await canvasInitialize([imageSize.width, imageSize.height])
        }
        let canvas = globalData.canvas;
        let context = globalData.context;
        let image = await Canvas.loadImage(fileDir);
        //mirroring
        if (orient.includes('Mirror horizontal') && !orient.includes('CW')) {//there is never both vertical mirroring and rotation
          context.scale(-1,1);
          context.translate(-canvas.width, 0);
        }
        else if (orient.includes('Mirror vertical') || (orient.includes('Mirror horizontal') && orient.includes('CW'))) {
          context.scale(1,-1);
          context.translate(0, -canvas.height);
        }
        //rotation
        if (orient.includes('rotate') || orient.includes('Rotate')) {
          let displace = [canvas.width, canvas.height];
          if (angle == '90') {
            displace[1] = 0;
          }
          if (angle == '270') {
            displace[0] = 0;
          }
          context.translate(displace[0], displace[1]);
          context.rotate(Math.PI * parseInt(angle) / 180);
        }
        context.drawImage(image, 0, 0, imageSize.width, imageSize.height);
        fs.writeFileSync(fileDir, canvas.toBuffer());
      }
    }
    console.log('download - ' + getTime(start).toString() + 'ms');
    return;
  }
}
async function typeCheck(fileURL){ //Checks the file type of the URL
  let fileTypeArray = await fileURL.split('.'); //Splits URL at every '.'
  let suffix = await fileTypeArray.pop(); //Takes the last split part (the file type)
  if (await suffix.includes('?')) {
    suffix = await suffix.split('?');
    await suffix.pop();
  }
  if (suffix.length > 5) {
    return undefined;
  }
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
async function canvasInitialize(canvasDims, background){
  let start = getTime();
  let canvas = Canvas.createCanvas(canvasDims[0], canvasDims[1]);
  globalData.canvas = canvas;
  let context = canvas.getContext('2d');
  globalData.context = context;
  //deciding background
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
  //imageDims, widestRatio, tallestRatio, wideDims, tallDims, scaleLength, scaleAxis
  let imageDims = funcArgs.imageDims;
  let widestRatio = funcArgs.widestRatio;
  let tallestRatio = funcArgs.tallestRatio;
  let wideDims = funcArgs.wideDims;
  let tallDims = funcArgs.tallDims;
  let scaleLength = funcArgs.scaleLength;
  let scaleAxis = funcArgs.scaleAxis;
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
  //determines whether scaleDim is treated as width or height, set dynamically for non-fit/fill (dependent on scaling up or down)
  let imageBool = height > width;

  let scaleDim = scaleDims;
  if (typeof scaleDims == 'object') {
    var scaleWidth = scaleDims[0];
    var scaleHeight = scaleDims[1];
    let scaleRatio = scaleHeight / scaleWidth;

    if (scaleType == 'fit') {
      if (imageRatio > scaleRatio) {//scaleDim set to more significant dimension of the image relative to scaleDims
        scaleDim = scaleHeight;
        imageBool = true;
      }
      else {
        scaleDim = scaleWidth;
        imageBool = false;
      }

    }
    else if (scaleType == 'fill') {
      if (imageRatio > scaleRatio) {//scaleDim set to the least significant dimension
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
  //actual scaling part
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
    globalData.scaledPos = [(scaleWidth - newWidth)/2, (scaleHeight - newHeight)/2];
  }
  globalData.scaledDims = [newWidth, newHeight];
  return;
}
async function drawImage(fileDir, offsets = [0,0], imagePos, imageDims) {
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
async function userData(action, command, option, value) {
  let start = getTime();
  //action - 'get' to get preferences and store them in globalData, 'set' to change a preference
  //tag - preference to change
  //arg - thing to set preference to
  let user = globalData.authorID;
  let defaultsOBJ = {id:user, prefixC:' ', prefixD:true, customCMD:true, priorityARC:'server', pointBG:'black', posterBG:'white', posterTXT:'big', posterCAPS:true};
  let defaults = JSON.stringify(defaultsOBJ);
  if (!fs.existsSync('user-data.json')) {
    fs.writeFileSync('user-data.json', defaults);
    globalData.userData = defaultsOBJ;
    globalData.authorIndex = 0;
    return;
  }
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
        globalData.userData = line;
        globalData.authorIndex = i;
        //console.log('userData - ' + getTime(start).toString() + 'ms');
        return;
      }
    }
    //will only be run if no id found (since if it was found function returns), sets values to defaults and adds new line
    globalData.userData = defaultsOBJ;
    globalData.authorIndex = lines.length - 1;
    lines.push(defaults);
  }
  //-----------------------
  // SET
  //-----------------------
  //depending on tag and args, changes the data of the given line, and creates message to be sent
  else if (action == 'set') {
    let data = JSON.parse(lines[globalData.authorIndex]);
    globalData.toggledMSG = `Couldn't set that preference... :Ɛ`;
    //inputs standardized
    if (value == 'true') {
      value = true;
    }
    else if (value == 'false') {
      value = false;
    }
    if (command == 'canvas') {
      command = 'poster';
    }
    if (command == 'a' || command == 'arc') {
      command = 'archive';
    }
    if (option == 'bg') {
      option = 'background';
    }
    else if ((option == 'custom' || option == 'cmd') && command == 'archive') {
      option = 'customcmd';
    }
    else if (option == 'c' && command == 'prefix') {
      option = 'custom';
    }
    else if (option == 'prio') {
      option = 'priority';
    }
    else if (option == 'd') {
      option = 'default';
    }
    let prefix = globalData.escapedPrefix;
    let valuesBG = ['black','white','png'];
    let valuesTXT = ['big','small'];
    let valuesARC = ['server','user'];
    let valuesBool = [true,false];
    let values;
    let valueDefault;
    let currentValue;
    let space = '';
    //point prefs
    if (command == 'point') {
      if (option == 'background') {
        values = valuesBG;
        valueDefault = 'black';
        currentValue = data.pointBG;
      }
      else {
        return;
      }
    }
    //poster prefs
    else if (command == 'poster') {
      if (option == 'background') {
        values = valuesBG;
        valueDefault = 'white';
        currentValue = data.posterBG;
      }
      else if (option == 'text') {
        values = valuesTXT;
        valueDefault = 'big';
        currentValue = data.posterTXT;
      }
      else if (option == 'caps') {
        values = valuesBool;
        valueDefault = true;
        currentValue = data.posterCAPS;
      }
      else {
        return;
      }
    }
    //archive prefs
    else if (command == 'archive') {
      if (option == 'customcmd') {
        values = valuesBool;
        valueDefault = true;
        currentValue = data.customCMD;
      }
      else if (option == 'priority') {
        values = valuesARC;
        valueDefault = 'server';
        currentValue = data.priorityARC;
      }
      else {
        return;
      }
    }
    else if (command == 'prefix') {
      prefix = '';
      if (option == 'custom') {
        valueDefault = ' ';
        currentValue = data.prefixC;
        let argsArray = globalData.args;
        let textValue = argsArray.splice(2).join(' ');
        await textArgs(1, textValue);
        value = globalData.textInputs[0];
        if (value.length > 50) {
          return;
        }
        if (value == globalData.globalPrefix) {
          value = 'reset';
        }
        if (value == '`') {
          space = ' ';
        }
        values = [value];
      }
      else if (option == 'default') {
        values = valuesBool;
        valueDefault = true;
        currentValue = data.prefixD;
      }
      else {
        return;
      }
    }
    //pref reset
    else if (command == 'reset') {
      data = defaultsOBJ;
      globalData.toggledMSG = `Preferences reset! :3`;
    }
    else {
      return;
    }
    let re = '';
    if (command != 'reset' && (values.includes(value) || value == 'reset' || value == '')) {//determining/setting value, then creating message
      if (value == '') {
        if (values.length == 2) {//sets it to the other value in the array
          value = values[(values.indexOf(currentValue) + 1) % 2]
        }
        else {
          return;
        }
      }
      else if (value == 'reset') {
        re = 're';
        value = valueDefault;
      }
      if (command == 'point' && option == 'background') {
        data.pointBG = value;
      }
      else if (command == 'poster' && option == 'background') {
        data.posterBG = value;
      }
      else if (command == 'poster' && option == 'text') {
        data.posterTXT = value;
      }
      else if (command == 'poster' && option == 'caps') {
        data.posterCAPS = value;
      }
      else if (command == 'archive' && option == 'customcmd') {
        data.customCMD = value;
      }
      else if (command == 'archive' && option == 'priority') {
        data.priorityARC = value;
      }
      else if (command == 'prefix' && option == 'custom') {
        data.prefixC = value;
        globalData.changedPrefix = true;
      }
      else if (command == 'prefix' && option == 'default') {
        data.prefixD = value;
      }
      else {
        return;
      }
      globalData.toggledMSG = 'Preferences for ' + prefix + `${command} ${option} ` + re + 'set to `' + value + space + '`! :3';
    }
    lines[globalData.authorIndex] = JSON.stringify(data);
  }
  else if (action == 'prefix') {//load prefix array
    let prefixes = [globalData.globalPrefix];
    for (var i = 0; i < lines.length; i++) {
      let line = JSON.parse(lines[i]);
      if (line.prefixC != ' ') {
        prefixes.push(line.prefixC);
      }
    }
    //console.log('userData - ' + getTime(start).toString() + 'ms');
    return prefixes;
  }
  else if (action == 'update') {//update user-data.json (for when new preferences are added in an update)
    let length = Object.keys(defaultsOBJ).length;
    for (var i = 0; i < lines.length; i++) {
      let line = JSON.parse(lines[i]);
      if(Object.keys(line).length != length) {
        line = {...defaultsOBJ, ...line};
        lines[i] = JSON.stringify(line);
      }
    }
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
  let animRegex = /<a:(\w+):(\d+)>/gmdi;
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
      let names = [''];
      if (fs.existsSync('./files/buffer/emojiDownload/')) {
        names = fs.readdirSync('./files/buffer/emojiDownload/');
        names.forEach((n, index) => {
          names[index] = n.slice(0,-4)
        });
      }
      if (names.includes(fileName)) {//for emojis with same name
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
async function textArgs(maxInputs = 1, input) {
  let command = globalData.command;
  let message = globalData.message.content;
  let prefix = globalData.prefix;
  if (input) {
    message = prefix + command + ' ' + input;
  }
  let content = ' ' + message.slice(prefix.length + command.length + 1).trim() + ' ';
  while (content.includes('“') || content.includes('”')) {
    content = content.replace('“','"');
    content = content.replace('”','"');
  }
  //strings to get indexes of (open/closed single/double quotes, and spaces)
  let strings = [];
  let targets = [' "', '" ', " '", "' ", ' ']
  let indexArrays = [[], [], [], [], []]
  //get all the relevant indexes
  for (var i = 0; i < 5; i++) {
    let index = 0;
    let targetIndex = content.indexOf(targets[i], index);
    if (i == 5) {
      targetIndex = content.trim().indexOf(targets[i], index);
    }
    while (targetIndex != -1) {
      if (i == 0 || i == 2) {
        indexArrays[i].push(targetIndex + 1);
      }
      else {
        indexArrays[i].push(targetIndex);
      }
      index = targetIndex + 1;
      targetIndex = content.indexOf(targets[i], index);
      if (i == 5) {
        targetIndex = content.trim().indexOf(targets[i], index);
      }
    }
    if (i == 4) {
      indexArrays[i].splice(-1, 1)
    }
  }
  let quotesExist = false;
  while ((indexArrays[0].length > 0 && indexArrays[1].length > 0) || (indexArrays[2].length > 0 && indexArrays[3].length > 0)) {//while there is a valid pair of open and close quotes
    quotesExist = true;
    //get the very first open quote and its corresponding close quote
    let startIndex = Math.min(Math.min(...indexArrays[0]), Math.min(...indexArrays[2]));
    let endIndex = content.indexOf('" ', startIndex);
    if (content[startIndex] == "'") {
      endIndex = content.indexOf("' ", startIndex);
    }
    //console.log('start, end', [startIndex, endIndex])
    for (var i = 0; i < 4; i++) {//filter array to only include indexes after the end index, sets up for future loops
      indexArrays[i] = indexArrays[i].filter(val => val > endIndex);
    }
    let priorSpaces = indexArrays[4].filter(val => val < startIndex);
    if (priorSpaces.length > 1) {//find spaces before the start index, use them to find string arguments, then clear its indexes as well
      let spaceSplits = content.slice(indexArrays[4][0], startIndex).trim().split(' ');
      spaceSplits.forEach(string => strings.push(string));
    }
    indexArrays[4] = indexArrays[4].filter(val => val > endIndex);
    //then add the argument within the quotes
    strings.push(content.slice(startIndex + 1, endIndex))
  }
  //if there are more args with spaces after quotes, or no quotes at all
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
    //if no quotes found, assumes all text is one input
    if (!quotesExist) {
      strings = [strings.join(' ')];
    }
    //any further arguments beyond max are assumed to be command arguments
    else {
      argsText = strings.splice(maxInputs)
    }
  }
  globalData.textInputs = strings;
  globalData.argsText = argsText;
  return;
}
async function textHandler(funcArgs) {
  let start = getTime();
  //text, font, style, maxSize, minSize, maxWidth, maxHeight, byLine, spacing, baseX, baseY, yAlign, xAlign

  let defaults = {style:'', minSize:1, byLine:false, spacing:0.2, xAlign:'center', yAlign:'center'};
  funcArgs = {...defaults, ...funcArgs};
  let text = funcArgs.text;
  let font = funcArgs.font;
  let style = funcArgs.style;
  let maxSize = funcArgs.maxSize;
  let minSize = funcArgs.minSize;
  let maxWidth = funcArgs.maxWidth;
  let maxHeight = funcArgs.maxHeight;
  let byLine = funcArgs.byLine;
  let spacing = funcArgs.spacing;
  let baseX = funcArgs.baseX;
  let baseY = funcArgs.baseY;
  let xAlign = funcArgs.xAlign;
  let yAlign = funcArgs.yAlign;
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
  let customRegex = /<:(\w+):(\d+)>/gmd;
  let animRegex = /<a:(\w+):(\d+)>/gmdi;
  let char = ' ';
  text = text.replace(char, ' ');
  if (text.search(defaultRegex) != -1 || text.search(customRegex) != -1 || text.search(animRegex) != -1 ) {
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
      if (maxLines == 0) {
        if (n > minSize) { continue; }
        maxLines = 1;
      }
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
  let charWidth = context.measureText(char).width;
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
  //round positions to avoid blurry text
  xPos.forEach((x, index) => {
    xPos[index] = Math.round(x);
  });
  yPos.forEach((y, index) => {
    yPos[index] = Math.round(y);
  });
  //-----------------------
  // FINAL VALUES
  //-----------------------
  //can store up to two sets of text parameters in global data at a time
  //need to do it this way since if globalData.text1 is undefined, I can't check if globalData.text1.lines is without crash
  let channel1 = false;
  if (globalData.text1 == undefined) {
    channel1 = true;
  }
  else if (globalData.text1.lines == undefined) {
    channel1 = true;
  }
  if (channel1) {
    globalData.text1 = {};
    globalData.text1.lines = lines;
    globalData.text1.pos = [xPos, yPos]
    globalData.text1.size = size;
    globalData.text1.height = (height + space) * lineNum;
    globalData.text1.lineHeight = height;
    globalData.text1.baselineHeight = heights[1];
    globalData.text1.emoji = matches;
    globalData.text1.emojiPos = [emojiX, heights[1] + (heights[0] / 2)]
    globalData.text1.emojiLines = emojiLine;
  }
  else {
    globalData.text2 = {};
    globalData.text2.lines = lines;
    globalData.text2.pos = [xPos, yPos]
    globalData.text2.size = size;
    globalData.text2.height = (height + space) * lineNum;
    globalData.text2.lineHeight = height;
    globalData.text2.baselineHeight = heights[1];
    globalData.text2.emoji = matches;
    globalData.text2.emojiPos = [emojiX, heights[1] + (heights[0] / 2)]
    globalData.text2.emojiLines = emojiLine;
  }
  console.log('textHandler - ' + getTime(start).toString() + 'ms');
  return;
}
async function drawText(offsets = [0,0], channel = 1, stroke = false) {
  let context = globalData.context;
  if (channel == 1) {
    var lines = globalData.text1.lines;
    var textPos = globalData.text1.pos;
    var lineHeight = globalData.text1.lineHeight;
    var emojiArray = globalData.text1.emoji;
    var emojiPos = globalData.text1.emojiPos;
    var emojiLines = globalData.text1.emojiLines;
  }
  else {
    var lines = globalData.text2.lines;
    var textPos = globalData.text2.pos;
    var lineHeight = globalData.text2.lineHeight;
    var emojiArray = globalData.text2.emoji;
    var emojiPos = globalData.text2.emojiPos;
    var emojiLines = globalData.text2.emojiLines;
  }
  for (i = 0; i < lines.length; i++) {//draw text
    if (stroke) {
      context.strokeText(lines[i], textPos[0][i] + offsets[0], textPos[1][i] + offsets[1]);
    }
    context.fillText(lines[i], textPos[0][i] + offsets[0], textPos[1][i] + offsets[1]);
  }
  //download emoji
  if (emojiArray != undefined) {
    globalData.emojiMatch = emojiArray;
    await getEmoji();
    let emoji;
    let nameArray = [];
    for (var i = 0; i < emojiArray.length; i++) {
      //accounts for duplicate names
      let name = await fileNameVerify(encodeURI(emojiArray[i][2]));
      if (!nameArray.includes(name)) {
        nameArray.push(name);
      }
      else if (emojiArray[i][0] != emojiArray[i][3]) {//for custom emoji only
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
      if (emojiSize.width != emojiSize.height) {//abnormal proportion emojis e.g. flooshed
        if (emojiSize.width > emojiSize.height) {
          emojiHeight = (emojiSize.height/emojiSize.width) * lineHeight;
          offsets[1] += (lineHeight - emojiHeight) / 2;
        }
        else {
          emojiWidth = (emojiSize.width/emojiSize.height) * lineHeight;
          offsets[0] += (lineHeight - emojiWidth) / 2;
        }
      }
      //actual emoji drawing
      emoji = await Canvas.loadImage(fileDir);
      context.drawImage(emoji, emojiPos[0][i] + offsets[0], (textPos[1][emojiLines[i]] - emojiPos[1] + offsets[1]), emojiWidth, emojiHeight);
      offsets[0] -= (lineHeight - emojiWidth) / 2;
      offsets[1] -= (lineHeight - emojiHeight) / 2;
    } 
    fs.emptyDirSync('./files/buffer/emojiDownload/');
  }
  if (channel == 1) {
    globalData.text1 = {};
  }
  else {
    globalData.text2 = {};
  }
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
  else if (extension == 'gif') {return 'gif';}
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
  if (string.search(nameRegex) != -1) {
    string = '-';
  }
  if (filePath != undefined && fs.existsSync(filePath + string + extension)) {
    let repeat = 0;
    while (fs.existsSync(filePath + string + repeat.toString() + extension)) {
      repeat += 1;
    }
  }
  return string;
}
function canManageMessages(msg) {
  return msg.member.permissionsIn(msg.channel).has('MANAGE_MESSAGES')
}
async function messageReturn(input, title, textEmbed = true, isAttach = false, sendRaw = false, thumbnail = '') {
  //textEmbed : puts input text into a plain embed, optionally with title
  //isAttach : gets attachment using input as file path, and title as file name
  //sendRaw : just sends whatever the input is, either plain text or a premade attachment
  //thumbnail : thumbnail link to put in embed
  let start = getTime();
  //note title can either be title of embed, or name of file for message attachment
  let message = globalData.message;
  let content;
  if (typeof input == 'string') {
    if (input.indexOf('./') == 0) {
      isAttach = true;
    }
  }
  if (typeof input == 'string' && textEmbed && !isAttach) {
    //embed stuff
      if (title != undefined && title != '') {
        content = new MessageEmbed()
          .setTitle(title)
          .setDescription(input)
          .setColor(0x686868)
          .setThumbnail(thumbnail);
      }
      else {
        content = new MessageEmbed()
          .setTitle(input)
          .setColor(0x686868)
          .setThumbnail(thumbnail);
      }
  }
  //attachment case
  else if (!sendRaw) {
    if (title != undefined){
      content = new MessageAttachment(input, title);
    }
    else {
      content = new MessageAttachment(input);
    }
  }
  //encompasses raw text being sent, or an already prepared embed
  else {
    content = input;
  }
  await message.channel.send(content);
  fs.emptyDirSync('./files/buffer/emojiDownload/');
  if (fs.existsSync('./files/buffer/emojis.zip') == true) {
    fs.unlinkSync('./files/buffer/emojis.zip');
  }
  return getTime(start);
}

module.exports = { generalScraper, download, canvasInitialize, imageToCanvas,
                  textHandler, getTime, wait, typeCheck, infoScraper, uploadLimitCheck, sendFile,
                  userData, textArgs, createFolders, findEmoji, getEmoji, fileNameVerify, scaleImage, 
                  fileExtension, fileType, canManageMessages, messageReturn, drawImage, drawText };