const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num',

  _has_skill_code(code) {
    return this.related('skills').pluck('skl_code').some(s => s === code)
  },

  role() {
    return this.belongsTo('Roles', 'role')
  },
  grade() {
    return this.belongsTo('Grades', 'grade')
  },
  skills() {
    return this.belongsToMany('Codes', 'employees_skills', 'perdet_seq_num', 'jc_id')
  },
  manager() {
    return this.belongsTo('Employees', 'manager_id')
  }
})

module.exports = Employees