const fs = require('fs')

const readJson = path => JSON.parse(fs.readFileSync(require.resolve(path)))

const findRandom = array => array[Math.floor(Math.random() * array.length)]

module.exports = { readJson, findRandom }