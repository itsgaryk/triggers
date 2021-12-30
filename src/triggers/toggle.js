module.exports = function toggle(message, config){
     switch(config.enabled){
        case(0): message.channel.send("Trigger Bot Enabled"); return 1;
        case(1): message.channel.send("Trigger Bot Disabled"); return 0;
    }
}