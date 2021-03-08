module.exports = (arg) => {
    if(fileTypes.some(i => i === arg))
        return true;
    else 
        return false;
}