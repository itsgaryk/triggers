const { ReactionUserManager } = require('discord.js');

module.exports = async (message, reacts, content) => {
    const msg = await message.channel.send(content);
    for(let i = 0; i < reacts.length; i++)
        await msg.react(reacts[i].emoji);

    const collector = await msg.awaitReactions((response, user) => {
        if(message.author.id == user.id && reacts.some(react => react.emoji == response.emoji.name)) return response}, {max: 1, time: 10000, errors: ['time'] })
    .catch(() => {
        message.channel.send("🤷‍♂️ Nothing selected");
    });

    msg.delete();

    if (collector)
        for(let i = 0; i < reacts.length; i++){
            if(reacts[i].emoji ==  collector.first().emoji.name){
                return reacts[i].type;
            }        
        }
}