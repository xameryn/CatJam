const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ModalBuilder, TextInputBuilder, TextInputStyle, AttachmentBuilder } = require('discord.js');
//const { webhookId, webhookToken } = require('./config.json');
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
const twitterGetUrl = require("twitter-url-direct")
const apng2gif = require('apng2gif');
const fetch = require('node-fetch');
var ffmpeg = require('fluent-ffmpeg');
var synonyms = require("synonyms");
//var Twit = require('twit');

const func = require("./functions.js");

import { discordKey, prefixKey, twt_key, twt_secret } from './keys.js';
import { catJamArrayStorage, stellarisArrayStorage, developerIDStorage } from './arrays.js';
import { message } from 'synonyms/dictionary.js';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers] });
const DISCORDTOKEN = discordKey;
const globalPrefix = prefixKey;
const catJamArray = catJamArrayStorage;
const stellarisArray = stellarisArrayStorage;
const devIDArray = developerIDStorage;

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

client.on("ready", () => {
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('In Development');
    func.createFolders();
    setInterval(function(){ 
      //console.log('looping now :3'); 
    }, 2500);
});

func.userData('update');

globalData.globalPrefix = globalPrefix;
let prefixArray = [globalPrefix];
if (fs.existsSync('user-data.json')) {
  func.userData('prefix').then(array => {
    prefixArray = array;
  });
}


