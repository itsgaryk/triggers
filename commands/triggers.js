const functions = require("../functions.js")
module.exports = {
	name: 'triggers',
    description: 'Displays all available triggers',
    args: false,
	execute(message, args, serverConfig) {
        if(serverConfig.triggers.length == 0) message.channel.send("No triggers have been added to the server")
        else {
            const TriggerWords = functions.sortArray(serverConfig.triggers.map(r => r.triggerWord));
            message.channel.send("Available triggers\n```" + TriggerWords.join("  ") + "```");
        }
        return;
	},
};