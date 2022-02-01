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
  
})

module.exports = PanelMeetingItems