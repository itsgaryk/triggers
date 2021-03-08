module.exports = function (message, category){
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