module.exports = {
	name: 'ping',
	description: 'Ping!',
	args: false,
	execute(message, args, serverConfig) {
		message.channel.send('Pong.');
	},
};