const functions = require("../functions.js")
module.exports = {
	name: 'trigger',
    description: 'add [word] [image URL] - Adds a trigger word',
    args: true,
	execute(message, args, serverConfig) {
        if(args[0] == undefined || args[1] == undefined)
        { message.channel.send("Error: missing arguments. See !help"); return; }
        const triggerWord = args[1].toLowerCase();

        if(!functions.hasAlphabeticCharactersOnly(triggerWord))
            { message.channel.send("Error: trigger word cannot contain special characters or numbers"); return;}
        switch (args[0]){
            case "add": 
                addTrigger(message, serverConfig, triggerWord, args[2]);
                break;
            case "remove":
                if(!functions.hasMod(message, serverConfig))
                    return message.channel.send("Error: you don't have permission to perform that command.");
                removeTrigger(message,serverConfig,triggerWord);
                break;
            default:
                return message.channel.send("Error: invalid arguments. See !help");
        }
	},
};



async function addTrigger(message, serverConfig, triggerWord, triggerLink){    
    
    if(!functions.validateLink(triggerLink))
        message.channel.send("Error: invalid link");
    if(!functions.validateImage(triggerLink))
        message.channel.send("Error: invalid image");
    if(serverConfig.triggers.find(r => r.triggerWord === triggerWord))
        message.channel.send(`Trigger **${triggerWord}** already exists`)
    else{
        serverConfig.triggers.push({"triggerWord":triggerWord,"triggerLink":`${triggerLink}`});
        message.channel.send(`Trigger **${triggerWord}** successfully added`);
        functions.updateConfig(serverConfig, message.guild.id);
    }                                            
}

async function removeTrigger(message, serverConfig, triggerWord){
    if(serverConfig.triggers.find(r => r.triggerWord === triggerWord)) {
        serverConfig.triggers.forEach((r, indexValue) => {
            if (r.triggerWord == triggerWord)
                serverConfig.triggers.splice(indexValue, 1);
        })
        message.channel.send(`Trigger **${triggerWord}** successfully removed`);
        functions.updateConfig(serverConfig, message.guild.id);
    }
    else
        message.channel.send("Trigger word does not exist")
    return;
}