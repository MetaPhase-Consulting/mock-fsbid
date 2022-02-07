const bookshelf = require('../bookshelf.js')

const AgendaItemRemarks = bookshelf.model('AgendaItemRemarks', {
  tableName: 'agendaitemremarks',
  idAttribute: 'rmrkseqnum',

  aiseqnum() {
    return this.belongsTo('AgendaItems', 'aiseqnum')
  },

})

module.exports = AgendaItemRemarks