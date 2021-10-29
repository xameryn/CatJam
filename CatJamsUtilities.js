const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const fs = require(`fs`);
const sharp = require('sharp');
const request = require(`request`);
const stringify = require('json-stringify');
const compress_images = require("compress-images");
const Canvas = require('canvas');
const SizeOf = require('image-size');

//const comm = require("./commands.js")
const func = require("./functions.js");

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const DISCORDTOKEN = 'ODk5NTM2NDI5OTU5NDk5Nzc3.YW0MlQ.Xsh8llVAamR56WeneBYgFNFzcmo';
//const GuildID = '629574376278327316';
const prefix = '`';

const catJamArray = ["https://i.imgur.com/m1RcS2E.gif", "https://i.imgur.com/YtFyPCM.gif", "https://i.imgur.com/HStrwbj.gif", "https://i.imgur.com/SGJa70g.gif", "https://i.imgur.com/JIWZM8V.gif", "https://i.imgur.com/ZjwgQ6F.gif", "https://i.imgur.com/qeOwz9D.gif", "https://i.imgur.com/8HBqVxX.gif", "https://i.imgur.com/1wzjB5q.gif", "https://i.imgur.com/dIcdgPc.gif", "https://i.imgur.com/WJliVos.gif", "https://i.imgur.com/0DGTf7P.gif", "https://i.imgur.com/GHA41XQ.gif", "https://i.imgur.com/OCdpolV.gif", "https://i.imgur.com/KrhcPSW.gif", "https://i.imgur.com/pZi5q2a.gif", "https://i.imgur.com/3tc47Kp.gif", "https://i.imgur.com/bokEy7G.gif", "https://i.imgur.com/x4VMK9L.gif", "https://i.imgur.com/QFZjDnx.gif", "https://i.imgur.com/Gw24CRS.gif", "https://i.imgur.com/m6zcZU9.gif", "https://i.imgur.com/JchmSaG.gif", "https://i.imgur.com/RUnFtKo.gif", "https://i.imgur.com/uMjl7qF.gif"];
const stellarisArray = ["https://i.imgur.com/ys7BoS4.gif", "https://i.imgur.com/SnhAEYz.gif", "https://i.imgur.com/lRTbGgV.gif", "https://i.imgur.com/EG37YDG.gif", "https://i.imgur.com/AaHeo7d.gif", "https://i.imgur.com/nm7O4QY.gif", "https://i.imgur.com/A5jNiBT.gif", "https://i.imgur.com/K5XMeRx.gif", "https://i.imgur.com/tbsCdy9.gif", "https://i.imgur.com/Shxvl4u.gif", "https://i.imgur.com/UCbsNfV.gif", "https://i.imgur.com/2ITcDzY.gif", "https://i.imgur.com/nUMwqhA.gif"];
//const fileTypeList = ['mp4']
var globalData = {};
var downloadingBoolean = false;

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Iteration vX');
 });

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
  const user = message.author.id;
  let input = args[0];
  let input2 = args[1];
  let output = (Math.round((input)/5))*5;
  globalData.message = message;
