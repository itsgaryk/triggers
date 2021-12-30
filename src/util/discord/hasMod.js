module.exports = (message, member) => {
    if(member.id === message.guild.owner.id)
    return 1;
}