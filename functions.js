const fs = require('fs');
module.exports = {
    updateConfig,
    hasSpecialCharaters,
    hasAlphabeticCharactersOnly,
    removeFileExtension,
    removeNonNumericCharacters,
    isGuildMember,
    validateLink,
    validateFileType,
    downloadFile,
    hasMod,
    sortArray,
    checkRoom
};

async function updateConfig(serverConfig,guildId){
        fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
        console.log(`Updated config file for server ${guildId}`);
}

function hasMod(message,serverConfig){
    const memberRoles = message.member.roles.cache;
    if (serverConfig.modRoles.length < 1 && message.member.roles.cache.length < 0) return false;
    if (memberRoles.find(r => serverConfig.modRoles.find(m => r.id == m)) 
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

function validateFileType(message, res, fileType){
    const getContentType = (res) => {
        newContentType = res.headers.get('content-type').split("/")
        return newContentType[0];
    }    
    const contentType = getContentType(res);
    if (contentType != fileType)
    { message.channel.send("Error: invalid file type"); return false;}
    else return true;
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

//Checks if the message channel is a secret room.
//messageChannel = message.channel.id
//secretRoom = serverConfig.secretRoom
function checkRoom(serverConfig, messageChannel){
    if (serverConfig.secretRoom.rooms.find(r => r.roomId === messageChannel)){ return true;}
    else return false;
}

function removeFileExtension(fileList){
    let newList = []
    for(let i =0;i < fileList.length; i++){
        let newWord = fileList[i].split(".");
        newList.push(newWord[0]);
    }
    return newList
}