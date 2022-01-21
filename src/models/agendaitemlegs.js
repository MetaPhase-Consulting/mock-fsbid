const bookshelf = require('../bookshelf.js')

const AgendaItemLegs = bookshelf.model('AgendaItemLegs', {
  tableName: 'agendaitemlegs',
  idAttribute: 'ailseqnum',

  aiseqnum() {
    return this.belongsTo('AgendaItems', 'aiseqnum')
  },

  latcode() {
    return this.belongsTo('LegActionType', 'latcode')
  },
})

module.exports = AgendaItemLegs