/*
   _____              _______        _              __  __
  / ____|     /\     |__   __|      | |     /\     |  \/  |
 | |         /  \       | |         | |    /  \    | \  / |
 | |        / /\ \      | |     _   | |   / /\ \   | |\/| |
 | |____   / ____ \     | |    | |__| |  / ____ \  | |  | |
  \_____| /_/    \_\    |_|     \____/  /_/    \_\ |_|  |_|
*/
  if (command === 'catjam') {
    if (input == 'help') {
			return message.channel.send(`Send $catjam [bpm] for catjam to groove along with your song.`);
    }
    else if (!args.length) {
      attachment = new MessageAttachment(catJamArray[12]);
      return message.channel.send(attachment);
		}
    else if (output < 60 || output > 180) {
			return message.channel.send(`BPM not within range.`);
		}
    else {
      let gifNum = (output - 60) / 5;
      attachment = new MessageAttachment(catJamArray[gifNum]);
      return message.channel.send(attachment);
    }
	}
  //-----------------------
  // BPM
  //-----------------------
  else if (command === 'bpm') {
    if (!args.length) {
      const msg = await message.channel.send(`At \'GO\' count the beats until you see \'STOP\'.`);
      setTimeout(function(){
        msg.edit("3");
      }, 2000);
      setTimeout(function(){
        msg.edit("2");
      }, 3000);
      setTimeout(function(){
        msg.edit("1");
      }, 4000);
      setTimeout(function(){
        msg.edit("GO");
      }, 5000);
      setTimeout(function(){
        msg.delete();
        message.channel.send(`STOP`);
      }, 15000);
      setTimeout(function(){
        return message.channel.send(`Enter the amount of beats using $bpm [beats]`);
      }, 16000);
    }
    else {
      let roundInput = (Math.round(input))*6;
      let roundBPM = (Math.round((roundInput)/5))*5;
      return message.channel.send(roundBPM);
    }
  }
  /*
    ______   _____   _        ______            _____     ____     _____   _______
   |  ____| |_   _| | |      |  ____|          |  __ \   / __ \   / ____| |__   __|
   | |__      | |   | |      | |__     ______  | |__) | | |  | | | (___      | |
   |  __|     | |   | |      |  __|   |______| |  ___/  | |  | |  \___ \     | |
   | |       _| |_  | |____  | |____           | |      | |__| |  ____) |    | |
   |_|      |_____| |______| |______|          |_|       \____/  |_____/     |_|
  */
  //-----------------------
  // STELLARIS
  //-----------------------
  else if (command === 'stellaris') {
    //message.delete();
    if (input == 'help') {
      return message.channel.send(`Send $stellaris [hour of day] for funny Ali gif.`);
    }
    else if (!args.length) {
      attachment = new MessageAttachment(stellarisArray[0]);
      return message.channel.send(attachment);
    }
    else if (input > 0 && input < 13) {
      attachment = new MessageAttachment(stellarisArray[input]);
      return message.channel.send(attachment);
    }
    else {
      attachment = new MessageAttachment(stellarisArray[0]);
      return message.channel.send(attachment);
    }
  }
  //-----------------------
  // DADON
  //-----------------------
  else if (command === 'dadon') {
    let dir = './images/dadon';
    let dadonArray = ['./images/dadon/', 'dadon (', 'num', ').png'];
    let fileNumber = fs.readdirSync(dir).length;
    let imageNum = Math.floor(Math.random() * fileNumber) + 1;
    dadonArray[2] = imageNum;
    if (!isNaN(input) && input <= fileNumber && input > 0) {
      dadonArray[2] = input;
    }
    let joinedArray = dadonArray.join('');
    var attachment = await new MessageAttachment(joinedArray);
    return message.channel.send(attachment);
  }
  //-----------------------
  // DEEPCUT
  //-----------------------
  else if (command === 'deepcut') {
    attachment = new MessageAttachment('https://i.imgur.com/2jeADx1.gif');
    return message.channel.send(attachment);
  }
  //-----------------------
  // TWINPEAKS
  //-----------------------
  else if (command === 'twinpeaks') {
    attachment = new MessageAttachment('https://i.imgur.com/UbHeqxd.gif');
    return message.channel.send(attachment);
  }
  //-----------------------
  // 1984
  //-----------------------
  else if (command === '1984') {
    if ((Math.floor(Math.random() * 11)) >= 5) {
        attachment = new MessageAttachment('https://i.imgur.com/59QZNLa.gif');
        return message.channel.send(attachment);
      }
    else {
        attachment = new MessageAttachment('https://i.imgur.com/wInH3ud.gif');
        return message.channel.send(attachment);
    }
  }
  //-----------------------
  // GN
  //-----------------------
  else if (command === 'gn') {
    return message.channel.send({files: ["./images/videos/goodNight.mp4"]});
  }
  /*
     _____              _   _  __      __              _____
    / ____|     /\     | \ | | \ \    / /     /\      / ____|
   | |         /  \    |  \| |  \ \  / /     /  \    | (___
   | |        / /\ \   | . ` |   \ \/ /     / /\ \    \___ \
   | |____   / ____ \  | |\  |    \  /     / ____ \   ____) |
    \_____| /_/    \_\ |_| \_|     \/     /_/    \_\ |_____/
  */
  else if (command === 'canvas') {
    const canvas = Canvas.createCanvas(650, 600);
	  const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./images/templates/blackBox.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);


    var attachedUrl = await func.fileScraper()
    await func.download(attachedUrl, './images/templates/memeBuffer.png');
    console.log('check')
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(2500)

    var dimensions = await SizeOf('./images/templates/memeBuffer.png')

    //const dimensions = await SizeOf('./images/templates/memeBuffer.png')
    var memeRatio = dimensions.width / dimensions.height;

    var meme = await Canvas.loadImage('./images/templates/memeBuffer.png');

    context.strokeStyle = '#ffffff';
    context.fillStyle = '#ffffff';

    context.fillRect((canvas.width - (300 * memeRatio)) / 2, 75, (300 * memeRatio), 300);

    context.drawImage(meme, (canvas.width - (300 * memeRatio)) / 2, 75, (300 * memeRatio), 300);

    context.strokeRect(((canvas.width - (300 * memeRatio)) / 2) - 3, 75 - 3, (300 * memeRatio) + 6, 300 + 6);

    let inputString = await message.content.slice(prefix.length).trim().split('"');


    context.font = '60px Times New Roman';
    console.log(context.measureText(inputString[1].toUpperCase()).width)
    context.fillText(inputString[1].toUpperCase(), (canvas.width / 2) - ((inputString[1].length * 35) / 2), canvas.height / 1.25);



    context.font = '30px Times New Roman';
    context.fillText(inputString[3].toUpperCase(), (canvas.width / 2) - ((inputString[3].length * 15) / 2), canvas.height / 1.1);

    var attachment = new MessageAttachment(canvas.toBuffer(), 'blackBorderTemplate.png');
    return message.channel.send(attachment);
  }
  /*
    __    ___     ___    _  _
   /_ |  / _ \   / _ \  | || |
    | | | (_) | | (_) | | || |_
    | |  \__, |  > _ <  |__   _|
    | |    / /  | (_) |    | |
    |_|   /_/    \___/     |_|
  */
  else if (command === 'literally1984') {
    const canvas = Canvas.createCanvas(1400, 1036);
	  const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./images/templates/literally1984.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    let inputString = await message.content.slice(prefix.length).trim().split('"');

    let fontSize = 200;

    let textWidth;
    do {
    fontSize -= 10;
		context.font = `${fontSize}px sans-serif`;
    textWidth = context.measureText(inputString[1]).width;
	  } while (textWidth > 700 || fontSize < 50);

    //textHeight = context.measureText(inputString[1]).height;
    console.log(fontSize);

    //context.font = '200px sans-serif';
    context.fillStyle = '#000000';
    //context.textAlign = 'center';
    context.fillText(inputString[1], 450 - (textWidth / 2), 220);

    var attachment = new MessageAttachment(canvas.toBuffer(), 'literally1984meme.jpg');
    return message.channel.send(attachment);
  }
