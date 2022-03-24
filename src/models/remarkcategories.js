const bookshelf = require('../bookshelf.js')

const Remark_Categories = bookshelf.model('Remark_Categories', {
  tableName: 'remark_categories',
  idAttribute: 'rccode'
})

module.exports = Remark_Categories