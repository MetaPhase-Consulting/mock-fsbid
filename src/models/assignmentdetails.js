const bookshelf = require('../bookshelf.js')

const AssignmentDetails = bookshelf.model('AssignmentDetails', {
  tableName: 'assignmentdetails',
  idAttribute: 'asgd_code',

  assignment() {
    return this.belongsTo('Assignments', 'asgseqnum', 'asg_seq_num')
  },
  ailseqnum() {
    return this.belongsTo('agendaitemlegs', 'ailseqnum')
  },
  tod() {
    return this.belongsTo('ToursOfDuty', 'todcode')
  },
})

module.exports = AssignmentDetails