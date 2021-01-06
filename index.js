const Discord = require('discord.js');
const {prefix, token} = require('./config.json');
const client = new Discord.Client();
client.login(token);
client.once('ready', () => {
    console.log('Lock and loaded!')    
});

//Configuring bot activity
client.on('ready', () => {
    client.user.setStatus("Online");
    client.user.setActivity("!help for commands", {type: "LISTENING"});
  })

//Number game variable
var guessNumber = newNumber();
console.log("The 1st number is " + guessNumber);

//Event Message send
client.on('message', message => {
    //Variables
    const guildOwner  = message.guild.owner.user.id;
    //List of secret rooms - Sophie, Marcio, Perry, Sarah
    var channelList = ["789338729198256128", "789338885536088095", "789338994692325406", "789339231569969172"];

    //Checks if bot sent the message
    if (message.author.bot) {
        return;
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
    //Commands
    else if(message.content.startsWith(prefix)) {
    
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const command = args.shift().toLowerCase();    
        const memberRoles = message.member.roles.cache;
        
        switch (command) {
            case "help":
                message.channel.send("Available Commands\n\n" + "!admin - Try me\n" + "!help - Lists all available commands\n" + "!hint - Gives you a hint for the number\n" + "!whisper - Coming soon");
                return;
            case "hint":
                message.channel.send(hintNumber());
                return;
            case "owner":
                message.channel.send("The owner of the server is " + guildOwner);
            case "channel":
                message.channel.send("I will eventually do something");
                return;
            case "admin":
                if (!hasAdmin(memberRoles)) {
                    message.channel.send("You have no power here");
                }
                else {
                    message.channel.send("Sup G");
                }
            case "whisper":
                return;
            default:
                message.channel.send("That command doesn't exist. Try again!");    
                return;
        }
    }
    //Number guessing
    else if(isNumeric(message.content) && message.channel.name.toLowerCase() === "your-secret-room") {
        if(!checkNumber(message.content) && (getNumber() - message.content >= -10) && (getNumber() - message.content <= 10)) {
            message.channel.send("Getting warmer!");
        }
        else if(checkNumber(message.content)) {
            message.channel.send("You guessed the right number. Congratulations!");
            let i = 0;
            while(i < channelList.length) {
                client.channels.cache.get(channelList[i]).send("<@" + message.author + ">" + " guessed the right number! The number was " + getNumber() + ". A new number has been generated.");
                i++;
            }
            newNumber()
            console.log("The new number is " + getNumber());
        }
        else {
            message.channel.send("You guessed the wrong number. Try again!");
        }  
    }
})

//permission functions
function hasAdmin(n){
    return n.has("783739916088639548");
}

//number functions
function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNumber(){
    return guessNumber;
}

function checkNumber(n){
    return guessNumber == n;
}

function hintNumber() {
    if (getNumber() > 50) {
        return("Here's your hint. The number is higher than 50 and lower than 100")
    }
    else {
        return("Here's your hint. The number is lower than 51 and higher than 0")
    }    
}

function newNumber(){
    guessNumber = Math.floor(Math.random() * 100);
    return guessNumber;
}