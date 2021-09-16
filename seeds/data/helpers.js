const fs = require('fs')

const readJson = path => JSON.parse(fs.readFileSync(require.resolve(path)))

const findRandom = array => array[Math.floor(Math.random() * array.length)]

export const randomIntInclusive = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

module.exports = { readJson, findRandom }