/*
  _______   ______  __   __  _______  __     __
 |__   __| |  ____| \ \ / / |__   __| \ \   / /
    | |    | |__     \ V /     | |     \ \_/ /
    | |    |  __|     > <      | |      \   /
    | |    | |____   / . \     | |       | |
    |_|    |______| /_/ \_\    |_|       |_|
*/
  else if (command === 'texty' && input != undefined) {
    await func.canvasInitialize(1000, 1000, './images/templates/blackBox.jpg', input, input2)
    let canvas = globalData.canvas
    let context = globalData.context

    let bg = await Canvas.loadImage('./images/templates/texty.png')
    context.drawImage(bg, 0, 0, 1000, 1000)

    let inputString = await message.content.slice(prefix.length).trim().split('"')

    let arguements = inputString[2].split(' ')
    let arg1 = arguements[1]
    let arg2 = arguements[2]
    let style = ''
    if (arg1 == 'bold' || arg2 == 'bold') {
      style += 'bold '
    }
    if (arg1 == 'italic' || arg2 == 'italic') {
      style += 'italic '
    }
    //box dimensions: 878x237
    //center: 503, 831.5
    //top edge: 713
    //bottom edge: 950
    await func.textHandler(inputString[1], 'sans-serif', style, 120, 1, 878, 237, false, 0.1, 503, 831.5)

    let lines = globalData.textLines
    let xPos = globalData.textX
    let yPos = globalData.textY
    let size = globalData.textSize
    //console.log('final values:')
    //console.log(lines)
    //console.log(xPos)
    //console.log(yPos)
    //console.log(size)

    context.fillStyle = '#000000'
    for (i = 0; i < lines.length; i++) {
      context.fillText(lines[i], xPos[i], yPos[i])
    }
    var attachment = new MessageAttachment(canvas.toBuffer(), 'textyOutput.png');
    return message.channel.send(attachment);
  }
  /*
    _____     ____    _____   _   _   _______
   |  __ \   / __ \  |_   _| | \ | | |__   __|
   | |__) | | |  | |   | |   |  \| |    | |
   |  ___/  | |  | |   | |   | . ` |    | |
   | |      | |__| |  _| |_  | |\  |    | |
   |_|       \____/  |_____| |_| \_|    |_|
  */
  else if (command === 'point') {
    //-----------------------
    // GET IMAGE AND ITS SIZE
    //-----------------------
    //scraped image is used as base, so it has to be found before canvas is made
    let fileDir = './images/templates/buffer/memePointingBuffer.png';
    fileURL = await func.fileScraper();
    await func.download(fileURL, fileDir);
    //put a delay here since otherwise the download would happen too late
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
    await delay(2500);
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
    // CATEGORIZE IMAGE
    //-----------------------
    // small, tall, wide, or normal
    //
    //if the image is small, it's placed at its original size on a fixed canvas (3x smaller than native pointing.png)
    //(since otherwise the tiny image would be overstretched by fitting it, or the two dudes would be overcompressed)
    if (imageSize.height < 100 || imageSize.width < 100) {
      var memeWidth = 640;
      var memeHeight = 506;
      var memeSmall = true;
    }
    else {
      //if the image is taller than a square (relatively), then it's fit into the ratio of pointing.png (Which is 1920x1518)
      //(this is about the point where the two dudes get too close for comfort)
      if (imageSize.height / imageSize.width > 1) {
        var memeWidth = (imageSize.height / 1518) * 1920;
      } else {
        var memeWidth = imageSize.width;
      }
      //if the image is more than twice as wide as it is tall, then it's fit into the ratio of pointing.png
      //(this is about where the two dudes get too far away)
      if (imageSize.width / imageSize.height > 2) {
        var memeHeight = (imageSize.width / 1920) * 1518;
        var memeWide = true;
      } else {
        var memeHeight = imageSize.height;
        var memeWide = false;
      }
      var memeSmall = false;
    }
    //-----------------------
    // CANVAS
    //-----------------------
    await func.canvasInitialize(memeWidth, memeHeight, './images/templates/blackBox.jpg', input, input2);
    let canvas = globalData.canvas;
    let context = globalData.context;
    //-----------------------
    // IMAGE SCALING/DRAWING
    //-----------------------
    let meme = await Canvas.loadImage(fileDir);
    if (memeSmall == false) {
      //scaled to fit canvas, is only actually scaled if it's wide or tall
      await func.canvasScaleDown(fileDir);
      //very wide images are moved upwards in the frame, since central positioning obscures most of them
      if (memeWide == true) {
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
    if (input == 'colonist') {
      var pointImage1 = './images/templates/pointing/pointingColonist1.png';
      var pointImage2 = './images/templates/pointing/pointingColonist2.png';
    } else if (input == 'real') {
      var pointImage1 = './images/templates/pointing/pointingReal1.png';
      var pointImage2 = './images/templates/pointing/pointingReal2.png';
    } else if (input == 'myth') {
      var pointImage1 = './images/templates/pointing/pointingMyth1.png';
      var pointImage2 = './images/templates/pointing/pointingMyth2.png';
      var explosionImage = './images/templates/pointing/pointingMythExplosion.png';
    } else if (input == 'catholic') {
      var pointImage1 = './images/templates/pointing/pointingCatholic1.png';
      var pointImage2 = './images/templates/pointing/pointingCatholic2.png';
    } else if (input == 'hearthian') {
      var pointImage1 = './images/templates/pointing/pointingHearthian1.png';
      var pointImage2 = './images/templates/pointing/pointingHearthian2.png';
    } else {
      var pointImage1 = './images/templates/pointing/pointing1.png';
      var pointImage2 = './images/templates/pointing/pointing2.png';
    }
    //-----------------------
    // TWO DUDES SCALING/DRAWING
    //-----------------------
    //they're both always stuck to the edges of the screen, so all we need is their scaled widths, and scaled height which is the same for both
    await func.canvasScaleDown(pointImage1);
    let scaledWidth1 = globalData.scaledWidth;
    await func.canvasScaleDown(pointImage2);
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
    return message.channel.send(attachment);
  }
  /*
    __  __              _____    _____    ____
   |  \/  |     /\     |  __ \  |_   _|  / __ \
   | \  / |    /  \    | |__) |   | |   | |  | |
   | |\/| |   / /\ \   |  _  /    | |   | |  | |
   | |  | |  / ____ \  | | \ \   _| |_  | |__| |
   |_|  |_| /_/    \_\ |_|  \_\ |_____|  \____/
  */
  else if (command === 'mario') {
    await func.canvasInitialize(1920, 1080, './images/templates/blackBox.jpg', input);
    let canvas = globalData.canvas
    let context = globalData.context
    let fileDir = './images/templates/buffer/memeMarioBuffer.png'
    let fileName = 'memeMarioBuffer.png'
    let internalWidth = 729
    let internalHeight = 973
    let boxWidth = 729
    let boxHeight = 973
    let textBoxCenterX = 530
    let textBoxCenterY = 895
    let textBoxWidth = 560
    let textBoxHeight = null
    let font = '60px Arial'
    let stroke = '#ffffff'
    let fill = '#ffffff'
    let upperCaseBool = true;


    await func.fileScraper(fileDir)

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(2500)

    await func.canvasScaleUp(fileName, internalWidth, internalHeight, 960, 539);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;

    var meme = await Canvas.loadImage('./images/templates/buffer/' + fileName);
    context.drawImage(meme, xAxis, yAxis, scaledWidth, scaledHeight);

    const foreground = await Canvas.loadImage('./images/templates/mario.png');
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);

    let inputString = await message.content.slice(prefix.length).trim().split('"');
    func.textAddition(font, stroke, fill, inputString, textBoxCenterX, textBoxCenterY, textBoxWidth, textBoxHeight, upperCaseBool)

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'marioMeme.png');
    return message.channel.send(attachment);
  }
  /*
               _____     _____
       /\     |  __ \   / ____|
      /  \    | |__) | | |
     / /\ \   |  _  /  | |
    / ____ \  | | \ \  | |____
   /_/    \_\ |_|  \_\  \_____|
  */
  else if (command === 'arc' || command === 'a') {
    globalData.fileType = 'fileType';
    let nameBypass = false;
    let dir = './images/archive';
    let fileDir = ['./images/archive/', 'fileName', '.', 'fileType'];
    fileDir [1] = input;

    let fileList = fs.readdirSync('./images/archive/');
    let fileListJoin = await fileList.join().replaceAll(',', '.').split('.');

    for (var i = 0; i < (fileListJoin.length); i = i + 2) { //Find file type of input name
      if (fileListJoin[i] == input) {
        fileDir[3] = fileListJoin[i + 1];
        globalData.fileType = fileListJoin[i + 1].toString();
      }
    }
    fileDir = fileDir.join('').toString();
    //-----------------------
    // INPUTS
    //-----------------------
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
    //-----------------------
    // SEND/ARCHIVE
    //-----------------------
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
  /*
    __  __   _____    _____    _____
   |  \/  | |_   _|  / ____|  / ____|
   | \  / |   | |   | (___   | |
   | |\/| |   | |    \___ \  | |
   | |  | |  _| |_   ____) | | |____   _
   |_|  |_| |_____| |_____/   \_____| (_)
  */
  //-----------------------
  // FLIP
  //-----------------------
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
      return message.channel.send(`Success!`);
    }
    else {
      return message.channel.send(`Failure!`);
    }
  }
  //-----------------------
  // TWT
  //-----------------------
  else if (command === 'twt') {
    const messages = await message.channel.messages.fetch({ limit: 2 });
    const lastMessage = messages.last();
    let stringOriginal = lastMessage.content;
    let splitArray = stringOriginal.split('/');
    if (splitArray[2] == 'twitter.com') {
      splitArray[2] = 'fxtwitter.com';
      let joinedArray = splitArray.join('/');
      return message.channel.send(joinedArray);
    }
    else {
      return message.channel.send("This is not a twitter link.");
    }
  }
  //-----------------------
  // TEST
  //-----------------------
  else if (command === 'test' || command === 't') {
    console.log('test function');
    return;
  }
});

export { globalData };
client.login(DISCORDTOKEN);
