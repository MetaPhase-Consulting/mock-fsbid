const bookshelf = require('../bookshelf.js')

const PanelMeetingStatuses = bookshelf.model('PanelMeetingStatuses', {
  tableName: 'panelmeetingstatuses',
  idAttribute: 'pmscode'
})

module.exports = PanelMeetingStatuses