const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs-extra');
const synonyms = require("synonyms");
const { DEV_ID_ARRAY } = require('../../config.js');
const { messageReturn } = require('../../utils/discord.js');

module.exports = {
    name: 'reaction',
    description: 'Developer reaction command.',
    data: new SlashCommandBuilder()
        .setName('reaction')
        .setDescription('Developer reaction command.')
        .addStringOption(option => option.setName('search').setDescription('Search terms').setRequired(true)),
    async execute(message, args) {
        if (!DEV_ID_ARRAY.includes(message.author.id)) return;
        
        let SearchInput = args.join(' ');
        let searchPhrase = [];
        let searchAny = [];

        if (SearchInput.includes('"')) {
            let SearchArr = SearchInput.split('"');
            SearchInput = '';
            for (let i = 0; i < SearchArr.length; i++) {
                if (i % 2 == 0) {
                    SearchInput += SearchArr[i].trim() + ' ';
                } else {
                    searchPhrase.push(SearchArr[i].trim());
                }
            }
        }
        searchAny = SearchInput.trim().split(' ');

        if (searchAny.length > 0) {
            var synonomAny = [];
            for (let i = 0; i < searchAny.length; i++) {
                let syns = synonyms(searchAny[i], "v");
                if (syns != undefined) {
                    syns.shift();
                    synonomAny = synonomAny.concat(syns);
                }
            }
            searchAny = searchAny.concat(synonomAny);
        }

        let meme = JSON.parse(fs.readFileSync(`./files/memes/meme.json`, 'utf8'));
        if (searchPhrase.length > 0) {
            meme = meme.filter(m => searchPhrase.every(phrase => m.Text.includes(phrase)));
        }

        let memeSort = [];
        for (let i = 0; i < meme.length; i++) {
            let matchCount = 0;
            for (let j = 0; j < searchAny.length; j++) {
                if (new RegExp(`\\b${searchAny[j]}\\b`, 'i').test(meme[i].Text)) {
                    matchCount++;
                }
            }
            if (matchCount > 0) {
                memeSort.push({ link: meme[i].Media, matches: matchCount });
            }
        }

        if (memeSort.length === 0) return await messageReturn({ input: "No reaction found.", type: 'text' });

        memeSort.sort((a, b) => b.matches - a.matches);
        let link = memeSort[0].link.toString();
        
        return await messageReturn({ input: link, type: 'attach', filename: 'reaction.jpg' });
    },
    async executeSlash(interaction) {
        if (!DEV_ID_ARRAY.includes(interaction.user.id)) {
            return await interaction.reply({ content: 'Developer only!', ephemeral: true });
        }
        let search = interaction.options.getString('search');
        return await this.execute(interaction, search.split(' '));
    }
};
