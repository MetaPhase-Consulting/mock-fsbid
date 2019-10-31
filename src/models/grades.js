const bookshelf = require('../bookshelf.js')

const Grades = bookshelf.model('Grades', {
  tableName: 'grades',
})

module.exports = Grades