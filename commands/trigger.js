const functions = require("../functions.js")
const fs = require('fs');
const fetch = require('node-fetch');

module.exports = {
	name: 'trigger',
    description: 'Adds a trigger sound/image',
    args: true,
    alias: "sound",
	execute (message, config, args) { 
        const checkTrigger = async (message, trigger) =>
        {
            fetch(trigger.url)
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
                if(fileType === "image" || fileType === "audio"){

                    const triggers = JSON.parse(fs.readFileSync("./triggers.json"));
                    //Checks if the trigger word is already used as a filename
                    if(triggers.find(r => r.text === trigger.text && r.type === fileType))
                        return message.channel.send(`Error: ${fileType} trigger **${trigger.text}** already exists`);
        
                    if (Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio") 
                        return message.channel.send(`Error: ${fileType} file exceeds more than 1MB`);
                    
                    if (Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image") 
                        return message.channel.send(`Error: ${fileType} file exceeds more than 3MB`);

                    trigger.type = fileType;
                    addTrigger(message, trigger, triggers, res);
                }
                else message.channel.send("Invalid file type");
            });
        }

        const addTrigger = async (message, trigger, triggers, res) => {
            console.log("0".concat(triggers.length));
            const getIndex = triggers => {
                if (triggers.length < 10)
                    return "00".concat(triggers.length);
                if (triggers.length > 9 && triggers.length < 100)
                    return "0".concat(triggers.length)
            }
    
                    const fileExtension = trigger.url.split(".").pop();
                    const triggerIndex = getIndex(triggers);
                    const file = fs.createWriteStream(`./triggers/${triggerIndex}.${fileExtension}`);
                    res.body.pipe(file);

                triggers.push({
                    type:trigger.type,
                    text:trigger.text,
                    file:`${triggerIndex}.${fileExtension}`,
                    category:trigger.category,
                    author:message.author.id,
                    uploaded: new Date().toLocaleString()
                })
                fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
                message.channel.send(`${trigger.type} trigger **${trigger.text}** successfully added`);
        }

        const trigger = {text:"", url:"", category:"", type:""};
        
        //Text
        message.channel.send("Enter the trigger text e.g. 'final fantasy'");
        functions.getInputFromMessage(message, message.author.id, message.channel.id).then(mtext => {
            
            if(mtext === undefined || mtext.content === "")
                return message.channel.send("Error: nothing entered");

            trigger.text = mtext.content.toLowerCase();

            if(functions.hasSpecialCharaters(trigger.text))
                return message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed");

            //File
            message.channel.send("Submit the file. Either paste the URL or upload file");
            functions.getInputFromMessage(message, message.author.id, message.channel.id).then(murl => {
                if(murl === undefined)
                    return message.channel.send("Error: nothing entered");
                if (murl.attachments.first() === undefined)
                        trigger.url = murl.content;
                    else
                        trigger.url = murl.attachments.first().url;
                if (!functions.validateLink(trigger.url))
                    return message.channel.send("Error: invalid URL");

            //Category
            message.channel.send("Enter the trigger category e.g. 'animals'");
                functions.getInputFromMessage(message, message.author.id, message.channel.id).then(mcategory => {
                    if(mcategory === undefined  || mcategory.content === "")
                        return message.channel.send("Error: nothing entered");
                    
                    trigger.category = mcategory.content;
                    if(functions.hasSpecialCharaters(trigger.text))
                        return message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed");
                    checkTrigger(message, trigger);
                })
            });
        })
    },
};
