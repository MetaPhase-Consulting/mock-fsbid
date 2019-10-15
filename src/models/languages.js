const bookshelf = require('../bookshelf.js')

const Languages = bookshelf.model('Languages', {
  tableName: 'languages',
})

module.exports = Languages