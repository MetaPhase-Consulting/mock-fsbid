const bookshelf = require('../bookshelf.js')

const Bureaus = bookshelf.model('Bureaus', {
  tableName: 'bureaus',
  idAttribute: 'bur',
})

module.exports = Bureaus