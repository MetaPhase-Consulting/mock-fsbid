const bookshelf = require('../bookshelf.js')

const PanelMeetingDateTypes = bookshelf.model('PanelMeetingStatuses', {
  tableName: 'panelmeetingstatuses',
  idAttribute: 'pmscode'
})

module.exports = PanelMeetingStatuses