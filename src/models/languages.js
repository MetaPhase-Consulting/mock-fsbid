const bookshelf = require('../bookshelf.js')

const Languages = bookshelf.model('Languages', {
  tableName: 'languages',
  idAttribute: 'language_code'
})

module.exports = Languages