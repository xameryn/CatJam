const { discordKey, prefixKey, twt_key, twt_secret } = require('../keys.js');
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
