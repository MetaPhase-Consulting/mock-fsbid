const bookshelf = require('../bookshelf.js')

const PanelMeetingDateTypes = bookshelf.model('PanelMeetingDateTypes', {
  tableName: 'panelmeetingdatetypes',
  idAttribute: 'mdtcode'
})

module.exports = PanelMeetingDateTypes