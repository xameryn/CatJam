const { catJamArrayStorage, stellarisArrayStorage, developerIDStorage, imageTypes, videoTypes, audioTypes, textTypes } = require('../arrays.js');

module.exports = {
    DISCORDTOKEN: process.env.DISCORD_TOKEN,
    GLOBAL_PREFIX: process.env.PREFIX || '!',
    TWT_KEY: process.env.TWITTER_KEY,
    TWT_SECRET: process.env.TWITTER_SECRET,
    GUILD_ID: process.env.GUILD_ID,
    CAT_JAM_ARRAY: catJamArrayStorage,
    STELLARIS_ARRAY: stellarisArrayStorage,
    DEV_ID_ARRAY: process.env.DEV_ID_ARRAY ? process.env.DEV_ID_ARRAY.split(',') : developerIDStorage,
    IMAGE_TYPES: imageTypes,
    VIDEO_TYPES: videoTypes,
    AUDIO_TYPES: audioTypes,
    TEXT_TYPES: textTypes
};
