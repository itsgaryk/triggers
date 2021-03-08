module.exports =   member =>{
    for(const child of category.children){
        const channel = message.guild.channels.cache.get(child[0]);
        for(const role of channel.permissionOverwrites){
            //checks if ID is the member's ID
            if (role[0] === member.id)
                return channel;
        }
    }
}