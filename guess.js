const functions = require('./functions.js');
module.exports = {
 checkNumber
}

function checkNumber (message, serverConfig, guessNumber) {
    if(!functions.checkRoom(serverConfig, message.channel.id)) return;
    if (guessNumber === serverConfig.guessNumber){
        message.channel.send("You guessed the right number. Congratulations!");
        serverConfig.guessNumber = serverConfig.guessNumber = (Math.floor(Math.random()*100)+1).toString();
        console.log(`Number guessed on ${message.guild.id}. New number is ${serverConfig.guessNumber}`);
        functions.updateConfig(serverConfig, message.guild.id);
        return;
    }

    if ((message.con >= serverConfig.guessNumber-10) && (guessNumber <= serverConfig.guessNumber+10))
        return message.channel.send("getting warmer");
    else return message.channel.send("You guessed the wrong number. Try again!");
}