const fs = require("fs");
const triggers =  JSON.parse(fs.readFileSync("./triggers.json"))//require("./triggers.json");
let category;

module.exports = {
    updateTriggers: t => {
        triggers.push(t);
        console.log(triggers);
    },
    getTriggers: () => {
        return triggers;
    },
    category: c => {
        category = c;
    },
    execute: message => {
        //Checks if the channel is a secret room
        const isRoom = channel => {    
            //checks if the channel has the voice chat role
            if(channel.permissionOverwrites.some(i => i.id === "793013387612520468"))
                    return true;

            //dev channel
            if (channel.id === "801191295829671936")
                return true;

            //checks if the message was posted in a secret room
            for(const child of category.children){
                if (child[0] === channel.id)
                    return true;
            }
            return false;
        }
        const playAudio = (item) => {
            message.member.voice.channel.join()
            .then(musicPlayer => {
                        const dispatcher = musicPlayer.play(`triggers/${item}`)
                        dispatcher.on('start', () => {});
                        dispatcher.on('finish', () => {});
                        dispatcher.on('error', console.error);
            })
        }
        
        for(const item of triggers){
            //Checks if the message contains the trigger word/phrase
            if ((message.content.toLocaleLowerCase().includes(item.text) || message.content.toLocaleLowerCase() === item.text)){
                //If it's a secret room play any trigger
                switch(item.type){
                    case("audio"): if(isRoom(message.channel)) playAudio(item.file); break;
                    case("text"): message.channel.send(item.file); break;
                    case("image"):message.channel.send({files:[fs.realpathSync(`triggers/${item.file}`)]}); return;
                    default: return;
                }
            }
        }
    },
}