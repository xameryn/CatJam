const fs = require('fs-extra');
const { globalData } = require('../state.js');
const { getTime, textArgs } = require('./misc.js');

async function userData(action, command, option, value) {
    let start = getTime();
    let user = globalData.authorID;
    let defaultsOBJ = { id: user, prefixC: ' ', prefixD: true, customCMD: true, priorityARC: 'server', deleteArchiveMessage: false, pointBG: 'black', posterBG: 'white', posterTXT: 'big', posterCAPS: true };
    let defaults = JSON.stringify(defaultsOBJ);
    if (!fs.existsSync('user-data.json')) {
        fs.writeFileSync('user-data.json', defaults);
        globalData.userData = defaultsOBJ;
        globalData.authorIndex = 0;
        return;
    }
    let doc = fs.readFileSync('user-data.json', 'utf8');
    let lines = doc.split('\r\n').filter(line => line.trim() !== '');

    if (action == 'get') {
        for (var i = 0; i < lines.length; i++) {
            let line = JSON.parse(lines[i]);
            if (line.id == user) {
                globalData.userData = line;
                globalData.authorIndex = i;
                return;
            }
        }
        globalData.userData = defaultsOBJ;
        globalData.authorIndex = lines.length;
        lines.push(defaults);
    }
    else if (action == 'set') {
        let data = JSON.parse(lines[globalData.authorIndex]);
        globalData.toggledMSG = `Couldn't set that preference... :Ɛ`;
        if (value == 'true') value = true;
        else if (value == 'false') value = false;
        if (command == 'canvas') command = 'poster';
        if (command == 'a' || command == 'arc') command = 'archive';
        if (option == 'bg') option = 'background';
        else if ((option == 'custom' || option == 'cmd') && command == 'archive') option = 'customcmd';
        else if (option == 'c' && command == 'prefix') option = 'custom';
        else if (option == 'prio') option = 'priority';
        else if (option == 'd') option = 'default';

        let prefix = globalData.escapedPrefix;
        let valuesBG = ['black', 'white', 'png'];
        let valuesTXT = ['big', 'small'];
        let valuesARC = ['server', 'user'];
        let valuesBool = [true, false];
        let values, valueDefault, currentValue;
        let space = '';

        if (command == 'point') {
            if (option == 'background') {
                values = valuesBG;
                valueDefault = 'black';
                currentValue = data.pointBG;
            } else return;
        }
        else if (command == 'poster') {
            if (option == 'background') {
                values = valuesBG;
                valueDefault = 'white';
                currentValue = data.posterBG;
            } else if (option == 'text') {
                values = valuesTXT;
                valueDefault = 'big';
                currentValue = data.posterTXT;
            } else if (option == 'caps') {
                values = valuesBool;
                valueDefault = true;
                currentValue = data.posterCAPS;
            } else return;
        }
        else if (command == 'archive') {
            if (option == 'customcmd') {
                values = valuesBool;
                valueDefault = true;
                currentValue = data.customCMD;
            } else if (option == 'priority') {
                values = valuesARC;
                valueDefault = 'server';
                currentValue = data.priorityARC;
            } else if (option == 'delete') {
                values = valuesBool;
                valueDefault = false;
                currentValue = data.deleteArchiveMessage;
            } else return;
        }
        else if (command == 'prefix') {
            prefix = '';
            if (option == 'custom') {
                valueDefault = ' ';
                currentValue = data.prefixC;
                let argsArray = [...globalData.args];
                let textValue = argsArray.splice(2).join(' ');
                await textArgs(1, textValue);
                value = globalData.textInputs[0];
                if (value.length > 50) return;
                if (value == globalData.globalPrefix) value = 'reset';
                if (value == '`') space = ' ';
                values = [value];
            } else if (option == 'default') {
                values = valuesBool;
                valueDefault = true;
                currentValue = data.prefixD;
            } else return;
        }
        else if (command == 'reset') {
            data = { ...defaultsOBJ };
            globalData.toggledMSG = `Preferences reset! :3`;
        } else return;

        let re = '';
        if (command != 'reset' && (values.includes(value) || value == 'reset' || value == '')) {
            if (value == '') {
                if (values.length == 2) value = values[(values.indexOf(currentValue) + 1) % 2];
                else return;
            } else if (value == 'reset') {
                re = 're';
                value = valueDefault;
            }
            if (command == 'point' && option == 'background') data.pointBG = value;
            else if (command == 'poster' && option == 'background') data.posterBG = value;
            else if (command == 'poster' && option == 'text') data.posterTXT = value;
            else if (command == 'poster' && option == 'caps') data.posterCAPS = value;
            else if (command == 'archive' && option == 'customcmd') data.customCMD = value;
            else if (command == 'archive' && option == 'priority') data.priorityARC = value;
            else if (command == 'archive' && option == 'delete') data.deleteArchiveMessage = value;
            else if (command == 'prefix' && option == 'custom') { data.prefixC = value; globalData.changedPrefix = true; }
            else if (command == 'prefix' && option == 'default') data.prefixD = value;
            globalData.toggledMSG = 'Preferences for ' + prefix + `${command} ${option} ` + re + 'set to `' + value + space + '`! :3';
        }
        lines[globalData.authorIndex] = JSON.stringify(data);
    }
    else if (action == 'prefix') {
        let prefixes = [globalData.globalPrefix];
        for (var i = 0; i < lines.length; i++) {
            let line = JSON.parse(lines[i]);
            if (line.prefixC != ' ') prefixes.push(line.prefixC);
        }
        return prefixes;
    }
    else if (action == 'update') {
        let length = Object.keys(defaultsOBJ).length;
        for (var i = 0; i < lines.length; i++) {
            let line = JSON.parse(lines[i]);
            if (Object.keys(line).length != length) {
                line = { ...defaultsOBJ, ...line };
                lines[i] = JSON.stringify(line);
            }
        }
    }
    fs.writeFileSync('user-data.json', lines.join('\r\n'), 'utf8');
    console.log('userData - ' + getTime(start).toString() + 'ms');
}

module.exports = { userData };
