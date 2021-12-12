const getRoom = require("./get.js");

module.exports = function (message, roomCategory, roomName) {
    //Checks if user already has a secret room
    //console.log((getRoom(message, message.guild.channels.cache.get(roomCategory))))
    if(getRoom(message, message.guild.channels.cache.get(roomCategory)))
        message.channel.send(`Error: You already have secret room - ${getRoom(message, message.guild.channels.cache.get(roomCategory))}`);
    else{
        message.guild.channels.create(roomName, {"parent" : roomCategory})
        .then(newChannel => {
            newChannel.updateOverwrite(message.author.id,{VIEW_CHANNEL: true});
            message.channel.send(`Secret Room ${newChannel} has successfully been created`);
        });
    }
}