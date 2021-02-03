const bookshelf = require('../bookshelf.js')

const Classifications = bookshelf.model('Classifications', {
  tableName: 'classifications',
  idAttribute: 'te_id',

  employees_classifications() {
    return this.hasMany('EmployeesClassifications', 'te_id')
  },

})

module.exports = Classifications