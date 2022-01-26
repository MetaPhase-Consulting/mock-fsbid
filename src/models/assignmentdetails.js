const bookshelf = require('../bookshelf.js')

const AssignmentDetails = bookshelf.model('AssignmentDetails', {
  tableName: 'assignmentdetails',
  idAttribute: 'asgd_code',

  assignment() {
    return this.belongsTo('Assignments', 'asg_seq_num')
  },
  assignmentstatus() {
    return this.belongsTo('Assignments', 'asgs_code')
  },
  latcode() {
    return this.belongsTo('LegActionType', 'latcode')
  },
  todcode() {
    return this.belongsTo('tourofduties', 'code')
  },
  ailseqnum() {
    return this.belongsTo('agendaitemlegs', 'ailseqnum')
  },
  org() {
    return this.belongsTo('Organizations', 'org_code')
  },
})

module.exports = AssignmentDetails