const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const fs = require('fs-extra');
const { globalData } = require('./state.js');
const { arcName } = require('./utils/misc.js');
const { findEmoji } = require('./utils/emoji.js');
const { fileNameVerify } = require('./utils/file.js');

async function handleInteractions(interaction) {
    let info = interaction.customId.split(' ');
    
    if (interaction.isButton()) {
        if (info[0] == 'arc') {
            let id = info[1];
            if (id != (interaction.member ? interaction.member.id : interaction.user.id)) {
                return await interaction.deferUpdate();
            }
            if (id != info[4]) {
                id = info[4];
            }
            let name = info[3];
            let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
            let archiveList = JSON.parse(importJSON);
            let fileExists = false;
            let arrayPosition;
            
            if (info[2] == 'delete') {
                for (let i = 0; i < archiveList.length; i++) {
                    if (await arcName(archiveList[i].name) === name) {
                        fileExists = true;
                        arrayPosition = i;
                        break;
                    }
                }
                
                let embed;
                if (fileExists) {
                    let realName = archiveList[arrayPosition].name;
                    let thumb = null;
                    if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {
                        thumb = archiveList[arrayPosition].link;
                    }
                    archiveList.splice(arrayPosition, 1);
                    fs.writeFileSync(`./files/archive/${id}.json`, JSON.stringify(archiveList));
                    embed = new EmbedBuilder()
                        .setColor(0x686868)
                        .setTitle('"' + realName + '" deleted.')
                        .setThumbnail(thumb);
                } else {
                    embed = new EmbedBuilder().setColor(0x686868).setTitle('Error encountered!');
                }
                return await interaction.update({ embeds: [embed], content: '', files: [], components: [] });
            }
            else if (info[2] == 'rename') {
                let modal = new ModalBuilder().setCustomId(interaction.customId + ' modal').setTitle('Rename');
                let textBox = new TextInputBuilder()
                    .setCustomId(interaction.customId + ' textBox')
                    .setLabel('New name:')
                    .setStyle(TextInputStyle.Short);
                let row = new ActionRowBuilder().addComponents(textBox);
                modal.addComponents(row);
                return await interaction.showModal(modal);
            }
        }
        else if (info[0] == 'help') {
            let id = info[1];
            if (id != (interaction.member ? interaction.member.id : interaction.user.id)) {
                return await interaction.deferUpdate();
            }
            let page = parseInt(info[3]);
            if (info[2] == 'L') page -= 1;
            else if (info[2] == 'R') page += 1;
            
            if (page <= 0) page = 4;
            if (page >= 5) page = 1;
            
            let embed = new EmbedBuilder().setColor(0x686868);
            if (page == 1) {
                embed.setTitle("About CatJam's Utilities")
                    .setDescription("This bot gives you many fun ways to interact with media on Discord, along with various useful tools.\n\nIts biggest selling points are finely tuned meme creation tools, and a rigorous archival system for easily storing and accessing important/funny things on the fly.");
            } else if (page == 2) {
                embed.setTitle("Commands")
                    .setDescription("As you've probably noticed, CatJam deletes your commands to avoid unnecessarily spamming the chat. The user and command are indicated in the embed so it doesn't get too confusing.\n\nNote that this means Catjam will delete media if you attach it alongside a command. This is usually good, but keep try to keep it in mind.\n\nIf you don't like the prefix, it can be changed in your settings with the __pref__ command.");
            } else if (page == 3) {
                embed.setTitle("How CatJam Gets Files (+ The Reply System)")
                    .setDescription("When you use a command that needs a file, CatJam will find the most recent suitable one in the chat (or one you attached in your message).\n\nIf you want to specify a file from a certain message, try replying to it. This tells CatJam where it should look.\n\nCatJam also uses replies in other ways, like preserving your command's reply when it can and replying to the source image when it alters an image.");
            } else if (page == 4) {
                embed.setTitle("Flexibility")
                    .setDescription("We've tried to give CatJam a lot of customization options and adapt to its circumstances. The way commands work can be changed with __pref__, and you can add arguments to commands to customize in the moment.\n\nThis is especially true when it comes to text inputs. You can use quotes of all kinds to separate your different inputs, or not use quotes at all and let CatJam merge them together. You can even use emoji (including custom ones)!\n\nJust try things that make sense, and if all else fails consult the help menu.");
            }
            
            let row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('help ' + id + ' L ' + page).setLabel('<').setStyle(ButtonStyle.Secondary),
                new ButtonBuilder().setCustomId('help ' + id + ' R ' + page).setLabel('>').setStyle(ButtonStyle.Secondary)
            );
            return await interaction.update({ embeds: [embed], components: [row] });
        }
    }
    else if (interaction.isModalSubmit()) {
        if (info[0] == 'arc') {
            let id = info[1];
            if (id != info[4]) id = info[4];
            let name = info[3];
            let importJSON = fs.readFileSync(`./files/archive/${id}.json`, 'utf8');
            let archiveList = JSON.parse(importJSON);
            let fileExists = false;
            let arrayPosition;
            
            if (info[2] == 'rename') {
                let newName = interaction.fields.getTextInputValue(info.slice(0, 5).join(' ') + ' textBox');
                await findEmoji(newName);
                let matches = globalData.emojiMatch;
                for (var match of matches) {
                    if (match[3] != match[0]) newName = newName.replace(match[3], match[2]);
                }
                newName = await fileNameVerify(newName);
                
                for (let i = 0; i < archiveList.length; i++) {
                    if (await arcName(archiveList[i].name) === name) {
                        fileExists = true;
                        arrayPosition = i;
                        break;
                    }
                }
                
                let newNameExists = false;
                for (let i = 0; i < archiveList.length; i++) {
                    if (await arcName(archiveList[i].name) === await arcName(newName) && arrayPosition != i) {
                        newNameExists = true;
                        break;
                    }
                }
                
                if (newNameExists) {
                    let embed = new EmbedBuilder().setColor(0x686868).setTitle('The name "' + newName + '" is already taken.');
                    return await interaction.update({ embeds: [embed], content: '', files: [], components: [] });
                }
                
                let embed;
                if (fileExists) {
                    let oldName = archiveList[arrayPosition].name;
                    let thumb = null;
                    if (archiveList[arrayPosition].type === 'image' || archiveList[arrayPosition].type === 'gif') {
                        thumb = archiveList[arrayPosition].link;
                    }
                    archiveList[arrayPosition].name = newName;
                    fs.writeFileSync(`./files/archive/${id}.json`, JSON.stringify(archiveList));
                    embed = new EmbedBuilder()
                        .setColor(0x686868)
                        .setTitle('"' + oldName + '" has been renamed to "' + newName + '".')
                        .setThumbnail(thumb);
                } else {
                    embed = new EmbedBuilder().setColor(0x686868).setTitle('Error encountered!');
                }
                return await interaction.update({ embeds: [embed], content: '', files: [], components: [] });
            }
        }
    }
}

module.exports = { handleInteractions };
