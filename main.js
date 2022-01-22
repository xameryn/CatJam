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
var crashLog = ''
var currentdate = new Date(); 
var startTime =    currentdate.getDate() + "-"
                + (currentdate.getMonth()+1)  + "-" 
                + currentdate.getFullYear() + "_"  
                + currentdate.getHours() + "."  
                + currentdate.getMinutes() + "." 
                + currentdate.getSeconds();

process.on('uncaughtException', function (err) {
  let crashMessage = 'Caught exception: ' + err;
  console.log(crashMessage);

  if (!fs.existsSync('./files/crashlogs/crash-' + startTime + '.json')) {
    fs.writeFileSync('./files/crashlogs/crash-' + startTime + '.json', '[]');
  }

  crashLog = crashLog + '\n' + startTime + ': ' + crashMessage;

  fs.writeFileSync('./files/crashlogs/crash-' + startTime + '.json', crashLog);

});

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('In Development');
    func.createFolders();
    setInterval(function(){ 
      //console.log('looping now :3'); 
    }, 2500);
 });

let running = false;
let alreadyRunning = false;
let command = '';
let start = func.getTime();
async function commandLoop(message) { //All commands stored here
  if (running) {
    alreadyRunning = true;
  }
	if (!message.content.startsWith(prefix) || message.author.bot) return;
  running = true;
  start = func.getTime();
  globalData = {}
	const args = message.content.slice(prefix.length).trim().split(' ');
	command = args.shift().toLowerCase();
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
          .setColor(0x686868)
          .setDescription("A catjam that jams to the beat.");
        break;
      case 'stellaris':
        embed
          .setTitle(p + "stellaris [1-12]")
          .setColor(0x686868)
          .setDescription("It's time to play Stellaris.");
        break;
      case 'dadon':
        embed
          .setTitle(p + "dadon")
          .setColor(0x686868)
          .setDescription("Sends one of over 200 images of Don-chan.");
        break;
      case 'neco':
        embed
          .setTitle(p + "neco")
          .setColor(0x686868)
          .setDescription("Sends one of over 100 images of Neco Arc.");
        break;
      case '1984':
        embed
          .setTitle(p + "1984")
          .setColor(0x686868)
          .setDescription("Two possible GIFs depicting 1984.");
        break;
      case 'scatter':
        embed
          .setTitle(p + "scatter")
          .setColor(0x686868)
          .setDescription("Randomizes the colours in an image.");
        break;
      case 'glitch':
      case 'corrupt':
        embed
          .setTitle(p + "glitch")
          .setColor(0x686868)
          .setDescription("Glitches your image.");
        break;
      case 'obradinn':
      case 'obra':
      case 'dinn':
        embed
          .setTitle(p + "obradinn")
          .setColor(0x686868)
          .setDescription("Who was this? How did they die?");
        break;
      case 'poster':
      case 'canvas':
        embed
          .setTitle(p + "poster [up to 2 text inputs]")
          .setColor(0x686868)
          .setDescription("Framed like an early 2000s motivational poster.");
        break;
      case 'point':
        embed
          .setTitle(p + "point")
          .setColor(0x686868)
          .setDescription("Two respectable gentlemen pointing at something of interest.");
        break;
      case 'meme':
        embed
          .setTitle(p + "meme [up to 3 text inputs]")
          .setColor(0x686868)
          .setDescription("Including classic top text, bottom text, and middle text");
        break;
      case 'mario':
        embed
          .setTitle(p + "mario [text input]")
          .setColor(0x686868)
          .setDescription("I can't believe they cast them as Mario.");
        break;
      case 'literally1984':
      case 'l1984':
        embed
          .setTitle(p + "literally1984 [optional text input]")
          .setColor(0x686868)
          .setDescription("For when it is literally 1984.");
        break;
      case 'archive':
      case 'arc':
      case 'a':
        embed
          .setTitle(p + "archive [file name] / delete [file name] / rename [file name] [new name] / list")
          .setColor(0x686868)
          .setDescription("Save any file, then call upon it when you need it most (In any server).")
          .setFooter("Unknown commands send archived files of the same name by default! See " + prefix + "pref for details.");
        break;
      case 'serverarchive':
      case 'sarc':
      case 'sa':
        embed
          .setTitle(p + "serverarchive [file name] / delete [file name] / rename [file name] [new name] / list / permissions")
          .setColor(0x686868)
          .setDescription("Save any file to the server collection, then let anyone in the server call upon it when they need it most.")
          .setFooter("Unknown commands send archived files of the same name by default! See " + prefix + "pref for details.");
        break;
      case 'bpm':
        embed
          .setTitle(p + "bpm")
          .setColor(0x686868)
          .setDescription("Determine the bpm by counting the beats\n(Make sure to start counting as soon as you click the flag).");
        break;
      case 'twitter':
      case 'twt':
        embed
          .setTitle(p + "twitter")
          .setColor(0x686868)
          .setDescription("Convert a Twitter video link into a more consistent embed.");
        break;
      case 'flip':
      case 'toss':
      case 'coin':
        embed
          .setTitle(p + "flip [probability]")
          .setColor(0x686868)
          .setDescription("Flip a coin of any weight!");
        break;
      case 'get':
      case 'avatar':
      case 'avy':
      case 'ava':
        embed
          .setTitle(p + "get [user] / [emoji]")
          .setColor(0x686868)
          .setDescription("Get avatars (Using mentions, ID, or name)\nor emoji (Custom or default) in picture format.");
        break;
      case 'starpic':
      case 'sp':
        embed
          .setTitle(p + "starpic")
          .setColor(0x686868)
          .setDescription("Reposts an image with a star reaction, a neutral mediator for starboards.");
        break;
      case 'help':
      case 'h':
        embed
          .setTitle(p + "help")
          .setColor(0x686868)
          .setDescription("You are beyond help.");
        break;
      case 'pref':
      case 'prefs':
      case 'preferences':
        embed
          .setTitle(p + "pref [preference] [option]")
          .setColor(0x686868)
          .setDescription("Alter the default behaviour of various commands.");
        break;
      case 'server':
      case 'srv':
        embed
          .setTitle(p + "server")
          .setColor(0x686868)
          .setDescription("In case you were wondering how the server was doing.");
        break;
      default:
        embed
          .setTitle("List of Commands")
          .setColor(0x686868)
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
          .setFooter('DISCLAIMER: Not all command names and arguments are disclosed.\nModerator permissions may also be required.')
    }
    return await func.messageReturn(embed, '', false, false, true);
  }
  else if (command === 'catjam') {
    let output = (Math.round((input)/5))*5;
    let link;
    if (!args.length) {
      link = catJamArray[12];
		}
    else if (output < 60) {
      link = catJamArray[0];
		}
    else if (output > 180) {
      link = catJamArray[24];
      console.log(link);
    }
    else {
      link = catJamArray[(output - 60) / 5];
    }
    return await func.messageReturn(link, 'catjam.gif', false, true);
	}
  else if (command === 'stellaris') {
    let link;
    if (input > 0 && input < 13) {
      link = stellarisArray[input];
    }
    else {
      link = stellarisArray[0];
    }
    return await func.messageReturn(link, 'stellaris.gif', false, true);
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
    return await func.messageReturn(joinedArray);
  }
  else if (command === '1984') {
    let link;
    if ((Math.floor(Math.random() * 11)) >= 5) {
        link = 'https://i.imgur.com/59QZNLa.gif'
      }
    else {
        link = 'https://i.imgur.com/wInH3ud.gif'
    }
    return await func.messageReturn(link, '1984.gif', false, true);
  }
  else if (command === 'poster' || command === 'canvas') {
    //-----------------------
    // GET IMAGE AND ITS SIZE
    //-----------------------
    let fileDir = './files/buffer/memePosterBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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
    return await func.messageReturn(canvas.toBuffer(), 'posterMeme.png');
  }
  else if (command === 'meme') {
    //-----------------------
    // GET DA FILE AND DO DA THING
    //-----------------------
    let fileDir = './files/buffer/memeBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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
    return await func.messageReturn(canvas.toBuffer(), 'meme.png')
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
      if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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
    return await func.messageReturn(canvas.toBuffer(), 'literally1984meme.png');
  }
  else if (command === 'point') {
    //-----------------------
    // GET IMAGE AND ITS SIZE
    //-----------------------
    let fileDir = './files/buffer/memePointingBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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

    return await func.messageReturn(canvas.toBuffer(), 'pointerMeme.png');
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
    if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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
    return await func.messageReturn(canvas.toBuffer(), 'marioMeme.png');
  }
  else if (command === 'scatter' || command === 'obra' || command === 'dinn' || command === 'obradinn' || command === 'glitch' || command === 'corrupt') {
    //-----------------------
    // UNIVERSAL STUFF
    //-----------------------
    let filter = command;
    //basic get image make canvas from that image
    let fileDir = './files/buffer/filterBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn("No file found :(")}
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
    if (filter == 'scatter') {//loop 2 takes most time, loop 4 2nd most
      //the pixelData is just an array of all the rgb (and alpha) values of the pixels of the canvas, as in [r1, g1, b1, a1, r2, g2, b2, a2...]
      //this is why stuff like i += 4 appears later, since these values aren't separated by anything
      let pixelData = context.getImageData(0, 0, canvasWidth, canvasHeight);
      let pixelDataLength = pixelData.data.length;
      //flattens the colours by making the RGB values multiples of 5 (to make it faster)
      for (var i = 0; i < pixelDataLength; i++) {
        pixelData.data[i] = Math.round(pixelData.data[i] / 5) * 5;
      }
      //console.log('loop 1 done')
      //goes through each pixel, and checks if its colour has already been logged in colours (final result is array of all unique colours)
      let colours = [`${pixelData.data[0]} ${pixelData.data[1]} ${pixelData.data[2]}`];
      for (var i = 0; i < pixelDataLength; i += 4) {
        let rgb = `${pixelData.data[i]} ${pixelData.data[i+1]} ${pixelData.data[i+2]}`;
        //if all RGB values match, move on, if not keep going until last colour
        if (colours.includes(rgb)) { continue; }
        colours.push(rgb);
      }
      //console.log('loop 2 done')
      //console.log(colours.length)
      //creates an array with the same dimensions as colours, but filling the RGB values with random ones
      let newColours = [];
      for (var i = 0; i < colours.length; i++) {
        let randRGB = [Math.floor(Math.random()*256), Math.floor(Math.random()*256), Math.floor(Math.random()*256)];
        newColours.push(randRGB);
      }
      //console.log('loop 3 done')
      //similar to loop 2, except when a colour matches it replaces it with the counterpart in newColours
      for (var i = 0; i < pixelDataLength; i += 4) {
        let rgb = `${pixelData.data[i]} ${pixelData.data[i+1]} ${pixelData.data[i+2]}`;
        let index = colours.indexOf(rgb);
        if (index != -1) {
          let newColour = newColours[index];
          pixelData.data[i] = newColour[0];
          pixelData.data[i+1] = newColour[1];
          pixelData.data[i+2] = newColour[2];
        }
      }
      //console.log('loop 4 done')
      context.putImageData(pixelData,0,0);
      return await func.messageReturn(canvas.toBuffer(), 'scatter.png');
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
      return await func.messageReturn(canvas.toBuffer(), 'obraDinn.png');
    }
    //-----------------------
    // GLITCH
    //-----------------------
    else if (filter == 'glitch' || filter == 'corrupt') {
      //glitch-canvas module using buffer
      let buffer = canvas.toBuffer();
      let glitchedBuffer = await glitch({ amount: 0, seed: Math.floor(Math.random()* 101), iterations: Math.floor(Math.random() * 16 + 10), quality: 60}).fromBuffer(buffer).toBuffer();
      return await func.messageReturn(glitchedBuffer, 'glitch.png');
    }
  }
  else if (command === 'pref' || command === 'prefs' || command === 'preferences') {
    if (input !== undefined) {
      if (input2 === undefined) {
        input2 = '';
      }
      //(see userData function)
      await func.userData('set', input.toLowerCase(), input2.toLowerCase());
      return await func.messageReturn(`${globalData.toggledMSG}`);
    }
    //if input undefined sends your preferences
    else {
      let thumb = message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
      let embed = new MessageEmbed()
        .setTitle("Your Preferences")
        .setColor(0x686868)
        .addFields(
          { name: 'point', value: "background : `" + `${globalData.pointBG}` + '`'},
          { name: 'poster', value: "background : `" + `${globalData.posterBG}` + "`\ntext priority : `" + `${globalData.posterTXT}` + '`'},
          { name: 'archive', value: "customCMD : `" + `${globalData.customCMD}` + "`\n(Unused commands send\narchived files of the same name)\n⠀"}
        )
        .setFooter('Usage: ' + prefix + 'pref [command] [setting/parameter]\ne.g. ' + prefix + 'pref point png, ' + prefix + 'pref archive customcmd')
        .setThumbnail(thumb);
      return await func.messageReturn(embed, '', false, false, true);
    }
  }
  else if (command === 'server' || command === 'srv') {
    let cpuSpeed = await systeminfo.cpuCurrentSpeed().then();
    let memInfo = await systeminfo.mem().then();
    
    const embed = new MessageEmbed()
      .setTitle("Server PC Status")
      .setColor(0x686868)
      .setDescription("CPU Speed: " + cpuSpeed.avg + "GHz\nMemory Used: " + (Math.round((memInfo.used/1073741824) * 10) / 10) + "GB / " + (Math.round((memInfo.total/1073741824) * 10) / 10) + "GB")
      .setTimestamp()
    return await func.messageReturn(embed, '', false, false, true);
  }
  else if (command === 'get' || command === 'avatar' || command === 'avy' || command === 'ava' || command === 'pfp') {
    //catch for alternate commands
    let errorMsg = "Couldn't find an avatar or emoji from that input.";
    if (command === 'avatar' || command === 'avy' || command === 'ava' || command === 'pfp') {
      errorMsg = "Couldn't find an avatar from that input.";
    }
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
    else if (input == 'emojis' || input == 'emoji' && !(command === 'avatar' || command === 'avy' || command === 'ava' || command === 'pfp')) {
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
        return await func.messageReturn(errorMsg, "Bad Input!");
      }
      await func.getEmoji(emoji);
      foundEmoji = true
    }
    //-----------------------
    // EMOJI
    //-----------------------
    else if ((defaultRegex.test(fullInput) || customRegex.test(fullInput) || animRegex.test(fullInput)) && !(command === 'avatar' || command === 'avy' || command === 'ava' || command === 'pfp')) {
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
        return await func.messageReturn(errorMsg, "Bad Input!");
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
        return await func.messageReturn(errorMsg, "Bad Input!");
      }
    }
    //-----------------------
    // EMOJI DOWNLOAD
    //-----------------------
    if (foundEmoji) {
      //invalid emoji
      if (globalData.emojiStatus == 'invalid') { return await func.messageReturn(errorMsg, "Bad Input!"); }
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
    return await func.messageReturn(fileDir);
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
    let messageContent = lastMessage.content.split('https')
    let splitURL = originalURL.split('/');
    if (splitURL[2] == 'twitter.com') {
      splitURL[2] = 'fxtwitter.com';
      let joinedURL = splitURL.join('/');
      message.delete();
      lastMessage.delete();
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send("Tweet was sent by: **" + nickName + "\n**" + messageContent[0] + "\n" + joinedURL);
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
    let link = await func.generalScraper('file');
    console.log(message.reference);

    console.log('$link link: ' + link);    

    //console.log(archiveList[0]);

    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return;
  }
  else if (command === 'kill') {
    log();
    return;
  }
  else if (command === 'test' || command === 't') {
    //console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
  }
  else { //archive stuff
    //arc, serverarc, and custom command checks
    let customCMD = false
    if (!(command === 'arc' || command === 'a' || command === 'archive' || command === 'sarc' || command === 'serverarc' || command === 'sa' || command === 'serverarchive')) {
      if (globalData.customCMD) {
        input = command;
        customCMD = true
      }
      else { return; }
    }
    let serverArc = false;
    if (command === 'sarc' || command === 'serverarc' || command === 'sa' || command === 'serverarchive' || customCMD) {
      serverArc = true;
    }
    //wow that's a lot of variables
    let fileExists = false;
    let newNameExists = false;
    let typeLink = false;
    var arrayPosition = undefined;
    var canManageMessages = true;
    var serverStored = false;
    var peepingTom = false;
    let archiveList = [];
    let serverPerms = [];
    let id = message.author.id;
    let imageList = [], videoList = [], gifList = [], audioList = [], textList = [], otherList = [];
    let title = 'User Archived File List';
    var currentPerm;
    let listThumb = '';
    let argsString = '';
    
    if (input != undefined) { //sanitize input
      input = encodeURI(await func.fileNameVerify(input));
    }
    else if (input2 != undefined) { //sanitize input
      input2 = encodeURI(await func.fileNameVerify(input2));
    }
    if (serverArc) { // ARC/SERVER ARC SPECIFIC
      id = message.guild.id;
      canManageMessages = func.canManageMessages(message);

      if (!fs.existsSync(`./files/archive/${id}.json`)) {
        fs.writeFileSync(`./files/archive/${id}.json`, '[]');
      }
      if (!fs.existsSync(`./files/archive/serverPerms.json`)) {
        fs.writeFileSync(`./files/archive/serverPerms.json`, '[]');
      }

      let importServerJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
      archiveList = await JSON.parse(importServerJSON);
      let importServerPerms = fs.readFileSync(`./files/archive/serverPerms.json`, 'utf8');
      serverPerms = await JSON.parse(importServerPerms);

      var filteredArchiveList = await archiveList.filter(function (el) {
        return el != null;
      });
      var filteredServerPerms = await serverPerms.filter(function (el) {
        return el != null;
      });

      archiveList = await filteredArchiveList;
      serverPerms = await filteredServerPerms;

      title = 'Server Archived File List';
      if (message.guild.iconURL() != null) {
        listThumb = message.guild.iconURL({ format: 'png', size: 1024, dynamic: true});
      }

      for (let i = 0; i < serverPerms.length; i++) { //Check if the server ID exists in the JSON
        if (serverPerms[i].server === id) {
          currentPerm = serverPerms[i].status;
          serverStored = true;
          arrayPosition = i;
          break;
        }
      }

      if (serverStored) {
        if (currentPerm === 'global') {
          canManageMessages = true;
        }
      }
    }
    else { //ARC SPECIFIC

      listThumb = message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});

      if (message.mentions.users.first() && func.canManageMessages(message) && message.reference === null) { // Checks if message is mentions a user, is not a reply, and if the sender is a moderator
        id = message.mentions.users.first().id;
        listThumb = message.mentions.users.first().displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
        peepingTom = true;
      }

      if (!fs.existsSync(`./files/archive/${id}.json`)) {
        fs.writeFileSync(`./files/archive/${id}.json`, '[]');
      }
      let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
      archiveList = await JSON.parse(importJSON);
    }
    if ((input === 'delete' || input === 'd') && canManageMessages && !peepingTom && !customCMD) { // Delete from JSON
      for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
        if (archiveList[i].name === input2) {
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }
      if (fileExists === true) {
        let thumb = '';
        if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {
          thumb = archiveList[arrayPosition].link;
        }
        archiveList.splice(arrayPosition, 1);
        var archiveJSON = JSON.stringify(archiveList);
        fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);
        return await func.messageReturn('"' + input2 + '" deleted.');
      }
      else {
        return await func.messageReturn('Please include a valid file name.');
      }
    }
    if ((input === 'rename' || input === 'r') && canManageMessages && !peepingTom && !customCMD) { // Ranme file in JSON
      for (let i = 0; i < archiveList.length; i++) { //Check if the original name exists in the JSON
        if (archiveList[i].name === input2) {
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }
      for (let i = 0; i < archiveList.length; i++) { //Check if the new name exists in the JSON
        if (archiveList[i].name === input3) {
          newNameExists = true;
          break;
        }
      }
      if (newNameExists === true) {
        return await func.messageReturn('The name "' + input3 + '" is already taken.');
      }
      if (fileExists === true) {
        let thumb = '';
        if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {
          thumb = archiveList[arrayPosition].link;
        }
        archiveList[arrayPosition].name = input3;
        var archiveJSON = JSON.stringify(archiveList);
        fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);
        return await func.messageReturn('"' + input2 + '"' + ' has been renamed to ' + '"' + input3 + '".', '', true, false, false, thumb);
      }
      else {
        return await func.messageReturn('Please include a valid file name.');
      }
    }
    else if ((input === 'list' || input === 'l') && !customCMD) { // List files from JSON
      for (let i = 0; i < archiveList.length; i++) {
        if (archiveList[i].type === 'image') { //File is an image
          imageList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'video') { //File is a video
          videoList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'gif' || (archiveList[i].link.includes('https://tenor.com/') && archiveList[i].link.includes('-gif-'))) { //File is a gif
          gifList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'audio') { //File is audio
          audioList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'text') { //File is text
          textList.push(' ' + archiveList[i].name)
        }
        else if (archiveList[i].type === 'link' && !(archiveList[i].link.includes('https://tenor.com/') && archiveList[i].link.includes('-gif-'))) { //File is other
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

      return await func.messageReturn(embedDescription.image + embedDescription.video + embedDescription.gif + embedDescription.audio + embedDescription.text + embedDescription.other, title, true, false, false, listThumb);
    }
    else if (input === undefined && !customCMD) {
      return await func.messageReturn('Please include a file name.');
    }
    else if ((input === 'perms' || input === 'permissions') && func.canManageMessages(message) && serverArc && !customCMD) { // Server permissions
      id = message.guild.id;

      if (!fs.existsSync(`./files/archive/serverPerms.json`)) {
        fs.writeFileSync(`./files/archive/serverPerms.json`, '[]');
      }

      let importServerPerms = fs.readFileSync(`./files/archive/serverPerms.json`, 'utf8');
      serverPerms = await JSON.parse(importServerPerms);

      var filteredServerPerms = await serverPerms.filter(function (el) {
        return el != null;
      });
      serverPerms = await filteredServerPerms;

      if (input2 === 'global' || input2 === 'moderator') {
        if (serverStored) {
          var permissions = {}
          permissions.server = id
          permissions.status = input2
  
          serverPerms[arrayPosition] = permissions
          var serverPermsJSON = JSON.stringify(serverPerms);
          fs.writeFileSync(`./files/archive/serverPerms.json`, serverPermsJSON);

          return await func.messageReturn('Permissions have been set to ' + '``' + input2 + '``', 'Server Archive Permissions');
        }
        else {
          var permissions = {}
          permissions.server = id
          permissions.status = input2
  
          serverPerms.push(permissions)
          var serverPermsJSON = JSON.stringify(serverPerms);
          fs.writeFileSync(`./files/archive/serverPerms.json`, serverPermsJSON);

          return await func.messageReturn('Permissions have been set to ' + '``' + input2 + '``', 'Server Archive Permissions');
        }
      }

      else if (input2 === undefined && serverStored) {
        return await func.messageReturn('Permissions are set to ' + '``' + serverPerms[arrayPosition].status + '``', 'Server Archive Permissions');
      }

      else if (input2 === undefined && !serverStored) {
        return await func.messageReturn('Permissions have not been set.', 'Server Archive Permissions');
      }
      else {
        return await func.messageReturn('Please enter a valid argument.', 'Server Archive Permissions');
      }
    }
    else { // SEND or ADD File
      for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
        if (archiveList[i].name === input) {
          if (archiveList[i].type === 'link') {
            typeLink = true;
          }
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }
      if (fileExists === false && customCMD) { //special case for custom cmd
        //earlier code redone
        id = message.author.id;
        if (!fs.existsSync(`./files/archive/${id}.json`)) {
          fs.writeFileSync(`./files/archive/${id}.json`, '[]');
        }
        let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
        archiveList = await JSON.parse(importJSON);
        listThumb = message.author.displayAvatarURL({ format: 'png', size: 1024, dynamic: true});
        var filteredArchiveList = await archiveList.filter(function (el) {
          return el != null;
        });
        archiveList = await filteredArchiveList;
        //search re-executed for user files
        for (let i = 0; i < archiveList.length; i++) {
          if (archiveList[i].name === input) {
            if (archiveList[i].type === 'link') {
              typeLink = true;
            }
            fileExists = true;
            arrayPosition = i;
            break;
          }
        }
      }
      if (fileExists === true && typeLink === false) { //File name already exists in JSON - File is a file - Send given file
        let downloadURL = archiveList[arrayPosition].link;
        let archiveBuffer = './files/buffer/' + archiveList[arrayPosition].name + '.' + archiveList[arrayPosition].extension;
        await func.download(downloadURL, archiveBuffer);
        if (func.uploadLimitCheck(archiveBuffer) === true) {
          return await func.messageReturn(downloadURL, '', true, false, true);
        }
        else {
          return await func.messageReturn(archiveBuffer);
        }
      }
      else if (fileExists === true && typeLink === true) { //File name already exists in JSON - File is a link - Send given link
        let linkURL = archiveList[arrayPosition].link;
        return await func.messageReturn(linkURL, '', true, false, true);
      }
      else if (fileExists === false && canManageMessages && !peepingTom && !customCMD) { //File name does not exists in JSON - Add file to JSON
        let link = await func.generalScraper('link'); //Searches for any embed
        if (link === null) {
          link = await func.generalScraper('file'); //If embed is invalid (ie. Discord Rich Embed), searches for a file (ie. image or video)
        }
        else if (link === undefined) {
          return await func.messageReturn('Not a valid embed.');
        }
        let extension = await func.fileExtension(link);
        let fileType = await func.fileType(extension);

        var archive = {}
        archive.name = input
        archive.link = link
        archive.extension = extension
        archive.type = fileType

        archiveList.push(archive)
        var archiveJSON = JSON.stringify(archiveList);
        fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);

        //send embed with thumbnail
        let thumb = '';
        if (fileType == 'image' || fileType == 'gif') {
          thumb = link;
        }
        /*else if (link.includes('https://tenor.com/') && link.includes('-gif-')) { // If link is Tenor, do special embed (because Tenor is aids.)
          thumb = 'https://cdn.discordapp.com/attachments/813337498029391873/933875660202602546/unknown.png';
        }*/
        return await func.messageReturn('File saved as "' + input + '"', '', true, false, false, thumb);
      }
      else if (peepingTom) {
        return await func.messageReturn('You may not edit another users files.');
      }
    }
  }
}

client.on('message', async message => {
	await commandLoop(message).then( sendTime => {
    if (running && !alreadyRunning) {
      let totalTime = func.getTime(start);
      if (sendTime != undefined) {
        console.log(`[ ${command} - ${totalTime}ms ] ( ${(totalTime - sendTime)}ms + ${sendTime}ms )`);
      }
      else {
        console.log(`[ ${command} - ${totalTime}ms ]`);
      }
      running = false
    }
    alreadyRunning = false;
  });
});

export { globalData };
client.login(DISCORDTOKEN);
