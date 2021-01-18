module.exports = {
	name: 'mod',
    description: 'Adds/removes mod roles',
    args: true,
	execute(message, args, serverConfig){
        const argMod = removeNonNumericCharacters(args[1]);    
        if(!hasMod(memberRoles, serverConfig.modRoles) && message.author.id != guildOwner)
            message.channel.send("Error: you don't have permission to perform that command.")
        if(args[0] === undefined || args[1] === undefined)
            message.channel.send("Error: missing arguments. See !help")                    
        if (!message.guild.roles.cache.find(r => r.id === `${argMod}`))
            message.channel.send("Error: invalid Role ID");
        
        // eslint-disable-next-line no-case-declarations
        const addMod = async () => {
            if(serverConfig.modRoles.find(r => r == `${argMod}`)){
                message.channel.send(`Error: role is already added`);
                return;
            }
            serverConfig.modRoles.push(`${argMod}`);
            message.channel.send(`Role <@&${argMod}> has successfully been added`);
            updateConfig(serverConfig,guildId);
        }

        // eslint-disable-next-line no-case-declarations
        const removeMod = async () => {
            if(serverConfig.modRoles.find(r => r == `${argMod}`)){
                serverConfig.modRoles = serverConfig.modRoles.filter(r => r != `${argMod}`);
                message.channel.send(`Role <#${argMod}> has successfully been removed`);
                updateConfig(serverConfig,guildId);
                return;
            }
            else{
                message.channel.send("Channel is not on the list")
                return;
            }
        }

        switch(args[0]){
            case "add":    
                await addMod(); return;
            case "remove":
                await removeMod(); return;
            default:
                message.channel.send("Error: invalid argument after !room. See !help")
                return;  
        }
    },
};