module.exports = {
	name: 'brb',
    description: 'Ping!',
    args: false,
	execute(message, clientUserObject) {
        if (message.member.nickname.startsWith("(brb - )"))
            message.member.setNickname(clientUserObject.username);
        else
            message.member.setNickname("(brb - )" + clientUserObject.username);
        return;
	},
};