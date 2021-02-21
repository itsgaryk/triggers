const functions = require("../functions.js")
const fs = require('fs');
const Discord = require ("discord.js");

module.exports = {
	name: 'triggers',
    description: 'Displays all available triggers',
    args: false,
    alias: "sounds",
    /** * @param {Discord.Message} [message] */
	execute(message, config, args) {
        
        const getFileType = (message) => {
            const arguments = message.content.slice(config.prefix.length).trim().split(/ +/);
            if (arguments[0] === "triggers")
                return "image";
            if (arguments[0] === "sounds")
                return "audio"
        }

        const fileType = getFileType(message);
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