module.exports = {
	name: 'sounds',
    description: 'Lists all available sounds for use in voice channels',
    args: false,
	execute() {
        const removeFileExtension = async () => {
            let newList = []
            for(let i =0;i < fileList.length; i++){
                let newWord = fileList[i].split(".");
                newList.push(newWord[0]);
            }
            return newList
        }
        const fileList = fs.readdirSync("audio/")    
        if(fileList.length === 0) message.channel.send("No sounds have been added to the server")
        else {
            const soundList = await removeFileExtension(fileList);
            const voiceList = sortArray(soundList);
            message.channel.send("Available sounds\n```" + voiceList.join("  ") + "```");
        }
        return;  
	},
};