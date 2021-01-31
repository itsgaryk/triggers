const functions = require("../functions.js")
const fs = require('fs');

module.exports = {
	name: 'triggers',
    description: 'Displays all available triggers',
    args: false,
    alias: "sounds",
	execute(message, config, args, fileType) {
        const theMessage = [];
        const fileList = fs.readdirSync(`${fileType}/`)
        if(fileList.length === 0) message.channel.send(`No ${fileType} triggers have been added to the server`)
        else {
            theMessage.push("**Available Triggers**")        
            const commandList = functions.removeFileExtension(fileList);
            const orderedList = functions.sortArray(commandList);
            theMessage.push("```" + orderedList.join("  ") + "```");
        }

        message.channel.send(theMessage.join(""));
	},
};