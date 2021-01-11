const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();

//Filesystem required for reading and writing files
var fs = require('fs');

client.login(token);
client.once('ready', () => {
    console.log('Locked and loaded!')    
});

//Configuring bot activity
client.on('ready', () => {
    client.user.setStatus("Online");
    client.user.setActivity("!help for commands", {type: "LISTENING"});
  })

//Event Message send
client.on('message', message => {
    
    //Variables
    const guildId = message.guild.id;
    const guildOwner  = message.guild.owner.user.id;
    const memberRoles = message.member.roles.cache;
    
    //Loads server config file. Creates new if it doesn't already exist.
    let serverConfig;
    try{
        serverConfig = JSON.parse(fs.readFileSync("json/" + guildId + ".json"));
    }
    catch(err){
        serverConfig = {"guessNumber": newNumber(),"secretRooms": [],"modRoles": [], "triggers":[]};
        console.log("config file for server " + guildId + " does not exist. Creating a new one")
        fs.writeFileSync("json/"+ guildId + ".json", JSON.stringify(serverConfig, null, 2));
    }

    //Checks if bot sent the message
    if (message.author.bot) {
        return;
    }

    //Commands
    else if(message.content.startsWith(prefix)) {
            
        const args = message.content.toLowerCase().slice(prefix.length).trim().split(/ +/);
        const command = args.shift();

        switch (command) {
            case "test":
                if(!hasMod(memberRoles, serverConfig.modRoles) || message.author.id == guildOwner) {
                    console.log(serverConfig);
                }
                return;
            case "mod":
                if(!hasMod(memberRoles, serverConfig.modRoles) || message.author.id == guildOwner) {
                    message.channel.send("you don't have permissions to perform that command.")
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
                            message.channel.send("Role <@&" + argMod + "> has successfully been added");
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                    case "remove":
                        if(checkId(argMod, serverConfig.modRoles)) {
                            serverConfig.modRoles = removeId(argMod, serverConfig.modRoles);
                            message.channel.send("Role <@&" + argMod + "> has successfully been removed");
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
                message.channel.send("Available Commands\n\n" + "!help - Lists all available commands\n" + "!mod [add/remove] [role] - Manage your mods (mod only)\n" + "!hint - Gives you a hint for the number\n" + "room [add/remove] [channel] - Manage your secret rooms (mod only)");
                return;
            case "hint":
                message.channel.send(hintNumber(serverConfig.guessNumber));
                return;
            case "owner":
                message.channel.send("The owner of the server is " + "<@" + guildOwner + ">");
            case "room":
                if(!hasMod(memberRoles, serverConfig.modRoles) || message.author.id == guildOwner) {
                    message.channel.send("You don't have permissions to perform that command.")
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
                    case "list":
                        message.channel.send("Here's a list of all channels as secret rooms\n" + serverConfig.secretRooms);
                        return;
                    case "add":
                        if(checkId(argRoom, serverConfig.secretRooms)){
                            message.channel.send("Error: Channel is already added");
                            return;
                        }
                        else
                        {
                            serverConfig.secretRooms = addId(argRoom, serverConfig.secretRooms);
                            message.channel.send("Channel <#" + argRoom + "> has successfully been added");
                            updateConfig(serverConfig,guildId);
                            return;
                        }
                    case "remove":
                        if(checkId(argRoom, serverConfig.secretRooms)){
                            serverConfig.secretRooms = removeId(argRoom, serverConfig.secretRooms);
                            message.channel.send("Channel <#" + argRoom + "> has successfully been removed");
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
                case "trigger":
                    let argTrigger;
                    switch (args[1]){
                        case undefined:
                            message.channel.send("Error: no trigger added e.g. !trigger add #general");
                            return;
                        default:
                            if(isNumber(args[2])){
                                message.channel.send("Error: cannot use number as a trigger");
                            }
                            triggerWord = args[1]
                            triggerImage = args[2]
                    }
                    switch(args[0]){
                        case undefined:
                            message.channel.send("Error: no add/remove command e.g. !room add #general");
                            return;
                        case "list":
                            message.channel.send("Here's a list of all channels as secret rooms\n" + serverConfig.secretRooms);
                            return;
                        case "add":
                            if(checkId(argRoom, serverConfig.secretRooms)){
                                message.channel.send("Error: Channel is already added");
                                return;
                            }
                            else
                            {
                                serverConfig.secretRooms = addId(argRoom, serverConfig.secretRooms);
                                message.channel.send("Channel <#" + argRoom + "> has successfully been added");
                                updateConfig(serverConfig,guildId);
                                return;
                            }
                        case "remove":
                            if(checkId(argRoom, serverConfig.secretRooms)){
                                serverConfig.secretRooms = removeId(argRoom, serverConfig.secretRooms);
                                message.channel.send("Channel <#" + argRoom + "> has successfully been removed");
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
                break;
            default:
                message.channel.send("Invalid command. See !help for a list of available commands");    
                return;
        }
    }
    //Triggers
    else if (!message.content.startsWith(prefix) && !isNumber(message.content)) {
        let args = message.content.toLowerCase().split(" ");
        for(i = 0; i < args.length; i++) {
            for (j = 0; j < serverConfig.triggers.length; j++) {
                if (args[i] === serverConfig.triggers[j].triggerWord){
                    message.channel.send({files: ["images/" + guildId + "/" + serverConfig.triggers[j].triggerLink]});
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
                console.log("Number guessed on " + guildId + ". New number is" + serverConfig.guessNumber);
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
        console.log("Updated config file for server " + o);
}
function isArrayEmpty(n){
    if (n.length-1 > 0) {
        return false;
    }
    else {
        return true;
    }
}

function isNumber(n){
    return !isNaN(parseInt(n));
}

function hasMod(n,o){
    if (isArrayEmpty(o)){
        return 0;
    }
    for(i = 0; i < o.length; i++){
        if (n.find(r => r.id == o[i])){
            return 1;
        }
    }
    return 0;
}

//Array checking functions
//n = user submitted array  o = serverConfig.[array]
function checkId(n, o){    
    if (isArrayEmpty(o)){
        return 0;
    }
    for(i = 0; i < o.length; i++){
        if (n == o[i]){
            return true;
        }
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
    if (n == o){
        return 1;
    }
    else if (n > o-10 || n < o+10){
        return 2;
    }
    else{
        return 3;
    }
}

function hintNumber(n) {
    if (n > 50) {
        return("Here's your hint. The number is between 51 and 101");
    }
    else {
        return("Here's your hint. The number is betweeen 1 and 50");
    }    
}

function newNumber(n) {
    return Math.floor(Math.random()*100)+1;
}