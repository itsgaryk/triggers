const functions = require("../util/functions.js");
const controller = require("./controller/index.js");
const triggerTypes = [
    {"type": "image", "emoji":"🖼"},
    {"type": "audio", "emoji":"🔊"},
    {"type":"text", "emoji":"🅰"}
];

module.exports = async (message, args, prefix, assets) => {   

    const getTriggerText = async () => {
        const response = await functions.getInputFromMessage(message, "Enter the trigger text e.g. 'final fantasy'")
        if(response){
            //Checks if the trigger text starts with the prefix command
            if (response?.content.startsWith(prefix))
                {message.channel.send("Error: text cannot start with prefix"); return;}

            //Checks if the trigger already exists
            if(controller.find(response?.content, assets))
                {message.channel.send(`Trigger **${response.content}** already exists`); return;}
            
            //Checks if the trigger text is less than 3 characters
            if(response.content.length < 3)
                {message.channel.send("Trigger needs to be longer than 3 characters"); return}

            // if(functions.hasSpecialCharaters(mtext.content))
            // {message.channel.send("Error: cannot use special characters. Only numbers, letters and spaces are allowed"); return "";}
            return response.content;
        }
    }
    
    const getTriggerCategory = async () => {
        const response = await functions.getInputFromMessage(message, "Enter the trigger category e.g. animals. Enter \"none\" if you don't want to add a category")
        if(response?.content == "none")
            return response.content;
        if(functions.hasSpecialCharaters(response?.content))
            message.channel.send("Error: category cannot contain special characters. Only numbers, letters and spaces are allowed");
        else
            return response.content;
    }
    const checkTriggerFile = (res, type) => {
        const fileType = functions.getFileType(res);
        if(fileType !== type)
            {message.channel.send(`Error: Not an ${type} file type. Must be either an image or audio`); return;}
        else{
            //Checks the audio file size
            if(Number(res.headers.get('content-length')) > 1024 * 1024 && fileType === "audio")
                {message.channel.send(`Error: ${fileType} file exceeds more than 1MB`); return}

            //Checks the image file size
            if(Number(res.headers.get('content-length')) > 1024 * 3072 && fileType === "image")
                {message.channel.send(`Error: ${fileType} file exceeds more than 3MB`); return}
        }
        return 1;
    }
    const getTriggerFile = async (type) => {
        if(type === "image" || type === "audio"){
            
            let triggerFile;
            const response = await functions.getInputFromMessage(message, "Submit the file. Either paste the URL or upload file")         

            if (response?.attachments.size != 0)
                triggerFile =  response.attachments.first().url;
            else
                triggerFile = response.content;

            if(triggerFile.length > 200)
            {
                message.channel.send("Error: URL cannot be greater than 200 characters");
                return;
            }

            try{
                const res = await functions.validateURL(triggerFile)
                await checkTriggerFile(res, type)
                return triggerFile;
            } catch(e) {
                console.log(e);
                message.channel.send("Error: Invalid URL");
            } 
            
        }
        if(type === "text"){
            const response = await functions.getInputFromMessage(message, "Enter the trigger reponse e.g. 'haha thats hilarious'").catch(e => console.log(e.code + "\tError with trigger response text"));
            if(response.content.startsWith(prefix)){
                message.channel.send("Error: text cannot start with prefix");
                return;
            }
            if(response.content.length > 200)
            {
                message.channel.send("Error: Text cannot be greater than 200 characters");
                return;
            }
            else
                return response.content
        }
    }
    
    //Sets up the trigger object to send at the end to the "add" method
    const trigger = {type:undefined, text:undefined, file:undefined, category:undefined, originalURL:"", author:message.author.id, uploaded: new Date().toLocaleString()};

    //Checks if there's 1 arguments and there's an attachment
    if(args.length > 0 && message?.attachments.size > 0){
        //Adds the 1st argument as the trigger text
        if(checkFileType(message.attachments.first().url)){
            trigger.text = args.join(" ");
            trigger.response = message.attachments.first().url;

        }
    await functions.validateURL(trigger.response).then(res => {
        trigger.type = functions.getFileType(res);
        //if(functions.hasSpecialCharaters(trigger.text)) return message.channel.send("Trigger text cannot contain special character (excluding space)");
        if(!checkTriggerFile(res, trigger.type)) return message.channel.send("Error: invalid file type. Make sure you're submitted either an image or audio file");
        if(controller.find(trigger.text)) return message.channel.send(`Trigger ${trigger.text} already exists`);
        else{
            trigger.category = "none";
            addTrigger(trigger)
        }
    })
    .catch(e => console.log(e))
    return message.channel.send("Invalid arguments")
    }
  
    // If there are no arguments it will prompt the user to enter details
    // Trigger Type
    functions.getReactionFromMessage(message, triggerTypes, "Select the type of trigger you'd like to add").then(responseType => {
        if(responseType){
            trigger.type = responseType;
            //Trigger Text
            getTriggerText().then(responseText => {
                if(responseText){
                    trigger.text = responseText;
                    //Trigger Category
                    getTriggerCategory().then(responseCategory => {
                        if(responseCategory){
                            trigger.category = responseCategory;
                            //Trigger File
                            getTriggerFile(trigger.type).then(responseFile => {
                                if(responseFile){
                                    trigger.file = responseFile;
                                    if(trigger.type != "text")
                                        trigger.originalURL = responseFile;
                                    controller.add(message, trigger, assets, functions.validateURL());
                                }
                            })
                        }    
                    })
                }
            })
        }
    })
}