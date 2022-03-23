const bookshelf = require('../bookshelf.js')

const Agenda_Item_Remark_Categories = bookshelf.model('Agenda_Item_Remark_Categories', {
  tableName: 'agenda_item_remark_categories',
  idAttribute: 'rccode'
})

module.exports = Agenda_Item_Remark_Categories