const fs = require("fs");
const fileExtensions = ["jpg", "bmp", "png", "webp", "gif", "mp3", "wav", "ogg"];

module.exports = async (message, trigger, assets, validateURL) => {


    const getFileExtension = () =>{
        for(const extension of fileExtensions)
            if(trigger.file.includes(".".concat(extension)))
                return extension;
    }
    const getIndex = () => {
        if (assets.length < 10)
            return "00".concat(assets.length);
        if (assets.length > 9 && assets.length < 100)
            return "0".concat(assets.length);
        if(assets.length > 99 && assets.length < 1000)
            return assets.length;
    }

    const file = {name:undefined, type:undefined, extension:undefined, index:undefined}

    if(trigger.type !== "text"){
        file.extension = getFileExtension();
        if (!file?.extension) return message.channel.send("Unknown file extension");
        file.index = getIndex(assets);
        file.name = fs.createWriteStream(`./assets/${file.index}.${file.extension}`);
        validateURL(trigger.file)
        .then(res => {
            res.body.pipe(file.name);
        })
        trigger.file = `${file.index}.${file.extension}`;
    }
        assets.push(trigger)
        fs.writeFileSync("./assets/.json", JSON.stringify(assets, null, 2));
        message.channel.send(`${trigger.type} trigger **${trigger.text}** successfully added`);
}