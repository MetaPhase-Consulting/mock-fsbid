const bookshelf = require('../bookshelf.js')

const Codes = bookshelf.model('Codes', {
  tableName: 'codes',
})

module.exports = Codes