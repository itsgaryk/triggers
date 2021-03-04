const fs = require('fs');
const functions = require("./functions.js");
const triggers = require("./triggers.json");

const fileTypes = ["image", "audio", "text"]
const fileExtensions = ["jpg", "bmp", "png", "webp", "gif", "mp3", "wav", "ogg"];

module.exports = {
    play,
    list,
    del,
    add,
}
function play(message, category){
    //Checks if the channel is a secret room
    const isRoom = () => {    
        //checks if the channel has the voice chat role
        if(message.channel.permissionOverwrites.some(i => i.id === "793013387612520468"))
            return true;

        //dev channel
        if (message.channel.id === "801191295829671936")
            return true;

        //checks if the message was posted in a secret room
        for(const child of category.children){
            if (child[0] === channel.id)
                return true;
        }
    }

    const playAudio = (item) => {
        message.member.voice.channel.join()
        .then(musicPlayer => {
                    const dispatcher = musicPlayer.play(`triggers/${item}`)
                    dispatcher.on('start', () => {});
                    dispatcher.on('finish', () => {});
                    dispatcher.on('error', console.error);
        })
    }

    const hasTrigger = (item) => {
            //Checks if the message contains the trigger word/phrase
            if(item.text.length < 5){
                const split = message.content.split();
                for(const arg of split)
                    if(arg.toLowerCase() === item.text.toLowerCase()) return true;
            }
            else if (message.content.toLowerCase().includes(item.text)) return true;
    }
    

    //If it's a secret room play any trigger
    for(const item of triggers){
        if(hasTrigger(item)){
            switch(item.type){
                case("audio"): if(isRoom(message.channel)) playAudio(item.file); break;
                case("text"): message.channel.send(item.file); break;
                case("image"):message.channel.send({files:[fs.realpathSync(`triggers/${item.file}`)]}); break;;
                default: return;
            }
        }
    }
}

async function del(message, args) {
    const triggers = JSON.parse(fs.readFileSync("./triggers.json"))
    if(triggers.length === 0) { message.channel.send("Error: no triggers have been added to the server"); return; }

    message.channel.send("What is the name of the trigger??")
    await functions.getInputFromMessage(message, message.author.id, message.channel.id)
    .then(trigger => {
        for (let i = 0; i < triggers.length; i++){
            if (triggers[i].text === trigger && triggers[i].type === type){
                fs.unlinkSync(`./triggers/${triggers[i].file}`)
                triggers.splice(i,1)
                fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
                message.channel.send(`Trigger **${trigger}** successfully removed`);
                return;
            }
            if (i+1 === soundList.length) message.channel.send(`Error: ${type} trigger **${trigger}** does not exist`);
        }
    })
    .catch(() => {
        return message.channel.send(`Error: you did enter the trigger text`);
    })
}

function list(message, args){
    const getList = (types) =>{
        const theMessage = [`Found **${formatted.length}** triggers\n`]
        for(const type of types){
            const formatted = functions.sortArray(triggers.filter(i => i.type === type));
            theMessage.push(type + "\n\`\`\`")            
            if(formatted.length === 0){
                theMessage.push("None available" + "\`\`\`\n")
            }
            else{
                for(const item of formatted){
                    //Creates a new line for every 9 triggers
                    // if(formatted.indexOf(item) % 10 === 0)
                    //     theMessage.push(item.text + "\n")

                    //Final object in the array
                    if(theMessage.join("").length > 1900){
                        theMessage.push("\`\`\`\n Message size limit reached. Use !triggers [type] or !triggers [member] to search for specific triggers");
                        return message.channel.send(theMessage.join(""));
                    }
                    if(formatted.indexOf(item) === formatted.length-1)
                        theMessage.push(item.text + "\`\`\`\n");
                    else
                        theMessage.push(item.text + " - ");
                }
            }
        }
        return theMessage.join("");
    }

    if (triggers.length === 0)
        return message.channel.send("No triggers have been added");
    
    if(args[0] !== undefined)
        if (fileTypes.some(args[0].toLowerCase())){
            message.channel.send(getList(args[0]))
        }
    else message.channel.send(getList(fileTypes));
}

