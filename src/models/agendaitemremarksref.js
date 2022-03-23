const bookshelf = require('../bookshelf.js')

const Agenda_Item_Remarks_Ref = bookshelf.model('Agenda_Item_Remarks_Ref', {
  tableName: 'agenda_item_remarks_ref',
  idAttribute: 'rmrkseqnum'
})

module.exports = Agenda_Item_Remarks_Ref