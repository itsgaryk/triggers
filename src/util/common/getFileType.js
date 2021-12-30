module.exports = (res) => {
    try{
        const newContentType = res.headers.get('content-type').split("/");
        return newContentType[0];
    }
    catch (e){
            console.log("Error: unknown file type")
            return "unknown";
    }
}