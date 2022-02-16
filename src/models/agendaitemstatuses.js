const bookshelf = require('../bookshelf.js')

const Agenda_Item_Statuses = bookshelf.model('Agenda_Item_Statuses', {
  tableName: 'agenda_item_statuses',
  idAttribute: 'aiscode'
})

module.exports = Agenda_Item_Statuses