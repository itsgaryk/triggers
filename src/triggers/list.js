const utilCommon = require('../util/common');

module.exports = function(message, args, assets){

    listTriggers = (condition) => {
        if(condition == undefined)
            composeMessage(utilCommon.sortArray(assets.map(x => x.text)));
        else
            //Triggers by type
            composeMessage(utilCommon.sortArray(assets.filter(x => x.type == condition).map(x => x.text)));

            //Triggers uploaded by the user        
    }

    composeMessage = (newList) => {

        const theMessage = [`Found **${newList.length}** triggers\n\`\`\``];
        
        for(let i = 0; i < newList.length; i++){
            //Creates a new line for every 9 triggers
            if((theMessage.length - 2) % 10 === 0)
                theMessage.push("\n")
            
            //Adds the element to the message
            theMessage.push(newList[i]);

            if(newList.length-1 !== i)
                theMessage.push(" - ");

            //If adding the next item is about to exceed the maximum message characrer limited
            if(theMessage.join("").length + newList[i].length > 1900){
                theMessage.push("\`\`\`\n Message size limit reached. Use !triggers [type] or !triggers [member] to search for specific triggers");
            }
        }
            theMessage.push("\`\`\`\n");
            message.channel.send(theMessage.join(""));
    }



    if (assets.length === 0)
        return message.channel.send("No triggers have been added");    
    
    switch(args[0]){
        //List all available triggers
        case(undefined):
            listTriggers();
            break;
        default: 
            listTriggers(args[0].toLowerCase())
            return;
    }
}