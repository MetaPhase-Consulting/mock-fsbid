const bookshelf = require('../bookshelf.js')

const PanelMeetingItems = bookshelf.model('PanelMeetingItems', {
  tableName: 'panelmeetingitems',
  idAttribute: 'pmiseqnum',

  pmseqnum() {
    return this.belongsTo('PanelMeetings', 'pmseqnum')
  },

  miccode() {
    return this.belongsTo('PanelMeetingItemCategories', 'miccode')
  },

  // aiseqnum() {
  //   return this.belongsTo('AgendaItems', 'aiseqnum')
  // },
  
})

module.exports = PanelMeetingItems