const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num',
  virtuals: {
    hs_cd: function() {
      if (this.related('bids').pluck('ubw_hndshk_offrd_flg').some(b => b === 'Y')) {
        return 'Y'
      } else {
        return 'N'
      }
   }
  },

  _has_skill_code(code) {
    return this.related('skills').pluck('skl_code').some(s => s === code)
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
    return this.hasMany('Bids', 'perdet_seq_num')
  }
})

module.exports = Employees