let running = false;
let alreadyRunning = false;
let command = '';
let start = func.getTime();
async function commandLoop(message) { //All commands stored here
  if (running) {
    alreadyRunning = true;
  }
  if (message.mentions.has(client.user)) {
    if (message.content.includes('prefix')) {
      globalData.authorID = message.author.id;
      globalData.message = message;
      await func.userData('get');
      await func.userData('set', 'prefix', 'default', '');
      return await func.messageReturn({input: `${globalData.toggledMSG}`, type: 'text'});
    }
  }
  if (!prefixArray.some(p => message.content.startsWith(p)) || message.author.bot) { return; }
  globalData = {};
  globalData.authorID = message.author.id;
  await func.userData('get');
  let prefix;
  if (message.content.startsWith(globalData.userData.prefixC)) {
    prefix = globalData.userData.prefixC;
  }
  else if (message.content.startsWith(globalPrefix) && globalData.userData.prefixD) {
    prefix = globalPrefix;
  }
  else { return; }
  globalData.globalPrefix = globalPrefix;
  globalData.prefix = prefix;
  let escapedPrefix = prefix.replaceAll(/[^\w\s]/g, '\\$&');//backslash escapes on non-alphanumeric characters
  globalData.escapedPrefix = escapedPrefix;

  running = true;
  start = func.getTime();
	const args = message.content.slice(prefix.length).trim().split(' ');
	command = args.shift().toLowerCase();
  let input = args[0];
  let input2 = args[1];
  let input3 = args[2];
  let fullInput = message.content.slice(prefix.length + command.length).trim();
  let developerCheck = false;
  globalData.command = command;
  globalData.message = message;
  globalData.args = args;
  if (devIDArray.includes(message.author.id)) {
    developerCheck = true;
  }
  //alternate commands
  switch(command) {
    case 'necoarc':
    case 'neco-arc':
      command = 'neco';
      break;
    case 'h':
      command = 'help';
      break;
    case 'canvas':
      command = 'poster';
      break;
    case 'l1984':
      command = 'literally1984';
      break;
    case 'stuffimg':
    case 'stuffi':
      command = 'stuffimage'
      break;
    case 'obra':
    case 'dinn':
      command = 'obradinn';
      break;
    case 'corrupt':
      command = 'glitch';
      break;
    case 'preferences':
    case 'prefs':
      command = 'pref';
      break;
    case 'srv':
      command = 'server';
      break;
    case 'avy':
    case 'ava':
    case 'pfp':
      command = 'avatar';
      break;
    case 'toss':
    case 'coin':
      command = 'flip';
      break;
    case 'twt':
      command = 'twitter';
      break;
    case 'rp':
      command = 'repost';
      break;
    case 'sp':
      command = 'starpic';
      break;
    case 'prb':
      command = 'probe';
      break;
    case 'lk':
      command = 'link';
      break;
    case 't':
      command = 'test';
      break;
    case 'a':
    case 'arc':
      command = 'archive';
      break;
    case 'sa':
    case 'sarc':
    case 'serverarc':
      command = 'serverarchive';
      break;
    default:
      break;
  }
  globalData.trueCommand = command;
  if (command === 'help') {
    let embed = new EmbedBuilder();
    let p = escapedPrefix;
    let component;
    switch(input) {
      case 'basic':
      case 'basics':
        embed
          .setTitle("About CatJam's Utilities")
          .setColor(0x686868)
          .setDescription("This bot gives you many fun ways to interact with media on Discord, along with various useful tools.\n\nIts biggest selling points are finely tuned meme creation tools, and a rigorous archival system for easily storing and accessing important/funny things on the fly.");
        let row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('help ' + message.author.id + ' L ' +'1')
              .setLabel('<') 
              .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
              .setCustomId('help ' + message.author.id + ' R ' + '1')
              .setLabel('>')
              .setStyle(ButtonStyle.Secondary)
            );
        component = [row];
        break;
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
      case 'stuff':
      case 'stuffimage':
      case 'stuffimg':
      case 'stuffi':
        embed
          .setTitle(p + "stuff [text input]")
          .setColor(0x686868)
          .setDescription("He is stuff.")
          .setFooter({text:"Use " + prefix + "stuffimage to stick it under an image."});
        break;
      case 'archive':
      case 'arc':
      case 'a':
        embed
          .setTitle(p + "archive [file name] / list")
          .setColor(0x686868)
          .setDescription("Finds the most recent file in chat and adds it to your personal archive!\n\nAny file from this archive can be accessed in any server by typing the file name as if it was a command (__" + p + "[file name]__).\n\nYou can view all your files at once with __" + p + "archive list__, and if you want to edit or remove something, try __"  + p + "archive [file name]__ like when you added it.")
          .setFooter({text:"By default, files from the server archive take priority over your personal archive.\nYou can change this in your settings with " + prefix + "pref"});
        break;
      case 'serverarchive':
      case 'serverarc':
      case 'sarc':
      case 'sa':
        embed
          .setTitle(p + "serverarchive [file name] / list")
          .setColor(0x686868)
          .setDescription("Finds the most recent file in chat and adds it to this server's archive!\n\nAny file from this archive can be accessed only in this server by typing the file name as if it was a command (__" + p + "[file name]__).\n\nYou can view all the server's files at once with __" + p + "serverarchive list__, and if you want to edit or remove something, try __"  + p + "serverarchive [file name]__ like when you added it.")
          .setFooter({text:"By default, files from the server archive take priority over your personal archive.\nYou can change this in your settings with " + prefix + "pref"});
        break;
      /*
      case 'bpm':
        embed
          .setTitle(p + "bpm")
          .setColor(0x686868)
          .setDescription("Determine the bpm by counting the beats\n(Make sure to start counting as soon as you click the flag).");
        break;
      */
      case 'twitter':
      case 'twt':
        embed
          .setTitle(p + "twitter")
          .setColor(0x686868)
          .setDescription("Convert a Twitter video link into a more consistent embed.");
        break;
      case 'flip':
      case 'coin':
      case 'toss':
        embed
          .setTitle(p + "flip [probability]")
          .setColor(0x686868)
          .setDescription("Flip a coin of any weight!");
        break;
      case 'get':
      case 'avatar':
      case 'ava':
      case 'avy':
      case 'pfp':
        embed
          .setTitle(p + "get [user] / [emoji]")
          .setColor(0x686868)
          .setDescription("Get avatars (using mentions, ID, or name)\nor emoji (custom or default) in picture format.")
          .setFooter({text:"Add 'global' somewhere to get global avatars or use 'server' to get server avatars."});
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
      case 'preferences':
      case 'prefs':
        embed
          .setTitle(p + "pref [command] [setting] [value]")
          .setColor(0x686868)
          .setDescription("Alter the default behaviour of various commands (And prefixes).")
          .setFooter({text:'"reset" can be used as a command or value to restore defaults'});
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
            "**__Media:__**\n" + p + "catjam\n" + p + "stellaris\n" + p + "dadon\n" + p + "neco\n" + p + "1984\n" + p + "stuff\n\n" +
            "**__Filter:__**\n" + p + "scatter\n" + p + "glitch\n" + p + "obradinn\n\n" +
            "**__Media Editing:__** \n" + p + "poster\n" + p + "point\n" + p + "meme\n" + p + "mario\n" + p + "literally1984⠀",
            inline: true},
            { name: '\u200B', value:
            "**__Utility:__**\n" + p + "archive\n" + p + "serverarchive\n" + p + "twitter\n" + p + "flip\n" + p + "get\n" + p + "starpic\n\n" +
            "**__Meta:__**\n" + p + "help\n" + p + "pref\n" + p + "server⠀",
            inline: true},
            { name: '\u200B', value:
            "Want a general overview? Try __" + p + "help basics__\n⠀"}
          )
          //.setFooter({text: message.member.displayName + ' : ' + globalData.globalPrefix + 'help', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true})})
          .setFooter({text: 'Not all command aliases and arguments are given here.\nFeel free to experiment!'})
        input = '';
    }
    if (input == undefined) {
      input = '';
    }
    else {
      input = ' ' + input
    }
    embed.setAuthor({name: message.member.displayName + ' : ' + globalData.globalPrefix + 'help' + input, iconURL: message.author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true})});
    await message.delete();
    return await func.messageReturn({input: {embeds: [embed],components: component}});
  }
  else if (command === 'test' && developerCheck === true) {
    
    /*message.channel.createWebhook('Snek', {
      avatar: 'https://i.imgur.com/mI8XcpG.jpg',
      reason: 'Needed a cool new Webhook'
    })
      .then(console.log)
      .catch(console.error)
    */
    //client.user.setUsername("CatJam's Utilities R&D");

    return;
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
    }
    else {
      link = catJamArray[(output - 60) / 5];
    }
    return await func.messageReturn({input: link, type: 'link', filename: 'catjam.gif'});
	}
  else if (command === 'stellaris') {
    let link;
    if (input > 0 && input < 13) {
      link = stellarisArray[input];
    }
    else {
      link = stellarisArray[0];
    }
    return await func.messageReturn({input: link, type: 'link', filename: 'stellaris.gif'});
  }
  else if (command === 'dadon' || command === 'neco') {
    let dir = './files/' + command;
    let imageArray = [dir + '/', command + ' (', 'num', ').png'];
    let fileNumber = fs.readdirSync(dir).length;
    let imageNum = Math.floor(Math.random() * fileNumber) + 1;
    imageArray[2] = imageNum;
    if (!isNaN(input) && input <= fileNumber && input > 0) {
      imageArray[2] = input;
      imageNum = input;
    }
    let joinedArray = imageArray.join('');
    return await func.messageReturn({input: joinedArray, type: 'attach'});
  }
  else if (command === '1984') {
    let link;
    if ((Math.floor(Math.random() * 11)) >= 5) {
        link = 'https://i.imgur.com/59QZNLa.gif'
      }
    else {
        link = 'https://i.imgur.com/wInH3ud.gif'
    }
    return await func.messageReturn({input: link, type: 'link', filename: '1984.gif'});
  }
  else if (command === 'poster' || command === 'meme' || command === 'literally1984' || command === 'point' || command === 'mario' || command === 'stuff' || command === 'stuffimage') {
    //text argument handling
    let bgOption = 'png';
    switch(command) {
      case 'poster':
        bgOption = globalData.userData.posterBG;
        await func.textArgs(2);
        break;
      case 'meme':
        await func.textArgs(3);
        break;
      case 'point':
        bgOption = globalData.userData.pointBG;
        break;
      default:
        await func.textArgs();
    }
    let inputs = globalData.textInputs;
    let argsText = globalData.argsText;
    if (command === 'point') {//point doesn't have any text inputs
      inputs = [''];
      argsText = args
    }
    if (command === 'point' || command === 'poster') {
      //background determination
      if (argsText.includes('black') || (!argsText.includes('white') && !argsText.includes('png') && bgOption == 'black')) {
        bgOption = 'black';
      }
      else if (argsText.includes('white') || (!argsText.includes('png') && bgOption == 'white')) {
        bgOption = 'white';
      }
      else {
        bgOption = 'png';
      }
    }
    //image download and so on
    let textScrape = false;
    if (!(command === 'literally1984' && inputs[0] != '') && command != 'stuff') {//literally1984 doesn't need to download an image if it has text
      var fileDir = `./files/buffer/${command}Buffer.png`;
      var fileURL = await func.generalScraper('image');
      if (fileURL == undefined) {
        if (command === 'literally1984' && message.reference != undefined) {//is reply and is l1984 asking for text (since no image found text is fallback if it can be found in reply)
          textScrape = true;
        }
        else {return await func.messageReturn({input: "No file found :(", type:'text'})}
      }
      await func.download(fileURL, fileDir);
      var imageSize = await SizeOf(fileDir);
      var imageDims = [imageSize.width, imageSize.height];
    }
    if ((command === 'stuff' && inputs[0] == '' && message.reference != undefined) || textScrape == true) {//if a text command doesn't have any text input directly, try the replied message
      let replyMessage = await message.channel.messages.fetch(message.reference.messageId);
      inputs[0] = replyMessage.content;
    }
    //canvas setup
    let canvasDims;
    if (command === 'poster' || command === 'meme' || command === 'point' || command === 'stuffimage') {//image to canvas commands
      //normalizing excessively small or large images
      if (command === 'point' || command === 'meme') {
        if (imageSize.height > 1500 || imageSize.width > 1500) {
          await func.scaleImage(imageDims, 'down', 1500);
          let scaledDims = globalData.scaledDims
          imageSize.width = scaledDims[0];
          imageSize.height = scaledDims[1];
        }
        if (imageSize.height < 100 || imageSize.width < 100) {
          await func.scaleImage(imageDims, 'up', 100);
          let scaledDims = globalData.scaledDims
          imageSize.width = scaledDims[0];
          imageSize.height = scaledDims[1];
        }
        imageDims = [imageSize.width, imageSize.height];
      }
      //imageToCanvas
      if (command === 'poster') {
        await func.imageToCanvas({imageDims:imageDims, widestRatio:2, tallestRatio:1.5, wideDims:[1200,600], tallDims:[400,600], scaleLength:600, scaleAxis:'height'});
      }
      else if (command === 'meme') {
        await func.imageToCanvas({imageDims:imageDims, widestRatio:3, tallestRatio:3, wideDims:[imageSize.width,(imageSize.width / 3)], tallDims:[(imageSize.height / 3),imageSize.height]});
      }
      else if (command === 'point') {//special handling for small images, expanded upon later
        if (imageSize.height == 100 || imageSize.width == 100) {
          var smallImage = true;
          globalData.imgCanvasDims = [640, 506];
        }
        else {
          await func.imageToCanvas({imageDims:imageDims, widestRatio:2, tallestRatio:1, wideDims:[1920,1518], tallDims:[1920,1518]});
        }
      }
      else if (command === 'stuffimage') {
        var stuffWidth = (1533-920)/(3-1) * imageDims[0]/imageDims[1] + 613.5;//linear interpolation between (1, 920) and (3, 1533)
        if (stuffWidth > 1533) {
          stuffWidth = 1533;
        }
        else if (stuffWidth < 920) {
          stuffWidth = 920;
        }
        await func.imageToCanvas({imageDims:imageDims, widestRatio:3, tallestRatio:1, wideDims:[1533,511], tallDims:[920,920], scaleLength:stuffWidth, scaleAxis:'width'});
        globalData.imgCanvasDims[1] += 511;
        bgOption = './files/templates/eggshellBox.jpg';
      }
      canvasDims = globalData.imgCanvasDims;
    }
    //other canvases
    else if (command === 'literally1984') {
      bgOption = './files/templates/literally1984.jpg';
      canvasDims = [1440, 1036];
    }
    else if (command === 'mario') {
      canvasDims = [1920, 1080];
    }
    else if (command === 'stuff') {
      bgOption = './files/templates/eggshellBox.jpg';
      var stuffWidth = 1226;
      canvasDims = [1226, 511];
    }
    await func.canvasInitialize(canvasDims, bgOption);
    let canvas = globalData.canvas;
    let context = globalData.context;
    let canvasWidth = canvasDims[0];
    let canvasHeight = canvasDims[1];
    //-----------------------
    // POSTER
    //-----------------------
    if (command === 'poster') {
      let centerX = (canvasWidth + 200) / 2;
      //single input case
      if (inputs[1] == undefined) {
        inputs[1] = '';
        if (globalData.userData.posterTXT == 'small') {
          inputs[1] = inputs[0];
          inputs[0] = '';
        }
      }
      if (globalData.userData.posterCAPS == true) {
        inputs[0] = inputs[0].toUpperCase()
      }
      let smallSize = 40;
      if (inputs[0] == '' && inputs[1] != '') {
        smallSize = 50;
      }
      //big text
      await func.textHandler({text:inputs[0], font:'Times New Roman', maxSize:150, maxWidth:(canvasWidth + 100), maxHeight:100, baseX:centerX, baseY:711+50, yAlign:'top'});
      let size1 = globalData.text1.size;
      let textHeight1 = globalData.text1.height;
      //small text
      await func.textHandler({text:inputs[1], font:'Arial', maxSize:smallSize, maxWidth:(canvasWidth + 100), maxHeight:3, byLine:true, baseX:centerX, baseY:(711+50 + textHeight1 + 30), yAlign:'top'});
      let size2 = globalData.text2.size;
      let textHeight2 = globalData.text2.height;
      //canvas is padded on all sides, lower padding is dependent on text heights
      //if either of the inputs is empty, spacing is adjusted accordingly, if both are empty it is left a symmetric square border
      let padding = 89;
      let yOffset2 = 0;
      if (inputs[0] != '' && inputs[1] == '') {
        padding = (50 * 2) + textHeight1;
      }
      else if (inputs[0] == '' && inputs[1] != '') {
        yOffset2 -= 30
        padding = (50 * 2) + textHeight2;
      }
      else if (inputs[0] != '' && inputs[1] != '') {
        padding = (50 * 2 + 30) + textHeight1 + textHeight2;
      }
      await func.canvasInitialize([(canvasWidth + 200), (canvasHeight + 111  + padding)], bgOption);
      //update canvas and context
      canvas = globalData.canvas;
      context = globalData.context;
      await func.scaleImage(imageDims, 'fit', canvasDims);
      await func.drawImage(fileDir, [100, 100]);
      //black space is drawn with rectangles
      context.fillStyle = '#000000';
      context.fillRect(0, 0, (canvasWidth + 200), 100);//top rectangle
      context.fillRect(0, 0, 100, (canvasHeight + 111 + padding));//left rectangle
      context.fillRect((canvasWidth + 100), 0, 100, (canvasHeight + 111 + padding));//right rectangle
      context.fillRect(0, (canvasHeight + 100), (canvasWidth + 200), (11 + padding));//bottom rectangle
      context.strokeStyle = '#ffffff';
      context.lineWidth = 2;
      context.strokeRect(100-10, 100-10, canvasWidth+20, canvasHeight+20);
      //fonts need to be assigned here since text handler was used in an abormal way where its context was overwritten
      context.fillStyle = '#ffffff';
      context.font = `${size1}px Times New Roman`;
      await func.drawText();
      context.font = `${size2}px Arial`;
      await func.drawText([0, yOffset2], 2);
    }
    //-----------------------
    // MEME
    //-----------------------
    else if (command === 'meme') {
      //image scaled to fit (mostly redundant), then drawn
      await func.scaleImage(imageDims, 'fit', canvasDims);
      await func.drawImage(fileDir);
      context.fillStyle = '#ffffff';
      context.strokeStyle = '000000';
      context.lineJoin = 'round';
      //two input case will have larger text, and inputs assigned to memeInput to match top and bottom
      let max;
      let memeInput;
      if (inputs.length == 1) {
        max = canvasHeight / 4;
        if (inputs[0] != '') {
          memeInput = [inputs[0],undefined,undefined];
        }
        else {
          memeInput = ['top text',undefined,'bottom text'];
        }
      }
      else if (inputs.length == 2) {
        max = canvasHeight / 4;
        memeInput = [inputs[0],undefined,inputs[1]];
      }
      else {
        max = canvasHeight / 5;
        memeInput = inputs;
      }
      //top text
      if (memeInput[0] !== undefined) {
        await func.textHandler({text:memeInput[0].toUpperCase(), font:'impact', maxSize:max, maxWidth:(0.95 * canvasWidth), maxHeight:max, baseX:(canvasWidth / 2), baseY:(0.01 * canvasHeight), yAlign:'top'});
        context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
        await func.drawText([0,0], 1, true);
      }
      //middle text
      if (memeInput[1] !== undefined) {
        await func.textHandler({text:memeInput[1].toUpperCase(), font:'impact', maxSize:max, maxWidth:(0.95 * canvasWidth), maxHeight:max, baseX:(canvasWidth / 2), baseY:(canvasHeight / 2)});
        context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
        await func.drawText([0,0], 1, true);
      }
      //bottom text
      if (memeInput[2] !== undefined) {
        await func.textHandler({text:memeInput[2].toUpperCase(), font:'impact', maxSize:max, maxWidth:(0.95 * canvasWidth), maxHeight:max, baseX:(canvasWidth / 2), baseY:(0.99 * canvasHeight), yAlign:'bottom'});
        context.lineWidth = 2 * (globalData.text1.baselineHeight * 0.06);
        await func.drawText([0,0], 1, true);
      }
    }
    //-----------------------
    // LITERALLY1984
    //-----------------------
    else if (command === 'literally1984') {
      //if text input present, does text stuff
      if (inputs[0] != '') {
        await func.textHandler({text:inputs[0], font:'sans-serif', maxSize:175, maxWidth:699, maxHeight:242, baseX:455.5, baseY:150});
        context.fillStyle = '#000000';
        await func.drawText();
      }
      //if no text inputs, uses image
      else {
        await func.scaleImage(imageDims, 'fit', [699, 242]);
        await func.drawImage(fileDir, [106, 29]);
      }
    }
    //-----------------------
    // POINT
    //-----------------------
    else if (command === 'point') {
      if (smallImage == true) {
        //very small images are placed unscaled around the center
        //deviations from the center are to make it look generally nicer in frame, lining up with the direction being pointed at
        let xAxis = (Math.abs(canvasWidth - imageSize.width) / 2) - 35;
        let yAxis = (Math.abs(canvasHeight - imageSize.height) / 2) - 70;
        await func.drawImage(fileDir, [0,0], [xAxis,yAxis], imageDims);
      }
      else {
        //scaled to fit canvas, is only actually scaled if it's wide or tall
        await func.scaleImage(imageDims, 'fit', canvasDims);
        if (globalData.imgCanvasEval == 'wide') {
          globalData.scaledPos[1] = globalData.scaledPos[1] / 2;
        }
        await func.drawImage(fileDir);
      }
      let pointImage1 = './files/templates/pointing/pointing1.png';
      let pointImage2 = './files/templates/pointing/pointing2.png';
      if (args.includes('colonist')) {
        pointImage1 = './files/templates/pointing/pointingColonist1.png';
        pointImage2 = './files/templates/pointing/pointingColonist2.png';
      } else if (args.includes('real')) {
        pointImage1 = './files/templates/pointing/pointingReal1.png';
        pointImage2 = './files/templates/pointing/pointingReal2.png';
      } else if (args.includes('myth')) {
        pointImage1 = './files/templates/pointing/pointingMyth1.png';
        pointImage2 = './files/templates/pointing/pointingMyth2.png';
        var explosionImage = './files/templates/pointing/pointingMythExplosion.png';
      } else if (args.includes('catholic')) {
        pointImage1 = './files/templates/pointing/pointingCatholic1.png';
        pointImage2 = './files/templates/pointing/pointingCatholic2.png';
      } else if (args.includes('hearthian')) {
        pointImage1 = './files/templates/pointing/pointingHearthian1.png';
        pointImage2 = './files/templates/pointing/pointingHearthian2.png';
      } else {
        pointImage1 = './files/templates/pointing/pointing1.png';
        pointImage2 = './files/templates/pointing/pointing2.png';
      }
      //they're both always stuck to the edges of the screen, so all we need is their scaled widths, and scaled height which is the same for both
      await func.scaleImage([864,1518], 'fit', canvasDims);//pointImage1
      let scaledWidth1 = globalData.scaledDims[0];
      await func.scaleImage([1056,1518], 'fit', canvasDims);//pointImage2
      let scaledWidth2 = globalData.scaledDims[0];
      let scaledHeightP = globalData.scaledDims[1];
      //x-axis for dude 2 is also calculated here, just so that he is on the very right edge of screen
      let xAxis2 = Math.abs(canvasWidth - scaledWidth2);
      //mythbusters explosion
      if (explosionImage != undefined){
        let scaledHeightE = 673 * (scaledHeightP / 1518);
        let scaledWidthE = 578 * (((scaledWidth1 + scaledWidth2) / 2) / 960);
        await func.drawImage(explosionImage, [0,0], [(canvasWidth/2 - scaledWidthE/2), (canvasHeight/2 - scaledHeightE/2)], [scaledWidthE, scaledHeightE]);
      }
      await func.drawImage(pointImage2, [0,0], [xAxis2 ,0], [scaledWidth2, scaledHeightP]);
      await func.drawImage(pointImage1, [0,0], [0,0], [scaledWidth1, scaledHeightP]);
    }
    //-----------------------
    // MARIO
    //-----------------------
    else if (command === 'mario') {
      //scale to fill entire canvas
      await func.scaleImage(imageDims, 'fill', [730, 973]);
      //draw given image and mario template on top
      await func.drawImage(fileDir, [595,53]);
      await func.drawImage('./files/templates/mario.png', [0,0], [0,0], canvasDims);
      //text handling
      await func.textHandler({text:inputs[0].toUpperCase(), font:'Trebuchet MS', style:'bold ', maxSize:75, maxWidth:526, maxHeight:1, byLine:true, spacing:0, baseX:275, baseY:897, xAlign:'left'});
      context.fillStyle = '#ffffff';
      if (globalData.emojiMatch != undefined) {//font gets weird with emojis
        await func.drawText([0, 0.1 * globalData.text1.baselineHeight]);
      }
      else {
        await func.drawText();
      }
    }
    else if (command === 'stuff' || command === 'stuffimage') {
      let adjustedHeight = canvasHeight - 511;
      if (command == 'stuffimage') {
        await func.scaleImage(imageDims, 'fit', [canvasWidth, adjustedHeight]);
        await func.drawImage(fileDir);
      }
      await func.drawImage('./files/templates/stuff.png', [0,0], [0, adjustedHeight]);
      let textWidth = canvasWidth - 602 - 50;
      await func.textHandler({text:inputs[0], font:'arial', style:'bold ', maxSize:100, maxWidth:textWidth, maxHeight:450, baseX:(textWidth/2 + 602 + 25), baseY:255.5});
      context.fillStyle = '#000000'
      await func.drawText([0, adjustedHeight]);
    }
    return await func.messageReturn({input: canvas.toBuffer(), type: 'attach', filename: `${command}.png`, transformative: false});
  }
  else if (command === 'scatter' || command === 'obradinn' || command === 'glitch') {
    let filter = command;
    //basic get image make canvas from that image
    let fileDir = './files/buffer/filterBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn({input: "No file found :(", type: 'text'})}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //obra dinn shrinks image to 250 pixels tall
    if (filter == 'obradinn') {
      await func.canvasInitialize([(250 * imageSize.width / imageSize.height), 250], fileDir);
    }
    else if (filter == 'scatter' && (imageSize.width > 400 || imageSize.height > 400)) {
      await func.scaleImage([imageSize.width, imageSize.height], 'down', 400);
      let dims = globalData.scaledDims;
      await func.canvasInitialize(dims, fileDir);
    }
    else {
      await func.canvasInitialize([imageSize.width, imageSize.height], fileDir);
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
      return await func.messageReturn({input: canvas.toBuffer(), type: 'attach', filename: 'scatter.png'});
    }
    //-----------------------
    // OBRA DINN
    //-----------------------
    else if (filter == 'obradinn') {
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
      return await func.messageReturn({input: canvas.toBuffer(), type: 'attach', filename: 'obraDinn.png'});
    }
    //-----------------------
    // GLITCH
    //-----------------------
    else if (filter == 'glitch') {
      //glitch-canvas module using buffer
      let buffer = canvas.toBuffer();
      let glitchedBuffer = await glitch({ amount: 0, seed: Math.floor(Math.random()* 101), iterations: Math.floor(Math.random() * 16 + 10), quality: 60}).fromBuffer(buffer).toBuffer();
      return await func.messageReturn({input: glitchedBuffer, type: 'attach', filename: 'glitch.png'});
    }
  }
  else if (command === 'pref') {
    if (input != undefined) {
      if (input2 == undefined) {
        input2 = '';
      }
      if (input3 == undefined) {
        input3 = '';
      }
      //(see userData function)
      await func.userData('set', input.toLowerCase(), input2.toLowerCase(), input3.toLowerCase());
      if (globalData.changedPrefix) {
        prefixArray = await func.userData('prefix');
      }
      return await func.messageReturn({input: `${globalData.toggledMSG}`, type: 'text'});
    }
    //if input undefined sends your preferences
    else {
      let thumb = message.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
      let embed = new EmbedBuilder()
        .setTitle("Your Preferences")
        .setColor(0x686868)
        .addFields(
          { name: '⠀\n' + 'point : background : `' + `${globalData.userData.pointBG}` + '`', value: "background used if transparency is present"},
          { name: 'poster : background : `' + `${globalData.userData.posterBG}` + '`', value: "background used if transparency is present"},
          { name: 'poster : text : `' + `${globalData.userData.posterTXT}` + '`', value: "which type of text displays with 1 argument"},
          { name: 'poster : caps : `' + `${globalData.userData.posterCAPS}` + '`', value: "capitalization of the larger text"},
          { name: 'archive : customCMD : `' + `${globalData.userData.customCMD}` + '`', value: "unknown commands send archived files of the same name"},
          { name: 'archive : priority : `' + `${globalData.userData.priorityARC}` + '`', value: "archive which takes priority for custom commands"},
          { name: 'archive : delete : `' + `${globalData.userData.deleteArchiveMessage}` + '`', value: 'whether to delete your archive message'},
          { name: 'prefix : custom : `' + `${globalData.userData.prefixC}` + '`', value: "custom prefix for all commands"},
          { name: 'prefix : default : `' + `${globalData.userData.prefixD}` + '`', value: 'whether default prefix is still used\n(also toggled by pinging the bot with the word "prefix")\n⠀'}
        )
        .setFooter({text:'Usage: ' + prefix + 'pref [command] [setting] [value]\ne.g. ' + prefix + 'pref point background png\n"reset" can be used as a command or value to restore defaults'})
        .setThumbnail(thumb);
      return await func.messageReturn({input: {embeds: [embed]}});
    }
  }
  else if (command === 'server') {
    let cpuSpeed = await systeminfo.cpuCurrentSpeed().then();
    let memInfo = await systeminfo.mem().then();
    let embed = new EmbedBuilder()
      .setTitle("Server PC Status")
      .setColor(0x686868)
      .setDescription("CPU Speed: " + cpuSpeed.avg + "GHz\nMemory Used: " + (Math.round((memInfo.used/1073741824) * 10) / 10) + "GB / " + (Math.round((memInfo.total/1073741824) * 10) / 10) + "GB")
      .setFooter({text: message.member.displayName + ' : ' + globalData.globalPrefix + 'server', iconURL: message.author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true})});
    await message.delete();
    return await func.messageReturn({input: {embeds: [embed]}});
  }
  else if (command === 'get' || command === 'avatar') {
    //catch for alternate commands
    let errorMsg = "Couldn't find an avatar, emoji, or sticker from that input.";
    if (command === 'avatar') {
      errorMsg = "Couldn't find an avatar from that input.";
    }
    //decide on guild or global avatar
    let guildAvy = true;
    if (args.includes('global') || args.includes('g')) {
      guildAvy = false;
      fullInput = (' ' + fullInput).replaceAll(' global', '').replaceAll(' g', '').trim();
      input = fullInput.split(' ')[0];
      if (fullInput == '') {
        input = undefined;
      }
      else if (input == '') {
        input = fullInput
      }
    }
    //if a message is replied to, its content is used as input
    let reply = false;
    let replyMessage = message;
    if (message.reference != undefined) { 
      replyMessage =  await message.channel.messages.fetch(message.reference.messageId);
      input = replyMessage.content;
      fullInput = input;
      reply = true;
    }
    let fileDir = './files/buffer/getBuffer.png';
    let defaultRegex = emojiRegex();
    let customRegex = /<:\w+:(\d+)>/gmd;
    let animRegex = /<a:\w+:(\d+)>/gmd;
    let foundEmoji = false;
    let link;
    //-----------------------
    // STICKERS
    //-----------------------
    //must have no input if you send a sticker, but when replying to a sticker, it prioritizes the sticker over the message content
    //also note replyMessage will be the regular message if there is no reply
    if (replyMessage.stickers.last() != undefined && (input === undefined || reply) && !(command === 'avatar')) {
      let sticker = replyMessage.stickers.last();
      if (sticker.format == 1) {
        link = sticker.url;
      }
      else if (sticker.format == 2) {
        await func.download(sticker.url, fileDir);
        apng2gif.sync(fileDir, './files/buffer/' + sticker.id.toString() + '.gif');
        fileDir = './files/buffer/' + sticker.id.toString() + '.gif';
      }
      else {
        await func.download(sticker.url, './files/buffer/' + sticker.id.toString() + '.json');
        fileDir = './files/buffer/' + sticker.id.toString() + '.json';
      }
    }
    //-----------------------
    // AVATAR FROM AUTHOR
    //-----------------------
    else if (input === undefined && !reply) {
      if (guildAvy) {
        let guildUser = await message.guild.members.fetch(message.author.id).catch(console.error);
        if (guildUser != undefined) {
          link = guildUser.displayAvatarURL({ extension: 'png', size: 1024});
          fileDir = './files/buffer/' + message.author.id.toString() + '.png';
          //console.log(link)
        }
        else {
          return await func.messageReturn({input: errorMsg, type: 'text', title: "Bad Input!"});
        }
      }
      else {
        link = message.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
        fileDir = './files/buffer/' + message.author.id.toString() + '.png';
      }
    }
    //-----------------------
    // AVATAR FROM MENTION
    //-----------------------
    else if (message.mentions.users.first() !== undefined && !reply) {
      if (guildAvy) {
        let guildMember = message.mentions.members.first();
        link = guildMember.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
        fileDir = './files/buffer/' + guildMember.id.toString() + '.png';
      }
      else {
        let guildUser = message.mentions.users.first();
        link = guildUser.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
        fileDir = './files/buffer/' + guildUser.id.toString() + '.png';
      }
    }
    //-----------------------
    // SERVER AVATAR
    //-----------------------
    else if ((input == 'server' || input == 's') && message.guild.iconURL() != null && !reply) {
      link = message.guild.iconURL({ extension: 'png', size: 1024, dynamic: true});
      fileDir = './files/buffer/' + message.guild.id.toString() + '.png';
    }
    //-----------------------
    // SERVER EMOJIS
    //-----------------------
    else if (input == 'emojis' || input == 'emoji' && !(command === 'avatar') && !reply) {
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
        return await func.messageReturn({input: errorMsg, type: 'text', title: "Bad Input!"});
      }
      await func.getEmoji(emoji);
      foundEmoji = true;
    }
    //-----------------------
    // EMOJI
    //-----------------------
    else if ((fullInput.search(defaultRegex) != -1 || fullInput.search(customRegex) != -1 || fullInput.search(animRegex) != -1) && !(command === 'avatar')) {
      await func.getEmoji(fullInput);
      foundEmoji = true;
    }
    //-----------------------
    // AVATAR FROM ID
    //-----------------------
    else if (!isNaN(input) && input.length == 18 && !reply) {
      let user = await client.users.fetch(input).catch(console.error);
      let guildUser = await message.guild.members.fetch(input).catch(console.error);
      fileDir = './files/buffer/' + input.toString() + '.png';
      if (guildUser != undefined && guildAvy) {
        link = guildUser.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
      }
      else if (user != undefined) {
        link = user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
      }
      else {
        return await func.messageReturn({input: errorMsg, type: 'text', title: "Bad Input!"});
      }
    }
    //-----------------------
    // AVATAR FROM USERNAME
    //-----------------------
    else if (!reply) {
      let index = fullInput.indexOf('#');
      //trims command and leaves all content up until user tag (e.g. username#1234) if present
      let nameInput = fullInput;
      if (index != -1) {
        nameInput = fullInput.slice(0, index).trim();
      }
      //gets guild member
      let member = await message.guild.members.fetch({ query: nameInput, limit: 1 }).catch(console.error);
      //user from guild member
      if (member.first() != undefined) {
        if (guildAvy) {
          link = member.first().displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
          fileDir = './files/buffer/' + member.first().id.toString() + '.png';
        }
        else {
          link = member.first().user.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
          fileDir = './files/buffer/' + member.first().user.id.toString() + '.png';
        }
      }
      else {
        return await func.messageReturn({input: errorMsg, type: 'text', title: "Bad Input!"});
      }
    }
    else {//if no emojis can be found, the user being replied to has their avatar grabbed instead
      link = replyMessage.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
      fileDir = './files/buffer/' + replyMessage.author.id.toString() + '.png';
    }
    //-----------------------
    // EMOJI DOWNLOAD
    //-----------------------
    if (foundEmoji) {
      //invalid emoji
      if (globalData.emojiStatus == 'invalid') { return await func.messageReturn({input: errorMsg, type: 'text', title: "Bad Input!"}); }
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
    // LINK DOWNLOAD
    //-----------------------
    else if (link != undefined) {
      if (link.slice(-13,-10) == 'gif') {
        fileDir = fileDir.slice(0,-3);
        fileDir += 'gif';
      }
     await func.download(link, fileDir)
    }
    return await func.messageReturn({input: fileDir, type: 'attach'});//what does this do, are message return args right?
  }
  else if (command === 'bpm' && developerCheck === true) {
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

    msg.edit('The BPM is: ' + Math.round(bpm));
    return;
  }
  else if (command === 'flip') {
    if (!args.length) {
      var odds = 0.5;
    }
    else {
      var odds = input;
    }
    let attachment = new AttachmentBuilder('https://i.imgur.com/xzE6qF4.gif');
    const msg = await message.channel.send({files: [attachment]});
    await func.wait(2100);
    msg.delete();
    if (input == undefined) {
      input = ''
    }
    else {
      input = ' ' + input
    }
    if (odds > Math.random()) {
      return await func.messageReturn({input: "Success! / Heads / Yes", type: 'text', commandDisplay: 'flip' + input});
    }
    else {
      return await func.messageReturn({input: "Failure! / Tails / No", type: 'text', commandDisplay: 'flip' + input});
    }
  }
  else if (command === 'twitter') {
    let originalURL = await func.generalScraper('twitter');

    let lastMessage = await globalData.targetMessage;
    if (lastMessage == undefined) { return await func.messageReturn({input: "No Twitter link found :(", type: 'text'});}
    let nickName = lastMessage.member.displayName;
    let messageContent = lastMessage.content.split('https')
    let splitURL = originalURL.split('/');
    if (splitURL[2] == 'twitter.com') {
      splitURL[2] = 'vxtwitter.com';
      let joinedURL = splitURL.join('/');
      message.delete();
      lastMessage.delete();
      console.log(command + ' - ' + func.getTime(start).toString() + 'ms');
      message.channel.send("Tweet was sent by: **" + nickName + "\n**" + messageContent[0] + "\n" + joinedURL);
      return;
    }
    else {
      return await func.messageReturn({input: "This is not a twitter link.", type: 'text'});
    }
  }
  else if (command === 'starpic') {
    let fileURL = await func.generalScraper('image');
    
    if (fileURL == undefined) {return await func.messageReturn({input: "No file found :(", type: 'text'});}
    let fileType = await func.typeCheck(fileURL).then();
    if (fileType == undefined) {return await func.messageReturn({input: "Bad embed :(", type: 'text'});}

    let fileDir = './files/buffer/starBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    message.delete();
    const starMessage = await func.sendFile(fileURL, fileDir);
    starMessage.react("⭐");
    return;
  }
  else if (command === 't2' && developerCheck === true) {
    let originalURL = await func.generalScraper('twitter');

    let lastMessage = await globalData.targetMessage;
    if (lastMessage == undefined) { return await func.messageReturn({input: "No Twitter link found :(", type: 'text'});}

    let response = await twitterGetUrl(originalURL);

    /*

    let maxUrlLoops = response[dimensionsAvailable];
    let urlArray;

    for (let i = 0; i < maxUrlLoops; i++) {
      if (response['download'][i]['url'].includes('.mp4')) {
        urlArray.push(response['download'][i]['url'])
      }
    }

    */

    const embed = new EmbedBuilder()
      .setTitle("Your Preferences")
      .setColor(0x686868)
      .setUrl("https://video.twimg.com/amplify_video/1524843595550838793/vid/1280x720/FuCjDx79xZOfPc83.mp4?tag=14")
    return await func.messageReturn({input: {embeds: [embed]}});

    /*if(response['found'] == 'false') {return func.messageReturn({input: 'Invalid Link', type: 'text'});}
    if(response['type'] == 'video') {

    }
    if(response['type'] == 'image') {
      
    }*/

    //return console.log('response JSON: ' + response['download'][0]['url']);
    return console.log('response String: ' + JSON.stringify(response));
    //return func.messageReturn(JSON.stringify(response));
  }
  else if (command === 't3' && developerCheck === true) {
    let originalURL = await func.generalScraper('twitter');

    //Download twitter video from originalURL
    let response = await twitterGetUrl(originalURL);
    console.log('response String: ' + JSON.stringify(response));
    if (response['found'] == 'false') {return func.messageReturn({input: 'Invalid Link', type: 'text'});}
    if (response['type'] == 'video') {
      let dimensionsAvailable = response['dimensionsAvailable'];
      let videoURL = response['download'][dimensionsAvailable-1]['url'];
      let videoDir = './files/buffer/videoBuffer.' + "mp4";
      await func.download(videoURL, videoDir);
      await func.sendFile(videoURL, videoDir);
      return;
    }
    if (response['type'] == 'image') {
      let dimensionsAvailable = response['dimensionsAvailable'];
      let imageURL = response['download'][dimensionsAvailable-1]['url'];
      let imageDir = './files/buffer/imageBuffer.' + "jpg";
      await func.download(imageURL, imageDir);
      await func.sendFile(imageURL, imageDir);
      return;
    }
  }
  else if (command === 't4' && developerCheck === true) {
    let originalURL = await func.generalScraper('twitter');

    //Get twitter profile from tweet url (originalURL)
    

  }
  else if (command === 'vidT' && developerCheck === true) {
    new FFmpeg()
    .addInput("C:/Users/xameryn/Downloads/video.mp4")
    .addInput("C:/Users/xameryn/Downloads/audio.mp3")
    .output("C:/Users/xameryn/Downloads/output.mp4");

    return;

    //return await func.messageReturn();
  }
  else if (command === 'reaction' && developerCheck === true) {
    var SearchInput = '';
    var SearchArr = [];
    var searchAny = [];
    var searchPhrase = [];
    let meme = JSON.parse(fs.readFileSync(`./files/memes/meme.json`, 'utf8'));

    for (let i = 0; i < args.length; i++) { //Turns args into a string
      SearchInput += args[i] + ' ';
    }
    
    SearchInput = SearchInput.trim(); //Removes last space
    if (SearchInput.includes('"')) {
      SearchArr = SearchInput.split('"'); //Splits string into array by ' " '
      SearchInput = '';
      console.log('SearchArr.length: ' + SearchArr.length);
      for (let i = 0; i < SearchArr.length; i++) {
        if(i % 2 == 0) {
          SearchArr[i] = SearchArr[i].trim();
          SearchInput += SearchArr[i] + ' ';
        }
        else {
          SearchArr[i] = SearchArr[i].trim()
          searchPhrase.push(SearchArr[i]);
        }
      }
    }
    
    searchAny = SearchInput.trim().split(' ');

    if (searchAny.length > 0) { // Finds and adds synonoms to key words
      var synonomAny = [];
      var synonomAnyTemp = [];
      for (let i = 0; i < searchAny.length; i++) {
        if (synonyms(searchAny[i],"v") != undefined) {
          synonomAnyTemp = synonyms(searchAny[i],"v");
          synonomAnyTemp.shift();
          synonomAny = synonomAny.concat(synonomAnyTemp);
        }
      }
      searchAny = searchAny.concat(synonomAny)
    }

    var memeTemp = [];
    var memeSort = '['
    var matchCount = 0;


    if (searchPhrase.length > 0) {
      for (let i = 0; i < meme.length; i++) {
        for (let j = 0; j < searchPhrase.length; j++) {
          if (searchPhrase.every(item => meme[i].Text.includes(item))) {
            memeTemp.push(meme[i]);
          }
        }
      }
      meme = memeTemp;
    }

    for (let i = 0; i < meme.length; i++) {
      for (let j = 0; j < searchAny.length; j++) {
        if (new RegExp(`\\b${searchAny[j]}\\b`).test(meme[i].Text)) {
          matchCount++;
        }
      }
      if (matchCount > 0) {
        memeSort += '{ "link": "' + meme[i].Media + '", "matches": ' + matchCount + '}, '
      }
      matchCount = 0;
    }

    memeSort = memeSort.slice(0, -2) + ']'
    memeSort = JSON.parse(memeSort);

    memeSort.sort((a, b) => b.matches - a.matches);
    
    var link = memeSort[0].link.toString();
    
    return await func.messageReturn({input: link, type: 'attach', filename: 'reaction.jpg'});

  }
  else if (command === 'YoutubeDownload' && developerCheck === true) {
    /*
    ytdl('https://www.youtube.com/watch?v=OJ3SRV8QPfU').pipe(fs.createWriteStream('video.mp4'));
    ytdl('https://www.youtube.com/watch?v=OJ3SRV8QPfU').pipe(fs.createWriteStream('audio.mp3'));
    
    console.log(args);

    return;*/
    //return await func.messageReturn();
  }
  else if (command === 'switch' && developerCheck === true) {
    //basic get image make canvas from that image
    let fileDir = './files/buffer/switchBuffer.png';
    let fileURL = await func.generalScraper('image');
    if (fileURL == undefined) {return await func.messageReturn({input: "No file found :(", type: 'text'})}
    await func.download(fileURL, fileDir);
    let imageSize = await SizeOf(fileDir);
    //reduce image resolution
    let canvasRes = [imageSize.width*0.1, imageSize.height*0.1]
    await func.canvasInitialize(canvasRes, fileDir);
    let canvas = globalData.canvas;
    let context = globalData.context;
    let canvasWidth = canvas.width;
    let canvasHeight = canvas.height;

    canvasRes = [imageSize.width, imageSize.height]
    await func.canvasInitialize(canvasRes, fileDir);
    canvas = globalData.canvas;
    context = globalData.context;
    canvasWidth = canvas.width;
    canvasHeight = canvas.height;

    return await func.messageReturn({input: canvas.toBuffer(), type: 'attach', filename: 'switch.png'});
  }
  else if (command === 'repost' && developerCheck === true) {
    //let fileURL = await func.generalScraper('file');

    let fileURL = 'https://twitter.com/i/videos/tweet/1524844800574378003';

    if (fileURL == undefined) {return await func.messageReturn({input: "No file found :(", type: 'text'});}

    //let fileType = await func.typeCheck(fileURL).then();
    let fileType = 'mp4';
    if (fileType == undefined) {return await func.messageReturn({input: "Bad embed :(", type: 'text'});}

    let fileDir = './files/buffer/testBuffer.' + fileType;

    await func.download(fileURL, fileDir);
    await func.sendFile(fileURL, fileDir);
    return;
  }
  else if (command === 'info' && developerCheck === true) {
    await func.infoScraper();
    return;
  }
  else if (command === 'probe' && developerCheck === true) {
    await func.infoScraper();
    //console.log(link);
    return;
  }
  else if (command === 'link' && developerCheck === true) {
    let link = await func.generalScraper('file');
    console.log(message.reference);

    console.log('$link link: ' + link);    

    //console.log(archiveList[0]);

    return;
  }
  else if (command === 'kill' && developerCheck === true) {
    log();
    return;
  }
  else if (command === 'twitter_search' && developerCheck === true) {
    // Stored cause totally working, but only searches past 30 days, so not of use right now.
    
    var twitsearchPhrase = '';
    var twitsearchAny = '';
    var twitSearchArr = [];

    if (false) {
      for (let i = 0; i < args.length; i++) { //Turns args into a string
        twitsearchPhrase += args[i] + ' ';
      }

      twitsearchPhrase = twitsearchPhrase.trim(); //Removes last space
      twitSearchArr = twitsearchPhrase.split('"'); //Splits string into array by ' " '
      twitsearchPhrase = '';

      for (let i = 0; i < twitSearchArr.length; i++) {
        if(i % 2 == 0) {
          twitSearchArr[i] = twitSearchArr[i].trim();
          twitsearchAny += twitSearchArr[i] + ' ';
        }
        else {
          twitsearchPhrase += '"' + twitSearchArr[i] + '" ';
        }
      }

      twitsearchAny = twitsearchAny.trim();
      twitsearchPhrase = twitsearchPhrase.trim(); //Removes last space
      twitSearchArr = twitsearchAny.split(' '); //Splits string into array by ' '
      twitsearchAny = '';

      for (let i = 0; i < twitSearchArr.length; i++) { //Turns args into a string
        twitsearchAny += twitSearchArr[i] + ' OR ';
      }

      twitsearchAny = twitsearchAny.substring(0, twitsearchAny.length - 4); // Removes last ' OR '
      twitSearchArr = [];

      if (twitsearchPhrase != '') {
        twitsearchPhrase = twitsearchPhrase + ' ';
      }
      if (twitsearchAny != '') {
        twitsearchAny = '(' + twitsearchAny + ') ';
      }

      /*twit.get('search/tweets', { q: 'from (from:reactjpg)', count: 20 }, function (err, data, response) {
        console.log(data);
        console.log(data.statuses.length);
        
        if (twitSearchCompare != '') {
          twitSearchCompare = twitSearchCompare.replace(/[()]/g, '');
          twitSearchArr = twitSearchCompare.split(' OR ');
          for (let i = 0; i < twitSearchArr.length; i++) {
            twitSearchArr[i] = twitSearchArr[i].trim();
          }
          console.log('CRASH');
          for (let i = 0; i < data.statuses.length; i++) {
            console.log('for loop A: ' + i);
            for (let j = 0; j < twitSearchArr.length; j++) {
              console.log('for loop B: ' + j);
              if (data.statuses[i].text.includes(twitSearchArr[j])) {
                currentSearchMatches++;
              }
            }
            console.log('update4');
            if (currentSearchMatches > bestSearchMatches) {
              console.log('updateIF');
              bestSearchMatches = currentSearchMatches;
              bestSearch = i;
            }
          }
        }
        else {
          console.log('updateElse');
          bestSearch = 0;
        }
        console.log('update6');
        
        console.log(data.statuses[bestSearch].text);
      });*/

      console.log('Results: "' + twitsearchPhrase + twitsearchAny + '"');
      console.log('twitsearchPhrase: "' + twitsearchPhrase + '"');
      console.log('twitsearchAny: "' + twitsearchAny + '"');
  }
  }
  else if ((command === 'math' || command === 'm') && developerCheck === true) { // Math
    let fullMessage = message.toString();
    let stringCommand = command.toString();
    let tempMessage;
    let tempA;
    let tempB;
    let returnMessage = 0.0;

    fullMessage = fullMessage
      .replace(stringCommand,"")
      .replace(prefix,"")
      .split(" ")    

    for (let i = 1; i < fullMessage.length; i++) {
      if (fullMessage[i].includes('+')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('+');
        returnMessage = parseFloat(tempMessage[0]) + parseFloat(tempMessage[1]);
      }
      else if (fullMessage[i].includes('-')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('-');
        returnMessage = parseFloat(tempMessage[0]) - parseFloat(tempMessage[1]);
      }
      else if (fullMessage[i].includes('*')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('*');
        returnMessage = parseFloat(tempMessage[0]) * parseFloat(tempMessage[1]);
      }
      else if (fullMessage[i].includes('/')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('/');
        returnMessage = parseFloat(tempMessage[0]) / parseFloat(tempMessage[1]);
      }
      else if (fullMessage[i].includes('^')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('^');
        returnMessage = Math.pow(parseFloat(tempMessage[0]), parseFloat(tempMessage[1]));
      }
      else if (fullMessage[i].includes('d')) {
        tempMessage = await fullMessage[i].toString();
        tempMessage = await tempMessage.split('d');

        if (tempMessage[0] == '') {tempMessage[0] = 1}

        console.log(typeof(tempMessage[0]));
        console.log(tempMessage[0]);
        console.log(tempMessage[1]);

        for (let j = 0; j < parseFloat(tempMessage[0]); j++) {
          returnMessage = returnMessage + Math.floor(Math.random() * parseFloat(tempMessage[1])) + 1;
        }
      }
      else {
        returnMessage = 'NaN';
      }

      await func.messageReturn({input: returnMessage.toString(), type: 'text', title: fullMessage[i]});
    }
    
    return;
  }
  else if ((command === 'convert' || command === 'conv') && developerCheck === true) {
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
  else { //archive
    //arc, serverarc, and custom command checks:
    let customCMD = false
    if (!(command === 'archive' || command === 'serverarchive')) {
      customCMD = true
    }
    let serverArc = false;
    if (command === 'serverarchive' || (customCMD && globalData.userData.priorityARC == 'server')) {
      serverArc = true;
    }
    //name handling:
    let name;
    if (customCMD) {//everything except prefix
      name = message.content.slice(prefix.length).trim();
    }
    else {//everything after command
      name = fullInput;
    }
    await func.findEmoji(name);
    let matches = globalData.emojiMatch;
    for (var match of matches) {
      if (match[3] != match[0]) {
        name = name.replace(match[3], match[2])
      }
    }
    name = await func.fileNameVerify(name);//used for checking JSON and button IDs
    let compareName = await func.arcName(name);
    let id;
    let title;
    let listThumb = null;
    if (serverArc) {//SERVER ARC SPECIFIC
      id = message.guild.id;
      title = 'Server Archived File List';
      if (message.guild.iconURL() != null) {
        listThumb = message.guild.iconURL({ extension: 'png', size: 1024, dynamic: true});
      }
    }
    else {//ARC SPECIFIC
      id = message.author.id;
      title = 'User Archived File List';
      listThumb = message.author.displayAvatarURL({ extension: 'png', size: 1024, dynamic: true});
    }
    //UNIVERSAL
    if (!fs.existsSync(`./files/archive/${id}.json`)) {
      fs.writeFileSync(`./files/archive/${id}.json`, '[]');
    }
    let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
    let archiveList = await JSON.parse(importJSON);

    var filteredArchiveList = await archiveList.filter(function (el) {//removes null entries? idk if we need this
      return el != null;
    });
    archiveList = await filteredArchiveList;
    
    if ((fullInput === 'list' || fullInput === 'l') && !customCMD) {//LIST
      let imageList = [], videoList = [], gifList = [], audioList = [], textList = [], otherList = [];
      for (let i = 0; i < archiveList.length; i++) {
        let fileType =  archiveList[i].type;
        if (fileType === 'link') {//check if link fits other types
          fileType = await func.fileType(archiveList[i].extension);
        }
        if (fileType === 'image') { //File is an image
          imageList.push(' ' + archiveList[i].name)
        }
        else if (fileType === 'video') { //File is a video
          videoList.push(' ' + archiveList[i].name)
        }
        else if (fileType === 'gif' || (archiveList[i].link.includes('https://tenor.com/') && archiveList[i].link.includes('-gif-'))) { //File is a gif
          gifList.push(' ' + archiveList[i].name)
        }
        else if (fileType === 'audio') { //File is audio
          audioList.push(' ' + archiveList[i].name)
        }
        else if (fileType === 'text') { //File is text
          textList.push(' ' + archiveList[i].name)
        }
        else if (fileType === 'link' && !(archiveList[i].link.includes('https://tenor.com/') && archiveList[i].link.includes('-gif-'))) { //File is other
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
      if (otherList.length > 0) {embedDescription.other = '**Other:** ' + '\n' + otherList + '\n\n\n';}

      return await func.messageReturn({input: embedDescription.image + embedDescription.video + embedDescription.gif + embedDescription.audio + embedDescription.text + embedDescription.other, type: 'text', title: title, thumbnail: listThumb, commandDisplay: prefix + command + ' list'});
    }
    else if (input === undefined && !customCMD) {//no file name included
      return await func.messageReturn({input: 'Please include a file name.', type: 'text'});
    }
    else { // SEND or ADD File
      let fileExists = false;
      let arrayPosition;
      for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
        if (await func.arcName(archiveList[i].name) === compareName) {
          fileExists = true;
          arrayPosition = i;
          break;
        }
      }
      if (!fileExists && customCMD) { //special case for custom cmd: check the non-default archive if default archive fails
        if (serverArc) {//check user as fallback
          id = message.author.id;
        }
        else {//check server as fallback
          id = message.guild.id;
        }
        //UNIVERSAL again
        if (!fs.existsSync(`./files/archive/${id}.json`)) {
          fs.writeFileSync(`./files/archive/${id}.json`, '[]');
        }
        importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
        archiveList = await JSON.parse(importJSON);
      
        filteredArchiveList = await archiveList.filter(function (el) {
          return el != null;
        });
        archiveList = await filteredArchiveList;
          
        for (let i = 0; i < archiveList.length; i++) {//search re-executed
          if (await func.arcName(archiveList[i].name) === compareName) {
            fileExists = true;
            arrayPosition = i;
            break;
          }
        }
      }
      if (!fileExists && !customCMD) { //ADD FILE
        let link = await func.generalScraper('file'); //Searches for any embed
        if (link === undefined) {
          return await func.messageReturn({input: 'Not a valid embed.', type: 'text'});
        }
        if (link.includes('https://tenor.com/') && link.includes('-gif-')) {//if tenor, scrape actual link from raw html
          let response = await fetch(link);
          let rawHTML = await response.text();
          let pos1 = rawHTML.indexOf('"https://media.tenor.com/')
          let pos2 = rawHTML.indexOf('.gif"',pos1)
          link = rawHTML.substring(pos1 + 1, pos2 + 4);
        }
        let extension = await func.fileExtension(link);
        let fileType = await func.fileType(extension);
        
        let textType = 'File';
        if (fileType == 'link') {//used for embed display (File saved as... vs. Link saved as...)
          textType = 'Link';
        }

        if (fileType == 'image' || fileType == 'gif') {//check if too big for embed, which breaks at >50 MB
          let archiveBuffer = './files/buffer/' + name + '.' + extension
          await func.download(link, archiveBuffer)
          if (func.uploadLimitCheck(archiveBuffer, 50000000)) {
            fileType = 'link';
          }
        }
        

        var archive = {};
        archive.name = name;
        archive.link = link;
        archive.extension = extension;
        archive.type = fileType;

        archiveList.push(archive);
        var archiveJSON = JSON.stringify(archiveList);
        fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);

        let thumb = null;
        if (fileType == 'image' || fileType == 'gif') {//send embed with thumbnail
          thumb = link;
        }
        
        return await func.messageReturn({input: textType + ' saved as "' + name + '"', type: 'text', thumbnail: thumb});
      }
      else if (fileExists) {//SEND FILE
        let file = archiveList[arrayPosition];
        let fileType = file.type;
        let typeLink = fileType == 'link';
        let link = file.link;
        let extension = typeLink ? undefined : file.extension;
        
        if (fileExists === true && typeLink === false) { //File name already exists in JSON - File is a file - Send given file
          let messageType;
          let archiveBuffer;

          if ((fileType == 'image' || fileType == 'gif') && !(link.includes('https://media.tenor.com/'))){//exclude tenor from being treated like a normal link since it has a long embed delay
            archiveBuffer = link;
            messageType = 'link';
          }
          else {
            archiveBuffer = './files/buffer/' + name + '.' + extension;
            await func.download(link, archiveBuffer);
            messageType = 'attach';
            if (func.uploadLimitCheck(archiveBuffer) === true) {//file too big to download
              archiveBuffer = link;
              if (link.includes('https://media.tenor.com/')) {//tenor falls back to being a normal embedded link if too big to download (still less cringe than sending raw link)
                messageType = 'link'
              }
              else {//just send link
                messageType = 'raw';
              }
            }
          }
          if (!customCMD) {//edit buttons
            let row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('arc ' + message.author.id + ' delete ' + compareName + ' ' + id)//compareName used here since spaces are used to index button info
                .setLabel('Delete') 
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('arc ' + message.author.id + ' rename ' + compareName + ' ' + id)
                .setLabel('Rename') 
                .setStyle(ButtonStyle.Primary)
            );
            return await func.messageReturn({input: archiveBuffer, type: messageType, filename: name + '.' + archiveList[arrayPosition].extension, components: [row]});
          }
          else {
            return await func.messageReturn({input: archiveBuffer, type: messageType, filename: name + '.' + archiveList[arrayPosition].extension, commandDisplay: prefix + name});
          }
        }
        else if (fileExists === true && typeLink === true) { //File name already exists in JSON - File is a link - Send given link
          if (!customCMD) {//edit buttons
            let row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('arc ' + message.author.id + ' delete ' + compareName + ' ' + id)//compareName used here since spaces are used to index button info
                .setLabel('Delete') 
                .setStyle(ButtonStyle.Danger),
              new ButtonBuilder()
                .setCustomId('arc ' + message.author.id + ' rename ' + compareName + ' ' + id)
                .setLabel('Rename') 
                .setStyle(ButtonStyle.Primary)
            );
            return await func.messageReturn({input: link, type: 'raw', components: [row]});
          }
          else {
            return await func.messageReturn({input: link, type: 'raw'});
          }
        }
      }
    }
  }
}

