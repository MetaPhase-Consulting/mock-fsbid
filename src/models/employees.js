const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
})

module.exports = Employees