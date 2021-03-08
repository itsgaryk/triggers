const fs = require("fs");
const verifyFiles= require("util/controller/check/verifyfiles.js");
const verifyFolders = require("util/controller/check/verifyfolders.js");

const checkFile = require("util/controller/checkfiletype.js");
const hasTrigger = require("util/controller/hastrigger.js")
const listTriggers = require("util/controller/listtriggers.js")

const fileTypes = ["image", "audio", "text"];
const triggers = fs.readFileSync("util/controller/triggers.json");


module.exports = {
    checkFileType,
    findTrigger,
    hasTrigger,
    addTrigger,
    updateTrigger,
    deleteTrigger,
    listTriggers
}

function listTriggers(message, args){
    if (triggers.length === 0)
        return message.channel.send("No triggers have been added");

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