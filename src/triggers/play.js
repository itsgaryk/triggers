const getRoom = require("../rooms/get.js");
const findTrigger = require("./controller/find.js");
const fs = require('fs');

module.exports = (message, category, voiceRole, enabled, assets) => {
    //Checks if the channel is either a secret room or is a voice chat room
    const isRoom = () => {    
        //checks if the channel has the voice chat role
        if(message.channel.permissionOverwrites.some(i => i.id == voiceRole))   
            return true;

        //checks if the message was posted in the user's secret room
        if(getRoom(message,category)?.id == message.channel.id)
            return true;
    }

    const playAudio = () => {
        message.member.voice.channel.join()
        .then(musicPlayer => {
                    const dispatcher = musicPlayer.play(`./assets/${asset.file}`)
                    dispatcher.on('start', () => {});
                    dispatcher.on('finish', () => {});
                    dispatcher.on('error', console.error);
        })
    }

    //If it's a secret room play any trigger
    const asset = findTrigger(message.content, assets);
    switch(asset?.type){
            case(undefined): break;
            case("image"):message.channel.send({files:[fs.realpathSync(`./assets/${asset.file}`)]}); break;
            case("text"): message.channel.send(fs.readFileSync(`./assets/${asset.file}`)); break;
            case("audio"): if(isRoom() && message.member.voice.channel) playAudio(); break;
            default: return;
        }
}