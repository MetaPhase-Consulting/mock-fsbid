const bookshelf = require('../bookshelf.js')

const Codes = bookshelf.model('Codes', {
  tableName: 'codes',
  idAttribute: 'jc_id'
})

module.exports = Codes