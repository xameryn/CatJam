const { Client, Intents, MessageAttachment, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const fs = require('fs-extra')
const archiver = require('archiver');
const webp = require('webp-converter');
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const emojiRegex = require('emoji-regex');
const glitch = require('glitch-canvas');
const Canvas = require('canvas');
const SizeOf = require('image-size');

const func = require("./functions.js");

import { discordKey, guildKey, prefixKey } from './keys.js';
import { catJamArrayStorage, stellarisArrayStorage } from './links.js';

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const DISCORDTOKEN = discordKey;
const GuildID = guildKey;
const prefix = prefixKey;
const catJamArray = catJamArrayStorage;
const stellarisArray = stellarisArrayStorage;

var globalData = {};
var downloadingBoolean = false;

var output = fs.createWriteStream('emojis.zip');
var archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Iteration vX');
 });

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
  let start = func.getTime();
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
  const user = message.author.id;
  let input = args[0];
  let input2 = args[1];
  globalData.message = message;
  globalData.prefix = prefix;
  globalData.args = args;
  globalData.authorID = message.author.id;
  await func.userData('get');
  if (command === 'help') {
    switch(input) {
  case 'catjam':
    return message.channel.send("$catjam [BPM] for catjam to jam to the beat.");
    break;
  default:
    return message.channel.send(
      "__**List of Commands:**__" + "\n\n" +
      "__Media Commands:__" + "\n" + "$catjam" + "\n" + "$stellaris" + "\n" + "$dadon" + "\n" + "$1984" + "\n\n" +
      "__Filter Commands:__" + "\n" + "$scatter" + "\n" + "$glitch" + "\n" + "$obra" + "\n\n" +
      "__Media Editing Commands:__" + "\n" + "$poster" + "\n" + "$point" + "\n" + "$meme" + "\n" + "$mario" + "\n" + "$literally1984" + "\n\n" +
      "__Utility Commands:__" + "\n" + "$archive" + "\n" + "$bpm (WIP)" + "\n" + "$twitter" + "\n" + "$flip" + "\n" + "$get" + "\n" + "$pref" + "\n" + "$help");
    }
  }
  else if (command === 'catjam') {
    let output = (Math.round((input)/5))*5;
    if (!args.length) {
      attachment = new MessageAttachment(catJamArray[12]);
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
  else if (command === 'dadon') {
    let dir = './files/dadon';
    let dadonArray = ['./files/dadon/', 'dadon (', 'num', ').png'];
    let fileNumber = fs.readdirSync(dir).length;
    let imageNum = Math.floor(Math.random() * fileNumber) + 1;
    dadonArray[2] = imageNum;
    if (!isNaN(input) && input <= fileNumber && input > 0) {
      dadonArray[2] = input;
    }
    let joinedArray = dadonArray.join('');
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
    let fileURL = await func.imageScraper();
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
      if (globalData.posterTXT == 'small') {
        inputs[1] = inputs[0];
        inputs[0] = '';
      }
    }
    //dummy canvas so context works in textHandler
    await func.canvasInitialize(1400, 700, './files/templates/blackBox.jpg', []);
    //big text
    await func.textHandler(inputs[0].toUpperCase(), 'Times New Roman', '', 150, 1, (canvasWidth + 100), 1, true, 0, centerX, 711, 'top');
    let lines1 = globalData.textLines;
    let xPos1 = globalData.textX;
    let yPos1 = globalData.textY;
    let size1 = globalData.textSize;
    let textHeight1 = globalData.textHeight;
    //spacing between the two texts, and each text and its upper and lower bounds
    let spacing = textHeight1 * 0.5;
    //small text
    await func.textHandler(inputs[1], 'Arial', '', Math.floor(size1 / 3), 1, (canvasWidth + 100), 3, true, 0.2, centerX, (711 + textHeight1 + (2 * spacing)), 'top');
    let lines2 = globalData.textLines;
    let xPos2 = globalData.textX;
    let yPos2 = globalData.textY;
    let size2 = globalData.textSize;
    let textHeight2 = globalData.textHeight;
    //-----------------------
    // CANVAS THINGS
    //-----------------------
    //canvas is padded on all sides, lower padding is dependent on text heights
    //
    //if one of the inputs is empty, spacing is adjusted accordingly, if both are empty it becomes a symmetric square border
    if (inputs[0] != '' && inputs[1] == '') {
      await func.canvasInitialize(canvasWidth + 200, (canvasHeight + 111  + (spacing * 2) + textHeight1), './files/templates/blackBox.jpg', []);
    }
    else if (inputs[0] == '' && inputs[1] != '') {
      spacing = textHeight2 * 0.75;
      for (i = 0; i < lines2.length; i++) {
        yPos2[i] += spacing;
      }
      await func.canvasInitialize(canvasWidth + 200, (canvasHeight + 111  + (spacing * 2) + textHeight2), './files/templates/blackBox.jpg', []);
    }
    else if (inputs[0] == '' && inputs[1] == '') {
      await func.canvasInitialize(canvasWidth + 200, (canvasHeight + 111  + 100), './files/templates/blackBox.jpg', []);
    }
    else {
      await func.canvasInitialize(canvasWidth + 200, (canvasHeight + 111  + (spacing * 3) + textHeight1 + textHeight2), './files/templates/blackBox.jpg', []);
    }
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

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'posterMeme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'meme') {
    //-----------------------
    // GET DA FILE AND DO DA THING
    //-----------------------
    let fileDir = './files/buffer/memeBuffer.png';
    let fileURL = await func.imageScraper();
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // IMAGE TOO BIG OR TOO SMALL
    //-----------------------
    //discord still angy so image is shrink
    if (imageSize.height > 1500 || imageSize.width > 1500) {
      if (imageSize.height > imageSize.width) {
        imageSize.width = (1500 / imageSize.height) * imageSize.width;
        imageSize.height = 1500;
      }
      else {
        imageSize.height = (1500 / imageSize.width) * imageSize.height;
        imageSize.width = 1500;
      }
    }
    //dimensions scaled so they're at least 100
    if (imageSize.height < 100 || imageSize.width < 100) {
      if (imageSize.height > imageSize.width) {
        imageSize.height = (100 / imageSize.width) * imageSize.height;
        imageSize.width = 100;
      }
      else {
        imageSize.width = (100 / imageSize.height) * imageSize.width;
        imageSize.height = 100;
      }
    }
    //-----------------------
    // FUNCTIONS AND CANVAS STUFF
    //-----------------------
    //image is the canvas (fairly generous scale parameters here)
    func.imageToCanvas([imageSize.width, imageSize.height], 3, 3, [imageSize.width,(imageSize.width / 3)], [(imageSize.height / 3),imageSize.height]);
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
    }
    //-----------------------
    // IMAGE CASE
    //-----------------------
    //if no text inputs, scrapes image
    else {
      let fileDir = './files/buffer/meme1984Buffer.png';
      let fileURL = await func.imageScraper();
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
    let fileURL = await func.imageScraper();
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // IF IMAGE IS TOO BIG
    //-----------------------
    //if it is too big I make it less because discord angy
    if (imageSize.height > 1500 || imageSize.width > 1500) {
      if (imageSize.height > imageSize.width) {
        imageSize.width = (1500 / imageSize.height) * imageSize.width;
        imageSize.height = 1500;
      }
      else {
        imageSize.height = (1500 / imageSize.width) * imageSize.height;
        imageSize.width = 1500;
      }
    }
    //-----------------------
    // FIND CANVAS SIZE
    //-----------------------
    //suitable canvas size for image
    func.imageToCanvas([imageSize.width, imageSize.height], 2, 1, [1920,1518], [1920,1518]);
    let memeWidth = globalData.imgCanvasX;
    let memeHeight = globalData.imgCanvasY;
    let imgEval = globalData.imgCanvasEval;
    //if the image is small, it's placed at its original size on a fixed canvas (3x smaller than native pointing.png)
    let memeSmall = false;
    if (imageSize.height < 100 || imageSize.width < 100) {
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
    let fileURL = await func.imageScraper();
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //-----------------------
    // IMAGE
    //-----------------------
    //scale to fill entire canvas
    await func.canvasScaleFill('memeMarioBuffer.png', 730, 973, 960, 539.5);
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
    if (inputs[0] === undefined) {
      inputs[0] = '';
    }
    //text string left aligned in its place on template
    func.textHandler(inputs[0].toUpperCase(), 'Trebuchet MS', 'bold ', 75, 1, 526, 1, true, 0, 275, 897, 'center', 'left');
    let lines = globalData.textLines;
    let xPos = globalData.textX;
    let yPos = globalData.textY;
    context.fillStyle = '#ffffff';
    context.fillText(lines[0], xPos[0], yPos[0]);

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'marioMeme.png');
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return message.channel.send(attachment);
  }
  else if (command === 'scatter' || command === 'obra' || command === 'dinn' || command === 'glitch' || command === 'corrupt') {
    //-----------------------
    // UNIVERSAL STUFF
    //-----------------------
    let filter = command;
    //basic get image make canvas from that image
    let fileDir = './files/buffer/filterBuffer.png';
    let fileURL = await func.imageScraper();
    if (fileURL == undefined) {return message.channel.send("No File Found :(");}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //obra dinn shrinks image to 250 pixels tall
    if (filter == 'obra' || filter == 'dinn') {
      await func.canvasInitialize(250 * imageSize.width / imageSize.height, 250, fileDir);
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
    else if (filter == 'obra' || filter == 'dinn') {
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
      glitch({ amount: 0, seed: Math.floor(Math.random()* 101), iterations: Math.floor(Math.random() * 91 + 10), quality: 60}).fromBuffer(buffer).toBuffer().then((glitched) => {
        var attachment = new MessageAttachment(glitched, 'glitch.png');
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send(attachment);
      }).catch(console.error);
      //sometimes throws errors, but seems out of our control
    }
  }
  else if (command === 'arc' || command === 'a' || command === 'archive') {
    globalData.fileType = 'fileType';
    let nameBypass = false;
    let dir = './files/archive';
    let fileDir = ['./files/archive/', 'fileName', '.', 'fileType'];
    fileDir [1] = input;

    let fileList = fs.readdirSync('./files/archive/');
    let fileListJoin = await fileList.join().replaceAll(',', '.').split('.');

    for (var i = 0; i < (fileListJoin.length); i = i + 2) { //Find file type of input name
      if (fileListJoin[i] == input) {
        fileDir[3] = fileListJoin[i + 1];
        globalData.fileType = fileListJoin[i + 1].toString();
      }
    }
    fileDir = fileDir.join('').toString();
    // INPUTS
    if (input === undefined) { //No file name in message
      return message.channel.send(`No File Name.`);
    }
    if (input == 'list' || input == 'l') { //Search for file list
      for (var i = 0; i < fileList.length; i++) {
        fileList[i] = fileList[i].split('.').shift();
      }
      fileList = fileList.join(', ');
      return message.channel.send(`File List: ` + fileList);
    }
    if (input == 'help' || input == 'h') { //Search for help
      return message.channel.send(`Save Image: $arc [Name]` +  "\n" + `Post Image: $arc [Name]` +  "\n" + `See File List: $arc list` +  "\n" + `Delete File: $arc [Name] delete` +  "\n" + `Replace File: $arc [Name] replace`);
    }
    if (input2 == 'replace' || input2 == 'r') { //Replace file
      nameBypass = true;
      fs.unlinkSync(fileDir);
    }
    if (input2 == 'delete' || input2 == 'd') { //Delete file
      if (fs.existsSync(fileDir)) {
        await fs.unlinkSync(fileDir);
        return message.channel.send(`Deleted File ` + input);
      }
      else {
        return message.channel.send('File Name ' + '"' + input + '"' + ' does not exist.');
      }
    }
    // SEND/ARCHIVE
    if (fs.existsSync(fileDir)) { //Send file
      if (nameBypass == false) {
        var attachment = await new MessageAttachment(fileDir);
        return message.channel.send(attachment);
      }
    }
    var fileURL = await func.fileScraper(); //Archive most recent file
    var fileType =  fileURL.split('.').pop();
    fileDir = dir + '/' + input + '.' + fileType;
    func.download(fileURL, fileDir);
    return message.channel.send(`File Archived as ` + input + '.');
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
      return message.channel.send('**__Your preferences:__**\n`point` background - ' + `**${globalData.pointBG}**` + '\n`poster` background - ' + `**${globalData.posterBG}**` + '\n`poster` text priority - ' + `**${globalData.posterTXT}**`);
    }
  }
  else if (command === 'get') {
    if (input == 'ava' || input == 'av' || input == 'avatar' || input == 'pfp') {
      let link
      //avatar of author
      if (input2 === undefined) {
        link = message.author.avatarURL();
      }
      //avatar from mention
      else if (message.mentions.users.first() !== undefined) {
        link = message.mentions.users.first().avatarURL();
      }
      //server avatar
      else if ((input2 == 'server' || input2 == 's') && message.guild.iconURL() != null) {
        link = message.guild.iconURL();
      }
      //avatar from id
      else {
        //special case since promises are cringe
        client.users.fetch(input2).then((targetUser) => {
          let index = targetUser.avatarURL().indexOf('.webp');
          console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
          message.channel.send(targetUser.avatarURL().slice(0,index) + '.png?size=1024');
        }).catch(console.error);
        return;
      }
      //changed .webp to .png, and sets large size to make it display native res
      let index = link.indexOf('.webp');
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      return message.channel.send(link.slice(0,index) + '.png?size=1024');
    }
    else if (input == 'em' || input == 'emoji') {
      let cSplit = message.content.slice(prefix.length).trim().split(':');
      let regex = emojiRegex(); //Emoji database
      for (var i = 0; i < cSplit.length; i++) {
        cSplit[i] = cSplit[i].toString().replace('<', '').replace('>', '').replace('get em', '').replace('_', '').replace(' ', ''); //Removes all incompadible characters
        if (cSplit[i] == undefined || cSplit[i] === '') {
          cSplit.splice(i,1)
        }
      }

      var letters = /^[A-Za-z]+$/; //All letters
      var numbers = /^[0-9]+$/; //All numbers
      let emojiDirBase = await './files/buffer/emojiDownload/'
      let truthCounter = 0;

      for (i = 0; i < cSplit.length; i++) {
        if (i%2 == 0) { //Even
          if (cSplit[i].match(letters)) {
            truthCounter++
          }
        }
        else { //Odd
          if (cSplit[i].match(numbers)) {
            truthCounter++
          }
        }
      }

      if (truthCounter == cSplit.length) { //No unicode emoji's present
        console.log("Custom Emoji...");
        if (cSplit.length == 2) {
          console.log("Single Emoji Sent");
          console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
          console.log('https://cdn.discordapp.com/emojis/' + cSplit[1] + '.png?size=1024');
          return message.channel.send('https://cdn.discordapp.com/emojis/' + cSplit[1] + '.png?size=1024');
        }
        else {
          console.log("Multiple Emojis Sent");
          let archive = await archiver('zip');
          let output = await fs.createWriteStream('emojis.zip');
          await archive.pipe(output);
          await fs.emptyDirSync(emojiDirBase)
          for (i = 0; i < cSplit.length; i++) {
            await console.log('For loop iteration ' + i + ': ' + cSplit[i]);
            if (i%2 == 0) {
          		await console.log(cSplit[i] + " is even, skipping download.");
            }
          	else {
          		await console.log(cSplit[i] + " is odd, downloading...");
              let emojiURL = await 'https://cdn.discordapp.com/emojis/' + cSplit[i] + '.png'
              let emojiDir = await emojiDirBase + cSplit[i] + '.png'
              await func.download(emojiURL, emojiDir)
              await fs.renameSync(emojiDir, emojiDirBase + cSplit[i-1] + '.png')
            }
          }
          console.log('Archiving Emojis...');
          await archive.directory(emojiDirBase, false).finalize();
          while (await fs.existsSync('./emojis.zip') == false) {
            await func.wait(25);
          }
          attachment = new MessageAttachment('./emojis.zip');
          await message.channel.send(attachment);
          await fs.emptyDirSync(emojiDirBase)
          await fs.unlinkSync('./emojis.zip')
          return;
        }
      }
      else {
        console.log("Unicode Emoji...");
        input2 = input2.replace(/<.*>/, ''); //Deletes all custom emojis
        let names = [input2.codePointAt(0).toString(16)];
        let i = 1;
        while (input2.codePointAt(i) != undefined) {
          if (input2.codePointAt(i).toString(16)[0] != 'd') {
            names.push(input2.codePointAt(i).toString(16));
          }
          i += 1;
        }
        //gets character code and converts it to hexadecimal
        let name = names[0];
        for (i = 1; i < names.length; i++) {
          name += '-' + names[i];
        }
        //grabs png and puts on canvas
        await func.canvasInitialize(1024, 1024, './files/emoji/' + name + '.png', []);
        let canvas = globalData.canvas;

        var attachment = await new MessageAttachment(canvas.toBuffer(), 'emoji.png');
        console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
        return message.channel.send(attachment);
      }
    }
  }
  else if (command === 'convert' || command === 'conv') {
    let fileURL = await func.fileScraper();

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
    let lastMessage = await func.linkScraper();
    if (lastMessage == undefined) { return message.channel.send("No Link Found :(");}
    let nickName = lastMessage.member.displayName;
    let originalURL = lastMessage.content;
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
    let fileURL = await func.fileScraper();

    if (fileURL == undefined) {return message.channel.send("No File Found :(");}

    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return message.channel.send("Bad Embed :(");}

    let fileDir = await './files/buffer/testBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return func.sendFile(fileURL, fileDir);

  }
  else if (command === 'starpic' || command === 'sp') {
    let fileURL = await func.imageScraper();

    if (fileURL == undefined) {return message.channel.send("No File Found :(");}

    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return message.channel.send("Bad Embed :(");}

    let fileDir = await './files/buffer/starBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    message.delete();
    const starMessage = await func.sendFile(fileURL, fileDir);
    return starMessage.react("⭐");

  }
  else if (command === 'probe' || command === 'prb') {
    await func.infoScraper();
    console.log(link);
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
    return;
  }
  else if (command === 'kill') {log();}
  else if (command === 'test' || command === 't') {
    console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
  }
});

export { globalData };
client.login(DISCORDTOKEN);
