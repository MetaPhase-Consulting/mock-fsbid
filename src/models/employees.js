const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num',

  _has_skill_code(code) {
    return this.related('skills').pluck('skl_code').some(s => s === code)
  },

  _has_handshake() {
    if(this.related('bids').pluck('assignment_date').some(b => b != null)) {
      return "Y"
    } else {
      return "N"
    }
  },

  roles() {
    return this.belongsToMany('Roles', 'employees_roles', 'perdet_seq_num', 'code')
  },
  grade() {
    return this.belongsTo('Grades', 'grade')
  },
  skills() {
    return this.belongsToMany('Codes', 'employees_skills', 'perdet_seq_num', 'jc_id')
  },
  manager() {
    return this.belongsTo('Employees', 'manager_id')
  },
  bids() {
    return this.belongsTo('Bids', 'emplid')
  }
})

module.exports = Employees