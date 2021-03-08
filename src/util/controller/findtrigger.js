module.exports = (message) => {
    //message = message.content
    for(const item of triggers){
        if(message.length < 6){
            if(message.toLowerCase().split(" ").some(i => i === item.text.toLowerCase()))
                return item;
        else
            if(message.toLowerCase().includes(item.text.toLowerCase()))
                return item;
        }
    }
}