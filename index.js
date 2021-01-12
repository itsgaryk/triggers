//Filesystem required for reading and writing files
const fs = require('fs');

const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();

//loading command files
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
/*
for (const file of commandFiles) {
    const command = require("./commands/${file}");
}
*/

client.login(token);
client.once('ready', () => {
    console.log('Locked and loaded!')    
});

//Configuring bot activity
client.on('ready', () => {
    client.user.setStatus("Online");
    client.user.setActivity("!help for commands", {type: "LISTENING"});
  })

//Role assignment for voice channel join
client.on('voiceStateUpdate', (oldState, newState) => {
    // Triggered if the user left a channel
    if (!newState.channel || !newState.member){
        newState.member.roles.remove("793013387612520468")
    }

    // Triggered when the user joined a specific channel
    //const testChannel = newState.guild.channels.cache.find(c => c.name === 'One');
    //if (newState.channelID === testChannel.id) {

    
    //Triggered if the user joined a channel
        if (!newState.channel || !newState.member){
            // Add the role to the user if they don't already have it
            if (!newState.member.roles.cache.has("793013387612520468")) newState.member.roles.add("793013387612520468");
    }
});

//Event Message send
client.on('message', message => {
    
    //Variables
    const guildId = message.guild.id.toString();
    const guildOwner  = message.guild.owner.user.id.toString();
    const memberRoles = message.member.roles.cache;

    //Loads audio file names from server folder
    //const commandFiles = fs.readdirSync('./audio/${guildId}/').filter(file => file.endsWith('.mp3'));


    //Loads server config file. Creates new if it doesn't already exist.
    let serverConfig;
    try{
        serverConfig = JSON.parse(fs.readFileSync(`json/${guildId}.json`));
    }
    catch(err){
        serverConfig = {"guessNumber": newNumber(),"secretRooms": [],"modRoles": [], "triggers":[], "voice": ""};
        console.log(`config file for server ${guildId} does not exist. Creating a new one`)
        fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
    }

    //Checks if bot sent the message
    if (message.author.bot) return;

    //Commands
    else if(message.content.startsWith(prefix)) {
            
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift();

        switch (command) {
            case "test":
                if(message.author.id != guildOwner) return;
                
                //console.log ("Roles Map: " + message.member.roles.cache);
                //console.log(`Hello ${guildId} welcome back`)

                console.log ("Roles IDs: " + message.member.roles.cache.map(r => `${r.id}`));
                console.log ("Roles Names: " + message.member.roles.cache.map(r => `${r.name}`));
                
                return;
            case "mod":
                if(!hasMod(memberRoles, serverConfig.modRoles) && message.author.id != guildOwner) {
                    message.channel.send("You don't have permission to perform that command.")
                    return;
                }
                let argMod;
                switch (args[1]){
                    case undefined:
                        message.channel.send("Error: no role added e.g. !mod add @mod");
                        return;
                    default:
                        argMod = args[1].replace(/[^\w\s]/gi, '');
                        if (!isNumber(argMod)){
                            message.channel.send("Error: Not a number. Please submit a valid role");
                            return;
                        }
                        if (message.guild.roles.cache.get(argMod) === undefined){
                            message.channel.send("Error: Role does not exist on this server. Please submit a valid role")
                            return;
                        }
                        break;
                }
                switch(args[0]){
                    case undefined:
                        message.channel.send("Error: no add/remove command e.g. !role add @mod");
                        return;
                    case "add":
                        if(checkId(argMod, serverConfig.modRoles)) {
                            message.channel.send("Error: Role is already added");
                            return;
                        }
                        else {
                            serverConfig.modRoles = addId(argMod, serverConfig.modRoles);
                            message.channel.send(`Role <@&${argMod}> has successfully been added`);
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                    case "remove":
                        if(checkId(argMod, serverConfig.modRoles)) {
                            serverConfig.modRoles = removeId(argMod, serverConfig.modRoles);
                            message.channel.send(`Role <@&${argMod}> has successfully been removed`);
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                        else {
                            message.channel.send("Role is not on the list")
                            return;
                        }
                    default:
                        message.channel.send("Error: no argument after room e.g. !room add #general")
                        return;
                }
            case "help":
                message.channel.send("Available Commands\n\n" + "!help - Lists all available commands\n" + 
                "!mod [add/remove] [role] - Manage your mods (mod only)\n" + 
                "!hint - Gives you a hint for the number\n" + 
                "!room [add/remove] [channel] - Manage your secret rooms (mod only)\n" +
                "!trigger [add/remove] [word] [URL] - Manage your trigger words (remove is mod only)\n" +
                "!triggers - displays all available triggers");
                return;
            case "hint":
                message.channel.send(hintNumber(serverConfig.guessNumber));
                return;
            case "owner":
                message.channel.send(`The owner of the server is <@${guildOwner}>`);
            case "room":
                if(!hasMod(memberRoles, serverConfig.modRoles) && message.author.id != guildOwner) {
                    message.channel.send("You don't have permission to perform that command.")
                    return;
                }
                let argRoom;
                switch (args[1]){
                    case undefined && args[0] == "list":
                        break;
                    case undefined:
                        message.channel.send("Error: no room added e.g. !room add #general");
                        return;
                    default:
                        argRoom = args[1].replace(/[^\w\s]/gi, '');
                        if (!isNumber(argRoom)){
                            message.channel.send("Error: Not a number. Please submit a valid room");
                            return;
                        }
                        if (message.guild.channels.cache.get(argRoom) === undefined){
                            message.channel.send("Error: Channel ID does not exist on this server. Please submit a valid channel")
                            return;
                        }
                        break;
                }
                switch(args[0]){
                    case undefined:
                        message.channel.send("Error: no add/remove command e.g. !room add #general");
                        return;
                    case "add":
                        if(checkId(argRoom, serverConfig.secretRooms)){
                            message.channel.send(`Error: channel <#${argRoom}> is already added`);
                            return;
                        }
                        else
                        {
                            serverConfig.secretRooms = addId(argRoom, serverConfig.secretRooms);
                            message.channel.send(`Channel <#${argRoom}> has successfully been added`);
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                    case "remove":
                        if(checkId(argRoom, serverConfig.secretRooms)){
                            serverConfig.secretRooms = removeId(argRoom, serverConfig.secretRooms);
                            message.channel.send(`Channel <#${argRoom}> has successfully been removed`);
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                        else{
                            message.channel.send("Channel is not on the list")
                            return;
                        }
                    default:
                        message.channel.send("Error: no argument after room e.g. !room add #general")
                        return;
                }
            case "rooms":
                    message.channel.send(`Here's a list of all channels as secret rooms\n${serverConfig.secretRooms}`);
                    return;
            case "trigger":
                switch (true){
                    case args[0] === undefined:
                        message.channel.send("Error: did not include add/remove e.g. !trigger add funny https://website.com/image.jpg");
                        return;
                    case args[1] === undefined:
                        message.channel.send("Error: did not include a trigger word e.g. !trigger add funny https://website.com/image.jpg");
                        return;
                    default:
                        if(hasSpecialCharaters(args[1])){
                            message.channel.send("Error: trigger word cannot contain special characters");
                            return;
                        }
                        if(isNumber(args[1])){
                            message.channel.send("Error: trigger word cannot be a number (you can mix alphanumeric values)");
                            return;
                        }
                }

                let triggerWord = args[1];
                let triggerLink = args[2];
                let argTrigger = {triggerWord, triggerLink};

                switch (args[0]){
                    case "add":
                        let url;
                        try{
                            url = new URL(args[2])
                        }
                        catch (_) {
                            message.channel.send("Error: invalid URL e.g. https://www.website.com/image.jpg")
                            return;
                        }
                        
                        let urlSplit = args[2].split(".");
                        let validTypes = ["bmp", "jpg", "png", "jpeg", "gif"];
                        if (!validateURL(urlSplit, validTypes)){
                            message.channel.send("Error: must provide direct link to image e.g. https://www.website.com/image.jpg")
                            return;
                        }

                        if(checkTrigger(argTrigger, serverConfig.triggers)) {
                            serverConfig.triggers = addId(argTrigger, serverConfig.triggers);
                            message.channel.send(`Trigger **${triggerWord}** successfully added`);
                            updateConfig(serverConfig, guildId);
                            return;
                        }
                        else{
                            message.channel.send(`Trigger **${triggerWord}** already exists`);
                            return;
                        }
                    case "remove":
                        if(checkTrigger(argTrigger, serverConfig.triggers)) {
                            serverConfig.triggers = removeTrigger(triggerWord, serverConfig.triggers);
                            message.channel.send(`Trigger **${triggerWord}** successfully removed`);
                            updateConfig(serverConfig, guildId);
                        }
                        else{
                            message.channel.send("Error: trigger word does not exist on the server")
                        }
                            return;                        
                    default:
                        return;
                
                }
            case "triggers":
                if(serverConfig.triggers.length == 0){
                    message.channel.send("No triggers have been added yet to the server")
                    return;
                }
            let a = "Available triggers\n```"
                for(i =0; i < serverConfig.triggers.length; i++){
                    a = a + serverConfig.triggers[i].triggerWord + " "
                    if(i == serverConfig.triggers.length-1){
                        a = a + "```"
                    }
                }
                message.channel.send(a);
                return;
            case "voice":
                return;
            default:
                message.channel.send("Error: invalid command. See !help for a list of available commands");    
                return;
        }
    }
    //Triggers
    else if (!message.content.startsWith(prefix) && !isNumber(message.content)) {
        let args = message.content.toLowerCase().split(" ");
        for(i = 0; i < args.length; i++) {
            for (j = 0; j < serverConfig.triggers.length; j++) {
                if (args[i] === serverConfig.triggers[j].triggerWord){
                    message.channel.send({files: [serverConfig.triggers[j].triggerLink]});
                    return;
                }
            }
        }
    }

    //Number guessing
    else if(isNumber(message.content) && checkId(message.channel.id, serverConfig.secretRooms)) {
        switch(checkNumber(message.content, serverConfig.guessNumber)){
            case 1:
                message.channel.send("You guessed the right number. Congratulations!");
                serverConfig.guessNumber = serverConfig.guessNumber = newNumber();
                console.log(`Number guessed on ${guildId}. New number is ${serverConfig.guessNumber}`);
                updateConfig(serverConfig, guildId);
                break;
            case 2:
                message.channel.send("Getting warmer!");
                return;                
            default:
                message.channel.send("You guessed the wrong number. Try again!");
                return;
        }
    }
})

//General functions

//n = serverConfig, o = GuildID
function updateConfig(n,o){
        fs.writeFileSync("json/"+ o + ".json", JSON.stringify(n, null, 2));
        console.log(`Updated config file for server ${o}`);
}
function isArrayEmpty(n){
    if (n === undefined || n.length == 0) return true;
    else return false;
}

function isNumber(n){
    return !isNaN(parseInt(n));
}

function hasSpecialCharaters(n){
    const specialCharacters = /[^a-zA-Z0-9\-\/]/;
    if(specialCharacters.test(n)) return true;
    else return false;
}

//Role functions
function hasMod(n,o){
    if (isArrayEmpty(o)) return false;
    for(i = 0; i < o.length; i++){
        if (n.find(r => r.id == o[i])) return true;
    }
    return false;
}

//Trigger functions
function checkTrigger(n, o){
    if (isArrayEmpty(o)) return true;
    for(i = 0; i < o.length; i++){
        if (n.triggerWord == o[i].triggerWord) return false;
    }
    return true;
}

function removeTrigger(n, o){
    let newList = o
    for(i = 0; i < o.length; i++){
        if (n == o[i].triggerWord){
            newList.splice(i,1)
            return newList;
        }
    }
}

function validateURL(n, o){
    for(i=0; i < o.length; i++){
        if (n[n.length-1] === o[i]) return true;
    }
    return false;
}

//Array functions
//n = user submitted array  o = serverConfig.[array]
function checkId(n, o){    
    if (isArrayEmpty(o)) return 0;
    for(i = 0; i < o.length; i++){
        if (n == o[i]) return true;
    }
    return 0;
}

function removeId(n, o){
    let newList = o
    for(i = 0; i < o.length; i++){
        if (n == o[i]){
            newList.splice(i,1)
            return newList;
        }
    }
}

function addId(n, o) {
    o.push(n)
    return o;
}

//Number functions
//n = user subimitted, o = actual number
function checkNumber(n, o){
    switch(true){
        case n == o:
            return 1;
        case n > o-10 || n < o+10:
            return 2;
        default:
            return 3;
    }
}

function hintNumber(n) {
    if (n > 50) return("Here's your hint. The number is between 51 and 101");
    else return("Here's your hint. The number is betweeen 1 and 50");
}

function newNumber(n) {
    return Math.floor(Math.random()*100)+1;
}