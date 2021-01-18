module.exports = {
	name: 'test',
        description: 'Ping!',
        args: false,
	execute(message, args, serverConfig,) {
        message.channel.send("hello")
        console.log("suck your mum")
        message.channel.send(doSomething)
        //if(message.author.id != guildOwner) return;
        
        //console.log(await(await(message.guild.members.fetch(message.author.id)).nickname))
        //const content = message.content;
        //console.log(removeNonNumericCharacters(content))

        //console.log(Math.floor((Math.random()) * 50+1))

        //if (message.guild.channels.cache.find(r => r.id == ("798573191936081961"))) console.log("found the channel");
        //if (client.token.search("Nzkz")) console.log("Found the token!")

        //console.log ("Roles Map: " + message.member.roles.cache);
        //console.log(`Hello ${guildId} welcome back`)

        //console.log (serverConfig)
        //console.log ("Roles IDs: " + message.member.roles.cache.map(r => `${r.id}`));
        //console.log ("Roles Names: " + message.member.roles.cache.map(r => `${r.name}`));
        
        //console.log((message.guild.members.cache.get("174204688856514560")))

        //console.log(message.member.hasPermission("MANAGE_ROLES"))
        //console.log(message.guild.member("82919694574551040").hasPermission("MANAGE_ROLES"))
        //console.log(message.guild.members.cache.get("82919694574551040"))
        //console.log((message.guild.members.cache.get("793011221581660190"))
        //.hasPermission("MANAGE_ROLES"));
        
        //console.log(!hasMod(serverConfig.modRoles, memberRoles), message.author.id != guildOwner)

        //console.log(serverConfig.secretRoom)

        //console.log(serverConfig.triggers[0].triggerWord)
        //console.log(serverConfig.triggers.map(r => r.triggerWord))
        return;
	},
};

function doSomething(){
        return "x"
}