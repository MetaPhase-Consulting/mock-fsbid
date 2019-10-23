const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num'
})

module.exports = Employees