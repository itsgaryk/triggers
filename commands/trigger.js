const fs = require('fs');
const fetch = require('node-fetch');
const functions = require("../functions.js");
const {getTriggers, updateTriggers} = require("../trigger.js");
const {prefix} = require("../config.json");

module.exports = {
	name: 'trigger',
    description: 'Adds a trigger sound/image',
    args: true,
    alias: "sound",
	async execute (message) { 
        const checkFile = async (url, type) => {
            const res = await fetch(url);
            const fileType = functions.getFileType(res);

            if(fileType === "image" || fileType === "audio"){
                if (Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio")
                    return message.channel.send(`Error: ${fileType} file exceeds more than 1MB`);
                if (Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image")
                    return message.channel.send(`Error: ${fileType} file exceeds more than 3MB`);
                if (type === fileType)
                    return true;
                else
                    message.channel.send(`Error: not a ${type} file type`);
            }else
                message.channel.send("Error: invalid file type. Must be either an image or audio");
        }

        const addTrigger = (trigger, triggers) => {
            const getIndex = () => {
                if (triggers.length < 10)
                    return "00".concat(triggers.length);
                if (triggers.length > 9 && triggers.length < 100)
                    return "0".concat(triggers.length)
            }
            const file = {name:"", type:"", extension:"", index:""}
            if(trigger.type !== "text"){
                const triggerURL = trigger.file;
                file.extension = triggerURL.split(".").pop();
                file.index = getIndex(triggers);
                file.name = fs.createWriteStream(`./triggers/${file.index}.${file.extension}`);
                trigger.file = `${file.index}.${file.extension}`;
                fetch(triggerURL)
                .then(res => {
                    res.body.pipe(file.name);
                }) 
            }
            triggers.push(trigger);
            //Updates the triggers object in trigger.js
            updateTriggers(trigger);

            //Writes the new object to file
            fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
            message.channel.send(`${trigger.type} trigger **${trigger.text}** successfully added`);
        }
        
        const triggers = getTriggers(); //JSON.parse(fs.readFileSync("./triggers.json"));
        const trigger = {type:null, text:null, file:null, category:null, author:message.author.id, uploaded: new Date().toLocaleString()};
        
        //Trigger Type
        message.channel.send("Enter the type of trigger you'd like to add. Enter: text, image or audio")
        await functions.getInputFromMessage(message).then(response => {
            if(response === undefined || response?.content === "" || response?.content === null)
                message.channel.send("🤷‍♂️ Nothing entered");
            else{
                if(["text", "image", "audio"].some(i => i === response.content.toLowerCase()))
                    trigger.type = response.content.toLowerCase();
                else
                    message.channel.send("Error: you did not enter one of the specified types");
            }
        }).catch(e => console.log(e + "\tError with trigger type"));

        if (trigger.type === null) return;

        //Trigger Text
        message.channel.send("Enter the trigger text e.g. 'final fantasy'")
        await functions.getInputFromMessage(message).then(response => {
            if(response === undefined || response?.content === "" || response?.content === null)
                message.channel.send("🤷‍♂️ Nothing entered");
            else{        
                // if(functions.hasSpecialCharaters(mtext.content))
                // {message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed"); return "";}
                //
                // if(["text", "image", "audio"].some(m => m === response.content.toLowerCase()))
                //     return message.channel.send(`Error: unable to use **${response.content}** as a trigger. Reserved for !deltrigger`);

                if(response.content.startsWith(prefix))
                    message.channel.send("Error: text cannot start with prefix");
                else{
                    if(triggers.some(i => i.type === trigger.type && i.text === response.content.toLowerCase()))
                        message.channel.send(`Error: ${trigger.type} trigger **${response.content}** already exists`);
                    else
                        trigger.text = response.content.toLowerCase();
                }
            }
        }).catch(e => console.log(e + "\tError with trigger text"));

        if (trigger.text === null) return;

        //Trigger File
        if(trigger.type === "url"){
            message.channel.send("Submit the file. Either paste the URL or upload file");
            await functions.getInputFromMessage(message).then(response => {
                if(response === undefined)
                    message.channel.send("Error: nothing entered");
                else{
                    if (response?.attachments !== null){
                        functions.validateURL(response.attachments.first().url).then(() => {
                            checkFile(response.attachments.first().url, trigger.type).then(result => {
                                if(result !== undefined);
                                    trigger.file = response.attachments.first().url;
                            });
                        }).catch(e => console.log(e + "\tInvalid URL"))
                    }else{
                        functions.validateURL(response.content.toLowerCase()).then(() => {
                            checkFile(response.content.toLowerCase(), trigger.type).then(result => {
                                if(result !== undefined);
                                    trigger.file = response.content.toLowerCase();
                            });
                        }).catch(e => console.log(e + "\tInvalid URL"))
                    }
                }
            }).catch(e => console.log(e.code + "\tError with trigger URL"));
        }

        //Trigger Response
        if(trigger.type === "text"){
            message.channel.send("Enter the trigger reponse e.g. 'haha thats hilarious'");
            await functions.getInputFromMessage(message).then(response => {
                if(response === undefined || response?.content === "" || response?.content === null)
                    message.channel.send("Error: nothing entered");
                else{
                    // if(functions.hasSpecialCharaters(response.content))
                    // message.channel.send("Error: cannot use special characters (excluding spaces)");
                    // else
                    trigger.file = response.content.toLowerCase();
                }
            }).catch(e => console.log(e.code + "\tError with trigger response text"));
        }
             
        if (trigger.file === null) return;
                
        //Trigger Category
        message.channel.send("Enter the trigger category e.g. animals. Enter \"none\" if you don't want to add a category");
        await functions.getInputFromMessage(message, message.author.id, message.channel.id).then(response => {
            if(response === undefined) return;
            if(response.content.toLowerCase() === "none") trigger.category = "";
            if(functions.hasSpecialCharaters(response.content))
                return message.channel.send("Error: category cannot contain special characters. Only numbers, letters and spaces are allowed");
            else trigger.category = response.content.toLowerCase();
        }).catch(e => console.log(e.code + "\tError with trigger category"));

        if (trigger.category === null) return;

        addTrigger(trigger, triggers);
    },
};
