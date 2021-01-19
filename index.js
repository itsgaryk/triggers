const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
//const { type } = require('os');

//Custom modules
//-Number guessing Game
const numberGuess = require('./guess.js');

//-Triggers
const triggers = require('./triggers.js')

//Command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command =  require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.login(token);
client.once('ready', () => {
    console.log('Locked and loaded!')    

});

//Creates a new JSON file when the guild adds the bot
client.on('guildCreate', guild => {
    newConfig(guild.id)
})

//Event - On Promise ready. Sets the statusu of the bot
client.on('ready', () => {
            client.user.setStatus("Online");
            client.user.setActivity("!help for commands", {type: "LISTENING"});
})

//Event - Status change to voice channels
client.on('voiceStateUpdate', (oldState, newState) => {
    const serverConfig = JSON.parse(fs.readFileSync(`json/${newState.guild.id}.json`));

    //Ignores dev channel if client is live bot
    if((newState.channelID === "798573191936081961" ^ oldState.channelID === "798573191936081961") && client.user.id === "793011221581660190") return;

    //Ignores all other channels if client is dev bot
    if((newState.channelID !== "798573191936081961" ^ oldState.channelID === "798573191936081961") && client.user.id === "795940893709959178") return;

    //Ignores radio channel if client is a bot
    if((newState.channelID === "801084828388687882" ^ oldState.channelID === "801084828388687882") && client.user.id !== "801086277029986325") return;

    //New radio channel
    if((newState.channelID === "801084828388687882" ^ oldState.channelID === "801084828388687882")){
        if (!newState.member.user.bot){
            console.log("adding radio role");
            newState.member.roles.add("801089401249202176")
            return;
        }

        if (newState.channelID === null && !newState.member.user.bot) {
            console.log("removing radio role");
            newState.member.roles.remove("801089401249202176");
            return;
        }
    }
    //All other channels
    else{
        if (((newState.channelID && !newState.member.roles.cache.find(r => r.id == serverConfig.voice) && !newState.member.user.bot))){
            console.log("adding role");
            newState.member.roles.add(serverConfig.voice)
            return;
        }

        if (newState.channelID == null && !newState.member.user.bot) {
            console.log("removing role");
            newState.member.roles.remove(serverConfig.voice);
            return;
        }
    }
});

//Event - When a message has been sent
client.on('message', async message => {
    //Loads server config file. Creates new if it doesn't already exist.
    const serverConfig = await getConfig(message.guild.id);

    //Ignores the message if sent from a bot
    if (message.author.bot) return;

    //Commands
    if(message.content.startsWith(prefix)) {  
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        //Removes the first element of args and puts it in command
        const command = args.shift();
        try {
            switch(command){
                case "brb":
                    client.users.fetch(message.author.id)
                    .then(r => client.commands.get("brb").execute(message, r))
                    break;
                case "help":
                    client.commands.get("help").execute(client.commands);
                    break;
                default:
                    client.commands.get(command).execute(message, args, serverConfig);
            }
            return;
        }
        catch (error){
            console.error(error)
        }
    }

    //Number guessing
    if (!isNaN(message.content) && serverConfig.secretRoom.rooms.find(r => r.roomId = message.channel.id))
    numberGuess.checkNumber(message, serverConfig, message.content)
    
    //Triggers
    if (!message.content.startsWith(prefix) && isNaN(message.content))
        triggers.detectTrigger(message, serverConfig)
})

async function newConfig(guildId){
    const serverConfig = {"guessNumber": (Math.floor(Math.random()*100)+1).toString(),"secretRoom":{"name":"secret-room","categoryID":undefined,"rooms":[]},"modRoles": [], "triggers":[], "voice": undefined};
    fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
    console.log("new config created")
}

async function getConfig(guildId){
    try { return JSON.parse(fs.readFileSync(`json/${guildId}.json`)); }
    catch(err){
        console.log(`config file for server ${guildId} does not exist. Creating a new one`)
        newConfig(guildId);
        return;
    }
}