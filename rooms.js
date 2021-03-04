module.exports = {
    create,
    list
}
function create(message, args, category, roomName) {
    //Returns the channel object if the member has a secret room
    const getRoom = member =>{
        for(const child of category.children){
            const channel = message.guild.channels.cache.get(child[0]);
            for(const role of channel.permissionOverwrites){
                //checks if ID is the member's ID
                if (role[0] === member.id)
                    return channel;
            }
        }
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
    //Removes rooms where the permission overwrite IDs are equal to the category channel permission overwrite IDs
    //This is useful when a member leaves the server
    //Another option would be to have a category channel for archived secret rooms. And !room cleanup moves the channel
    const cleanRooms = () => {

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

function list(message, category){
    const roomOwners = [];
    if (roomCategory.children.size < 1)
        message.channel.send("No secret rooms have been added");
    else{
        for(const channel of category.children){
            for(const item of channel.permissionOverwrites){
                    //checks if ID is the member's ID
                    if (message.guild.members.cache.get(item.id) !== undefined){
                        const member = message.guild.members.cache.get(m.id)
                        roomOwners.push(member.displayName);
                    }
            }
        }
        message.channel.send("**Members with a Secret Room**\n" + "```" + roomOwners.join("\t") + "```");
    }
}