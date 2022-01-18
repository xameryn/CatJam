const { Client, Intents, MessageAttachment, MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js');
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const systeminfo = require('systeminformation');
const fs = require('fs-extra')
const archiver = require('archiver');
const webp = require('webp-converter');
const emojiRegex = require('emoji-regex');
const glitch = require('glitch-canvas');
const Canvas = require('canvas');
const SizeOf = require('image-size');

const func = require("./functions.js");

import { discordKey, prefixKey } from './keys.js';
import { catJamArrayStorage, stellarisArrayStorage } from './arrays.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const DISCORDTOKEN = discordKey;
const prefix = prefixKey;
const catJamArray = catJamArrayStorage;
const stellarisArray = stellarisArrayStorage;

var globalData = {};
var archiveList = []

var output = fs.createWriteStream('emojis.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('In Development');
    func.createFolders();
    setInterval(function(){ 
      //console.log('looping now :3'); 
    }, 2500);
 });

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
  let start = func.getTime();
  globalData = {}
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
  const user = message.author.id;
  let input = args[0];
  let input2 = args[1];
  let input3 = args[2];
  let fullInput = message.content.slice(prefix.length + command.length).trim();
  globalData.message = message;
  globalData.prefix = prefix;
  globalData.args = args;
  globalData.authorID = message.author.id;
  await func.userData('get');
  if (command === 'help' || command === 'h') {
    let embed = new MessageEmbed();
    let p = "\\" + prefix;
    switch(input) {
      case 'catjam':
        embed
          .setTitle(p + "catjam [bpm]")
          .setColor(0xFBF2F0)
          .setDescription("A catjam that jams to the beat.");
        break;
      case 'stellaris':
        embed
          .setTitle(p + "stellaris [1-12]")
          .setColor(0xFBF2F0)
          .setDescription("It's time to play Stellaris.");
        break;
      case 'dadon':
        embed
          .setTitle(p + "dadon")
          .setColor(0xFBF2F0)
          .setDescription("Sends one of over 200 images of Don-chan.");
        break;
      case 'neco':
        embed
          .setTitle(p + "neco")
          .setColor(0xFBF2F0)
          .setDescription("Sends one of over 100 images of Neco Arc.");
        break;
      case '1984':
        embed
          .setTitle(p + "1984")
          .setColor(0xFBF2F0)
          .setDescription("Two possible GIFs depicting 1984.");
        break;
      case 'scatter':
        embed
          .setTitle(p + "scatter")
          .setColor(0xFBF2F0)
          .setDescription("Randomizes the colours in an image.");
        break;
      case 'glitch':
      case 'corrupt':
        embed
          .setTitle(p + "glitch")
          .setColor(0xFBF2F0)
          .setDescription("Glitches your image.");
        break;
      case 'obradinn':
      case 'obra':
      case 'dinn':
        embed
          .setTitle(p + "obradinn")
          .setColor(0xFBF2F0)
          .setDescription("Who was this? How did they die?");
        break;
      case 'poster':
      case 'canvas':
        embed
          .setTitle(p + "poster [up to 2 text inputs]")
          .setColor(0xFBF2F0)
          .setDescription("Framed like an early 2000s motivational poster.");
        break;
      case 'point':
        embed
          .setTitle(p + "point")
          .setColor(0xFBF2F0)
          .setDescription("Two respectable gentlemen pointing at something of interest.");
        break;
      case 'meme':
        embed
          .setTitle(p + "meme [up to 3 text inputs]")
          .setColor(0xFBF2F0)
          .setDescription("Including classic top text, bottom text, and middle text");
        break;
      case 'mario':
        embed
          .setTitle(p + "mario [text input]")
          .setColor(0xFBF2F0)
          .setDescription("I can't believe they cast them as Mario.");
        break;
      case 'literally1984':
      case 'l1984':
        embed
          .setTitle(p + "literally1984 [optional text input]")
          .setColor(0xFBF2F0)
          .setDescription("For when it is literally 1984.");
        break;
      case 'archive':
      case 'arc':
      case 'a':
        embed
          .setTitle(p + "archive [file name] / delete [file name] / list")
          .setColor(0xFBF2F0)
          .setDescription("Save any file, then call upon it when you need it most in any server.");
        break;
      case 'serverarchive':
      case 'sarc':
      case 'sa':
        embed
          .setTitle(p + "serverarchive [file name] / delete [file name] / list")
          .setColor(0xFBF2F0)
          .setDescription("Save any file to the server collection, then let yourself or others call upon it when you need it most.");
        break;
      case 'bpm':
        embed
          .setTitle(p + "bpm")
          .setColor(0xFBF2F0)
          .setDescription("Determine the bpm by counting the beats\n(Make sure to start counting as soon as you click the flag).");
        break;
      case 'twitter':
      case 'twt':
        embed
          .setTitle(p + "twitter")
          .setColor(0xFBF2F0)
          .setDescription("Convert a Twitter video link into a more consistent embed.");
        break;
      case 'flip':
      case 'toss':
      case 'coin':
        embed
          .setTitle(p + "flip [probability]")
          .setColor(0xFBF2F0)
          .setDescription("Flip a coin of any weight!");
        break;
      case 'get':
        embed
          .setTitle(p + "get [user] / [emoji]")
          .setColor(0xFBF2F0)
          .setDescription("Get avatars (Using mentions, ID, or name)\nor emoji (Custom or default) in picture format.");
        break;
      case 'starpic':
      case 'sp':
        embed
          .setTitle(p + "starpic")
          .setColor(0xFBF2F0)
          .setDescription("Reposts an image with a star reaction, a neutral mediator for starboards.");
        break;
      case 'help':
        embed
          .setTitle(p + "help")
          .setColor(0xFBF2F0)
          .setDescription("You are beyond help.");
        break;
      case 'pref':
        embed
          .setTitle(p + "pref")
          .setColor(0xFBF2F0)
          .setDescription("Alter the default behaviour of various commands.");
        break;
      case 'server':
      case 'srv':
        embed
          .setTitle(p + "server")
          .setColor(0xFBF2F0)
          .setDescription("In case you were wondering how the server was doing.");
        break;
      default:
        embed
          .setTitle("List of Commands")
          .setColor(0xFBF2F0)
          .addFields(
            { name: '\u200B', value:
            "**__Media:__**\n" + p + "catjam\n" + p + "stellaris\n" + p + "dadon\n" + p + "neco\n" + p + "1984\n\n" +
            "**__Filter:__**\n" + p + "scatter\n" + p + "glitch\n" + p + "obradinn\n\n" +
            "**__Media Editing:__** \n" + p + "poster\n" + p + "point\n" + p + "meme\n" + p + "mario\n" + p + "literally1984\n⠀",
            inline: true},
            { name: '\u200B', value:
            "**__Utility:__**\n" + p + "archive\n" + p + "serverarchive\n" + p + "bpm\n" + p + "twitter\n" + p + "flip\n" + p + "get\n" + p + "starpic\n\n" +
            "**__Meta:__**\n" + p + "help\n" + p + "pref\n" + p + "server\n⠀",
            inline: true}
          )
          .setFooter('DISCLAIMER: Not all command names and arguments are disclosed. Moderator permissions may be required.')
    }
    return message.channel.send({embed})
  }
  else if (command === 'catjam') {
    let output = (Math.round((input)/5))*5;
    if (!args.length) {
      attachment = new MessageAttachment(catJamArray[12]);
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
		}
    else if (output < 60 || output > 180) {
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
			return message.channel.send(`BPM not within range.`);
		}
    else {
      let gifNum = (output - 60) / 5;
      attachment = new MessageAttachment(catJamArray[gifNum]);
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
	}
  else if (command === 'stellaris') {
    //message.delete();
    if (!args.length) {
      attachment = new MessageAttachment(stellarisArray[0]);
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
    else if (input > 0 && input < 13) {
      attachment = new MessageAttachment(stellarisArray[input]);
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
    else {
      attachment = new MessageAttachment(stellarisArray[0]);
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
  }
  else if (command === 'dadon' || command === 'neco') {
    let dir = './files/' + command;
    let imageArray = ['./files/' + command + '/', command + ' (', 'num', ').png'];
    let fileNumber = fs.readdirSync(dir).length;
    let imageNum = Math.floor(Math.random() * fileNumber) + 1;
    imageArray[2] = imageNum;
    if (!isNaN(input) && input <= fileNumber && input > 0) {
      imageArray[2] = input;
    }
    let joinedArray = imageArray.join('');
    var attachment = await new MessageAttachment(joinedArray);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === '1984') {
    if ((Math.floor(Math.random() * 11)) >= 5) {
        attachment = new MessageAttachment('https://i.imgur.com/59QZNLa.gif');
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send(attachment);
      }
    else {
        attachment = new MessageAttachment('https://i.imgur.com/wInH3ud.gif');
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send(attachment);
    }
  }
  else if (command === 'poster' || command === 'canvas') {
    //-----------------------
    // GET IMAGE AND ITS SIZE
    //-----------------------
    let fileDir = './files/buffer/memePosterBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // FIND INNER CANVAS SIZE
    //-----------------------
    func.imageToCanvas([imageSize.width, imageSize.height], 2, 1, [1200,600], [600,600], 600, 'height');
    let canvasWidth = globalData.imgCanvasX;
    let canvasHeight = globalData.imgCanvasY;
    let centerX = (canvasWidth + 200) / 2;
    //-----------------------
    // CALCULATE TEXT PARAMETERS
    //-----------------------
    await func.textArgs();
    let inputs = globalData.textInputs;
    let argsText = globalData.argsText;
    if (inputs[0] === undefined) {
      inputs[0] = '';
    }
    if (inputs[1] === undefined) {
      inputs[1] = '';
      if (globalData.posterTXT == 'small' || inputs[0].length > 50) {
        inputs[1] = inputs[0];
        inputs[0] = '';
      }
    }
    //dummy canvas so context works in textHandler
    await func.canvasInitialize(1400, 700, './files/templates/blackBox.jpg', []);
    //big text
    await func.textHandler(inputs[0].toUpperCase(), 'Times New Roman', '', 150, 30, (canvasWidth + 100), 1, true, 0, centerX, 711, 'top');
    let lines1 = globalData.textLines;
    let xPos1 = globalData.textX;
    let yPos1 = globalData.textY;
    let size1 = globalData.textSize;
    let textHeight1 = globalData.textHeight;
    let lineHeight1 = globalData.lineTextHeight;
    //emoji
    let emojiX1 = globalData.emojiX;
    let emojiY1 = globalData.emojiY;
    let emojiLines1 = globalData.emojiLines;
    let emojiArray1 = globalData.emojiMatch;
    //spacing between the two texts, and each text and its upper and lower bounds
    let spacing = textHeight1 * 0.5;
    if (spacing < 50 && spacing > 0) {
      spacing = 50;
    }
    //small text
    await func.textHandler(inputs[1], 'Arial', '', Math.floor(size1 / 3), 1, (canvasWidth + 100), 3, true, 0.2, centerX, (711 + textHeight1 + (2 * spacing)), 'top');
    let lines2 = globalData.textLines;
    let xPos2 = globalData.textX;
    let yPos2 = globalData.textY;
    let size2 = globalData.textSize;
    let textHeight2 = globalData.textHeight;
    let lineHeight2 = globalData.lineTextHeight;
    //emoji
    let emojiX2 = globalData.emojiX;
    let emojiY2 = globalData.emojiY;
    let emojiLines2 = globalData.emojiLines;
    let emojiArray2 = globalData.emojiMatch;
    //-----------------------
    // PADDING
    //-----------------------
    //canvas is padded on all sides, lower padding is dependent on text heights
    //
    //if one of the inputs is empty, spacing is adjusted accordingly, if both are empty it becomes a symmetric square border
    let padding = 89;
    if (inputs[0] != '' && inputs[1] == '') {
      padding = (spacing * 2) + textHeight1;
    }
    else if (inputs[0] == '' && inputs[1] != '') {
      spacing = lineHeight2;
      for (i = 0; i < lines2.length; i++) {
        yPos2[i] += spacing;
      }
      padding = (spacing * 2) + textHeight2;
    }
    else {
      padding = (spacing * 3) + textHeight1 + textHeight2;
    }
    if (padding < 89) {
      if (inputs[0] != '') {
        for (i = 0; i < lines1.length; i++) {
          yPos1[i] += (89 - padding) / 2;
        }
      }
      if (inputs[1] != '') {
        for (i = 0; i < lines2.length; i++) {
          yPos2[i] += (89 - padding) / 2;
        }
      }
      padding = 89
    }
    //-----------------------
    // CANVAS THINGS
    //-----------------------
    await func.canvasInitialize(canvasWidth + 200, (canvasHeight + 111  + padding), './files/templates/blackBox.jpg', []);
    //rest of the boring canvas stuff
    let canvas = globalData.canvas;
    let context = globalData.context;
    let image = await Canvas.loadImage(fileDir);
    //image scaled down to fit in inner canvas
    await func.canvasScaleFit(fileDir, canvasWidth, canvasHeight);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;
    //-----------------------
    // SHAPES AND STROKE
    //-----------------------
    context.fillStyle = '#ffffff';
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    //this ensures that if the inputs are included, background follows them, and if no inputs are given, it falls back on given default from globalData
    //(bg is black if nothing is done, can be filled with white, or cleared to create transparency)
    if (argsText.includes('w') || argsText.includes('white') || (globalData.posterBG == 'white' && !argsText.includes('png') && !argsText.includes('black') && !argsText.includes('b'))) {
      context.fillRect(100, 100, canvasWidth, canvasHeight);
    }
    else if (argsText.includes('png') || (globalData.posterBG == 'png' && !argsText.includes('black') && !argsText.includes('b'))) {
      context.clearRect(100, 100, canvasWidth, canvasHeight);
    }
    context.strokeRect(100-10, 100-10, canvasWidth+20, canvasHeight+20);
    //-----------------------
    // FINAL CANVAS DRAWING
    //-----------------------
    context.drawImage(image, (xAxis + 100), (yAxis + 100), scaledWidth, scaledHeight);
    //fonts need to be assigned here since text handler was used in an abormal way where its context was overwritten
    context.font = `${size1}px Times New Roman`;
    for (i = 0; i < lines1.length; i++) {
      context.fillText(lines1[i], xPos1[i], (yPos1[i] + spacing));
    }
    context.font = `${size2}px Arial`;
    for (i = 0; i < lines2.length; i++) {
      context.fillText(lines2[i], xPos2[i], yPos2[i]);
    }
    //emoji drawing
    await func.drawEmoji(true, yPos1, emojiX1, emojiY1, emojiLines1, emojiArray1, lineHeight1, 0, spacing);
    await func.drawEmoji(true, yPos2, emojiX2, emojiY2, emojiLines2, emojiArray2, lineHeight2, 0, 0);
    var attachment = await new MessageAttachment(canvas.toBuffer(), 'posterMeme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'meme') {
    //-----------------------
    // GET DA FILE AND DO DA THING
    //-----------------------
    let fileDir = './files/buffer/memeBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // IMAGE TOO BIG OR TOO SMALL
    //-----------------------
    //discord still angy so image is shrink
    if (imageSize.height > 1500 || imageSize.width > 1500) {
      let dims = await func.scaleDims([imageSize.width, imageSize.height], 1500);
      imageSize.width = dims[0];
      imageSize.height = dims[1];
    }
    //dimensions scaled so they're at least 100
    if (imageSize.height < 100 || imageSize.width < 100) {
      let dims = await func.scaleDims([imageSize.width, imageSize.height], 100, 'up');
      imageSize.width = dims[0];
      imageSize.height = dims[1];
    }
    //-----------------------
    // FUNCTIONS AND CANVAS STUFF
    //-----------------------
    //image is the canvas (fairly generous scale parameters here)
    await func.imageToCanvas([imageSize.width, imageSize.height], 3, 3, [imageSize.width,(imageSize.width / 3)], [(imageSize.height / 3),imageSize.height]);
    let width = globalData.imgCanvasX;
    let height = globalData.imgCanvasY;
    //handling text input
    await func.textArgs();
    let inputs = globalData.textInputs;
    let argsText = globalData.argsText;
    //canvas
    await func.canvasInitialize(width, height, './files/templates/blackBox.jpg', ['png']);
    let canvas = globalData.canvas;
    let context = globalData.context;
    //image scaled to fit (mostly redundant), then drawn
    await func.canvasScaleFit(fileDir, width, height);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;
    let image = await Canvas.loadImage(fileDir);
    context.drawImage(image, xAxis, yAxis, scaledWidth, scaledHeight);
    //-----------------------
    // TEXT PREP
    //-----------------------
    context.fillStyle = '#ffffff';
    context.strokeStyle = '000000';
    context.lineJoin = 'round';
    //two input case will have larger text, and inputs assigned to memeInput to match top and bottom
    let max;
    let memeInput;
    if (inputs.length < 3) {
      max = height / 4;
      memeInput = [inputs[0],undefined,inputs[1]];
    }
    else {
      max = height / 5;
      memeInput = [inputs[0],inputs[1],inputs[2]];
    }
    //-----------------------
    // TEXT
    //-----------------------
    //top text
    if (memeInput[0] !== undefined) {
      await func.textHandler(memeInput[0].toUpperCase(), 'impact', '', max, 1, (0.95 * width), max, false, 0.2, (width / 2), (0.01 * height), 'top');
      let lines = globalData.textLines;
      let xPos = globalData.textX;
      let yPos = globalData.textY;
      let size = globalData.baselineTextHeight;
      context.lineWidth = 2 * (size * 0.06);

      for (i = 0; i < lines.length; i++) {
        context.strokeText(lines[i], xPos[i], yPos[i]);
        context.fillText(lines[i], xPos[i], yPos[i]);
      }

      await func.drawEmoji();
    }
    //middle text
    if (memeInput[1] !== undefined) {
      await func.textHandler(memeInput[1].toUpperCase(), 'impact', '', max, 1, (0.95 * width), max, false, 0.2, (width / 2), (height / 2));
      let lines = globalData.textLines;
      let xPos = globalData.textX;
      let yPos = globalData.textY;
      let size = globalData.baselineTextHeight;
      context.lineWidth = 2 * (size * 0.06);

      for (i = 0; i < lines.length; i++) {
        context.strokeText(lines[i], xPos[i], yPos[i]);
        context.fillText(lines[i], xPos[i], yPos[i]);
      }
      await func.drawEmoji();
    }
    //bottom text
    if (memeInput[2] !== undefined) {
      await func.textHandler(memeInput[2].toUpperCase(), 'impact', '', max, 1, (0.95 * width), max, false, 0.2, (width / 2), (0.99 * height), 'bottom');
      let lines = globalData.textLines;
      let xPos = globalData.textX;
      let yPos = globalData.textY;
      let size = globalData.baselineTextHeight;
      context.lineWidth = 2 * (size * 0.06);

      for (i = 0; i < lines.length; i++) {
        context.strokeText(lines[i], xPos[i], yPos[i]);
        context.fillText(lines[i], xPos[i], yPos[i]);
      }
      await func.drawEmoji();
    }
    var attachment = await new MessageAttachment(canvas.toBuffer(), 'meme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'literally1984' || command === 'l1984') {
    //-----------------------
    // CANVAS AND TEXT SETUP
    //-----------------------
    await func.canvasInitialize(1440, 1036, './files/templates/literally1984.jpg', []);
    let canvas = globalData.canvas;
    let context = globalData.context;
    //gets text inputs
    await func.textArgs();
    let inputs = globalData.textInputs;
    //-----------------------
    // TEXT CASE
    //-----------------------
    //if text input present, does text stuff
    if (inputs[0] != undefined) {
      await func.textHandler(inputs[0], 'sans-serif', '', 175, 1, 699, 242, false, 0.2, 455.5, 150);
      let lines = globalData.textLines;
      let xPos = globalData.textX;
      let yPos = globalData.textY;
      context.fillStyle = '#000000';
      for (i = 0; i < lines.length; i++) {
        context.fillText(lines[i], xPos[i], yPos[i]);
      }
      await func.drawEmoji();
    }
    //-----------------------
    // IMAGE CASE
    //-----------------------
    //if no text inputs, scrapes image
    else {
      let fileDir = './files/buffer/meme1984Buffer.png';
      let fileURL = await func.generalScraper('image');
      if (fileURL == undefined) {return message.channel.send("No File Found :(");}
      await func.download(fileURL, fileDir);
      let imageSize = await SizeOf(fileDir);
      //fits and draws image in text bubble
      await func.canvasScaleFit(fileDir, 699, 242);
      let scaledWidth = globalData.scaledWidth;
      let scaledHeight = globalData.scaledHeight;
      let xAxis = globalData.xAxis;
      let yAxis = globalData.yAxis;
      let image = await Canvas.loadImage(fileDir);
      context.drawImage(image, xAxis+106, yAxis+29, scaledWidth, scaledHeight);
    }
    var attachment = new MessageAttachment(canvas.toBuffer(), 'literally1984meme.jpg');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'point') {
    //-----------------------
    // GET IMAGE AND ITS SIZE
    //-----------------------
    let fileDir = './files/buffer/memePointingBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // IF IMAGE IS TOO BIG
    //-----------------------
    //if it is too big I make it less because discord angy
    if (imageSize.height > 1500 || imageSize.width > 1500) {
      let dims = await func.scaleDims([imageSize.width, imageSize.height], 1500);
      imageSize.width = dims[0];
      imageSize.height = dims[1];
    }
    //-----------------------
    // FIND CANVAS SIZE
    //-----------------------
    //suitable canvas size for image
    func.imageToCanvas([imageSize.width, imageSize.height], 2, 1, [1920,1518], [1920,1518]);
    let memeWidth = globalData.imgCanvasX;
    let memeHeight = globalData.imgCanvasY;
    let imgEval = globalData.imgCanvasEval;
    //if the image is small, it's placed at 100 pixel scale on a fixed canvas (3x smaller than native pointing.png)
    let memeSmall = false;
    if (imageSize.height < 100 || imageSize.width < 100) {
      let dims = await func.scaleDims([imageSize.width, imageSize.height], 100);
      imageSize.width = dims[0];
      imageSize.height = dims[1];
      memeWidth = 640;
      memeHeight = 506;
      memeSmall = true;
    }
    //-----------------------
    // CANVAS
    //-----------------------
    //this ensures that if the inputs are included, background follows them, and if no inputs are given, it falls back on given default from globalData
    //(canvasInitialize has baked in logic for detecting png args, the first two cases can still return png if the args are there, so we don't need to check for them)
    if (args.includes('b') || args.includes('black') || (globalData.pointBG == 'black' && !args.includes('white') && !args.includes('w'))) {
      await func.canvasInitialize(memeWidth, memeHeight, './files/templates/blackBox.jpg');
    }
    else if (args.includes('w') || args.includes('white') || globalData.pointBG == 'white') {
      await func.canvasInitialize(memeWidth, memeHeight, './files/templates/whiteBox.jpg');
    }
    else {
      await func.canvasInitialize(memeWidth, memeHeight, './files/templates/blackBox.jpg', ['png']);
    }
    let canvas = globalData.canvas;
    let context = globalData.context;
    //-----------------------
    // IMAGE SCALING/DRAWING
    //-----------------------
    let meme = await Canvas.loadImage(fileDir);
    if (!memeSmall) {
      //scaled to fit canvas, is only actually scaled if it's wide or tall
      await func.canvasScaleFit(fileDir);
      //very wide images are moved upwards in the frame, since central positioning obscures most of them
      if (imgEval == 'wide') {
        globalData.yAxis = globalData.yAxis / 2;
      }
      let scaledWidth = globalData.scaledWidth;
      let scaledHeight = globalData.scaledHeight;
      let xAxis = globalData.xAxis;
      let yAxis = globalData.yAxis;
      context.drawImage(meme, xAxis, yAxis, scaledWidth, scaledHeight);
    }
    else {
      //very small images are placed unscaled around the center
      //deviations from the center are to make it look generally nicer in frame, lining up with the direction being pointed at
      let xAxis = (Math.abs(memeWidth - imageSize.width) / 2) - 35;
      let yAxis = (Math.abs(memeHeight - imageSize.height) / 2) - 70;
      context.drawImage(meme, xAxis, yAxis, imageSize.width, imageSize.height);
    }
    //-----------------------
    // TWO DUDES
    //-----------------------
    if (args.includes('colonist')) {
      var pointImage1 = './files/templates/pointing/pointingColonist1.png';
      var pointImage2 = './files/templates/pointing/pointingColonist2.png';
    } else if (args.includes('real')) {
      var pointImage1 = './files/templates/pointing/pointingReal1.png';
      var pointImage2 = './files/templates/pointing/pointingReal2.png';
    } else if (args.includes('myth')) {
      var pointImage1 = './files/templates/pointing/pointingMyth1.png';
      var pointImage2 = './files/templates/pointing/pointingMyth2.png';
      var explosionImage = './files/templates/pointing/pointingMythExplosion.png';
    } else if (args.includes('catholic')) {
      var pointImage1 = './files/templates/pointing/pointingCatholic1.png';
      var pointImage2 = './files/templates/pointing/pointingCatholic2.png';
    } else if (args.includes('hearthian')) {
      var pointImage1 = './files/templates/pointing/pointingHearthian1.png';
      var pointImage2 = './files/templates/pointing/pointingHearthian2.png';
    } else {
      var pointImage1 = './files/templates/pointing/pointing1.png';
      var pointImage2 = './files/templates/pointing/pointing2.png';
    }
    //-----------------------
    // TWO DUDES SCALING/DRAWING
    //-----------------------
    //they're both always stuck to the edges of the screen, so all we need is their scaled widths, and scaled height which is the same for both
    await func.canvasScaleFit(pointImage1);
    let scaledWidth1 = globalData.scaledWidth;
    await func.canvasScaleFit(pointImage2);
    let scaledWidth2 = globalData.scaledWidth;
    let scaledHeightP = globalData.scaledHeight;
    //x-axis for dude 2 is also calculated here, just so that he is on the very right edge of screen
    let xAxis2 = Math.abs(memeWidth - scaledWidth2);
    //mythbusters explosion
    if (input == 'myth'){
      let scaledHeightE = 673 * (scaledHeightP / 1518);
      let scaledWidthE = 578 * (((scaledWidth1 + scaledWidth2) / 2) / 960);
      const explosion = await Canvas.loadImage(explosionImage);
      context.drawImage(explosion, (memeWidth/2 - scaledWidthE/2), (memeHeight/2 - scaledHeightE/2), scaledWidthE, scaledHeightE);
    }
    const pointing2 = await Canvas.loadImage(pointImage2);
    context.drawImage(pointing2, xAxis2, 0, scaledWidth2, scaledHeightP);
    const pointing1 = await Canvas.loadImage(pointImage1);
    context.drawImage(pointing1, 0, 0, scaledWidth1, scaledHeightP);

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'pointerMeme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'mario') {
    //-----------------------
    // CANVAS AND BASICS
    //-----------------------
    await func.canvasInitialize(1920, 1080, './files/templates/blackBox.jpg', []);
    let canvas = globalData.canvas;
    let context = globalData.context;

    let fileDir = './files/buffer/memeMarioBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    //-----------------------
    // IMAGE
    //-----------------------
    //scale to fill entire canvas
    await func.canvasScaleFill(fileDir, 730, 973, 960, 539.5);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;
    //draw given image and mario template on top
    var meme = await Canvas.loadImage(fileDir);
    context.drawImage(meme, xAxis, yAxis, scaledWidth, scaledHeight);
    const foreground = await Canvas.loadImage('./files/templates/mario.png');
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);
    //-----------------------
    // TEXT
    //-----------------------
    //get text string
    await func.textArgs();
    let inputs = globalData.textInputs;
    if (inputs[0] == undefined) {
      inputs[0] = '';
    }
    //text string left aligned in its place on template
    await func.textHandler(inputs[0].toUpperCase(), 'Trebuchet MS', 'bold ', 75, 1, 526, 1, true, 0, 275, 897, 'center', 'left');
    let lines = globalData.textLines;
    let xPos = globalData.textX;
    let yPos = globalData.textY;
    context.fillStyle = '#ffffff';
    //-----------------------
    // DRAWING
    //-----------------------
    //subtracts below baseline space if emoji is present since this font makes it look quirky
    if (globalData.emojiMatch != undefined) {
      yPos[0] += 0.1 * globalData.baselineTextHeight
    }
    if (lines != undefined) {
      context.fillText(lines[0], xPos[0], yPos[0]);
    }
    await func.drawEmoji();

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'marioMeme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'scatter' || command === 'obra' || command === 'dinn' || command === 'obradinn' || command === 'glitch' || command === 'corrupt') {
    //-----------------------
    // UNIVERSAL STUFF
    //-----------------------
    let filter = command;
    //basic get image make canvas from that image
    let fileDir = './files/buffer/filterBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //obra dinn shrinks image to 250 pixels tall
    if (filter == 'obra' || filter == 'dinn' || filter == 'obradinn') {
      await func.canvasInitialize(250 * imageSize.width / imageSize.height, 250, fileDir);
    }
    else if (filter == 'scatter' && (imageSize.width > 400 || imageSize.height > 400)) {
      let dims = await func.scaleDims([imageSize.width, imageSize.height], 400)
      await func.canvasInitialize(dims[0], dims[1], fileDir);
    }
    else {
      await func.canvasInitialize(imageSize.width, imageSize.height, fileDir);
    }
    let canvas = globalData.canvas;
    let context = globalData.context;
    //this shorthand is mainly useful for obra dinn where we don't need to do any operations
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;
    //-----------------------
    // SCATTER
    //-----------------------
    if (filter == 'scatter') {
      //the pixelData is just an array of all the rgb (and alpha) values of the pixels of the canvas, as in [r1, g1, b1, a1, r2, g2, b2, a2...]
      //this is why stuff like i += 4 appears later, since these values aren't separated by anything
      let pixelData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      let pixelDataLength = pixelData.data.length;
      //flattens the colours by making the RGB values multiples of 5 (to make it faster)
      for (var i = 0; i < pixelDataLength; i++) {
        pixelData.data[i] = Math.round(pixelData.data[i] / 5) * 5;
      }
      //goes through each pixel, and checks if its colour has already been logged in colours (final result is array of all unique colours)
      let colours = [[pixelData.data[0], pixelData.data[1], pixelData.data[2]]];
      for (var i = 0; i < pixelDataLength; i += 4) {
        let rgb = [pixelData.data[i], pixelData.data[i+1], pixelData.data[i+2]];
        //if all RGB values match, move on, if not keep going until last colour
        for (var n = 0; n < colours.length; n++) {
          if (rgb[0] == colours[n][0] && rgb[1] == colours[n][1] && rgb[2] == colours[n][2]) { break; }
          if (n == colours.length - 1) {
            colours.push(rgb);
          }
        }
      }
      //creates an array with the same dimensions as colours, but filling the RGB values with random ones
      let newColours = [];
      for (var i = 0; i < colours.length; i++) {
        let randRGB = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];
        newColours.push(randRGB);
      }
      //similar to loop 2, except when a colour matches it replaces it with the counterpart in newColours
      for (var i = 0; i < pixelDataLength; i += 4) {
        let rgb = [pixelData.data[i], pixelData.data[i+1], pixelData.data[i+2]];
        for (var n = 0; n < colours.length; n++) {
          let colour = colours[n];
          if (rgb[0] == colour[0] && rgb[1] == colour[1] && rgb[2] == colour[2]) {
            let newColour = newColours[n];
            pixelData.data[i] = newColour[0];
            pixelData.data[i+1] = newColour[1];
            pixelData.data[i+2] = newColour[2];
            break;
          }
        }
      }
      context.putImageData(pixelData,0,0);

      var attachment = await new MessageAttachment(canvas.toBuffer(), 'scatter.png');
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
    //-----------------------
    // OBRA DINN
    //-----------------------
    else if (filter == 'obra' || filter == 'dinn' || filter == 'obradinn') {
      //same pixelData stuff as scatter (see there for details)
      let pixelData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      let pixelDataLength = pixelData.data.length;
      //sets the "luminance" of each colour
      let lumR = [];
      let lumG = [];
      let lumB = [];
      for (var i = 0; i < 256; i++) {
        lumR[i] = i * 0.299;
        lumG[i] = i * 0.587;
        lumB[i] = i * 0.114;
      }
      //sets the R value of each pixel to the overall luminance value
      for (var i = 0; i < pixelDataLength; i += 4) {
        pixelData.data[i] = Math.floor(lumR[pixelData.data[i]] + lumG[pixelData.data[i+1]] + lumB[pixelData.data[i+2]]);
      }
      //Bill Atkinson dithering algorithm
      let width = pixelData.width;
      let newPixel, err;
      for (var currentPixel = 0; currentPixel < pixelDataLength; currentPixel += 4) {
        newPixel = pixelData.data[currentPixel] < 200 ? 50 : 230;
        err = Math.floor((pixelData.data[currentPixel] - newPixel) / 8);
        pixelData.data[currentPixel] = newPixel;

        pixelData.data[currentPixel + 4] += err;
        pixelData.data[currentPixel + 8] += err;
        pixelData.data[currentPixel + 4 * width - 4] += err;
        pixelData.data[currentPixel + 4 * width] += err;
        pixelData.data[currentPixel + 4 * width + 4] += err;
        pixelData.data[currentPixel + 8 * width] += err;
        //sets the B and G values to match the R value
        //the complexity comes from the fact that the black value is (50, 50, 25), and the white is (230, 255, 255), so R->G,B depends on multiple factors
        if (newPixel == 50) {
          //black
          pixelData.data[currentPixel + 1] = pixelData.data[currentPixel];
          pixelData.data[currentPixel + 2] = pixelData.data[currentPixel] / 2;
        }
        else {
          //white
          pixelData.data[currentPixel + 1] = pixelData.data[currentPixel] * 1.1;
          pixelData.data[currentPixel + 2] = pixelData.data[currentPixel] * 1.1;
        }

      }
      context.putImageData(pixelData,0,0);
      var attachment = await new MessageAttachment(canvas.toBuffer(), 'obraDinn.png');
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(attachment);
    }
    //-----------------------
    // GLITCH
    //-----------------------
    else if (filter == 'glitch' || filter == 'corrupt') {
      //glitch-canvas module using buffer
      let buffer = canvas.toBuffer();
      glitch({ amount: 0, seed: Math.floor(Math.random()* 101), iterations: Math.floor(Math.random() * 16 + 10), quality: 60}).fromBuffer(buffer).toBuffer().then((glitched) => {
        var attachment = new MessageAttachment(glitched, 'glitch.png');
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send(attachment);
      }).catch(console.error);
      //sometimes throws errors, but seems out of our control
    }
  }
  else if (command === 'arc' || command === 'a' || command === 'archive') {
    let fileExists = false;
    let typeLink = false;
    let arrayPosition = undefined;
    let archiveList = []
    let imageList = [], videoList = [], gifList = [], audioList = [], textList = [], otherList = [];

    if (input != undefined) {
      input = encodeURI(await func.fileNameVerify(input));
    }
    else if (input2 != undefined) {
      input2 = encodeURI(await func.fileNameVerify(input2));
    }

    if (!fs.existsSync(`./files/archive/${message.author.id}.json`)) {
      fs.writeFileSync(`./files/archive/${message.author.id}.json`, '[]');
    }

    let importJSON = fs.readFileSync(`./files/archive/${message.author.id}.json`, 'utf8');
    archiveList = await JSON.parse(importJSON);

    var filteredArchiveList = await archiveList.filter(function (el) {
      return el != null;
    });

    archiveList = await filteredArchiveList;

    if (input === 'delete' || input === 'd') { //Delete a given file

      for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
        if (archiveList[i].name === input2) {
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }

      if (fileExists === true) {
        delete archiveList[arrayPosition];
        var archiveJSON = JSON.stringify(archiveList);
        fs.writeFileSync(`./files/archive/${message.author.id}.json`, archiveJSON);
        return message.channel.send(input2 + ' Deleted')
      }

      else {
        return message.channel.send('Filename not found')
      }

      
    }
    else if (input === 'list' || input === 'l') {

      for (let i = 0; i < archiveList.length; i++) {
        if (archiveList[i].type === 'image') { //File is an image
          imageList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'video') { //File is a video
          videoList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'gif') { //File is a gif
          gifList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'audio') { //File is audio
          audioList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'text') { //File is text
          textList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'link') { //File is other
          otherList.push(' ' + archiveList[i].name)
        }
      }

      let embedDescription = {}
      embedDescription.image = '';
      embedDescription.video = '';
      embedDescription.gif = '';
      embedDescription.audio = '';
      embedDescription.text = '';
      embedDescription.other = '';

      if (imageList.length > 0) {embedDescription.image = '**Images:** ' + '\n' + imageList + '\n\n';}
      if (videoList.length > 0) {embedDescription.video = '**Videos:** ' + '\n' + videoList + '\n\n';}
      if (gifList.length > 0) {embedDescription.gif = '**GIFs:** ' + '\n' + gifList + '\n\n';}
      if (audioList.length > 0) {embedDescription.audio = '**Audio:** ' + '\n' + audioList + '\n\n';}
      if (textList.length > 0) {embedDescription.text   = '**Text:** ' + '\n' + textList + '\n\n';}
      if (otherList.length > 0) {embedDescription.other = '**Other:** ' + '\n' + otherList + '\n\n';}

      const embed = new MessageEmbed()
      .setTitle("User Archived File List")
      .setColor(0x00AE86)
      .setDescription(embedDescription.image + embedDescription.video + embedDescription.gif + embedDescription.audio + embedDescription.text + embedDescription.other)
      return message.channel.send({embed})

    }
    else if (input === undefined) {
      return message.channel.send('Please include a file name.')
    }
    else if (input === 'command') {
      
    }
    else { //Adding or sending a file
      for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
        if (archiveList[i].name === input) {
          if (archiveList[i].type === 'link' || archiveList[i].type === 'gif') {
            typeLink = true;
          }
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }

      if (fileExists === true && typeLink === false) { //File name already exists in JSON - File is a file - Send given file
        let downloadURL = archiveList[arrayPosition].link;
        let archiveBuffer = './files/buffer/' + archiveList[arrayPosition].name + '.' + archiveList[arrayPosition].extension;
        await func.download(downloadURL, archiveBuffer);
        if (func.uploadLimitCheck(archiveBuffer) === true) {
          await message.channel.send(downloadURL);
        }
        else {
          let attachment = new MessageAttachment(archiveBuffer);
          await message.channel.send(attachment)
        }
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return fs.unlinkSync(archiveBuffer);
      }
      else if (fileExists === true && typeLink === true) { //File name already exists in JSON - File is a link - Send given link
        let linkURL = archiveList[arrayPosition].link;
        return message.channel.send(linkURL)
      }
      else if (fileExists === false) { //File name does not exists in JSON - Add file to JSON
        let link = await func.generalScraper('link');
        if (link === null || link === undefined) {
          return message.channel.send('Not a valid embed')
        }
        let extension = await func.fileExtension(link);
        console.log('extension:' + extension);
        let fileType = await func.fileType(extension);
        console.log('fileType:' + fileType);

        var archive = {}
        archive.name = input
        archive.link = link
        archive.extension = extension
        archive.type = fileType

        archiveList.push(archive)

        var archiveJSON = JSON.stringify(archiveList);

        fs.writeFileSync(`./files/archive/${message.author.id}.json`, archiveJSON);

        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send('File saved as ' + input)
      }
    }
  }
  else if (command === 'sarc' || command === 'serverarc' || command === 'sa' || command === 'serverarchive') {
    let fileExists = false;
    let typeLink = false;
    let arrayPosition = undefined;
    let canManageMessages = false;
    let archiveListServer = []
    let serverPerms = []
    let guildID = message.guild.id;
    let imageList = [], videoList = [], gifList = [], audioList = [], textList = [], otherList = [];

    if (input != undefined) {
      input = encodeURI(await func.fileNameVerify(input));
    }
    else if (input2 != undefined) {
      input2 = encodeURI(await func.fileNameVerify(input2));
    }

    if (!fs.existsSync(`./files/archive/${guildID}.json`)) {
      fs.writeFileSync(`./files/archive/${guildID}.json`, '[]');
    }

    if (!fs.existsSync(`./files/archive/${'serverPerms'}.json`)) {
      fs.writeFileSync(`./files/archive/${'serverPerms'}.json`, '[]');
    }

    canManageMessages = func.canManageMessages(message);

    let importServerJSON = fs.readFileSync(`./files/archive/${guildID}.json`, 'utf8');
    archiveListServer = await JSON.parse(importServerJSON);
    let importServerPerms = fs.readFileSync(`./files/archive/${'serverPerms'}.json`, 'utf8');
    serverPerms = await JSON.parse(importServerPerms);

    var filteredArchiveListServer = await archiveListServer.filter(function (el) {
      return el != null;
    });
    var filteredserverPerms = await serverPerms.filter(function (el) {
      return el != null;
    });

    archiveListServer = await filteredArchiveListServer;
    serverPerms = await filteredserverPerms;

    if ((input === 'delete' || input === 'd') && canManageMessages) { //Delete a given file

      for (let i = 0; i < archiveListServer.length; i++) { //Check if the given name exists in the JSON
        if (archiveListServer[i].name === input2) {
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }

      if (fileExists === true) {
        delete archiveListServer[arrayPosition];
        var archiveJSON = JSON.stringify(archiveListServer);
        fs.writeFileSync(`./files/archive/${message.guild.id}.json`, archiveJSON);
        return message.channel.send(input2 + ' Deleted')
      }

      else {
        return message.channel.send('Filename not found')
      }

      
    }
    else if (input === 'list' || input === 'l') {

      for (let i = 0; i < archiveListServer.length; i++) {
        if (archiveListServer[i].type === 'image') { //File is an image
          imageList.push(' ' + archiveListServer[i].name)
        }
        else if (archiveListServer[i].type === 'video') { //File is a video
          videoList.push(' ' + archiveListServer[i].name)
        }
        else if (archiveListServer[i].type === 'gif') { //File is a gif
          gifList.push(' ' + archiveListServer[i].name)
        }
        else if (archiveListServer[i].type === 'audio') { //File is audio
          audioList.push(' ' + archiveListServer[i].name)
        }
        else if (archiveListServer[i].type === 'text') { //File is text
          textList.push(' ' + archiveListServer[i].name)
        }
        else if (archiveListServer[i].type === 'link') { //File is other
          otherList.push(' ' + archiveListServer[i].name)
        }
      }

      let embedDescription = {}
      embedDescription.image = '';
      embedDescription.video = '';
      embedDescription.gif = '';
      embedDescription.audio = '';
      embedDescription.text = '';
      embedDescription.other = '';

      if (imageList.length > 0) {embedDescription.image = '**Images:** ' + '\n' + imageList + '\n\n';}
      if (videoList.length > 0) {embedDescription.video = '**Videos:** ' + '\n' + videoList + '\n\n';}
      if (gifList.length > 0) {embedDescription.gif = '**GIFs:** ' + '\n' + gifList + '\n\n';}
      if (audioList.length > 0) {embedDescription.audio = '**Audio:** ' + '\n' + audioList + '\n\n';}
      if (textList.length > 0) {embedDescription.text   = '**Text:** ' + '\n' + textList + '\n\n';}
      if (otherList.length > 0) {embedDescription.other = '**Other:** ' + '\n' + otherList + '\n\n';}

      const embed = new MessageEmbed()
      .setTitle("Server Archived File List")
      .setColor(0x00AE86)
      .setDescription(embedDescription.image + embedDescription.video + embedDescription.gif + embedDescription.audio + embedDescription.text + embedDescription.other)
      return message.channel.send({embed})

    }
    else if (input === undefined) {
      return message.channel.send('Please include a file name.')
    }
    else { //Adding or sending a file
      for (let i = 0; i < archiveListServer.length; i++) { //Check if the given name exists in the JSON
        if (archiveListServer[i].name === input) {
          if (archiveListServer[i].type === 'link' || archiveListServer[i].type === 'gif') {
            typeLink = true;
          }
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }

      if (fileExists === true && typeLink === false) { //File name already exists in JSON - File is a file - Send given file
        let downloadURL = archiveListServer[arrayPosition].link;
        let archiveBuffer = './files/buffer/' + archiveListServer[arrayPosition].name + '.' + archiveListServer[arrayPosition].extension;
        await func.download(downloadURL, archiveBuffer);
        if (func.uploadLimitCheck(archiveBuffer) === true) {
          await message.channel.send(downloadURL);
        }
        else {
          let attachment = new MessageAttachment(archiveBuffer);
          await message.channel.send(attachment)
        }
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return fs.unlinkSync(archiveBuffer);
      }
      else if (fileExists === true && typeLink === true) { //File name already exists in JSON - File is a link - Send given link
        let linkURL = archiveListServer[arrayPosition].link;
        return message.channel.send(linkURL)
      }
      else if (fileExists === false && canManageMessages) { //File name does not exists in JSON - Add file to JSON
        let link = await func.generalScraper('link');
        if (link === null || link === undefined) {
          return message.channel.send('Not a valid embed')
        }
        let extension = await func.fileExtension(link);
        let fileType = await func.fileType(extension);

        var archive = {}
        archive.name = input
        archive.link = link
        archive.extension = extension
        archive.type = fileType

        archiveListServer.push(archive)

        var archiveJSON = JSON.stringify(archiveListServer);

        fs.writeFileSync(`./files/archive/${guildID}.json`, archiveJSON);

        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send('File saved as ' + input)
      }
    }
  }
  else if (command === 'pref') {
    if (input !== undefined) {
      if (input2 === undefined) {
        input2 = '';
      }
      //(see userData function)
      await func.userData('set', input.toLowerCase(), input2.toLowerCase());
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(`${globalData.toggledMSG}`);
    }
    //if input undefined sends your preferences
    else {
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send('**__Your Preferences:__**\n`point` background - ' + `**${globalData.pointBG}**` +
                                  '\n`poster` background - ' + `**${globalData.posterBG}**` +
                                  '\n`poster` text priority - ' + `**${globalData.posterTXT}**`);
    }
  }
  else if (command === 'server' || command === 'srv') {
    let cpuSpeed = await systeminfo.cpuCurrentSpeed().then();
    let memInfo = await systeminfo.mem().then();
    
    const embed = new MessageEmbed()
      .setTitle("Server PC Status")
      .setColor(0x00AE86)
      .setDescription("CPU Speed: " + cpuSpeed.avg + "GHz\nMemory Used: " + (Math.round((memInfo.used/1073741824) * 10) / 10) + "GB / " + (Math.round((memInfo.total/1073741824) * 10) / 10) + "GB")
      .setTimestamp()
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send({embed})
  }
  else if (command === 'get') {
    let errorMsg = "**Bad Input!**\n(Couldn't find an avatar or emoji from that input)";
    let fileDir = './files/buffer/getBuffer.png';
    let defaultRegex = emojiRegex();
    let customRegex = /<:\w+:(\d+)>/gmd;
    let animRegex = /<a:\w+:(\d+)>/gmd;
    let foundEmoji = false;
    let link;
    //-----------------------
    // AVATAR FROM AUTHOR
    //-----------------------
    if (input === undefined) {
      link = message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
    }
    //-----------------------
    // AVATAR FROM MENTION
    //-----------------------
    else if (message.mentions.users.first() !== undefined) {
      link = message.mentions.users.first().displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
    }
    //-----------------------
    // SERVER AVATAR
    //-----------------------
    else if ((input == 'server' || input == 's') && message.guild.iconURL() != null) {
      link = message.guild.iconURL({ format: 'png', size: 1024, dynamic: true});
    }
    //-----------------------
    // SERVER EMOJIS
    //-----------------------
    else if (input == 'emojis' || input == 'emoji') {
      let serverEmoji = message.guild.emojis.cache;
      let emoji = '';
      serverEmoji.forEach(e => {
        let idtf = e.identifier
        if (e.animated) {
          emoji += '<' + idtf + '>';
        }
        else {
          emoji += '<:' + idtf + '>';
        }
      });
      if (emoji == '') {
        return message.channel.send(errorMsg);
      }
      await func.getEmoji(emoji);
      foundEmoji = true
    }
    //-----------------------
    // EMOJI
    //-----------------------
    else if (defaultRegex.test(fullInput) || customRegex.test(fullInput) || animRegex.test(fullInput)) {
      await func.getEmoji(fullInput);
      foundEmoji = true
    }
    //-----------------------
    // AVATAR FROM ID
    //-----------------------
    else if (!isNaN(input) && input.length == 18) {
      let user = await client.users.fetch(input).catch(console.error);
      if (user != undefined) {
        link = user.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
      }
      else {
        await func.getEmoji(+input);
        return message.channel.send(errorMsg);
      }
    }
    //-----------------------
    // AVATAR FROM USERNAME
    //-----------------------
    else {
      let index = message.content.indexOf('#');
      //trims command and leaves all content up until user tag (e.g. username#1234) if present
      let nameInput = fullInput;
      if (index != -1) {
        nameInput = fullInput.slice(0, index).trim();
      }
      //gets guild member
      let member = await message.guild.members.fetch({ query: nameInput, limit: 1 }).catch(console.error);
      //user from guild member
      if (member.first() != undefined) {
        link = member.first().user.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
      }
      else {
        return message.channel.send(errorMsg);
      }
    }
    //-----------------------
    // EMOJI DOWNLOAD
    //-----------------------
    if (foundEmoji) {
      //invalid emoji
      if (globalData.emojiStatus == 'invalid') { return message.channel.send(errorMsg); }
      //single emoji
      else if (globalData.emojiStatus == 'single') {
        let files = [];
        fs.readdirSync('./files/buffer/emojiDownload').forEach(file => {files.push(file);});
        fileDir = './files/buffer/emojiDownload/' + files[0];
      }
      //multiple emoji
      else {
        let archive = archiver('zip');
        let output = fs.createWriteStream('./files/buffer/emojis.zip');
        archive.pipe(output);
        await archive.directory('./files/buffer/emojiDownload/', false).finalize();
        while (fs.existsSync('./files/buffer/emojis.zip') == false) {
          await func.wait(25);
        }
        fileDir = './files/buffer/emojis.zip';
      }
    }
    //-----------------------
    // AVATAR DOWNLOAD
    //-----------------------
    else if (link != undefined) {
      if (link.indexOf('.gif') != -1) {
        fileDir = './files/buffer/getBuffer.gif';
      }
     await func.download(link, fileDir)
    }

    var attachment = await new MessageAttachment(fileDir);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    await message.channel.send(attachment);
    fs.emptyDirSync('./files/buffer/emojiDownload/');
    if (fs.existsSync('./files/buffer/emojis.zip') == true) {
      fs.unlinkSync('./files/buffer/emojis.zip');
    }
    return;
  }
  else if (command === 'convert' || command === 'conv') {
    /*
    let fileURL = await func.generalScraper('file');

    console.log(input);
    console.log(input2);

    if (fileURL == undefined) {return message.channel.send("No File Found :(");}

    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return message.channel.send("Bad Embed :(");}

    let fileDirBase = await './files/buffer/conversionDownload/filePreConversion.';
    let fileDirInput = await fileDirBase + fileType;
    let fileDirOutput = await './files/buffer/conversionDownload/filePostConversion.' + input;
    console.log(fileDirOutput);

    await func.download(fileURL, fileDirInput);

    await func.wait(1000)

    if (fileType === 'webp') {
      console.log("This is a .webp, SAD!");
      const result = await webp.dwebp(fileDirInput, fileDirOutput);
      result.then((response) => {console.log(response)});
    }

    attachment = await new MessageAttachment(fileDirOutput);
    return message.channel.send(attachment);
    */
   return;
  }
  else if (command === 'bpm') {
    const msg = await message.channel.send(`Press 🏁 to begin, count 10 beats (starting on 1) then press the 🛑.`); //Sends initial message
    let iterator = await 0;
    await msg.react("🏁");
    await func.wait(500);
    while (await msg.reactions.cache.get('🏁').count < 2) { //waits for a user to press 🏁
      await func.wait(10);
      iterator++;
      if (iterator > 3000) {
        msg.delete();
        return message.channel.send(`Command Timed Out`);
      }
    }

    let startTimer = func.getTime();

    iterator = await 0;
    await msg.reactions.cache.get('🏁').remove();
    await msg.react("🛑");
    msg.edit("Count 10 beats then press the 🛑.");

    while (await msg.reactions.cache.get('🛑').count < 2) { //waits for a user to press 🛑
      await func.wait(10);
      iterator++;
      if (iterator > 3000) {
        msg.delete();
        return message.channel.send(`Command Timed Out`);
      }
    }
    let endTimer = func.getTime(startTimer);
    await msg.reactions.cache.get('🛑').remove();

    let minutesPerBeat = endTimer / 60000;
    let bpm = (1 / minutesPerBeat) * 9;

    return msg.edit('The BPM is: ' + Math.round(bpm));
  }
  else if (command === 'flip' || command === 'toss' || command === 'coin') {
    if (!args.length) {
      var odds = 0.5;
    }
    else {
      var odds = input;
    }
    attachment = new MessageAttachment('https://i.imgur.com/xzE6qF4.gif');
    const msg = await message.channel.send(attachment);
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(2500);
    msg.delete();
    if (odds > Math.random()) {
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(`Success!`);
    }
    else {
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(`Failure!`);
    }
  }
  else if (command === 'twt' || command === 'twitter') {

    let originalURL = await func.generalScraper('twitter');

    let lastMessage = await globalData.targetMessage;

    if (lastMessage == undefined) { return message.channel.send("No Twitter Link Found :(");}
    let nickName = lastMessage.member.displayName;
    let splitURL = originalURL.split('/');
    if (splitURL[2] == 'twitter.com') {
      splitURL[2] = 'fxtwitter.com';
      let joinedURL = splitURL.join('/');
      message.delete();
      lastMessage.delete();
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send("Tweet was sent by: **" + nickName + "\n**" + joinedURL);
    }
    else {
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send("This is not a twitter link.");
    }
  }
  else if (command === 'repost' || command === 'rp') {
    let fileURL = await func.generalScraper('file');

    if (fileURL == undefined) {return message.channel.send("No File Found :(");}

    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return message.channel.send("Bad Embed :(");}

    let fileDir = await './files/buffer/testBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return func.sendFile(fileURL, fileDir);
  }
  else if (command === 'starpic' || command === 'sp') {
    let fileURL = await func.generalScraper('image');

    if (fileURL == undefined) {return message.channel.send("No File Found :(");}

    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return message.channel.send("Bad Embed :(");}

    let fileDir = await './files/buffer/starBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    message.delete();
    const starMessage = await func.sendFile(fileURL, fileDir);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return starMessage.react("⭐");
  }
  else if (command === 'probe' || command === 'prb') {
    await func.infoScraper();
    //console.log(link);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return;
  }
  else if (command === 'link' || command === 'lk') {
    let link = await func.generalScraper('link');
    //message.channel.send(link)

    var archive = {}
    archive.name = 'bruh'
    archive.link = link
    archive.type = 'image'

    archiveList.push(archive)
    
    //console.log(archiveList);

    console.log(archiveList[0]);

    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return;
  }
  else if (command === 'kill') {
    //log();
    return;
  }
  else if (command === 'test' || command === 't') {
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
  }
});

export { globalData };
client.login(DISCORDTOKEN);
