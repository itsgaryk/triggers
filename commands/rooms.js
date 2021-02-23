module.exports = {
	name: 'rooms',
    description: 'Ping!',
    args: false,
    /** * @param {Discord.Message} [message] */
	execute(message, config, functions, args) {
        const roomOwners = [];
        const category = message.guild.channels.cache.get(config.roomCategory)
        if (category.children.size < 1)
            message.channel.send("No secret rooms have been added");
        else{
            category.children.forEach(channel => {
                if (channel.name === config.roomName)
                channel.permissionOverwrites.forEach(m => {
                        //checks if ID is the member's ID
                        if (message.guild.members.cache.get(m.id) !== undefined){
                            const member = message.guild.members.cache.get(m.id)
                            roomOwners.push(member.displayName);
                        }
                })
            })
            message.channel.send("**Members with a Secret Room**\n" + "```" + roomOwners.join("\t") + "```");
        }
    },
};