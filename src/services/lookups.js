const { readJson } = require('./common')

const cycles = readJson('../data/cycles.json')

function get_cycles() {
  return { "Data": cycles}
}

module.exports = { get_cycles }
const grades = readJson('../data/grades.json')

function get_grades() {
  return { "Data": grades}
}

module.exports = { get_cycles, get_grades }