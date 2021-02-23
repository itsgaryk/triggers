const fs = require('fs');
const config = require("./config.json")
const Discord = require ("discord.js");
const triggers = require ("./triggers.json");
const {OpusEncoder} = require('@discordjs/opus');
// Specify 48kHz sampling rate and 2 channel size.
const encoder = new OpusEncoder(48000, 2);

// Encode and decode.
//const encoded = encoder.encode(buffer);
//const decoded = encoder.decode(encoded);

module.exports = {
    hasMod,
    hasSpecialCharaters,
    hasAlphabeticCharactersOnly,
    removeFileExtension,
    removeNonNumericCharacters,
    isGuildMember,
    getFileType,
    sortArray,
    checkRoom,
    isRoom,
    getInputFromMessage,
    trigger
};

function hasMod(message){
    const memberRoles = message.member.roles.cache;
    if (config.modRole < 1) return false;
    if (memberRoles.find(r => r.id === config.modRole) 
    || message.author.id == message.guild.owner.id) return true;
    else return false;
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
        const website = new URL(n);
        return true;
    }
    catch (e) {
        console.log(e.message, e.code)
        return false;
    }

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
    if(n == 0) return;
    return n.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
}

//Returns true if the member already has a secret room
async function checkRoom(message){
    const category = message.guild.channels.cache.get(config.roomCategory)
    //checks if the message was posted in the member's room by the owner
    for(const child of category.children){
        const channel = message.guild.channels.cache.get(child[0]);
        for(const role of channel.permissionOverwrites){
            //checks if ID is the member's ID
            if (role[0] === message.author.id)
                { return 1; }
        }
    }
    return 0;
}

//Checks if the channel is a secret room
async function isRoom(message){
    const category = message.guild.channels.cache.get(config.roomCategory);
    //checks if the channel has the voice chat role
    for(const role of message.channel.permissionOverwrites){
        if (role[0] === config.voiceRole)
            { return 1; }
    }

    //dev channel
    if (message.channel.id === "801191295829671936")
        return 0;

    //checks if the message was posted in a secret room
    for(const child of category.children){
        if (child[0] === message.channel.id)
            { return 1; }
    }
    return 0;
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
};

//Author is message.author.id or a specified User ID. Channel is message.channel.id or a specified Channel ID
async function getInputFromMessage (message, author, channel) {
    const filter = response => {
        return response.author.id === author && response.channel.id === channel;
    };        

    newMessage = await message.channel.awaitMessages(filter, { max: 1, time: 30000, errors: ['time'] })
    .catch(() => {
        console.log("nothing");
    });

    if (newMessage === undefined)    
        return undefined;
    else
        return newMessage.first();
}

async function trigger(message){
    const executeTrigger = (message, trigger, type) => {
        switch(type){
            case "audio":
                message.member.voice.channel.join()
                .then(musicPlayer => {
                    const dispatcher = musicPlayer.play(`triggers/${trigger.file}`)
                    dispatcher.on('start', () => {});
                    dispatcher.on('finish', () => { return;});
                    dispatcher.on('error', console.error);
                })
                return;
            case "image":
                message.channel.send({files:[fs.realpathSync(`triggers/${trigger.file}`)]});
                return;
            case "text":
                message.channel.send(trigger.file);
        }
    }
    
    const triggers = JSON.parse(fs.readFileSync("triggers.json"));
    isRoom(message)
    .then(room => {
        for(let i = 0; i < triggers.length; i++){
            //Checks if the message contains the trigger word/phrase
            if ((message.content.toLocaleLowerCase().includes(triggers[i].text) || message.content.toLocaleLowerCase() === triggers[i].text)){
                //If it's a secret room play any trigger
                if (room)
                        executeTrigger(message, triggers[i], "audio");
                //Else non-secret rooms can only allow image triggers
                if (!room && triggers[i].type === "image")
                        executeTrigger(message, triggers[i], "image");
                if (!room && triggers[i].type === "text")
                        executeTrigger(message, triggers[i], "text");
            }
        }
    })
}