const bookshelf = require('../bookshelf.js')

const Employees = bookshelf.model('Employees', {
  tableName: 'employees',
  idAttribute: 'perdet_seq_num',

  initialize() {
    this.constructor.__super__.initialize.apply(this, arguments)

    this.on('fetched', this._has_handshake)
  },

  _has_skill_code(code) {
    return this.related('skills').pluck('skl_code').some(s => s === code)
  },

  _has_handshake() {
    if(this.related('bids').pluck('assignment_date').some(b => b != null)) {
      return this.set('hs_cd', 'Y')
    } else {
      return this.set('hs_cd', 'N')
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
    return this.hasMany('Bids', 'emplid')
  }
})

module.exports = Employees