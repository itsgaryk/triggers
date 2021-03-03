const fs = require('fs');
const triggers = require("../triggers.json");
const functions = require("../functions.js")

module.exports = {
	name: 'triggers',
    description: 'Displays all available triggers',
    args: false,
    alias: "sounds",
	execute(message) {
        const makeList = (fileType, newObject) => {
            const formatted = functions.sortArray(newObject.map(item => item.text));
            return `${fileType}` + "```" + formatted.map(item => formatted.indexOf(item)+1 + ". " + item).join("\t") + "```\n";
        }

        if (triggers.length === 0)
            return message.channel.send("No triggers have been added");
        
        const fileTypes = [];
        triggers.map(item => {if(!fileTypes.some(i => i === item.type)) fileTypes.push(item.type);});
        functions.sortArray(fileTypes);
        
        const theMessage = [`There are **${triggers.length}** triggers available\n`];
        for(let i = 0; i < fileTypes.length; i++){
            theMessage.push(makeList(fileTypes[i], triggers.filter(item => item.type === fileTypes[i])));
        }
        message.channel.send(theMessage.join(""));
    }, 
};