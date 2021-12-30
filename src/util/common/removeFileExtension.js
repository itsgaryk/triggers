//Removes file extensions of a single value or all items in an array
module.exports = (fileList) => {
    const getFileName = arg => {
        if (arg === undefined) return;
        const regex = /[-!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/;
        const splitFile = arg.split(regex);
        return splitFile[splitFile.length-2]
    }
    
    if(Array.isArray(fileList)){
        const newList = []
        for(let i =0;i < fileList.length; i++){
            newList.push(getFileName(fileList[i]));
        }
        return newList;
    }
    else
        return getFileName(fileList);
}