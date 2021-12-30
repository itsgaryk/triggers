module.exports = (n) => {
    const specialCharacters = /[^a-zA-Z0-9 _\-\/]/;
    if(specialCharacters.test(n)) return true;
    else return false;
}