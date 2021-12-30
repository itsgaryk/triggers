module.exports = async (message, content) => {
    const newMessage = await message.channel.send(content);
    const userResponse = await message.channel.awaitMessages(response => 
        response.author.id === message.author.id && response.channel.id === message.channel.id,{ max: 1, time: 20000, errors: ['time'] })
    .catch(() => {
        message.channel.send("🤷‍♂️ Nothing entered");
    });

    newMessage.delete();
    if (userResponse){
        userResponse.first().delete();
        return userResponse.first();
    }
}