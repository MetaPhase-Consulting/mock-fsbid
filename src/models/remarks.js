const bookshelf = require('../bookshelf.js')

const Remarks = bookshelf.model('Remarks', {
  tableName: 'remarks',
  idAttribute: 'rmrkseqnum'
})

module.exports = Remarks