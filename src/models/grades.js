const bookshelf = require('../bookshelf.js')

const Grades = bookshelf.model('Grades', {
  tableName: 'grades',
  idAttribute: 'grade_code'
})

module.exports = Grades