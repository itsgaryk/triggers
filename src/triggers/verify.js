const fs = require('fs');

module.exports = () => {

    //Checks if file exists
    try{
        fs.existsSync("./assets/assets.json");
        console.log("✅ File assets.json found")
    }
    catch(error){
        console.log(error + "\t❌Unable to load assets from assets.json");
        process.exit(1);
    }
    
    //Checks if file has correct JSON formatting
    try{
        JSON.parse(fs.readFileSync("./assets/assets.json"));
        console.log("✅ JSON formatting correct");
    }
    catch(error){
        console.log(error + "\t❌Invalid JSON formatting");
        process.exit(1);
    }

    const assets = JSON.parse(fs.readFileSync("./assets/assets.json"));

    //Checks if all files are present in asset folder
    try{
        for(let i = 0; i < assets.length; i++)            
            fs.existsSync(`./assets/${assets[i].file}`);
        console.log("✅ All files found")
    }
    catch(error){
        console.log(error + "\t❌Missing file/asset")
        process.exit(1);
    }

    return assets;
}