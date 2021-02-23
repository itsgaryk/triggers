const Discord = require('discord.js');
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
const fs = require('fs');

//Custom modules
const config = require('./config.json');
const functions = require ('./functions.js');

//Command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command =  require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(config.token);
client.once('ready', () => {
    console.log('Locked and loaded!')    
});

//Event - when a reaction is added to a message
client.on('messageReactionAdd', async (reaction, user) => {
    try {
        const emoji = reaction.emoji;
        const message = reaction.message;
        if(emoji.name === "😀")
            message.channel.send("😀");
    } catch (error) {
        console.error('Something went wrong when fetching the message: ', error);
        // Return as `reaction.message.author` may be undefined/null
        return;
    }
})

//Event - Status change to voice channels
client.on('voiceStateUpdate', (oldState, newState) => {
    //const config = JSON.parse(fs.readFileSync(`json/${newState.guild.id}.json`));

    //Ignores dev channel if client is live bot
    if((newState.channelID === "798573191936081961" ^ oldState.channelID === "798573191936081961") && client.user.id === "793011221581660190") return;

    //Ignores all other channels if client is dev bot
    if((newState.channelID !== "798573191936081961" ^ oldState.channelID === "798573191936081961") && client.user.id === "795940893709959178") return;

    //New radio channel
    if((newState.channelID === "801084828388687882" ^ oldState.channelID === "801084828388687882")){
        if (((newState.channelID && !newState.member.roles.cache.find(r => r.id == "793013387612520468") && !newState.member.user.bot))){
            console.log("adding radio role");
            newState.member.roles.add([config.radioRole, config.voiceRole])
        }

        if (newState.channelID === null && !newState.member.user.bot) {
                console.log("removing radio role");
                newState.member.roles.remove([config.radioRole, config.voiceRole]);
            }
    } 
    //Voice Chat role   
    else{
        if (((newState.channelID && !newState.member.roles.cache.find(r => r.id == config.voiceRole) && !newState.member.user.bot))){
            console.log("adding role");
            newState.member.roles.add(config.voiceRole)
            return;
        }

        if (newState.channelID == null && !newState.member.user.bot) {
            console.log("removing role");
            newState.member.roles.remove(config.voiceRole);
            return;
        }
    }
});

//Event - When a message has been sent
client.on('message', async message => {
    //Ignores the message if sent from a bot
    if(message.author.bot || message.channel.type === "dm" ) return;
    //Commands
    if(message.content.startsWith(config.prefix)) {  
        //Removes the first element of args and puts it in command
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift();
        //special exceptions
        try {
            client.commands.get(command).execute(message, config, functions, args);
        } catch (error){
            console.error("Command does not exist", error); }
    } else
        functions.trigger(message);
})