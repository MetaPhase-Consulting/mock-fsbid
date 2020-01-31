const bookshelf = require('../bookshelf.js')

const Assignments = bookshelf.model('Assignments', {
  tableName: 'assignments',
  idAttribute: 'asg_seq_num',

  position() {
    return this.belongsTo('Positions', 'pos_seq_num')
  },
  employee() {
    return this.belongsTo('Employees', 'per_seq_num')
  },
})

module.exports = Assignments