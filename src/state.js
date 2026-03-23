let globalData = {
    userData: {},
    authorIndex: 0,
    toggledMSG: '',
    authorID: '',
    message: null,
    globalPrefix: '',
    prefix: '',
    escapedPrefix: '',
    command: '',
    args: [],
    trueCommand: '',
    targetMessage: null,
    canvas: null,
    context: null,
    imgCanvasDims: [],
    imgCanvasEval: '',
    scaledPos: [0, 0],
    scaledDims: [0, 0],
    emojiMatch: [],
    emojiStatus: '',
    textInputs: [],
    argsText: [],
    text1: {},
    text2: {},
    changedPrefix: false
};

module.exports = { globalData };
