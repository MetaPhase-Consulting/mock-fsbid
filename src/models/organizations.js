const bookshelf = require('../bookshelf.js')

const Organizations = bookshelf.model('Organizations', {
  tableName: 'organizations',
  idAttribute: 'code'
})

module.exports = Organizations