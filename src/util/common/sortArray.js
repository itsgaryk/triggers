//Sorts array into alphabetical order
module.exports = (n) => {
    if(n.length === 0) return [];
    
    return n.sort(function(a, b){
        if(a < b) { return -1; }
        if(a > b) { return 1; }
        return 0;
    })
}