async function add(message, args, prefix){
    const checkFile = (res, type) => {
        const fileType = functions.getFileType(res);
        if(fileTypes.some(i => i === fileType)){
            if(Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio"){
                message.channel.send(`Error: ${fileType} file exceeds more than 1MB`);
            }else{
                if(type === fileType) return true;
            }
            if(Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image"){
                message.channel.send(`Error: ${fileType} file exceeds more than 3MB`);
            }else{
                if (type === fileType) return true;
                else message.channel.send(`Error: not a ${type} file type`);
            }
        }else
            message.channel.send("Error: invalid file type. Must be either an image or audio");
    }
    const addToJSON = (trigger) => {
        const getFileExtension = () =>{
            for(const extension of fileExtensions)
                if(trigger.response.includes(".".concat(extension)))
                    return extension;
        }
        const getIndex = () => {
            if (triggers.length < 10)
                return "00".concat(triggers.length);
            if (triggers.length > 9 && triggers.length < 100)
                return "0".concat(triggers.length);
            if(triggers.length > 99 && triggers.length < 1000)
                return triggers.length;
        }
        const file = {name:"", type:"", extension:"", index:""}
        if(trigger.type !== "text"){
            const triggerURL = trigger.response;
            file.extension = getFileExtension();
            if (file?.extension === null) return message.channel.send("Unknown file extension");
            file.index = getIndex(triggers);
            file.name = fs.createWriteStream(`./triggers/${file.index}.${file.extension}`);
            trigger.response = `${file.index}.${file.extension}`;
            functions.validateURL(triggerURL)
            .then(res => {
                res.body.pipe(file.name);
            }) 
        }

        triggers.push(trigger);
        //Writes the new object to file
        fs.writeFileSync("./triggers.json", JSON.stringify(triggers, null, 2));
        message.channel.send(`${trigger.type} trigger **${trigger.text}** successfully added`);
        }

    const trigger = {type:null, text:null, response:null, category:null, author:message.author.id, uploaded: new Date().toLocaleString()};
    
    if(args.length > 0){
        if(message?.attachments.size > 0){
            trigger.response = message.attachments.first().url;
            trigger.text = args.join(" ")
        }else{
            trigger.response = args[args.length-1];
            trigger.text = args.slice(0, args.length-1).join(" ");
        }
        await functions.validateURL(trigger.response).then(res => {
            trigger.type = functions.getFileType(res);
            if(functions.hasSpecialCharaters(trigger.text)) return message.channel.send("Trigger text cannot contain special character (excluding space)");
            if(!checkFile(res, trigger.type)) return message.channel.send("Error: invalid file type. Make sure you're submitted either an image or audio file");
            if(triggers.some(i => i.type === trigger.type && i.text.toLowerCase() === trigger.text.toLowerCase())) return message.channel.send(`Trigger ${trigger.text} already exists`);
            else{
                trigger.category = "none";
                addToJSON(trigger,triggers)
            }
        })
        .catch(e => console.log(e))
        return;
    }    

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
    if(trigger.type === "image" || trigger.type === "audio"){
        message.channel.send("Submit the file. Either paste the URL or upload file");
        await functions.getInputFromMessage(message).then(async response => {
            if(response === undefined)
                message.channel.send("Error: nothing entered");
            else{
                if (response?.attachments === null)
                    trigger.response = response.content;
                else
                    trigger.response = response.attachments.first().url;

                await functions.validateURL(trigger.response).then(res => {
                        if(!checkFile(res, trigger.type))
                            trigger.response = null;
                    }).catch(e => console.log(e + "\tInvalid URL"))
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
                trigger.response = response.content;
            }
        }).catch(e => console.log(e.code + "\tError with trigger response text"));
    }

    if (trigger.response === null) return;
            
    //Trigger Category
    message.channel.send("Enter the trigger category e.g. animals. Enter \"none\" if you don't want to add a category");
    await functions.getInputFromMessage(message).then(response => {
        if(response === undefined) return;
        if(response.content.toLowerCase() === "none") trigger.category = "";
        if(functions.hasSpecialCharaters(response.content))
            return message.channel.send("Error: category cannot contain special characters. Only numbers, letters and spaces are allowed");
        else trigger.category = response.content.toLowerCase();
    }).catch(e => console.log(e.code + "\tError with trigger category"));

    if (trigger.category === null) return;

    addToJSON(trigger, triggers);
}