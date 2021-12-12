const Discord = require('discord.js');

//Custom modules
const config = require('./config.json');
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
    console.log('Locked and loaded!');
        //Verifies voice chat role
        client.guilds.fetch(config.server).then(guild => {
            guild.roles.fetch(config.voiceRole)
            .catch(e => {
                console.log(e)
                process.exit(1);
            });
        }).catch(e => {
            console.log(e + "\tUnable to find voice chat role on server")
            process.exit(1);
        });
        //Verifies category channel
        client.channels.fetch(config.roomCategory)
        .catch(e => {
            console.log(e + "\tUnable to find category on server")
            process.exit(1);
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
            //case("trigger"): triggers.add(message, args, config.prefix); break;
            //case("triggers"): triggers.list(message, args); break;
            case("room"): rooms.createRoom(message, config.roomCategory, config.roomName); break;
            case("rooms"): rooms.listRooms(message, message.guild.channels.cache.get(config.roomCategory)); break;
            default: return message.channel.send("Error: envalid command");
        }
    } else
        triggers.play(message, message.guild.channels.cache.get(config.roomCategory), config.voiceRole, assets);
})