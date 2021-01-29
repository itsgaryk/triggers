const functions = require("../functions.js")
const fs = require('fs');
const fetch = require('node-fetch');
const trigger = require("./trigger.js");
const { triggerAsyncId } = require("async_hooks");


module.exports = {
	name: 'sound',
    description: 'add [word] - Adds a trigger word',
    args: true,
	execute(message, args, serverConfig) {
        if(args[0] === undefined)
            { message.channel.send("Error: missing arguments. See !help"); return; }

        if(!functions.hasAlphabeticCharactersOnly(args[0]) && !functions.hasAlphabeticCharactersOnly(args[1]))
            { message.channel.send("Error: trigger word cannot contain special characters or numbers"); return; }

        if(args[1] !== undefined && args[0] === "remove"){
            if(!functions.hasMod(message, serverConfig))
                { message.channel.send("Error: you don't have permission to perform that command."); return; }
            else
                removeSound(message, args[1].toLowerCase());
        }
        else
            addSound(message, args[0].toLowerCase());
	},
};

async function addSound(message, triggerWord){
    //Remove is reserved for mod command !sound remove [word]
    if(triggerWord === "remove") 
    { message.channel.send("Error: unable to use **remove** as a sound"); return;}
    
    //Checks if the trigger word is already used as a filename
    const fileList = fs.readdirSync("audio/")
    const soundList = functions.removeFileExtension(fileList);
    if(soundList.find(r => r === triggerWord))
    { message.channel.send(`Error: audio trigger **${triggerWord}** already exists`);; return; }

    //Checks if there's an attachment
    const triggerAttachment = message.attachments.first();
    if(triggerAttachment === undefined) 
    { message.channel.send("Error: no audio file attached"); return; }

    //Gets the URL from the attachment object
    const attachmentUrl = triggerAttachment.url;
    const attachmentExtension = attachmentUrl.split(".").pop()

    fetch(attachmentUrl)
    .then(res => {
        if(!functions.validateFileType(message, res, "audio")) return;

        if (Number(res.headers.get('content-length')) > 1024 * 1024) 
        { message.channel.send("Error: file exceeds more than 1MB"); return;}

        const file = fs.createWriteStream(`./audio/${triggerWord}.${attachmentExtension}`);
        res.body.pipe(file);
        message.channel.send(`Sound clip **${triggerWord}** successfully added`);
    })
}

async function removeSound(message, triggerWord){
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