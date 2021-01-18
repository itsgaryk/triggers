//OpusEncoder for voice
const {OpusEncoder} = require('@discordjs/opus');
// Specify 48kHz sampling rate and 2 channel size.
const encoder = new OpusEncoder(48000, 2);

// Encode and decode.
//const encoded = encoder.encode(buffer);
//const decoded = encoder.decode(encoded);

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();
const {prefix, token} = require('./config.json');
//const { type } = require('os');


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
    if((newState.channelID == "798573191936081961" ^ oldState.channelID == "798573191936081961") && client.user.id == "793011221581660190") return;

    //Ignores all other channels if client is dev bot
    if((newState.channelID != "798573191936081961" ^ oldState.channelID == "798573191936081961") && client.user.id == "795940893709959178") return;

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
});

//Event - When a message has been sent
client.on('message', async message => {

    //Guild and Member constants
    const guildId = message.guild.id;
    const guildOwner  = message.guild.owner.user.id;
    const memberRoles = message.member.roles.cache;
    const clientUserObject = await client.users.fetch(message.author.id);

    //Loads audio file names from server folder
    //const commandFiles = fs.readdirSync('./audio/${guildId}/').filter(file => file.endsWith('.mp3'));


    //Loads server config file. Creates new if it doesn't already exist.
    let serverConfig;
    try { serverConfig = JSON.parse(fs.readFileSync(`json/${guildId}.json`)); }
    catch(err){
        console.log(`config file for server ${guildId} does not exist. Creating a new one`)
        newConfig(guildId);
        return;
    }

    //Checks if bot sent the message
    if (message.author.bot) return;

    //Commands
    if(message.content.startsWith(prefix)) {
        
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();

        try {
            switch(command){
                case "help":
                    client.commands.get("help").execute(client.commands);
                    return;
                default:
                    client.commands.get(command).execute(message, args, serverConfig);
                    return;
            }
        }
        catch (error){
            console.error(error)
        }
    }
        
    //Triggers
    if (!message.content.startsWith(prefix) && !isNumber(message.content)) {
        let args = message.content.toLowerCase().split(" ");
        //Voice Triggers
        if (serverConfig.secretRoom.rooms.find(r => r.roomId == message.channel.id))
        {    
            const getCommands = (fileList) => {
                let newList = [];
                for(let i =0;i < fileList.length; i++){
                    let newWord = fileList[i].split(".")
                    newList[i] = newWord[0];
                }
                return newList
            }
            const fileList = fs.readdirSync("audio/")
            const voiceCommands = getCommands(fileList)

            const connection = await message.member.voice.channel.join();
            //if (message.member.voice.channel) {}
            if(voiceCommands.length > 0)
            for(let i =0; i < voiceCommands.length; i++) {
                if (args[0] === voiceCommands[i]){
                    const dispatcher = connection.play('audio/'+fileList[i]);
                    dispatcher.on('start', () => {});
                    
                    dispatcher.on('finish', () => { return; });
                    dispatcher.on('error', console.error);
                }
            }
            return;
        }
        else{
            for(let i =0; i < args.length; i++) {
                for (let j = 0; j < serverConfig.triggers.length; j++) {
                    if (args[i] === serverConfig.triggers[j].triggerWord){
                        message.channel.send({files: [serverConfig.triggers[j].triggerLink]});
                        return;
                    }
                }
            }
        }
    }
})

//General functions
async function newConfig(guildId){
    let serverConfig = {"guessNumber": newNumber(),"secretRoom":{"name":"secret-room","categoryID":null,"rooms":[]},"modRoles": [], "triggers":[], "voice": null};
    fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
}

async function updateConfig(serverConfig,guildId){
        fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
        console.log(`Updated config file for server ${guildId}`);
}

function isNumber(n){
    return !isNaN(parseInt(n));
}

function hasSpecialCharaters(n){
    const specialCharacters = /[^a-zA-Z0-9\-\/]/;
    if(specialCharacters.test(n)) return true;
    else return false;
}

function removeNonNumericCharacters(n){
    if (hasSpecialCharaters(n)) return n.replace(/[^\w\s]/gi, '')
    else return n;
}

async function isGuildMember(guildMembers, memberId){
    try{
        // Try fetching the member. If it can't find him, will throw a rejection.
        await guildMembers.fetch(memberId);
        // We passed the fetching, so the ID was correct, and everything worked out.
        return true;
      }
      catch(e){
        console.log(e.message, e.code)
        // Check what the error was, and the error-code 
        //(see: https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes)
        //-- should be "10007: Unknown member"
        if( e instanceof Discord.DiscordAPIError && e.code === 10007 ) return false;
        if( e instanceof Discord.DiscordAPIError && e.code === 10013 ) return false;
        // Was some unrelated error, rethrow.
        throw(e);
    }
}

async function validateLink(n){
    try{
        const website = new URL(n)
        return true;
    }
    catch (e) {
        console.log(e.message, e.code)
        return undefined;
        throw(e);
    }

}

function hasMod(memberRoles,modRoles){
let valueCondition = 0;
    if (modRoles.length > 0 || memberRoles.length > 0){
        for(let i =0; i < modRoles.length; i++){
            memberRoles.forEach(r => {if(r.id === modRoles[i]) valueCondition++;});
        }
    }
    if(valueCondition > 0) return true;
    else return false;
}

//Sorts array into alphabetical order
function sortArray(n){
    if(n == 0) return;
    return n.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
}