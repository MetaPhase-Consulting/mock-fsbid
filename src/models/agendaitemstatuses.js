const bookshelf = require('../bookshelf.js')

const AgendaItemStatuses = bookshelf.model('AgendaItemStatuses', {
  tableName: 'agendaitemstatuses',
  idAttribute: 'aiscode'
})

module.exports = AgendaItemStatuses