const bookshelf = require('../bookshelf.js')

const AgendaItemLegs = bookshelf.model('AgendaItemLegs', {
  tableName: 'agendaitemlegs',
  idAttribute: 'ailseqnum',

  aiseqnum() {
    return this.belongsTo('AgendaItems', 'aiseqnum')
  },
  cpid() {
    return this.belongsTo('AvailablePositions', 'cp_id')
  },
  todcode() {
    return this.belongsTo('tourofduties', 'todcode')
  },
  latcode() {
    return this.belongsTo('LegActionTypes', 'latcode')
  },
})

module.exports = AgendaItemLegs