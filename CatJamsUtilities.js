const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const fs = require(`fs`)
const sharp = require('sharp');
const request = require(`request`)
const stringify = require('json-stringify')
const compress_images = require("compress-images")
const Canvas = require('canvas')
const SizeOf = require('image-size')

//const comm = require("./commands.js")
const func = require("./functions.js")

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const DISCORDTOKEN = 'ODk2OTM0NjI1Mzg4MTM4NTI3.YWOVdg.gffqm3fD04KSvRGvq3puIwHmd54';
const GuildID = '730691398768263198';
const prefix = '`';

const catJamArray = ["https://i.imgur.com/m1RcS2E.gif", "https://i.imgur.com/YtFyPCM.gif", "https://i.imgur.com/HStrwbj.gif", "https://i.imgur.com/SGJa70g.gif", "https://i.imgur.com/JIWZM8V.gif", "https://i.imgur.com/ZjwgQ6F.gif", "https://i.imgur.com/qeOwz9D.gif", "https://i.imgur.com/8HBqVxX.gif", "https://i.imgur.com/1wzjB5q.gif", "https://i.imgur.com/dIcdgPc.gif", "https://i.imgur.com/WJliVos.gif", "https://i.imgur.com/0DGTf7P.gif", "https://i.imgur.com/GHA41XQ.gif", "https://i.imgur.com/OCdpolV.gif", "https://i.imgur.com/KrhcPSW.gif", "https://i.imgur.com/pZi5q2a.gif", "https://i.imgur.com/3tc47Kp.gif", "https://i.imgur.com/bokEy7G.gif", "https://i.imgur.com/x4VMK9L.gif", "https://i.imgur.com/QFZjDnx.gif", "https://i.imgur.com/Gw24CRS.gif", "https://i.imgur.com/m6zcZU9.gif", "https://i.imgur.com/JchmSaG.gif", "https://i.imgur.com/RUnFtKo.gif", "https://i.imgur.com/uMjl7qF.gif"];
const stellarisArray = ["https://i.imgur.com/ys7BoS4.gif", "https://i.imgur.com/SnhAEYz.gif", "https://i.imgur.com/lRTbGgV.gif", "https://i.imgur.com/EG37YDG.gif", "https://i.imgur.com/AaHeo7d.gif", "https://i.imgur.com/nm7O4QY.gif", "https://i.imgur.com/A5jNiBT.gif", "https://i.imgur.com/K5XMeRx.gif", "https://i.imgur.com/tbsCdy9.gif", "https://i.imgur.com/Shxvl4u.gif", "https://i.imgur.com/UCbsNfV.gif", "https://i.imgur.com/2ITcDzY.gif", "https://i.imgur.com/nUMwqhA.gif"];
//const fileTypeList = ['mp4']
var globalData = {};
var downloadingBoolean = false;

