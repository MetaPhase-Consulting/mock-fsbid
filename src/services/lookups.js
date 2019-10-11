const { readJson } = require('./common')

const cycles = readJson('../data/cycles.json')

function get_cycles() {
  return { "Data": cycles, return_code: 0 }
}

const grades = readJson('../data/grades.json')

function get_grades() {
  return { "Data": grades, return_code: 0 }
}

const languages = readJson('../data/languages.json')

function get_languages() {
  return { "Data": languages, return_code: 0 }
}

const dangerpays = readJson('../data/dangerpays.json')

function get_dangerpays() {
  return { "Data": dangerpays, return_code: 0 }
}

const differentialrates = readJson('../data/differentialrates.json')

function get_differentialrates() {
  return { "Data": differentialrates, return_code: 0}
}

const tourofduties = readJson('../data/tourofduties.json')

function get_tourofduties() {
  return { "Data": tourofduties, return_code: 0 }
}

const bureaus = readJson('../data/bureaus.json')

function get_bureaus() {
  return { "Data": bureaus, return_code: 0 }
}

const codes = readJson('../data/codes.json')

function get_codes() {
  return { "Data": codes, return_code: 0 }
}

module.exports = { get_cycles, get_grades, get_languages, get_dangerpays, get_differentialrates, get_tourofduties, get_bureaus, get_codes }