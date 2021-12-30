const Discord = require('discord.js');

//Custom modules
const config = require('./config.json');
config.enabled = 1;
const triggers = require ('./src/triggers');
const rooms = require("./src/rooms")

//Trigger Assets
const assets = triggers.verify()

const client = new Discord.Client({
    presence:{
        activity: {
            name: "!help for commands",
            type: "LISTENING"
        }
    },
    ws : {
        intents: [
            'GUILDS', 
            'GUILD_MESSAGES',
            'GUILD_PRESENCES',
            'GUILD_MESSAGE_REACTIONS',
            "GUILD_VOICE_STATES"
        ]
    }
});

client.login(config.token);
client.once('ready', () => {
        client.guilds.fetch(config.server).then(guild => {
            //Verifies voice chat role
            try{
                guild.roles.fetch(config.voiceRole)
                console.log("✅ Found the voice chat role on the server");
            }
            catch(e){
                console.log(e + "\t❌ Unable to find voice chat role on server")
                process.exit(1);
            }
            //Verifies category channel
            try{
                guild.channels.cache.get()
                console.log("✅ Found the category on the server");
            }
            catch(e){
                console.log(e + "\t❌ Unable to find category on server")
                process.exit(1);
            }
            //Verifies permissions
            try{
                let i = 0;
                if(guild.me.hasPermission("SEND_MESSAGES")) i++;
                if(guild.me.hasPermission("ADD_REACTIONS")) i++;
                if(guild.me.hasPermission("CONNECT")) i++;
                if(guild.me.hasPermission("MANAGE_MESSAGES"))i++;
                if(guild.me.hasPermission("MANAGE_ROLES")) i++;
                if(guild.me.hasPermission("MANAGE_CHANNELS")) i++;
                if(i === 6) console.log("✅ Permissions are setup");
            }
            catch(e){
                console.log(e + "\t❌ Missing bot permissions");
                process.exit(1);
            }
            finally{
                console.log('Locked and loaded!');
            }
        });
});

//Event - Status change to voice channels
//Adds the voice role to the user when joining a voice channel
client.on('voiceStateUpdate', (oldState, newState) => {
    if (((newState.channelID && !newState.member.roles.cache.find(r => r.id == config.voiceRole) && !newState.member.user.bot))){
        newState.member.roles.add(config.voiceRole)
        return; 
    }
//Removes the voice role to the user when leaving a voice channel
    if (newState.channelID == null && !newState.member.user.bot) {
        newState.member.roles.remove(config.voiceRole);
        return;
    }
});

//Event - When a message has been sent
client.on('message', message => {
    //Ignores the message if sent from a bot
    if(message.author.bot || message.channel.type === "dm" ) return;
    //Commands
    if(message.content.startsWith(config.prefix) || message.content.startsWith(client.user)){
        
        let argument;
        //Removes the first element of args and puts it in command
        if(message.content.startsWith(config.prefix))
            argument = config.prefix;
        else
            argument = client.user //.username
        const args = message.content.slice(argument.length).trim().split(/ +/);
        const command = args.shift();
        //special exceptions
        switch(command){
            case("toggle"):config.enabled = triggers.toggle(message, config); break;
            case("trigger"):triggers.create(message, args, config.prefix, assets); break;
            case("triggers"): triggers.list(message, args, assets); break;
            case("room"): rooms.createRoom(message, config.roomCategory, config.roomName); break;
            case("rooms"): rooms.listRooms(message, message.guild.channels.cache.get(config.roomCategory)); break;
            default: return message.channel.send("Error: envalid command");
        }
    } else
        if(config.enabled) triggers.play(message, message.guild.channels.cache.get(config.roomCategory), config.voiceRole, config.enabled, assets);
})