client.on("ready", () =>{
    console.log(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Iteration v7')
 });

client.on('message', async message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).trim().split(' ');
	const command = args.shift().toLowerCase();
  let input = args[0];
  let input2 = args[1];
  let output = (Math.round((input)/5))*5;
  globalData.message = message;

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
  else if (command === 'stellaris') {
    //message.delete();
    if (input == 'help') {
      return message.channel.send(`Send $stellaris [hour of day] for funny Ali gif.`);
    }
    else if (!args.length) {
      attachment = new MessageAttachment(stellarisArray[0]);
      return message.channel.send(attachment);
    }
    else if (0 > input || input > 13) {
      attachment = new MessageAttachment(stellarisArray[input]);
      return message.channel.send(attachment);
    }
    else {
      attachment = new MessageAttachment(stellarisArray[0]);
      return message.channel.send(attachment);
    }
  }
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
  else if (command === 'deepcut') {
    attachment = new MessageAttachment('https://i.imgur.com/2jeADx1.gif');
    return message.channel.send(attachment);
  }
  else if (command === 'twinpeaks') {
    attachment = new MessageAttachment('https://i.imgur.com/UbHeqxd.gif');
    return message.channel.send(attachment);
  }
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
  else if (command === 'dadon') {
    let dir = './images/dadon';
    let dadonArray = ['./images/dadon/', 'dadon (', 'num', ').png'];
    let fileNumber = fs.readdirSync(dir).length
    let imageNum = Math.floor(Math.random() * fileNumber) + 1;
    dadonArray[2] = imageNum;
    if (!isNaN(input) && input <= fileNumber && input > 0) {
      dadonArray[2] = input;
    }
    let joinedArray = dadonArray.join('');
    var attachment = await new MessageAttachment(joinedArray);
    return message.channel.send(attachment);
  }
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
  else if (command === 'canvas') {
    const canvas = Canvas.createCanvas(650, 600);
	  const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./images/templates/blackBox.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    if(message.attachments.size) {
      var Attachment = await message.attachments.first();
      var attachedUrl = Attachment ? Attachment.url : null;

      download(attachedUrl);

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
      await delay(2500)
    }

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
    context.fillText(inputString[1].toUpperCase(), (canvas.width / 2) - ((inputString[1].length * 35) / 2), canvas.height / 1.25);

    context.font = '30px Times New Roman';
    context.fillText(inputString[3].toUpperCase(), (canvas.width / 2) - ((inputString[3].length * 15) / 2), canvas.height / 1.1);

    var attachment = new MessageAttachment(canvas.toBuffer(), 'blackBorderTemplate.png');
    return message.channel.send(attachment);
  }
  else if (command === 'literally1984') {
    const canvas = Canvas.createCanvas(1400, 1036);
	  const context = canvas.getContext('2d');

    const background = await Canvas.loadImage('./images/templates/literally1984.jpg');
    context.drawImage(background, 0, 0, canvas.width, canvas.height);

    let inputString = await message.content.slice(prefix.length).trim().split('"');

    let fontSize = 200;

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
  else if (command === 'point') {
    await func.canvasInitialize(1920, 1518, './images/templates/blackBox.jpg', input, input2);
    let canvas = globalData.canvas
    let context = globalData.context;
    let pointImage = './images/templates/pointing/pointing.png';
    let fileDir = './images/templates/buffer/memePointingBuffer.png';

    fileURL = await func.fileScraper()
    func.download(fileURL, fileDir)

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(2500)

    await func.canvasScaleDown(fileDir);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;

    var meme = await Canvas.loadImage(fileDir);
    context.drawImage(meme, xAxis, yAxis, scaledWidth, scaledHeight);

    if (input == 'colonist') {
      pointImage = './images/templates/pointing/pointingColonist.png';
    }
    else if (input == 'real') {
      pointImage = './images/templates/pointing/pointingReal.png';
    }
    else if (input == 'myth') {
      pointImage = './images/templates/pointing/pointingMyth.png';
    }
    else if (input == 'catholic') {
      pointImage = './images/templates/pointing/pointingCatholic.png';
    }

    const foreground = await Canvas.loadImage(pointImage);
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'pointerMeme.png');
    return message.channel.send(attachment);
  }
  else if (command === 'mario') {
    await canvasInitialize(1920, 1080, './images/templates/blackBox.jpg', input);
    let canvas = globalData.canvas
    let context = globalData.context
    let fileDir = './images/templates/buffer/memeMarioBuffer.png'
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


    await imageScraper(fileDir)

    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(2500)

    await canvasScaleUp(fileName, internalWidth, internalHeight, 960, 539);
    let scaledWidth = globalData.scaledWidth;
    let scaledHeight = globalData.scaledHeight;
    let xAxis = globalData.xAxis;
    let yAxis = globalData.yAxis;

    var meme = await Canvas.loadImage('./images/templates/buffer/' + fileName);
    context.drawImage(meme, xAxis, yAxis, scaledWidth, scaledHeight);

    const foreground = await Canvas.loadImage('./images/templates/mario.png');
    context.drawImage(foreground, 0, 0, canvas.width, canvas.height);

    let inputString = await message.content.slice(prefix.length).trim().split('"');
    textAddition(font, stroke, fill, inputString, textBoxCenterX, textBoxCenterY, textBoxWidth, textBoxHeight, upperCaseBool)

    var attachment = await new MessageAttachment(canvas.toBuffer(), 'marioMeme.png');
    return message.channel.send(attachment);
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
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
    await delay(2500)
    msg.delete();
    if (odds > Math.random()) {
      return message.channel.send(`Success!`);
    }
    else {
      return message.channel.send(`Failure!`);
    }
  }
  else if (command === 'gn') {
    return message.channel.send({files: ["./images/videos/goodNight.mp4"]});
  }
  else if (command === 'arc' || command === 'a') {
    globalData.fileType = 'fileType'
    let nameBypass = false
    let dir = './images/archive';
    let fileDir = ['./images/archive/', 'fileName', '.', 'fileType'];
    fileDir [1] = input;

    let fileList = fs.readdirSync('./images/archive/');
    let fileListJoin = await fileList.join().replaceAll(',', '.').split('.')

    for (var i = 0; i < (fileListJoin.length); i = i + 2) { //Find file type of input name
      if (fileListJoin[i] == input) {
        fileDir[3] = fileListJoin[i + 1];
        globalData.fileType = fileListJoin[i + 1].toString()
      }
    }

    fileDir = fileDir.join('').toString();

    if (input === undefined) { //No file name in message
      return message.channel.send(`No File Name.`);
    }
    if (input == 'list' || input == 'l') { //Search for file list
      for (var i = 0; i < fileList.length; i++) {
        fileList[i] = fileList[i].split('.').shift()
      }
      fileList = fileList.join(', ');
      return message.channel.send(`File List: ` + fileList);
    }
    if (input == 'help' || input == 'h') { //Search for help
      return message.channel.send(`Save Image: $arc [Name]` +  "\n" + `Post Image: $arc [Name]` +  "\n" + `See File List: $arc list` +  "\n" + `Delete File: $arc [Name] delete` +  "\n" + `Replace File: $arc [Name] replace`);
    }
    if (input2 == 'replace' || input2 == 'r') { //Replace file
      nameBypass = true
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
    if (fs.existsSync(fileDir)) { //Send file
      if (nameBypass == false) {
        var attachment = await new MessageAttachment(fileDir);
        return message.channel.send(attachment);
      }
    }
    var fileURL = await func.fileScraper(); //Archive most recent file
    var fileType =  fileURL.split('.').pop()
    fileDir = dir + '/' + input + '.' + fileType
    func.download(fileURL, fileDir);
    return message.channel.send(`File Archived as ` + input + '.');
  }
  else if (command === 'test' || command === 't') {
    console.log('test function')
    return;
  }
});

export { globalData };
client.login(DISCORDTOKEN);
