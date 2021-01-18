module.exports = {
	name: 'room',
    description: 'Creates a secret room',
    args: true,
	execute(message, args, serverConfig) {
        // eslint-disable-next-line no-case-declarations
        const hasRoomConfig = async secretRoom => { 
            if (secretRoom.categoryId)
                return "Error: no category configured. See !help"
        
            if(!secretRoom.name)
                return ("Error: no room name configured. See !help")
            
            return true;
        }

        //message.guild.channels, message.guild.members, argRoom, serverConfig.secretRoom
        // eslint-disable-next-line no-case-declarations
        const newRoom = async (channels, members, member, secretRoom) => {
            try{
                if (secretRoom.rooms.forEach(r => {if(r.userId === member) return true}))
                    return`Error: member already has a secret room`
                const newChannel = await channels.create(secretRoom.name, {"parent" : secretRoom.categoryId})
                const memberObject = await members.fetch(member)
                newChannel.updateOverwrite(memberObject,{
                        VIEW_CHANNEL: true})
                return newChannel.id;
            }
            catch(e) {
                console.log(e.message, "\t", e.code)
                if(e instanceof Discord.DiscordAPIError && (
                    (e.code == 10003) ||
                    (e.code == 10007) ||
                    (e.code == 10013) 
                    )) return null;
        
                throw(e);
            }  
        }

        if(!hasMod(memberRoles, serverConfig.modRoles) && message.author.id != guildOwner)
            {message.channel.send("Error: you don't have permission to perform that command."); return;}
        if(args[0] == false || args[1] == false)
                message.channel.send("Error: missing arguments. See !help");

        const argRoom = removeNonNumericCharacters(args[1]);                
        const isMember = await isGuildMember(message.guild.members, argRoom)
        const memberName = await (await message.guild.members.fetch(argRoom)).nickname;
        
        switch(args[0]){
            case false:
                if(!hasRoomConfig(serverConfig.secretRoom, message.channel)) return;

                if(serverConfig.secretRoom.rooms.find(r => r.userId === message.author.id))
                    message.channel.send(`Error: You already have a secret room. Don't be greedy!`);
                else {
                    const newChannel = await newRoom(message.guild.channels.guild.channels, message.guild.members, argRoom, serverConfig.secretRoom)
                    serverConfig.secretRoom.rooms.push({"roomId": newChannel, "userId": argRoom});
                    message.channel.send(`Here's your shiny new Secret Room. <#${newChannel}>`);
                    updateConfig(serverConfig,guildId);
                }
                return;
            case "add":
                if (isMember == false)
                { message.channel.send("Error: invalid user"); return; }

                if(!hasRoomConfig(serverConfig.secretRoom, message.channel)) return;

                if(serverConfig.secretRoom.rooms.find(r => r.userId === message.author.id))
                { message.channel.send(`Error: Member already has a secret room`); return; }

                // eslint-disable-next-line no-case-declarations
                const newChannel = await newRoom(message.guild.channels.guild.channels, message.guild.members, argRoom, serverConfig.secretRoom)
                serverConfig.secretRoom.rooms.push({"roomId": newChannel, "userId": argRoom});
                message.channel.send(`Secret Room <#${newChannel}> has successfully been created for **${memberName}**`);
                updateConfig(serverConfig,guildId);
                return;
            case "category":
                if(!message.guild.channels.cache.find(r => r.id === argRoom && r.type === "category"))
                    message.channel.send("Error: cannot find category on server")
                else if(serverConfig.secretRoom.categoryId === argRoom)
                    message.channel.send("Error: category is already configured")
                else {
                    serverConfig.secretRoom.categoryId = argRoom;
                    message.channel.send("Category has been updated successfully")
                    updateConfig(serverConfig, guildId)
                }
                return;
            case "name":
                serverConfig.secretRoom.name = args[2];
                updateConfig(serverConfig, guildId)
                message.channel.send("Secret Room name has successfully been updated to ", argRoom);
                return;
            case "remove":
                if (isMember == false)
                { message.channel.send("Error: invalid user"); return; }
                
                if(serverConfig.secretRoom.rooms.find (r => r.userId === argRoom) ^ serverConfig.secretRoom.rooms.length < 1)
                message.channel.send("Error: member does not have a secret room")
                else{
                    serverConfig.secretRoom.rooms.forEach((r, indexValue) => {
                        if(r.userId === argRoom && message.guild.channels.cache.get(r.roomId))
                        {
                            const deleteChannel = message.guild.channels.cache.get(r.roomId);
                            deleteChannel.delete()
                            serverConfig.secretRoom.rooms.splice(indexValue,1)
                            message.channel.send(`Secret Room belonging to **${memberName}** has successfully been removed`);
                            return;
                        }
                    })

                    updateConfig(serverConfig,guildId);
                }
                return;
            default:
                message.channel.send("Error: invalid argument after room. See !help")
                return; 
        }  
	},
};