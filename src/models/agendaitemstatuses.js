const bookshelf = require('../bookshelf.js')

const AgendaItemStatuses = bookshelf.model('AgendaItemStatuses', {
  tableName: 'agenda_item_statuses',
  idAttribute: 'aiscode'
})

module.exports = AgendaItemStatuses