const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { DISCORDTOKEN } = require('./config.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent, 
        GatewayIntentBits.GuildMembers
    ] 
});

client.commands = new Collection();

module.exports = { client };
