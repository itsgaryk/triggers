module.exports = () => {
    //Checks if all trigger files exist
    for(const type of fileTypes){
        const files = fs.readdirSync(`../assets/${type}`);
        for(const file of files){
            if(!triggers.some(i => i.type === type && i.file === file))
                return false;
        }
    }
}