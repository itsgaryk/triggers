module.exports = () => {
    //Checks if the folders exists. Creates folders if they don't
    try{
        fs.readdirSync("../assets")
    } catch(e){
        console.log("Assets folder doesn't exist. Creating new asset folder")
        fs.writeFileSync("../assets")
        for(const type of fileTypes){
            fs.writeFileSync(`../${type}`);
        }
    }

    try{
        for(const type of fileTypes)
            fs.readdirSync(`../assets/${type}`)
    } catch(e){
        console.log("Missing folder in assets")
        return false;
    }

    return true;
}