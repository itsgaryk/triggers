module.exports = (text, assets) => {
    const asset = [];
    //Message matches the exact text
    asset.push(assets.find(asset => asset.text.toLowerCase() === text.toLowerCase()));
    
    //Word in the message matches the exact text 
    asset.push(assets.find(asset => assets.find(asset => text.toLowerCase().split(" ").some(i => 
        i === asset.text.toLowerCase()))))

    //Message includes a trigger word
    asset.push(asset[asset.length] = assets.find(asset => text.toLowerCase().includes(asset.text.toLowerCase())));


    //Returns the image based on the above rules
    for(let i=0; i<asset.length;i++)
        if(asset[i]) return asset[i]
}