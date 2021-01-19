const functions = require("../functions.js")

module.exports = {
	name: 'mod',
    description: 'Adds/removes mod roles',
    args: true,
	execute(message, args, serverConfig){
 
        if(!functions.hasMod(message, serverConfig))
            { message.channel.send("Error: you don't have permission to perform that command."); return; }
        if(args[0] === undefined || args[1] === undefined)
            { message.channel.send("Error: missing arguments. See !help"); return; }
            
        const argMod = functions.removeNonNumericCharacters(args[1]);

        if (!message.guild.roles.cache.find(r => r.id === argMod))
            message.channel.send("Error: invalid Role ID");
        else{
            switch(args[0]){
            case "add":    
                addMod(message, serverConfig, argMod); break;
            case "remove":
                removeMod(message, serverConfig, argMod); break;
            default:
                message.channel.send("Error: invalid argument after !room. See !help")
            }
        }
        return;
    },
}

async function addMod(message, serverConfig, argMod){
    if(serverConfig.modRoles.find(r => r == `${argMod}`)){
        message.channel.send(`Error: role is already added`);
    }
    else{
        serverConfig.modRoles.push(argMod);
        message.channel.send(`Role <@&${argMod}> has successfully been added`);
        await functions.updateConfig(serverConfig, message.guild.id);
    }
    return;
}


async function removeMod (message, serverConfig, argMod){
    if(serverConfig.modRoles.find(r => r == `${argMod}`)){
        serverConfig.modRoles.forEach((m, indexValue) => {
            if (m == argMod)
            serverConfig.modRoles.splice(indexValue, 1);
            return;
        });
        message.channel.send(`Role <@&${argMod}> has successfully been removed`);
        functions.updateConfig(serverConfig,message.guild.id);
    }
    else message.channel.send("Channel is not on the list")
    return;
}