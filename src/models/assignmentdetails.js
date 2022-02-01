const bookshelf = require('../bookshelf.js')

const AssignmentDetails = bookshelf.model('AssignmentDetails', {
  tableName: 'assignmentdetails',
  idAttribute: 'asgd_code',

  assignment() {
    return this.belongsTo('Assignments', 'asg_seq_num')
  },
  ailseqnum() {
    return this.belongsTo('agendaitemlegs', 'ailseqnum')
  },
})

module.exports = AssignmentDetails