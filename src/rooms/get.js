module.exports =  function(message, category) {
    //Returns the channel object from the category children collection if User is found in the roles
    //Return undefined if no channel is found with the user's role 
    return category.children.find(channel => {
        //Checks each user's permission ID in the channel. Returns true if the role ID matches the User ID
        return channel.permissionOverwrites.some(role => 
            role.id == message.author.id
        )
    })
}