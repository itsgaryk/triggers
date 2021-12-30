module.exports = async function(message, assets){
    const triggers = JSON.parse(fs.readFileSync("./triggers.json"))
    if(triggers.length === 0) { message.channel.send("Error: no triggers have been added to the server"); return; }

    message.channel.send("What is the name of the trigger??")
    await functions.getInputFromMessage(message, message.author.id, message.channel.id)
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
}