const bookshelf = require('../bookshelf.js')

const AgendaItems = bookshelf.model('AgendaItems', {
  tableName: 'agendaitems',
  idAttribute: 'aiseqnum',

  aiscode() {
    return this.belongsTo('Agenda_Item_Statuses', 'aiscode')
  },

  pmiseqnum() {
    return this.belongsTo('PanelMeetingItems', 'pmiseqnum')
  },
})

module.exports = AgendaItems