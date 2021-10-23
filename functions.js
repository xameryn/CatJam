const { Client, Intents, MessageAttachment, MessageActionRow, MessageButton } = require('discord.js');
const fs = require(`fs`)
const sharp = require('sharp');
const request = require(`request`)
const stringify = require('json-stringify')
const compress_images = require("compress-images")
const Canvas = require('canvas')
const SizeOf = require('image-size')

import { globalData } from './CatJamsUtilities.js'

async function fileScraper() {
  console.log('fileScraper');
  let message = globalData.message;
  if (message.attachments.size) {
    var Attachment = message.attachments.last();
    var attachedFileURL = Attachment.url.toString()
    return attachedFileURL;
  }
  else {
    var exitForLoop = false;
    for (let i = 2; i < 25; i++) {
      if (exitForLoop) {return;}
      var scraperURL = message.channel.messages.fetch({ limit: i }).then(async messageList => {
        let messageListLastAttachment = messageList.last().attachments
        if (messageListLastAttachment.size) {
          var Attachment = await messageList.last().attachments.first()
          var attachedFileURL = Attachment.url
          exitForLoop = true;
          return attachedFileURL;
        }
      })
      var attachedFileURL = await scraperURL.then();
      if (attachedFileURL !== undefined) {
        return attachedFileURL;
      }
    }
  }
}

function download(fileURL, fileDir){
  console.log('download');
  request.get(fileURL).pipe(fs.createWriteStream(fileDir))
}

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

async function canvasScaleDown(fileDir, boxWidth, boxHeight){
  console.log('canvasScale');
  let canvas = globalData.canvas
  let context = globalData.context
  let memeSize = await SizeOf(fileDir)
  if (boxWidth === undefined || boxHeight === undefined) {
    var boxWidth = canvas.width;
    var boxHeight = canvas.height;
  }

  let memeRatio = memeSize.width / memeSize.height;
  if (memeRatio >= (boxWidth / boxHeight)) {
    let scalingRatio = memeSize.width / boxWidth
    var scaledHeight = memeSize.height / scalingRatio
    var scaledWidth = boxWidth
    var xAxis = 0
    var yAxis = (Math.abs(boxHeight - scaledHeight)) / 2
  }

  else if (memeRatio < (boxWidth / boxHeight)) {
    let scalingRatio = memeSize.height / boxHeight
    var scaledHeight = boxHeight
    var scaledWidth = memeSize.width / scalingRatio
    var xAxis = (Math.abs(boxWidth - scaledWidth)) / 2
    var yAxis = 0
  }
  globalData.scaledWidth = scaledWidth;
  globalData.scaledHeight = scaledHeight;
  globalData.xAxis = xAxis;
  globalData.yAxis = yAxis;
  return;
}

async function canvasScaleUp(fileName, internalWidth, internalHeight, centerX, centerY){
  console.log('canvasScale');
  let canvas = globalData.canvas
  let context = globalData.context;
  var memeSize = await SizeOf('./images/templates/buffer/' + fileName)

  if ((memeSize.width / memeSize.height) >= (internalWidth / internalHeight)) {
    var scalingRatio = memeSize.height / internalHeight
    if (scalingRatio < 1) {
      scalingRatio = Math.pow(scalingRatio, -1)
    }
    var scaledWidth = memeSize.width * scalingRatio
    var scaledHeight = internalHeight
    var xAxis = centerX - (scaledWidth / 2)
    var yAxis = centerY - (internalHeight / 2)
  }

  else if ((memeSize.width / memeSize.height) < (internalWidth / internalHeight)) {
    var scalingRatio = memeSize.width / internalWidth
    if (scalingRatio < 1) {
      scalingRatio = Math.pow(scalingRatio, -1)
    }
    var scaledWidth = internalWidth
    var scaledHeight = memeSize.height * scalingRatio
    var xAxis = centerX - (internalWidth / 2)
    var yAxis = centerY - (scaledHeight / 2)
  }
  globalData.scaledWidth = scaledWidth;
  globalData.scaledHeight = scaledHeight;
  globalData.xAxis = xAxis;
  globalData.yAxis = yAxis;
  return;
}

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

module.exports = { fileScraper, download, canvasInitialize, canvasScaleDown, canvasScaleUp, textAddition, getTextWidth, getTextHeight };
