const bookshelf = require('../bookshelf.js')

const PanelMeetings = bookshelf.model('PanelMeetings', {
  tableName: 'panelmeetings',
  idAttribute: 'pmseqnum',

  pmscode() {
    return this.belongsTo('PanelMeetingStatuses', 'pmscode')
  },

  pmpmtcode() {
    return this.belongsTo('PanelMeetingTypes', 'pmpmtcode')
  },

  pmseqnumpanelmeetingdates() {
    return this.hasMany('PanelMeetingDates', 'pmseqnum')
  },
  
})

module.exports = PanelMeetings