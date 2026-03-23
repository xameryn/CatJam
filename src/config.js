let keys = {};
try {
    keys = require('../keys.js');
} catch (e) {
    keys = {
        discordKey: process.env.DISCORD_TOKEN,
        prefixKey: process.env.PREFIX || '!',
        twt_key: process.env.TWITTER_KEY,
        twt_secret: process.env.TWITTER_SECRET
    };
}

const { discordKey, prefixKey, twt_key, twt_secret } = keys;
const { catJamArrayStorage, stellarisArrayStorage, developerIDStorage, imageTypes, videoTypes, audioTypes, textTypes } = require('../arrays.js');

module.exports = {
    DISCORDTOKEN: discordKey,
    GLOBAL_PREFIX: prefixKey,
    TWT_KEY: twt_key,
    TWT_SECRET: twt_secret,
    CAT_JAM_ARRAY: catJamArrayStorage,
    STELLARIS_ARRAY: stellarisArrayStorage,
    DEV_ID_ARRAY: developerIDStorage,
    IMAGE_TYPES: imageTypes,
    VIDEO_TYPES: videoTypes,
    AUDIO_TYPES: audioTypes,
    TEXT_TYPES: textTypes
};
