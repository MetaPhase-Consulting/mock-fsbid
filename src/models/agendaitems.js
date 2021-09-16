const bookshelf = require('../bookshelf.js')

const AgendaItems = bookshelf.model('AgendaItems', {
  tableName: 'agendaitems',
  idAttribute: 'aiseqnum',

  aiscode() {
    return this.belongsTo('AgendaItemStatuses', 'aiscode')
  },

  pmiseqnum() {
    return this.belongsTo('PanelMeetingItems', 'pmiseqnum')
  },

/* waiting on template response

  perdetseqnum() {
    return this.belongsTo('', 'perdetseqnum')
  },
  empseqnbr() {
    return this.belongsTo('', 'empseqnbr')
  },
  asgseqnum() {
    return this.belongsTo('', 'asgseqnum')
  },
  todcode() {
    return this.belongsTo('', 'todcode')
  },
  asgdrevisionnum() {
    return this.belongsTo('', 'asgdrevisionnum')
  },*/
})

module.exports = AgendaItems