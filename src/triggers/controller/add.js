const fs = require("fs");

module.exports = async (assets, trigger,file) => {

    const getIndex = () => {
        if (assets.length < 10)
            return "00".concat(assets.length);
        if (assets.length > 9 && assets.length < 100)
            return "0".concat(assets.length);
        if(assets.length > 99 && assets.length < 1000)
            return assets.length;
    }

    if(trigger.type != "text"){
        const fileIndex = getIndex(assets);
        trigger.file = `${fileIndex}.${file.extension}`;
        file.data = fs.createWriteStream(`./assets/${trigger.file}`);
    }
        assets.push(trigger)
        fs.writeFileSync("./assets/assets.json", JSON.stringify(assets, null, 2));
}