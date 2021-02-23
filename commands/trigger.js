const fs = require('fs');
const fetch = require('node-fetch');
module.exports = {
	name: 'trigger',
    description: 'Adds a trigger sound/image',
    args: true,
    alias: "sound",
	async execute (message, config, functions, args) { 

        const getTriggerType = async () => {
            message.channel.send("Enter the type of trigger you'd like to add. Enter: text, image or audio");
            const mtype = await functions.getInputFromMessage(message, message.author.id, message.channel.id)
            if(mtype.content === undefined || mtype.content === "")
                return message.channel.send("Error: nothing entered");

            switch(mtype.content.toLowerCase()){
                case "text": return "text";
                case "image": return "image";
                case "audio": return "audio";
                default: 
                    message.channel.send("Error: you did not enter one of the specified types");
                    return "";
            }
        }

        const getTriggerText = async (type, triggers) =>  {
            message.channel.send("Enter the trigger text e.g. 'final fantasy'");
            const mtext = await functions.getInputFromMessage(message, message.author.id, message.channel.id)           
            if(mtext.content === undefined || mtext.content === "")
                {message.channel.send("Error: nothing entered"); return "";}
            
            if(functions.hasSpecialCharaters(mtext.content))
                {message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed"); return "";}

            if(existsTrigger(type, mtext.content.toLowerCase(), triggers))
                { message.channel.send(`Error: ${type} trigger **${mtext}** already exists`); return "";}
            else
                return mtext.content.toLowerCase();

        }

        const getTriggerTextResponse = async () =>  {
            message.channel.send("Enter the trigger text reponse e.g. 'haha thats hilarious'");
            const mtext = await functions.getInputFromMessage(message, message.author.id, message.channel.id)
            if(mtext.content === undefined || mtext.content === "")
                {message.channel.send("Error: nothing entered"); return;}
            
            if(functions.hasSpecialCharaters(mtext.content))
                {message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed"); return;}

                return mtext.content.toLowerCase();

        }

        const getTriggerURL = async (type) =>{
            const getURL = (async m => {
                if (m.attachments.first() !== undefined) return m.attachments.first().url;
                else return m.content;
            })
            
            message.channel.send("Submit the file. Either paste the URL or upload file");
            const murl = await functions.getInputFromMessage(message, message.author.id, message.channel.id);
            if(murl === undefined){
                message.channel.send("Error: nothing entered"); return "";
            }
            
            const triggerURL = await getURL(murl)
            const check = await checkURL(triggerURL, type);
            console.log(check);
            if(check === "pass") return triggerURL;
            else return "";
        }

        const getTriggerCategory = async () => {
            //Category
            message.channel.send("Enter the trigger category e.g. animals. Leave blank if you don't want to add a category");
            const mcategory = await functions.getInputFromMessage(message, message.author.id, message.channel.id);
            if(mcategory === undefined)
                return "";
            if(functions.hasSpecialCharaters(mcategory.content))
                {message.channel.send("Error: Categories cannot contain special characters. Only numbers, letters and spaces are allowed"); return false;}
            else return mcategory.content;
                                
        }

        const checkURL = async (url, type) =>
        {
            try{
                await fetch(url)
            }
            catch(e){
                return message.channel.send("Error: invalid URL");
            }

            const res = await fetch(url);       
            const fileType = functions.getFileType(res);

            console.log(fileType);
            if(fileType === "image" || fileType === "audio"){
                if (Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio")
                    return message.channel.send(`Error: ${fileType} file exceeds more than 1MB`);
                if (Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image")
                    return message.channel.send(`Error: ${fileType} file exceeds more than 3MB`);
                if (type === fileType)
                    return "pass";
                else
                    return message.channel.send(`Error: File is not of type ${trigger.type}`);
            }
            else return message.channel.send("Error: unknown file type");
        }

        const existsTrigger = (type, trigger, triggers) => {
            if (triggers.find(r => trigger === r.text && type === r.type))
                return true;
            else
                return false;
        }

        const addTrigger = async (trigger, triggers) => {
            const getIndex = triggers => {
                if (triggers.length < 10)
                    return "00".concat(triggers.length);
                if (triggers.length > 9 && triggers.length < 100)
                    return "0".concat(triggers.length)
            }
            const file = {name:"", type:"", extension:"", index:""}
            if(trigger.type !== "text"){
                file.extension = trigger.url.split(".").pop();
                file.index = getIndex(triggers);
                file.name = fs.createWriteStream(`./triggers/${file.index}.${file.extension}`);
                fetch(trigger.url)
                .then(res => {
                    res.body.pipe(file.name);
                    trigger.type = functions.getFileType(res);
                    triggers.push({
                        type:trigger.type,
                        text:trigger.text,
                        file:`${file.index}.${file.extension}`,
                        category:trigger.category,
                        author:message.author.id,
                        uploaded: new Date().toLocaleString()
                    })
                });
            }
            else{
            triggers.push({
                type:trigger.type,
                text:trigger.text,
                file:trigger.response,
                category:trigger.category,
                author:message.author.id,
                uploaded: new Date().toLocaleString()
            })
            }
            fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
            message.channel.send(`${trigger.type} trigger **${trigger.text}** successfully added`);
        }

        const trigger = {text:"", url:"", category:"", type:"", response:""};
        const triggers = JSON.parse(fs.readFileSync("./triggers.json"));
        
        trigger.type = await getTriggerType();
        if(trigger.type === "") return;

        trigger.text = await getTriggerText(trigger.type, triggers);
        if(trigger.text === "") return;

        if(trigger.type === "text"){
            trigger.response = await getTriggerTextResponse();
            if(trigger.text === "") return;
        }
        else{
            trigger.url = await getTriggerURL(trigger.type);
            if(trigger.url === "") return;
        }      

        trigger.category = await getTriggerCategory();
        
        addTrigger(trigger, triggers);
    },
};
