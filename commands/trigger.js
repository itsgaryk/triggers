const functions = require("../functions.js")
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
	name: 'trigger',
    description: 'Adds a trigger sound/image',
    args: true,
    alias: "sound",
	execute(message, config, args) {
        if(args !== undefined && args[0] === "remove"){
            if(functions.hasMod(message, config))
                removeTrigger(message, args[1].toLowerCase());
            else
                message.channel.send("Error: unable to use **remove** as a trigger word");
        }
        else
            addTrigger(message, args);
	},
};

async function addTrigger(message, args){   

    const getTrigger = (message, args) => {
        
        const attachment = message.attachments.first()
        const triggerInfo = {attachmentUrl:"", attachmentExtension:"", triggerWord:""}

        //!trigger
        if(message.attachments.size !== 0){
                triggerInfo.attachmentUrl = attachment.url;
                triggerInfo.attachmentExtension = attachment.url.split(".").pop();

                //!trigger
                if(message.attachments.size !== 0 && args[0] === undefined)
                    triggerInfo.triggerWord = functions.removeFileExtension(attachment.url).toLowerCase();

                //!trigger [word]
                else
                    triggerInfo.triggerWord = args[0].toLowerCase();
        }
        else{
        //!trigger [link]
            if(args[1] === undefined){
                triggerInfo.attachmentUrl = args[0];
                triggerInfo.triggerWord = functions.removeFileExtension(args[0]).toLowerCase();
                triggerInfo.attachmentExtension = args[0].split(".").pop();
            }
        //!trigger [word] [link]
            if(args[1] !== undefined){
                triggerInfo.attachmentUrl = args[1];
                triggerInfo.triggerWord = args[0].toLowerCase();
                triggerInfo.attachmentExtension = args[1].split(".").pop();
            }                
        }

        return triggerInfo;
    }

    //Checks if there are no attachments and no arguments
    if(message.attachments.size === 0 && args[0] === undefined)
    { message.channel.send("Error: invalid arguments. See !help"); return; }

    //Checks if there are no attachments, only 1 argument and the 1 argument has an invalid link
    if(message.attachments.size === 0 && args[1] === undefined && !functions.validateLink(args[0]))
            { message.channel.send("Error: invalid arguments. See !help"); return; }

    //Gets the URL and extension)
    //const attachment = message.attachments.first()
    const {attachmentUrl , attachmentExtension, triggerWord} = getTrigger(message, args)

    if(!functions.validateLink(attachmentUrl)) 
    { message.channel.send("Error: not valid URL"); return; }

    //Creates the trigger word from attachment URL or argument
    //const triggerWord = await getTriggerWord(attachment.url, args)

    if(!functions.hasAlphabeticCharactersOnly(triggerWord))
        { message.channel.send("Error: word cannot contain special characters or numbers"); return; }

    fetch(attachmentUrl)
    .then(res => {

        //checks if the URL is valid
        try{
            res.body;
        }
        catch (e){
            message.channel.send("Error: invalid URL")
            return;
        }
        const fileType = functions.getFileType(res);

        //Checks if the trigger word is already used as a filename
        if(fileType === "image" || fileType === "audio"){

            const fileList = fs.readdirSync(fileType+"/")
            const commandList = functions.removeFileExtension(fileList);
            if(commandList.find(r => r === triggerWord))
            { message.channel.send(`Error: ${fileType} trigger **${triggerWord}** already exists`); return; }

            if (Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio") 
            { message.channel.send(`Error: ${fileType} file exceeds more than 1MB`); return;}
            
            if (Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image") 
            { message.channel.send(`Error: ${fileType} file exceeds more than 3MB`); return;}

            const file = fs.createWriteStream(`./${fileType}/${triggerWord}.${attachmentExtension}`);
            res.body.pipe(file);
            message.channel.send(`${fileType} trigger **${triggerWord}** successfully added`);
        }
        else
            message.channel.send("Error: invalid file type or invalid URL");
    })
}

async function removeTrigger(message, triggerWord){
    const fileList = fs.readdirSync("audio/")
    if(fileList.length === 0) { message.channel.send("Error: no sound clips have been added to the server"); return; }

    const soundList = functions.removeFileExtension(fileList);
    for (let i = 0; i < soundList.length; i++){
        if (soundList[i] === triggerWord){
            fs.unlinkSync(`./audio/${fileList[i]}`)
            message.channel.send(`Sound clip **${triggerWord}** successfully removed`);
            return;
        }
        if (i+1 === soundList.length) message.channel.send("Error: sound clip does not exist")
    }
}