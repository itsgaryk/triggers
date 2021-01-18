module.exports = {
	name: 'hint',
    description: 'Gives you a hint for the number',
    args: false,
	execute(serverConfig) {
        if (serverConfig.guessNumber > 50) return ("Here's your hint. The number is between 51 and 101");
        else return("Here's your hint. The number is betweeen 1 and 50");
    },
}