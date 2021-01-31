const functions = require("../functions.js")
const fs = require('fs');
const fetch = require('node-fetch');
const trigger = require("./trigger.js");

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
                message.channel.send("Error: unable to use **remove** as a sound");
        }
        else
            addTrigger(message, args);
	},
};

async function addTrigger(message, args){   

    const getTriggerUrl = (attachment, args) => {
        if(attachment !== undefined)
            return attachment.url;
        
        if(args !== [] && args[0] !== undefined)
            return args[0];
    }

    const getTriggerWord = (triggerAttachment, args) => {
        if(args === [])
            return functions.removeFileExtension(attachmentUrl).toLowerCase();

        else{
            if(triggerAttachment !== undefined && args[0] !== undefined)
                return args[0].toLowerCase();

            if(triggerAttachment === undefined && args[1] === undefined)
                return functions.removeFileExtension(args[0]).toLowerCase();

            if(triggerAttachment === undefined && args[1] !== undefined)
                return args[1].toLowerCase();
        }
    }

    //Gets the URL and extension)
    const attachment = message.attachments.first()
    const attachmentUrl = await getTriggerUrl(attachment, args)
    const attachmentExtension = attachmentUrl.split(".").pop()

    if(!functions.validateLink(attachmentUrl)) 
    { message.channel.send("Error: no valid URL detected"); return; }

    if(message.attachments !== undefined && args[0] !== undefined) 
        if(functions.validateLink(args[0])) { message.channel.send("Error: cannot submit both a file attachment and URL in message"); return; }
    
    //Creates the trigger word from attachment URL or argument
    const triggerWord = await getTriggerWord(attachment.url, args)

    if(!functions.hasAlphabeticCharactersOnly(triggerWord))
        { message.channel.send("Error: word cannot contain special characters or numbers"); return; }
    
    //Checks if the trigger word is already used as a filename
    const fileList = fs.readdirSync(fileType+"/")
    const commandList = functions.removeFileExtension(fileList);
    if(commandList.find(r => r === triggerWord))
    { message.channel.send(`Error: audio trigger **${triggerWord}** already exists`);; return; }

    fetch(attachmentUrl)
    .then(res => {
        const fileType = getFileType(res);
        if(fileType === "image" || fileType === "audio"){
            if (Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio") 
            { message.channel.send(`Error: ${fileType} file exceeds more than 1MB`); return;}
            
            if (Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image") 
            { message.channel.send(`Error: ${fileType} file exceeds more than 3MB`); return;}

            const file = fs.createWriteStream(`./${fileType}/${triggerWord}.${attachmentExtension}`);
            res.body.pipe(file);
            message.channel.send(`${fileType} trigger **${triggerWord}** successfully added`);
        }
        else
            return message.channel.send("Error: invalid file type")
    })
}

async function removeTrigger(message, serverConfig, triggerWord){
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