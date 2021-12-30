module.exports = async (message) => {
    try{
        await message.guild.members.fetch(memberId);
        return 1;
    }
    catch{
            (e => console.log(e));
    }
}