client.on(Events.InteractionCreate, async interaction => {
  let info = interaction.customId.split(' ');//button id used to store information separated by spaces
  if(interaction.isButton()) {
    if (info[0] == 'arc') {
      let id = info[1]
      if (id != interaction.member.id) {//only relevant person can interact with button
        interaction.deferUpdate();
        return;
      }
      if (id != info[4]) {//user id is stored in info[1], while JSON reference id is stored in info[4], if they're the same, JSON reference is to user and thus the command is archive, otherwise it's server archive
        id = info[4];
      }
      let name = info[3];//comes with no spaces
      let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
      let archiveList = JSON.parse(importJSON);
      let fileExists = false;
      let arrayPosition;
      if (info[2] == 'delete') { //DELETE
        for (let i = 0; i < archiveList.length; i++) { //Check if the given name exists in the JSON
          if (await func.arcName(archiveList[i].name) === name) {
            fileExists = true;
            arrayPosition = i;
            break;
          }
        }
        name = archiveList[arrayPosition].name;//restore spaces etc. to name
        let embed;
        if (fileExists) {
          let thumb = null;
          if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {//thumbnail for gifs and images
            thumb = archiveList[arrayPosition].link;
          }
          archiveList.splice(arrayPosition, 1);
          var archiveJSON = JSON.stringify(archiveList);
          fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);
          embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle('"' + name + '" deleted.')
            .setThumbnail(thumb);
        }
        else {//can't find file
          embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle('Error encountered!');
        }
        interaction.update({embeds: [embed], content: '', files: [], components: []});
      }
      else if (info[2] == 'rename') {//RENAME
        //id for these carries over same info as button, but with addition specifying what they are
        let modal = new ModalBuilder()
          .setCustomId(interaction.customId + ' modal')
          .setTitle('Rename');
        let textBox = new TextInputBuilder()
          .setCustomId(interaction.customId + ' textBox')
          .setLabel('New name:')
          .setStyle(TextInputStyle.Short);
        let row = new ActionRowBuilder().addComponents(textBox);
        modal.addComponents(row);
        interaction.showModal(modal);
      }
    }
    else if (info[0] == 'help') {//for $help basics
      let id = info[1]
      if (id != interaction.member.id) {//only relevant person can interact with button
        interaction.deferUpdate();
        return;
      }
      let page = parseInt(info[3]);
      if (info[2] == 'L') {
        page -= 1;
      }
      else if (info[2] == 'R') {
        page += 1;
      }
      if (page == 0) {
        page = 4;
      }
      if (page == 5) {
        page = 1;
      }
      let embed;
      if (page == 1) {
        embed = new EmbedBuilder()
          .setTitle("About CatJam's Utilities")
          .setColor(0x686868)
          .setDescription("This bot gives you many fun ways to interact with media on Discord, along with various useful tools.\n\nIts biggest selling points are finely tuned meme creation tools, and a rigorous archival system for easily storing and accessing important/funny things on the fly.");
      }
      else if (page == 2) {
        embed = new EmbedBuilder()
          .setTitle("Commands")
          .setColor(0x686868)
          .setDescription("As you've probably noticed, CatJam deletes your commands to avoid unnecessarily spamming the chat. The user and command are indicated in the embed so it doesn't get too confusing.\n\nNote that this means Catjam will delete media if you attach it alongside a command. This is usually good, but keep try to keep it in mind.\n\nIf you don't like the prefix, it can be changed in your settings with the __pref__ command.");
      }
      else if (page == 3) {
        embed = new EmbedBuilder()
          .setTitle("How CatJam Gets Files (+ The Reply System)")
          .setColor(0x686868)
          .setDescription("When you use a command that needs a file, CatJam will find the most recent suitable one in the chat (or one you attached in your message).\n\nIf you want to specify a file from a certain message, try replying to it. This tells CatJam where it should look.\n\nCatJam also uses replies in other ways, like preserving your command's reply when it can and replying to the source image when it alters an image.");
      }
      else if (page == 4) {
        embed = new EmbedBuilder()
          .setTitle("Flexibility")
          .setColor(0x686868)
          .setDescription("We've tried to give CatJam a lot of customization options and adapt to its circumstances. The way commands work can be changed with __pref__, and you can add arguments to commands to customize in the moment.\n\nThis is especially true when it comes to text inputs. You can use quotes of all kinds to separate your different inputs, or not use quotes at all and let CatJam merge them together. You can even use emoji (including custom ones)!\n\nJust try things that make sense, and if all else fails consult the help menu.");
      }
      let row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('help ' + id + ' L ' + page)
            .setLabel('<') 
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('help ' + id + ' R ' + page)
            .setLabel('>')
            .setStyle(ButtonStyle.Secondary)
          );
      interaction.update({embeds: [embed], components: [row]})
    }
  }
  else if (interaction.isModalSubmit()) {
    if (info[0] == 'arc') {
      let id = info[1];
      if (id != info[4]) {//user id is stored in info[1], while JSON reference id is stored in info[4], if they're the same, JSON reference is to user and thus the command is archive, otherwise it's server archive
        id = info[4];
      }
      let name = info[3];//comes with no spaces
      let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
      let archiveList = JSON.parse(importJSON);
      let fileExists = false;
      let arrayPosition = undefined;
      if (info[2] == 'rename') {
        let newName = interaction.fields.getTextInputValue(info.slice(0,5).join(' ') + ' textBox');//concats all info, omitting modal and adding textBox, to recreate textbox customId
        //emoji handling
        func.findEmoji(newName);
        let matches = globalData.emojiMatch;
        for (var match of matches) {
          if (match[3] != match[0]) {
            newName = newName.replace(match[3], match[2])
          }
        }
        newName = await func.fileNameVerify(newName).then();

        for (let i = 0; i < archiveList.length; i++) { //Check if the original name exists in the JSON
          if (await func.arcName(archiveList[i].name) === name) {
            fileExists = true;
            arrayPosition = i;
            break;
          }
        }

        let newNameExists = false;
        for (let i = 0; i < archiveList.length; i++) { //Check if the new name exists in the JSON
          if (await func.arcName(archiveList[i].name) === await func.arcName(newName) && arrayPosition != i) {//array position check means something can be renamed to its own name (for case/spacing differences)
            newNameExists = true;
            break;
          }
        }
        if (newNameExists) {
          let embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle('The name "' + newName + '" is already taken.');
          interaction.update({embeds: [embed], content: '', files: [], components: []});
          return;
        }

 
        name = archiveList[arrayPosition].name;//restore spaces etc. to name
        let embed;
        if (fileExists === true) {
          let thumb = null;
          if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {//thumbnail for gifs and images
            thumb = archiveList[arrayPosition].link;
          }
          archiveList[arrayPosition].name = newName;
          var archiveJSON = JSON.stringify(archiveList);
          fs.writeFileSync(`./files/archive/${id}.json`, archiveJSON);
          embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle('"' + name + '"' + ' has been renamed to ' + '"' + newName + '".')
            .setThumbnail(thumb);
        }
        else {//can't find file
          embed = new EmbedBuilder()
            .setColor(0x686868)
            .setTitle('Error encountered!');
        }
        interaction.update({embeds: [embed], content: '', files: [], components: []});
      }
    }

  }
});

client.on('messageCreate', async message => {
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
