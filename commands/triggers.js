const fs = require('fs');
module.exports = {
	name: 'triggers',
    description: 'Displays all available triggers',
    args: false,
    alias: "sounds",
	execute(message, config, functions, args) {

        const getList = (triggers, fileType) => {
            const triggerList = [];
            triggers.find(r => {if(r.type === fileType) triggerList.push(r.text);})
            return functions.sortArray(triggerList);
        }

        const triggers = JSON.parse(fs.readFileSync(`./triggers.json`));

        if (triggers.length === 0)
            return message.channel.send("No triggers have been added");
        
        const theMessage = [`**There are ${triggers.length} triggers available**\n\n`];
        const fileTypes = ["text", "image", "audio"]
            
        for(const fileType of fileTypes){
            theMessage.push(fileType + " triggers" + "```")
            const triggerList = getList(triggers, fileType);
            if(triggerList === [])
                theMessage.push(`No ${fileType} triggers have been added` + "```");
            else {
                for (let i = 0; i < triggerList.length; i++){
                    triggerList[i] = i+1 + "." + triggerList[i] + "   ";
                    if(i === triggerList.length-1)                    
                        theMessage.push(triggerList.join(""), "```");
                }
            }
        }
        message.channel.send(theMessage.join(""));
    }, 
};