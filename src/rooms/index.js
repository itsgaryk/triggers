const fs = require('fs')
const path = require('path')

const rooms = {}

fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.includes(".js"))
    .forEach(file => {
    const fullName = path.join(__dirname, file)

    if (file.toLowerCase().endsWith('.js')) {
      // Removes '.js' from the property name in 'models' object
      const [filename] = file.split('.')
      rooms[filename] = require(fullName)
    }
  })


module.exports = rooms