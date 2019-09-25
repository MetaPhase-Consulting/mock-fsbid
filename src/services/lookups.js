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

const dangerpays = readJson('../data/dangerpays.json')

function get_dangerpays() {
  return { "Data": dangerpays }
}

const differentialrates = readJson('../data/differentialrates.json')

function get_differentialrates() {
  return { "Data": differentialrates }
}

const tourofduties = readJson('../data/tourofduties.json')

function get_tourofduties() {
  return { "Data": tourofduties }
}

module.exports = { get_cycles, get_grades, get_languages, get_dangerpays, get_differentialrates, get_tourofduties }