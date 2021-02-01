const fs = require('fs');
module.exports = {
    hasMod,
    hasSpecialCharaters,
    hasAlphabeticCharactersOnly,
    removeFileExtension,
    removeNonNumericCharacters,
    isGuildMember,
    validateLink,
    getFileType,
    downloadFile,
    sortArray,
    checkRoom
};

function hasMod(message,config){
    const memberRoles = message.member.roles.cache;
    if (config.modRole < 1) return false;
    if (memberRoles.find(r => r.id === config.modRole) 
    || message.author.id == message.guild.owner.id) return true;
    else return false;
}

function hasSpecialCharaters(n){
    const specialCharacters = /[^a-zA-Z0-9\-\/]/;
    if(specialCharacters.test(n)) return true;
    else return false;
}

function hasAlphabeticCharactersOnly(n){
    const specialCharacters = /^[A-Za-z]+$/;
    if(specialCharacters.test(n)) return true;
    else return false;    
}

function removeNonNumericCharacters(n){
    if (hasSpecialCharaters(n)) return n.replace(/[^\w\s]/gi, '')
    else return n;
}

async function isGuildMember(message, memberId){
    try{
        // Try fetching the member. If it can't find him, will throw a rejection.
        await message.guild.members.fetch(memberId);
        // We passed the fetching, so the ID was correct, and everything worked out.
        return true;
    }
    catch(e){
        console.log(e.message, e.code)
        /*
        // Check what the error was, and the error-code 
        //(see: https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes)
        //-- should be "10007: Unknown member"
        if( e instanceof Discord.DiscordAPIError && e.code === 10007 ) return false;
        if( e instanceof Discord.DiscordAPIError && e.code === 10013 ) return false;
        // Was some unrelated error, rethrow.
        throw(e);
        */
       return;
    }
}

function validateLink(n){
    try{
        // eslint-disable-next-line no-unused-vars
        const website = new URL(n)
        return true;
    }
    catch (e) {
        console.log(e.message, e.code)
        return false;
    }

}

function getFileType(res){
    try{
        const newContentType = res.headers.get('content-type').split("/")
        return newContentType[0];
    }
    catch (e){
            console.log("Error: unknown file type")
            return "unknown";
    }
}

function downloadFile(link){
    file = new File();
    return file;
}
//Sorts array into alphabetical order
function sortArray(n){
    if(n == 0) return;
    return n.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
}

//Returns a value if the message channel is a secret room and the message author is the room owner
async function checkRoom(message, config){
    const roomId = [];
    const category = message.guild.channels.cache.get(config.roomCategory)
    
    //Marcios sound commands room and voice-chat
    if (message.channel.id === "800091815230570516")
        return 1;

    //checks if the channel has the voice chat role
    message.channel.permissionOverwrites.forEach( m => {
        if (m.id === config.voiceRole)
            roomId.push(m.id);
    })

    //checks if the message was posted in the member's room by the owner
    if (category.children.size > 0) {
        category.children.forEach(channel => {
            if (channel.name === config.roomName)
                channel.permissionOverwrites.forEach(m => {
                    //checks if ID is the member's ID
                    if (m.id === message.author.id)
                        roomId.push(channel.id);
            })
        })
    }
    if(roomId.length > 0) return roomId[0];
    else return undefined;
    
}

function removeFileExtension(fileList){
    const getFileName = arg => {
        if (arg === undefined) return;
        const regex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
        const splitFile = arg.split(regex);
        return splitFile[splitFile.length-2]
    }
    
    if(Array.isArray(fileList)){
        const newList = []
        for(let i =0;i < fileList.length; i++){
            newList.push(getFileName(fileList[i]));
        }
        return newList;
    }
    else
        return getFileName(fileList);
}