module.exports = {
	name: 'trigger',
    description: 'Ping!',
    args: true,
	execute(message, args, serverConfig) {
        const checkNumber = (serverConfig, guessNumber, actualNumber) => {
            switch(true){
                case guessNumber == actualNumber:
                    return 1;
                case guessNumber > actualNumber-10 || guessNumber < actualNumber+10:
                    return 2;
                default:
                    return 3;
            }
        }
        
        switch(checkNumber(serverConfig, message.content, serverConfig.guessNumber)){
            case 1:
                message.channel.send("You guessed the right number. Congratulations!");
                serverConfig.guessNumber = serverConfig.guessNumber = (Math.floor(Math.random()*100)+1).toString();
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
    },
}