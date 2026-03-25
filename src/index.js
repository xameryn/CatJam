const fs = require('fs-extra');
const path = require('path');
const { Events, REST, Routes } = require('discord.js');
const { client } = require('./client.js');
const { DISCORDTOKEN, GLOBAL_PREFIX, DEV_ID_ARRAY } = require('./config.js');
const { globalData, resetGlobalData } = require('./state.js');
const { getTime, createFolders } = require('./utils/misc.js');
const { userData } = require('./utils/user.js');

// Global variables for tracking command execution
let running = false;
let alreadyRunning = false;
let start = 0;

// Load commands
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = [];

function readCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            readCommands(fullPath);
        } else if (file.endsWith('.js')) {
            const command = require(fullPath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.name, command);
                if (command.aliases) {
                    command.aliases.forEach(alias => client.commands.set(alias, command));
                }
                commandFiles.push(command.data.toJSON());
            }
        }
    }
}

readCommands(commandsPath);

const { handleInteractions } = require('./interactions.js');

// Register Slash Commands
const rest = new REST({ version: '10' }).setToken(DISCORDTOKEN);

(async () => {
    try {
        console.log(`Started refreshing ${commandFiles.length} application (/) commands.`);
        const clientId = process.env.CLIENT_ID || (await client.login(DISCORDTOKEN).then(() => client.user.id));
        const data = await rest.put(
            Routes.applicationCommands(clientId),
            { body: commandFiles },
        );
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
})();

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
    c.user.setActivity('In Development');
    createFolders();
    userData('update');
});

client.on(Events.MessageCreate, async message => {
    if (message.author.bot) return;

    if (running) {
        alreadyRunning = true;
        return;
    }

    resetGlobalData();
    globalData.authorID = message.author.id;
    globalData.message = message;
    globalData.globalPrefix = GLOBAL_PREFIX;

    if (message.mentions.has(client.user)) {
        if (message.content.includes('prefix')) {
            await userData('get');
            await userData('set', 'prefix', 'default', '');
            const { messageReturn } = require('./utils/discord.js');
            return await messageReturn({ input: `${globalData.toggledMSG}`, type: 'text' });
        }
    }

    await userData('get');
    let prefix;
    if (message.content.startsWith(globalData.userData.prefixC) && globalData.userData.prefixC !== ' ') {
        prefix = globalData.userData.prefixC;
    }
    else if (message.content.startsWith(GLOBAL_PREFIX) && globalData.userData.prefixD) {
        prefix = GLOBAL_PREFIX;
    }
    else { return; }

    globalData.prefix = prefix;
    globalData.escapedPrefix = prefix.replaceAll(/[^\w\s]/g, '\\$&');

    running = true;
    start = getTime();

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();
    const command = client.commands.get(commandName);

    if (!command) {
        if (globalData.userData.customCMD) {
            const archiveCommand = client.commands.get('archive');
            globalData.command = commandName;
            globalData.args = args;
            globalData.trueCommand = commandName;
            await archiveCommand.execute(message, args);
        } else {
            running = false;
        }
    } else {
        globalData.command = commandName;
        globalData.args = args;
        globalData.trueCommand = command.name;

        try {
            const sendTime = await command.execute(message, args);
            let totalTime = getTime(start);
            if (sendTime != undefined) {
                console.log(`[ ${commandName} - ${totalTime}ms ] ( ${(totalTime - sendTime)}ms + ${sendTime}ms )`);
            } else {
                console.log(`[ ${commandName} - ${totalTime}ms ]`);
            }
        } catch (error) {
            console.error(error);
        }
    }

    running = false;
    alreadyRunning = false;
});

client.on(Events.InteractionCreate, async interaction => {
    if (running) {
        if (interaction.isChatInputCommand()) {
            await interaction.reply({ content: "CatJam's currently busy, please try again in a moment.", ephemeral: true });
        }
        return;
    }

    if (!interaction.isChatInputCommand()) {
        running = true;
        try {
            await handleInteractions(interaction);
        } finally {
            running = false;
        }
        return;
    }

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    resetGlobalData();
    globalData.authorID = interaction.user.id;
    globalData.message = interaction;
    globalData.globalPrefix = GLOBAL_PREFIX;
    globalData.trueCommand = command.name;
    globalData.args = []; 

    running = true;
    try {
        await interaction.deferReply();
        await command.executeSlash(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    } finally {
        running = false;
    }
});

client.login(DISCORDTOKEN);
