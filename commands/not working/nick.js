module.exports = {
	name: 'nick',
    description: 'Ping!',
    args: false,
	execute(message, args) {
        if (args[0] == false)
        await message.member.setNickname(clientUserObject.username);
        else { 
            await(message.member.setNickname(clientUserObject.username, " - ", args[0]))
        }
        return;
	},
};