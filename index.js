const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');

//Custom modules
const config = require('./config.json');
const triggers = require('./triggers.js')

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

//Event - On Promise ready. Sets the statusu of the bot
client.on('ready', () => {
            client.user.setStatus("Online");
            client.user.setActivity("!help for commands", {type: "LISTENING"});
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
    if(message.author.bot) return;

    //Commands
    if(message.content.startsWith(config.prefix)) {  
        //Removes the first element of args and puts it in command
        const args = message.content.slice(config.prefix.length).trim().split(/ +/);
        const command = args.shift();
        try {
            switch(command){
                case "sound":
                    client.commands.get("trigger").execute(message, config, args);
                    break;
                case "sounds":
                    client.commands.get("triggers").execute(message, config, args);             
                    break;
                default:
                    client.commands.get(command).execute(message, config, args);
            }
            return;
        }
        catch (error){
            console.error(error)
        }
    }
    else{
        triggers.execute(message, config);
    }
})