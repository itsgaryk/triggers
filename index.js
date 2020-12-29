const Discord = require('discord.js');
const { prefix, token} = require('./config.json');
const client = new Discord.Client();
var guessNumber = newNumber();

console.log("The 1st number is " + guessNumber);

client.login(token);
client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {

    //console.log(isNumeric(message.content));
    //console.log(message.content);
    /*
    if(message.content.startsWith(`${prefix}kick`)){
        message.channel.send("fuck you " + message.author.username + " <@" + message.author + ">")
    }
    */

    if(message.content.startsWith(`${prefix}hint`) && guessNumber > 50){
            message.channel.send("The number is higher than 50 and lower than 100")
    }
    
    else if(message.content.startsWith(`${prefix}hint`) && guessNumber < 51){
            message.channel.send("The number is lower than 51 and higher than 0")
    }

    if(isNumeric(message.content) && message.content == guessNumber){
        message.channel.send("you guessed the right number!")
        guessNumber = newNumber();
        console.log("The new number is " + guessNumber);
    }
    else if(isNumeric(message.content) && (guessNumber - (message.content) >= -10) && (guessNumber - (message.content) <= 10))
    {
        message.channel.send("Getting warmer!")
    }
    else if(isNumeric(message.content) && message.content != guessNumber)
    {
        message.channel.send("You guessed the wrong number. Try again!");
    };
})

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function newNumber(){
    return Math.floor(Math.random() * 100);
}