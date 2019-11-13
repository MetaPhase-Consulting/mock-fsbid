const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'hru_id',
  role() {
    return this.belongsTo('Roles', 'role')

  }
})

module.exports = Employees