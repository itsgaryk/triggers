const functions = require('../functions.js');
module.exports = {
	name: 'room',
    description: 'Creates a secret room',
    args: true,
	execute(message, config, args) {
        
        if(args[0] === undefined)
        { createRoom(message, config, message.author.id); return; }

        if(args[0] === "remove") {
            if (functions.hasMod(message, config)){
                removeRoom(message, config, functions.removeNonNumericCharacters(args[1]));
            }
            else 
                message.channel.send("Error: you don't have permission to perform that command.");
        }
        else
            message.channel.send("Error: invalid argument after room. See !help");
    },
};

async function createRoom(message, config){
        if (config.roomCategory < 1)
            { message.channel.send("Error: missing channel category in config file"); return; }

        if (config.roomName < 1)
            { message.channel.send("Error: missing channel name in config file"); return; }

        functions.checkRoom(message, config)
        .then(r => {
            if(r === undefined){
                message.guild.channels.create(config.roomName, {"parent" : config.roomCategory})
                .then(newChannel => {
                    message.guild.channels.cache.get(newChannel.id).updateOverwrite(message.author,{VIEW_CHANNEL: true});
                    message.channel.send(`Secret Room ${newChannel} has successfully been created`);
                });
            }
        else
            message.channel.send(`Error: You already have a secret room. Don't be greedy!`);            
        })
}

async function removeRoom(message, config, argRoom){
    getRoom(message, config, argRoom).then(room =>  {
        if(room === undefined)
            { message.channel.send("Error: member does not have a secret room"); return; }
        else {
            const deleteChannel = message.guild.channels.cache.get(room);
            deleteChannel.delete()
            message.channel.send(`Secret Room belonging to <@${argRoom}> has successfully been removed`);
        }
    })
}