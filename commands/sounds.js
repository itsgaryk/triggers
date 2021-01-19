const fs = require('fs');
const functions = require("../functions.js");
module.exports = {
	name: 'sounds',
    description: 'Lists all available sounds for use in voice channels',
    args: false,
	execute(message) {
        const fileList = fs.readdirSync("audio/")    
        if(fileList.length === 0) message.channel.send("No sounds have been added to the server")
        else {
            const soundList = removeFileExtension(fileList);
            const voiceList = functions.sortArray(soundList);
            message.channel.send("Available sounds\n```" + voiceList.join("  ") + "```");
        }
        return;  
	},
};

function removeFileExtension(fileList){
    let newList = []
    for(let i =0;i < fileList.length; i++){
        let newWord = fileList[i].split(".");
        newList.push(newWord[0]);
    }
    return newList
}