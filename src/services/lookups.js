const { readJson } = require('./common')

const cycles = readJson('../data/cycles.json')

function get_cycles() {
  return { "Data": cycles }
}

const grades = readJson('../data/grades.json')

function get_grades() {
  return { "Data": grades }
}

const languages = readJson('../data/languages.json')

function get_languages() {
  return { "Data": languages }
}

module.exports = { get_cycles, get_grades, get_languages }