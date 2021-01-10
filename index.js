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
    let serverConfigNew;
    try{
        serverConfigNew = JSON.parse(fs.readFileSync("json/" + guildId + ".json"));
    }
    catch(err){
        serverConfigNew = {"guessNumber": newNumber(),"secretRooms": [0],"modRoles": [0]};
        console.log("config file for server " + guildId + " does not exist. Creating a new one")
        fs.writeFileSync("json/"+ guildId + ".json", JSON.stringify(serverConfigNew, null, 2));
    }
    const serverConfig = serverConfigNew;

    //Checks if bot sent the message
    if (message.author.bot) {
        return;
    }

    //Commands
    else if(message.content.startsWith(prefix)) {
    
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        //console.log(args);
        const command = args.shift().toLowerCase();    

        switch (command) {
            case "test":
                console.log(serverConfigNew);
                if(!hasMod(memberRoles, serverConfigNew.modRoles)) {
                    message.channel.send("you don't have permissions to perform that command.")
                }
                else {
                    message.channel.send("you have a mod role");
                    }
                return;
            case "mod":
                if(!hasMod(memberRoles, serverConfigNew.modRoles)) {
                    message.channel.send("you don't have permissions to perform that command.")
                }
                return;
            case "help":
                message.channel.send("Available Commands\n\n" + "!admin - Try me\n" + "!help - Lists all available commands\n" + "!hint - Gives you a hint for the number\n" + "!whisper - Coming soon");
                return;
            case "hint":
                message.channel.send(hintNumber(serverConfigNew.guessNumber));
                return;
            case "owner":
                message.channel.send("The owner of the server is " + "<@" + guildOwner + ">");
            case "room":
                let argRoom;
                if(!hasMod(memberRoles, serverConfigNew.modRoles)) {
                    message.channel.send("You don't have permissions to perform that command.")
                    return;
                }
                try {
                    console.log(args[2])
                    argRoom = args[2].replace(/[^\w\s]/gi, '');
                }
                catch (err){
                    console.log("Channel formatting error (or doesn't exist)");
                    message.channel.send("Please format the command properly e.g. !room add #general")
                    return;
                }
                if(message.guild.channels.cache.get(argRoom)=== undefined)
                {
                    message.channel.send("Please format the command properly e.g. !room add #general")
                    return;
                }
                switch(args[1]){
                    case "add":
                        if(isSecretRoom(argRoom, serverConfigNew.secretRooms)){
                            serverConfigNew.secretRooms.push(argRoom);
                            break;
                        }
                        else
                        {
                            message.channel.send("Room is already added");
                            return;
                        }
                    case "remove":
                        if(isSecretRoom(argRoom, serverConfigNew)){
                            serverConfigNew.secretRooms = removeRoom(argRoom, serverConfigNew);
                            break;
                        }
                        else{
                            message.channel.send("Room is not on the list")
                            return;
                        }
                    default:
                        message.channel.send("Please format the command properly e.g. !room add #general")
                        return;
                }
            case "whisper":
                return;
            default:
                message.channel.send("That command doesn't exist. Try again!");    
                return;
        }
    }

    //Triggers
    else if (!message.content.startsWith(prefix) && !isNumeric(message.content)) {
        let args = [];
        args =  message.content.toLowerCase().split(" ");
        let i = 0;
        
        while(i < args.length) {
           switch (args[i]) {
                case "cunt":
                    message.channel.send({files: ["https://i.imgur.com/YfTpN6L.jpg"]});
                    return;
                case "riccardo":
                    message.channel.send({files: ["https://i.imgur.com/IvElYDw.gif"]});
                    return;    
                case "sweden":
                    message.channel.send({files: ["https://i.imgur.com/npzZ1X5.jpg"]});
                    return;    
                default:
                    i++
                    break;
           }
        }
    }

    //Number guessing
    else if(isNumeric(message.content) && isSecretRoom(message.channel.id, serverConfigNew.secretRooms)) {
        switch(checkNumber(message.content, serverConfigNew.guessNumber)){
            case 1:
                message.channel.send("You guessed the right number. Congratulations!");
                serverConfigNew.guessNumber = serverConfigNew.guessNumber = newNumber();
                console.log("The new number is " + serverConfigNew.guessNumber);
                break;
            case 2:
                message.channel.send("Getting warmer!");
                return;                
            default:
                message.channel.send("You guessed the wrong number. Try again!");
                return;
        }
    }

    //Commits any new changes
    if (JSON.stringify(serverConfigNew) !== JSON.stringify(serverConfig))
    {
        console.log("Changes in file detected. Updating file");
        fs.writeFileSync("json/"+ guildId + ".json", JSON.stringify(serverConfigNew, null, 2));
    }
})

//General functions
function isArrayEmpty(n){
    if (n.length-1 === 0)
    return false;
}

//Permission functions
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

//Room commands
function isSecretRoom(n, o){    
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

function removeRoom(n, o){
    let newRoomList = o
    for(i = 0; i < o.length; i++){
        if (n == o[i]){
            newRoomList.splice(i,1)
            return newRoomList;
        }
    }
}

//number functions
function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

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