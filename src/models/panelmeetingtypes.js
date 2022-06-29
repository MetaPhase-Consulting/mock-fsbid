const bookshelf = require('../bookshelf.js')

const PanelMeetingTypes = bookshelf.model('PanelMeetingTypes', {
  tableName: 'panelmeetingtypes',
  idAttribute: 'pmpmtcode'
})

module.exports = PanelMeetingTypes