const functions = require('../functions.js');
module.exports = {
	name: 'room',
    description: 'Creates a secret room',
    args: true,
	execute(message, args, serverConfig) {
    
        const argRoom = functions.removeNonNumericCharacters(args[1]);            
        //const memberName = message.guild.members.fetch(argRoom).then(n => n.nickname);
        
        if(args[0] === undefined && args[1] === undefined)
            { createRoom(message, serverConfig, message.author.id); return; }

        if(!functions.hasMod(message, serverConfig))
        { message.channel.send("Error: you don't have permission to perform that command."); return false; }

        if(argRoom === undefined)
        { message.channel.send("Error: missing arguments. See !help"); return false; }

        switch(args[0]){
            case "add":
                createRoom(message, serverConfig, argRoom);
                break;
            case "category":
                modifyCategory(message, serverConfig, argRoom)
                break;
            case "name":
                serverConfig.secretRoom.name = args[2];
                functions.updateConfig(serverConfig, message.guild.id)
                message.channel.send("Secret Room name has successfully been updated to ", argRoom);
                break;
            case "remove":
                removeRoom(message, serverConfig, argRoom)
                break;
            default:
                message.channel.send("Error: invalid argument after room. See !help")
        }  
        return;
    },
};

function hasRoomConfig(serverConfig){ 
    if (serverConfig.secretRoom.category && serverConfig.secretRoom.name)
        return true
    else
        return false
}

async function createRoom(message, serverConfig, argRoom){
    try{

        if(!hasRoomConfig(serverConfig))
            { message.channel.send("Error: missing channel settings in config file"); return; }

        //For !room
        if (serverConfig.secretRoom.rooms.find(r => r.userId === argRoom && argRoom === message.author.id))
            { message.channel.send(`Error: You already have a secret room. Don't be greedy!`); return; }

        if (serverConfig.secretRoom.rooms.find(r => r.userId === argRoom))
            { message.channel.send(`Error: member already has a secret room`); return; }

        //For !room add
        const memberObject = await message.guild.members.fetch(argRoom);
        message.guild.channels.create(serverConfig.secretRoom.name, {"parent" : serverConfig.secretRoom.category})
        .then(newChannel => {
            message.guild.channels.cache.get(newChannel.id).updateOverwrite(memberObject,{VIEW_CHANNEL: true});
            serverConfig.secretRoom.rooms.push({"roomId": newChannel.id, "userId": argRoom});
            message.channel.send(`Secret Room ${newChannel} has successfully been created for <@${argRoom}>`);
            functions.updateConfig(serverConfig,message.guild.id);                        
            });
    }
    catch(e) {
        console.log("\t",e.lineNumber, " ", e.code, " - ", e.message)
        if((e.code == 10003) || (e.code == 10007) || (e.code == 10013))
        {
            message.channel.send("Error: invalid member");
            throw(e);
        } 
        
    }  
}

async function removeRoom(message, serverConfig, argRoom){
    if(serverConfig.secretRoom.rooms.find (r => r.userId === argRoom) ^ serverConfig.secretRoom.rooms.length < 1)
    { message.channel.send("Error: member does not have a secret room"); return; }

    serverConfig.secretRoom.rooms.forEach((r, indexValue) => {
        if(r.userId === argRoom && message.guild.channels.cache.get(r.roomId))
        {
            const deleteChannel = message.guild.channels.cache.get(r.roomId);
            deleteChannel.delete()
            serverConfig.secretRoom.rooms.splice(indexValue,1)
            functions.updateConfig(serverConfig,message.guild.id);
            message.channel.send(`Secret Room belonging to <@${argRoom}> has successfully been removed`);
            return;
        }
    })
}

async function modifyCategory(message, serverConfig, argRoom){
    if(!message.guild.channels.cache.find(r => r.id === argRoom && r.type === "category"))
        message.channel.send("Error: cannot find category on server");
    else {
        serverConfig.secretRoom.category = argRoom;
        message.channel.send("Category has been updated successfully");
        functions.updateConfig(serverConfig, message.guild.Id);
    }
    return;
}
