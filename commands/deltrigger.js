const fs = require('fs');
module.exports = {
	name: 'deltrigger',
    description: 'Deletes a trigger',
    args: true,
    alias: "delsound",
	execute(message, config, functions, args) {
        const triggers = JSON.parse(fs.readFileSync("./triggers.json"))
        if(triggers.length === 0) { message.channel.send("Error: no triggers have been added to the server"); return; }

        message.channel.send("What is the name of the trigger??")
        
        functions.getInputFromMessage(message, message.author.id, message.channel.id)
        .then(trigger => {
            for (let i = 0; i < triggers.length; i++){
                if (triggers[i].text === trigger && triggers[i].type === type){
                    fs.unlinkSync(`./triggers/${triggers[i].file}`)
                    triggers.splice(i,1)
                    fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
                    message.channel.send(`Trigger **${trigger}** successfully removed`);
                    return;
                }
                if (i+1 === soundList.length) message.channel.send(`Error: ${type} trigger **${trigger}** does not exist`);
            }
        })
        .catch(() => {
            return message.channel.send(`Error: you did enter the trigger text`);
        })
    /*
        message.channel.send("What type of trigger do you want to remove?")
        .then(async m => {
            await m.react("🖼");
            await m.react("📢");

            const filter = (reaction, user) => {
                ["🖼", "📢"].includes(reaction.emoji.name) && user.id === message.author.id;
            }

            message.awaitReactions(filter, { max: 1, time: 10000, errors: ['time'] })
            .then(async collected => {
                const getType = collected => {
                    if (collected.emoji.name === "🖼")
                        return "image"
                    if (collected.emoji.name === "📢")
                        return "audio"
                }
                const type = getType(collected.first())
    }, 
    */
    },
};