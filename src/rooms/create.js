module.exports = function (message, args, category, roomName) {
    //Returns the channel object if the member has a secret room

    }

    const createRoom = member => {
        //Verify argument
        if(getRoom(member))
            message.channel.send(`Error: secret room already exists - ${getRoom(member)}`);
        else{
            message.guild.channels.create(roomName, {"parent" : category.id})
            .then(newChannel => {
                newChannel.updateOverwrite(member.id,{VIEW_CHANNEL: true});
                message.channel.send(`Secret Room ${newChannel} has successfully been created`);
            });
        }
    }

    if(args[0] === undefined)
        return createRoom(message.author);

    switch(args[0]){
        // case("add"):
        //     if(args[1] === undefined) break;
        //     else createRoom(args[1]); break;
        case("remove"):
            if(args[1] === undefined) break;
            else{
                getRoom().then(room =>  {
                if(room)
                    room.delete().then(() => message.channel.send(`Secret Room belonging to ${arg[1]} has successfully been removed`)) 
                else 
                    message.channel.send("Member does not have a secret room");
                })
            }
            break;
        default: return message.channel.send("Error: invalid arguments")
    }
}