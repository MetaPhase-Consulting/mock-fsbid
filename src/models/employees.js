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
   },
   no_bids: function() {
        if (this.related('bids').pluck('bs_cd').some(b => ['A', 'C', 'P'].indexOf(b) > -1)) {
          return 'N'
        } else {
          return 'Y'
        }
    },
    no_successful_panel: function() {
      if (this.related('bids').pluck('bs_cd').some(b => ['P'].indexOf(b) > -1)) {
        return 'N'
      } else {
        return 'Y'
      }
  },
   fullname: function() {
     return `${this.get('last_name')}, ${this.get('first_name')}`
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
    return this.belongsToMany('Codes', 'employees_skills', 'perdet_seq_num', 'jc_id').orderBy('codes.skill_descr')
  },
  languages() {
    return this.belongsToMany('Languages', 'employees_languages', 'perdet_seq_num', 'language_code')
  },
  bureaus() {
    return this.belongsToMany('Bureaus', 'employees_bureaus', 'perdet_seq_num', 'bur')
  },
  organizations() {
    return this.belongsToMany('Organizations', 'employees_organizations', 'perdet_seq_num', 'org_code')
  },
  manager() {
    return this.belongsTo('Employees', 'manager_id')
  },
  bids() {
    return this.hasMany('Bids', 'perdet_seq_num')
  },
  classifications() {
    return this.belongsToMany('Classifications', 'employees_classifications', 'perdet_seq_num', 'td_id')
  },
  assignments() {
    return this.hasMany('Assignments', 'emp_seq_nbr', 'per_seq_num')
  },
  currentassignment() {
    return this.hasOne('Assignments', 'emp_seq_nbr', 'per_seq_num')
  }
})

module.exports = Employees
