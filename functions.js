const fs = require('fs');
const fetch = require("node-fetch");
const AbortController = require("abort-controller");

module.exports = {
    hasMod,
    isGuildMember,
    hasSpecialCharaters,
    hasAlphabeticCharactersOnly,
    removeFileExtension,
    removeNonNumericCharacters,
    validateURL,
    getFileType,
    sortArray,
    getInputFromMessage,
};

function hasMod(member){
    if(member.id === message.guild.owner.id)
        ret
}

async function isGuildMember(message, memberId){
        await message.guild.members.fetch(memberId)
        .catch(e => console.log(e));
    }

function hasSpecialCharaters(n){
    const specialCharacters = /[^a-zA-Z0-9 _\-\/]/;
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

async function validateURL(n){
	const controller = new AbortController();
	const signal  = controller.signal
	const timeout = setTimeout(() => controller.abort(), 1500);
	await fetch(n, {signal: controller.signal})
    return true;
}

function getFileType(res){
    try{
        const newContentType = res.headers.get('content-type').split("/");
        return newContentType[0];
    }
    catch (e){
            console.log("Error: unknown file type")
            return "unknown";
    }
}

//Sorts array into alphabetical order
function sortArray(n){
    if(n.length === 0) return;
    return n.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
}

//Removes file extensions of a single value or all items in an array
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
};

//Author is message.author.id or a specified User ID. Channel is message.channel.id or a specified Channel ID
async function getInputFromMessage (message) {
    newMessage = await message.channel.awaitMessages(response => response.author.id === message.author.id && response.channel.id === message.channel.id,{ max: 1, time: 20000, errors: ['time'] })
    .catch(() => {
        console.log("nothing entered");
    });
    if (newMessage !== undefined)    
        return newMessage.first();
}