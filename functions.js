//General functions
async function newConfig(guildId){
    let serverConfig = {"guessNumber": newNumber(),"secretRoom":{"name":"secret-room","categoryID":null,"rooms":[]},"modRoles": [], "triggers":[], "voice": null};
    fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
}

async function updateConfig(serverConfig,guildId){
        fs.writeFileSync(`json/${guildId}.json`, JSON.stringify(serverConfig, null, 2));
        console.log(`Updated config file for server ${guildId}`);
}

function isNumber(n){
    return !isNaN(parseInt(n));
}

function hasSpecialCharaters(n){
    const specialCharacters = /[^a-zA-Z0-9\-\/]/;
    if(specialCharacters.test(n)) return true;
    else return false;
}

function removeNonNumericCharacters(n){
    if (hasSpecialCharaters(n)) return n.replace(/[^\w\s]/gi, '')
    else return n;
}

async function isGuildMember(guildMembers, memberId){
    try{
        // Try fetching the member. If it can't find him, will throw a rejection.
        await guildMembers.fetch(memberId);
        // We passed the fetching, so the ID was correct, and everything worked out.
        return true;
      }
      catch(e){
        console.log(e.message, e.code)
        // Check what the error was, and the error-code 
        //(see: https://discord.com/developers/docs/topics/opcodes-and-status-codes#json-json-error-codes)
        //-- should be "10007: Unknown member"
        if( e instanceof Discord.DiscordAPIError && e.code === 10007 ) return false;
        if( e instanceof Discord.DiscordAPIError && e.code === 10013 ) return false;
        // Was some unrelated error, rethrow.
        throw(e);
    }
}

async function validateLink(n){
    try{
        const website = new URL(n)
        return true;
    }
    catch (e) {
        console.log(e.message, e.code)
        return undefined;
        throw(e);
    }

}

function hasMod(memberRoles,modRoles){
let valueCondition = 0;
    if (modRoles.length > 0 || memberRoles.length > 0){
        for(let i =0; i < modRoles.length; i++){
            memberRoles.forEach(r => {if(r.id === modRoles[i]) valueCondition++;});
        }
    }
    if(valueCondition > 0) return true;
    else return false;
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