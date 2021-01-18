module.exports = {
	name: 'rooms',
    description: 'Ping!',
    args: false,
	execute(message, args, serverConfig) {
        if(serverConfig.secretRoom.length == 0) message.channel.send("No secret rooms have been added");
        else{
            //message.channel.send("All channels as secret rooms\n```", getArray(serverConfig.secretRoom) , "```");
            let roomList= [];
            serverConfig.secretRoom.forEach(room => roomList.push(`<#${room.roomId}>\t-\t<@${room.userId}>`))
            message.channel.send("Secret Rooms\n\n", roomList);
        }
        return;
	},
};