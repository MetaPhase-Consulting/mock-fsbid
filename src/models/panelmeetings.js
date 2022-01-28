const bookshelf = require('../bookshelf.js')

const PanelMeetings = bookshelf.model('PanelMeetings', {
  tableName: 'panelmeetings',
  idAttribute: 'pmseqnum',

  pmscode() {
    return this.belongsTo('PanelMeetingStatuses', 'pmscode')
  },

  pmtcode() {
    return this.belongsTo('PanelMeetingTypes', 'pmtcode')
  },
  
})

module.exports = PanelMeetings