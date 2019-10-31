const fs = require('fs')
const readJson = path => JSON.parse(fs.readFileSync(require.resolve(path)))

module.exports = { readJson }