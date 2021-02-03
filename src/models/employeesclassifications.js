const bookshelf = require('../bookshelf.js')

const EmployeesClassifications = bookshelf.model('EmployeesClassifications', {
  tableName: 'employees_classifications',

  classification() {
    return this.belongsTo('Classifications', 'te_id')
  },
  employee() {
    return this.belongsTo('Employees', 'emp_seq_nbr', 'perdet_seq_num')
  },
})

module.exports = EmployeesClassifications