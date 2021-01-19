module.exports = {
	name: 'hint',
    description: 'Gives you a hint for the number',
    args: false,
	execute(message, args, serverConfig) {
        if (serverConfig.guessNumber > 50) return message.channel.send("Here's your hint. The number is between 51 and 101");
        else return message.channel.send("Here's your hint. The number is betweeen 1 and 50");
    },
}