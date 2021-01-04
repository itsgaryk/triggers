const Discord = require('discord.js');
const { prefix, token} = require('./config.json');
const client = new Discord.Client();
//Channel 1 = dev-zone
const channel01 = "793013215642124290";
var guessNumber = newNumber();

console.log("The 1st number is " + guessNumber);

client.login(token);
client.once('ready', () => {
    console.log('Ready!')
})

client.on('message', message => {

    if(isNumeric(message.content)) {
        if(message.channel.id === "793013215642124290" && isNumeric(message.content)) {
            message.channel.send("Please enter the number in your secret room");
        }    
        else if(message.content.startsWith(`${prefix}hint`) && getNumber() > 50) {
            message.channel.send("Here's your hint. The number is higher than 50 and lower than 100");
        }    
        else if(message.content.startsWith(`${prefix}hint`) && getNumber() < 51) {
            message.channel.send("Here's your hint. The number is lower than 51 and higher than 0");
        }
        else if(isCorrectNumber(message.content)) {
            client.channels.cache.get(channel01).send("<@" + message.author + ">" + " guessed the right number! The number was " + getNumber() + ". A new number has been generated.");
            console.log("The new number is " + newNumber());
        }
        else if((getNumber() - message.content) >= -10 && (getNumber() - message.content <= 10)) {
            message.channel.send("Getting warmer!");
        }
        else {
            message.channel.send("You guessed the wrong number. Try again!");
        }
    }
})

function isNumeric(n){
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function getNumber(){
    return guessNumber;
}
function isCorrectNumber(n){
    return guessNumber == n;
}

function newNumber(){
    guessNumber = Math.floor(Math.random() * 100);
    return guessNumber;
}
        //console.log(isNumeric(message.content));
        //console.log(message.content);
        /*
        if(message.content.startsWith(`${prefix}kick`)){
            message.channel.send("fuck you " + message.author.username + " <@" + message.author + ">")
        }
        */