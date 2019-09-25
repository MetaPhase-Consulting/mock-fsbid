const { readJson } = require('./common')

const cycles = readJson('../data/cycles.json')

function get_cycles() {
  return { "Data": cycles}
}

module.exports = { get_cycles }