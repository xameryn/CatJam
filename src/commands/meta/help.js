const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { globalData } = require('../../state.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'help',
    aliases: ['h'],
    description: 'Displays help information about the bot and its commands.',
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Displays help information about the bot and its commands.')
        .addStringOption(option =>
            option.setName('command')
                .setDescription('Specific command to get help for')
                .setRequired(false)),
    async execute(message, args) {
        return await this.run(message, args[0]);
    },
    async executeSlash(interaction) {
        let command = interaction.options.getString('command');
        globalData.message = interaction;
        return await this.run(interaction, command);
    },
    async run(messageOrInteraction, input) {
        let embed = new EmbedBuilder();
        let p = globalData.escapedPrefix || globalData.globalPrefix;
        let component;
        let author = messageOrInteraction.isInteraction ? messageOrInteraction.user : messageOrInteraction.author;
        let member = messageOrInteraction.isInteraction ? messageOrInteraction.member : messageOrInteraction.member;
        let username = member ? member.displayName : author.username;

        switch (input) {
            case 'basic':
            case 'basics':
                embed
                    .setTitle("About CatJam's Utilities")
                    .setColor(0x686868)
                    .setDescription("This bot gives you many fun ways to interact with media on Discord, along with various useful tools.\n\nIts biggest selling points are finely tuned meme creation tools, and a rigorous archival system for easily storing and accessing important/funny things on the fly.");
                let row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('help ' + author.id + ' L ' + '1')
                            .setLabel('<')
                            .setStyle(ButtonStyle.Secondary),
                        new ButtonBuilder()
                            .setCustomId('help ' + author.id + ' R ' + '1')
                            .setLabel('>')
                            .setStyle(ButtonStyle.Secondary)
                    );
                component = [row];
                break;
            case 'catjam':
                embed.setTitle(p + "catjam [bpm]").setColor(0x686868).setDescription("A catjam that jams to the beat.");
                break;
            case 'stellaris':
                embed.setTitle(p + "stellaris [1-12]").setColor(0x686868).setDescription("It's time to play Stellaris.");
                break;
            case 'dadon':
                embed.setTitle(p + "dadon").setColor(0x686868).setDescription("Sends one of over 200 images of Don-chan.");
                break;
            case 'neco':
                embed.setTitle(p + "neco").setColor(0x686868).setDescription("Sends one of over 100 images of Neco Arc.");
                break;
            case '1984':
                embed.setTitle(p + "1984").setColor(0x686868).setDescription("Two possible GIFs depicting 1984.");
                break;
            case 'scatter':
                embed.setTitle(p + "scatter").setColor(0x686868).setDescription("Randomizes the colours in an image.");
                break;
            case 'glitch':
            case 'corrupt':
                embed.setTitle(p + "glitch").setColor(0x686868).setDescription("Glitches your image.");
                break;
            case 'obradinn':
            case 'obra':
            case 'dinn':
                embed.setTitle(p + "obradinn").setColor(0x686868).setDescription("Who was this? How did they die?");
                break;
            case 'poster':
            case 'canvas':
                embed.setTitle(p + "poster [up to 2 text inputs]").setColor(0x686868).setDescription("Framed like an early 2000s motivational poster.");
                break;
            case 'point':
                embed.setTitle(p + "point").setColor(0x686868).setDescription("Two respectable gentlemen pointing at something of interest.");
                break;
            case 'meme':
                embed.setTitle(p + "meme [up to 3 text inputs]").setColor(0x686868).setDescription("Including classic top text, bottom text, and middle text");
                break;
            case 'mario':
                embed.setTitle(p + "mario [text input]").setColor(0x686868).setDescription("I can't believe they cast them as Mario.");
                break;
            case 'literally1984':
            case 'l1984':
                embed.setTitle(p + "literally1984 [optional text input]").setColor(0x686868).setDescription("For when it is literally 1984.");
                break;
            case 'healthbar':
            case 'hb':
            case 'health':
            case 'ds':
            case 'er':
                embed.setTitle(p + "healthbar [ds / er] [boss name]").setColor(0x686868).setDescription("Adds a Dark Souls or Elden Ring boss healthbar to an image.");
                break;
            case 'stuff':
            case 'stuffimage':
            case 'stuffimg':
            case 'stuffi':
                embed.setTitle(p + "stuff [text input]").setColor(0x686868).setDescription("He is stuff.").setFooter({ text: "Use " + p + "stuffimage to stick it under an image." });
                break;
            case 'archive':
            case 'arc':
            case 'a':
                embed.setTitle(p + "archive [file name] / list").setColor(0x686868).setDescription("Finds the most recent file in chat and adds it to your personal archive!\n\nAny file from this archive can be accessed in any server by typing the file name as if it was a command (__" + p + "[file name]__).\n\nYou can view all your files at once with __" + p + "archive list__, and if you want to edit or remove something, try __" + p + "archive [file name]__ like when you added it.")
                    .setFooter({ text: "By default, files from the server archive take priority over your personal archive.\nYou can change this in your settings with " + p + "pref" });
                break;
            case 'serverarchive':
            case 'serverarc':
            case 'sarc':
            case 'sa':
                embed.setTitle(p + "serverarchive [file name] / list").setColor(0x686868).setDescription("Finds the most recent file in chat and adds it to this server's archive!\n\nAny file from this archive can be accessed only in this server by typing the file name as if it was a command (__" + p + "[file name]__).\n\nYou can view all the server's files at once with __" + p + "serverarchive list__, and if you want to edit or remove something, try __" + p + "serverarchive [file name]__ like when you added it.")
                    .setFooter({ text: "By default, files from the server archive take priority over your personal archive.\nYou can change this in your settings with " + p + "pref" });
                break;
            case 'twitter':
            case 'twt':
                embed.setTitle(p + "twitter").setColor(0x686868).setDescription("Convert a Twitter video link into a more consistent embed.");
                break;
            case 'flip':
            case 'coin':
            case 'toss':
                embed.setTitle(p + "flip [probability]").setColor(0x686868).setDescription("Flip a coin of any weight!");
                break;
            case 'get':
            case 'avatar':
            case 'ava':
            case 'avy':
            case 'pfp':
                embed.setTitle(p + "get [user] / [emoji]").setColor(0x686868).setDescription("Get avatars (using mentions, ID, or name)\nor emoji (custom or default) in picture format.")
                    .setFooter({ text: "Add 'global' somewhere to get global avatars or use 'server' to get server avatars." });
                break;
            case 'starpic':
            case 'sp':
                embed.setTitle(p + "starpic").setColor(0x686868).setDescription("Reposts an image with a star reaction, a neutral mediator for starboards.");
                break;
            case 'help':
            case 'h':
                embed.setTitle(p + "help").setColor(0x686868).setDescription("You are beyond help.");
                break;
            case 'pref':
            case 'preferences':
            case 'prefs':
                embed.setTitle(p + "pref [command] [setting] [value]").setColor(0x686868).setDescription("Alter the default behaviour of various commands (And prefixes).")
                    .setFooter({ text: '"reset" can be used as a command or value to restore defaults' });
                break;
            case 'server':
            case 'srv':
                embed.setTitle(p + "server").setColor(0x686868).setDescription("In case you were wondering how the server was doing.");
                break;
            default:
                embed
                    .setTitle("List of Commands")
                    .setColor(0x686868)
                    .addFields(
                        {
                            name: '\u200B', value:
                                "**__Media:__**\n" + p + "catjam\n" + p + "stellaris\n" + p + "dadon\n" + p + "neco\n" + p + "1984\n" + p + "stuff\n\n" +
                                "**__Filter:__**\n" + p + "scatter\n" + p + "glitch\n" + p + "obradinn\n\n" +
                                "**__Media Editing:__** \n" + p + "poster\n" + p + "point\n" + p + "meme\n" + p + "mario\n" + p + "literally1984\n" + p + "healthbar⠀",
                            inline: true
                        },
                        {
                            name: '\u200B', value:
                                "**__Utility:__**\n" + p + "archive\n" + p + "serverarchive\n" + p + "twitter\n" + p + "flip\n" + p + "get\n" + p + "starpic\n\n" +
                                "**__Meta:__**\n" + p + "help\n" + p + "pref\n" + p + "server⠀",
                            inline: true
                        },
                        {
                            name: '\u200B', value:
                                "Want a general overview? Try __" + p + "help basics__\n⠀"
                        }
                    )
                    .setFooter({ text: 'Not all command aliases and arguments are given here.\nFeel free to experiment!' });
                input = '';
        }

        let displayInput = input ? ' ' + input : '';
        embed.setAuthor({ name: username + ' : ' + (globalData.globalPrefix || '') + 'help' + displayInput, iconURL: author.displayAvatarURL({ extension: 'png', size: 256, dynamic: true }) });
        
        if (messageOrInteraction.delete) await messageOrInteraction.delete().catch(() => null);
        
        return await messageReturn({ input: { embeds: [embed], components: component } });
    }
};
