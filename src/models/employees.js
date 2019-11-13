const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num',
  role() {
    return this.belongsTo('Roles', 'role')

  }
})

module.exports = Employees