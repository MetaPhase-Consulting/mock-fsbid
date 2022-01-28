const bookshelf = require('../bookshelf.js')

const PanelMeetingDates = bookshelf.model('PanelMeetingDates', {
  tableName: 'panelmeetingdates',

  pmseqnum() {
    return this.belongsTo('PanelMeetings', 'pmseqnum')
  },

  mdtcode() {
    return this.belongsTo('PanelMeetingDateTypes', 'mdtcode')
  },
})

module.exports = PanelMeetingDates