const bookshelf = require('../bookshelf.js')

const PanelMeetingItemCategories = bookshelf.model('PanelMeetingItemCategories', {
  tableName: 'panelmeetingitemcategories',
  idAttribute: 'miccode'
})

module.exports = PanelMeetingItemCategories