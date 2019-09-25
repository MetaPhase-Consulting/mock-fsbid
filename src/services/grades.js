const { readJson } = require('./common')

const grades = readJson('../data/grades.json')

function get_grades() {
  return { "Data": grades}
}

module.exports = { get_grades }