const bookshelf = require('../bookshelf.js')

const Bureaus = bookshelf.model('Bureaus', {
  tableName: 'bureaus',
})

module.exports = Bureaus