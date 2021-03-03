const {roomCategory, roomName} = require("../config.json");
const {isGuildMember} = require("../functions.js");

module.exports = {
	name: 'room',
    description: 'Creates a secret room',
    args: true,
	execute(message, args) {
        //Returns the channel object if the member has a secret room
        const getRoom = member =>{
            //checks if the message was posted in the member's room by the owner
            for(const child of message.guild.channels.cache.get(channelsroomCategory)){
                if(child.channel.permissionOverwrites.role.id.some(member.id))
                        return child;
            }
        }

        const createRoom = member => {
            //Verify argument
            if(room === undefined)
                message.channel.send(`Error: secret room already exists - ${getRoom(member)}`);
            else{
                message.guild.channels.create(roomName, {"parent" : roomCategory})
                .then(newChannel => {
                    newChannel.updateOverwrite(message.author,{VIEW_CHANNEL: true});
                    message.channel.send(`Secret Room ${newChannel} has successfully been created`);
                });
            }
        }
        //Removes rooms where the permission overwrite IDs are equal to the category channel permission overwrite IDs
        //This is useful when a member leaves the server
        //Another option would be to have a category channel for archived secret rooms. And !room cleanup moves the channel
        const cleanRooms = () => {

        }

        if(args[0] === undefined){
            createRoom(message.author);
        }

        switch(args[0]){
            case("add"):
                if(args[1] === undefined) break;
                createRoom(args[1]); break;
            case("remove"):
                if(args[1] === undefined) break;
                getRoom().then(room =>  {
                    if(room === undefined)
                        message.channel.send("Member does not have a secret room");
                    else 
                        room.delete().then(() => message.channel.send(`Secret Room belonging to ${arg[1]} has successfully been removed`))
                })
            default: return message.channel.send("Error: invalid arguments")
        }
    },
};