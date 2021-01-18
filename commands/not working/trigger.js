module.exports = {
	name: 'trigger',
    description: 'add [word] [image URL] - Adds a trigger word',
    args: true,
	execute(message, args, serverConfig) {

        const validateImage = async triggerLink => {
            return (triggerLink.match(/\.(jpeg|jpg|gif|png)$/) != null);
        }
        
        const addTrigger = async (triggerWord, website, serverConfig) => {
            if(await validateLink(website) == false)
            {message.channel.send("Error: invalid link");}
            
            if(!validateImage(website))
            {message.channel.send("Error: invalid image");}
            
            if(serverConfig.triggers.find(r => r.triggerWord === triggerWord))
            {message.channel.send(`Trigger **${triggerWord}** already exists`); return;}
            else{
                serverConfig.triggers.push({"triggerWord":triggerWord,"triggerLink":`${triggerLink}`});
                message.channel.send(`Trigger **${triggerWord}** successfully added`);
                updateConfig(serverConfig, guildId);
            }                                            
        }
        if(args[0] == false || args[1] == false)
        { message.channel.send("Error: missing arguments. See !help"); return; }
        const triggerWord = args[1].toLowerCase();

        if(hasSpecialCharaters(triggerWord) || isNumber(triggerWord))
        message.channel.send("Error: trigger word cannot contain special characters or numbers")

        switch (args[0]){
            case "add": 
                addTrigger(triggerWord, args[2], serverConfig);
                return;
            case "remove":
                if(serverConfig.triggers.find(r => r.triggerWord === triggerWord)) {
                    serverConfig.triggers = serverConfig.triggers.filter(r => r.triggerWord !== args[1]);
                    message.channel.send(`Trigger **${triggerWord}** successfully removed`);
                    updateConfig(serverConfig, guildId);
                    return;
                }
                else
                { message.channel.send(`Error: trigger word **${triggerWord}** does not exist`); return; }
            default:
                message.channel.send("Error: invalid arguments. See !help"); return;
        } 
	},
};